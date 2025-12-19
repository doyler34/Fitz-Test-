import { useState, useEffect, useRef } from 'react'
import { X, Clock, User, MapPin, Send, Bell, Mail, Check } from 'lucide-react'
import StatusBadge from './StatusBadge'
import { tickets as ticketsApi } from '../services/api'
import './TicketDetailPanel.css'

function TicketDetailPanel({ item, onClose, onUpdate }) {
  const [newNote, setNewNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(item?.status?.toLowerCase() || 'open')
  const [notes, setNotes] = useState([])
  const [message, setMessage] = useState(null)
  const [autoCloseRemaining, setAutoCloseRemaining] = useState(null) // seconds until auto-close

  // Get the ticket ID from item
  const ticketId = item?.id
  const autoCloseTimerRef = useRef(null)
  const AUTO_CLOSE_MS = 5 * 60 * 1000
  const AUTO_CLOSE_KEY_PREFIX = 'fitz_ticket_autoclose_'

  // Fetch full ticket details with notes
  useEffect(() => {
    if (ticketId) {
      fetchTicketDetails()
    }
  }, [ticketId])

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (autoCloseTimerRef.current) {
        clearInterval(autoCloseTimerRef.current)
      }
    }
  }, [])

  const stopAutoCloseTimer = () => {
    if (autoCloseTimerRef.current) {
      clearInterval(autoCloseTimerRef.current)
      autoCloseTimerRef.current = null
    }
    setAutoCloseRemaining(null)

    // Remove any persisted timer for this ticket
    if (ticketId && typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(`${AUTO_CLOSE_KEY_PREFIX}${ticketId}`)
      } catch (e) {
        // ignore storage errors
      }
    }
  }

  const startAutoCloseTimer = (startTimestampMs) => {
    if (!ticketId) return
    const start = startTimestampMs || Date.now()
    const end = start + AUTO_CLOSE_MS

    // Persist start time so countdown survives panel reopen
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(
          `${AUTO_CLOSE_KEY_PREFIX}${ticketId}`,
          String(start)
        )
      } catch (e) {
        // ignore storage errors
      }
    }

    stopAutoCloseTimer()

    const tick = () => {
      const now = Date.now()
      const remainingMs = end - now
      if (remainingMs <= 0) {
        stopAutoCloseTimer()
        handleClose() // will set status to closed and refresh
        return
      }
      setAutoCloseRemaining(Math.ceil(remainingMs / 1000))
    }

    tick()
    autoCloseTimerRef.current = setInterval(tick, 1000)
  }

  const maybeResumeAutoCloseTimer = (apiStatus) => {
    const effectiveStatus = (apiStatus || status || '').toLowerCase()
    if (effectiveStatus !== 'confirmed' || !ticketId) {
      stopAutoCloseTimer()
      return
    }

    if (typeof window === 'undefined') return
    try {
      const key = `${AUTO_CLOSE_KEY_PREFIX}${ticketId}`
      const stored = window.localStorage.getItem(key)
      const storedMs = stored ? Number(stored) : NaN
      const now = Date.now()

      // If we never stored, start from now
      if (!stored || Number.isNaN(storedMs)) {
        startAutoCloseTimer(now)
        return
      }

      // If 5+ mins already passed, immediately close
      if (now - storedMs >= AUTO_CLOSE_MS) {
        stopAutoCloseTimer()
        handleClose()
        return
      }

      // Resume timer from stored start time
      startAutoCloseTimer(storedMs)
    } catch (e) {
      // Fallback: start fresh timer
      startAutoCloseTimer(Date.now())
    }
  }

  const fetchTicketDetails = async () => {
    try {
      const data = await ticketsApi.get(ticketId)
      if (data?.notes) {
        setNotes(data.notes)
      }
      if (data?.status) {
        setStatus(data.status.toLowerCase())
        maybeResumeAutoCloseTimer(data.status)
      }
    } catch (err) {
      console.log('Could not fetch ticket details:', err.message)
    }
  }

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 3000)
  }

  const handleStatusChange = async (newStatus) => {
    if (!ticketId) {
      showMessage('Cannot update - ticket ID missing', 'error')
      return
    }
    setLoading(true)
    try {
      await ticketsApi.update(ticketId, { status: newStatus })
      setStatus(newStatus)
      showMessage(`Status changed to ${newStatus}`)
      if (newStatus === 'confirmed') {
        maybeResumeAutoCloseTimer(newStatus)
      } else {
        stopAutoCloseTimer()
      }
      onUpdate?.()
    } catch (err) {
      console.error('Failed to update status:', err)
      showMessage('Failed to update status', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleAddNote = async () => {
    if (!newNote.trim()) return
    if (!ticketId) {
      showMessage('Cannot add note - ticket ID missing', 'error')
      return
    }
    setLoading(true)
    try {
      await ticketsApi.addNote(ticketId, newNote)
      setNewNote('')
      showMessage('Note added!')
      // Refresh notes
      await fetchTicketDetails()
      onUpdate?.()
    } catch (err) {
      console.error('Failed to add note:', err)
      showMessage('Failed to add note', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = async () => {
    if (!ticketId) {
      showMessage('Cannot close - ticket ID missing', 'error')
      return
    }
    setLoading(true)
    try {
      await ticketsApi.close(ticketId)
      setStatus('closed')
      showMessage('Ticket closed!')
      onUpdate?.()
    } catch (err) {
      console.error('Failed to close ticket:', err)
      showMessage('Failed to close ticket', 'error')
    } finally {
      setLoading(false)
    }
  }

  const time = new Date(item?.time || item?.scheduled_time || Date.now())
  const formattedTime = time.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })

  const guestName = item?.guestName || item?.guest_name
  const roomNumber = item?.roomNumber || item?.room_number
  const ticketType = item?.ticketType || item?.type
  const statusLabel = (status || 'open').replace('_', ' ')

  const formatSeconds = (seconds) => {
    if (seconds == null) return ''
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }
  return (
    <div className="detail-panel-overlay" onClick={onClose}>
      <div className="detail-panel" onClick={e => e.stopPropagation()}>
        <div className="panel-header">
          <div className="panel-title">
            <span className="ticket-type">{ticketType?.toUpperCase().replace('_', ' ') || 'TICKET'}</span>
            <h3>{item?.summary}</h3>
          </div>
          <button className="panel-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {message && (
          <div className={`panel-message ${message.type}`}>
            {message.type === 'success' && <Check size={16} />}
            {message.text}
          </div>
        )}

        <div className="panel-body">
          {/* Primary ticket info - ALICE-style layout, Fitz styling */}
          <div className="info-section">
            {roomNumber && (
              <div className="field-group">
                <div className="field-label">ROOM / LOCATION</div>
                <div className="field-value">
                  <MapPin size={16} />
                  <span>{roomNumber}</span>
                </div>
              </div>
            )}

            <div className="field-group">
              <div className="field-label">TICKET</div>
              <div className="field-value main-value">
                {item?.summary || 'Ticket'}
              </div>
            </div>

            {guestName && (
              <div className="field-group">
                <div className="field-label">GUEST</div>
                <div className="field-value">
                  <User size={16} />
                  <span>{guestName}</span>
                </div>
              </div>
            )}

            <div className="field-group">
              <div className="field-label">SCHEDULED</div>
              <div className="field-value">
                <Clock size={16} />
                <span>{formattedTime}</span>
              </div>
            </div>

            <div className="field-group compact-status">
              <div className="field-label">STATUS</div>
              <div className="field-value">
                <StatusBadge status={status} />
                {status === 'confirmed' && autoCloseRemaining != null && (
                  <span className="auto-close-timer">
                    Auto-close in {formatSeconds(autoCloseRemaining)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Status Section */}
          <div className="status-section">
            <label>Status</label>
            <div className="status-options">
              {['open', 'in_progress', 'confirmed', 'closed'].map(s => (
                <button
                  key={s}
                  className={`status-option ${status === s ? 'active' : ''}`}
                  onClick={() => handleStatusChange(s)}
                  disabled={loading}
                >
                  {s === 'confirmed' ? 'Completed' : s.replace('_', ' ').charAt(0).toUpperCase() + s.replace('_', ' ').slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Notes Section - NO EMAIL SENT */}
          <div className="notes-section">
            <label>Notes (Internal Only - No Email)</label>
            <div className="notes-list">
              {notes.length > 0 ? (
                notes.map(note => (
                  <div key={note.id} className="note-item">
                    <div className="note-meta">
                      <span className="note-author">{note.staff?.name || 'Staff'}</span>
                      <span className="note-time">
                        {new Date(note.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p>{note.note}</p>
                  </div>
                ))
              ) : (
                <p className="no-notes">No notes yet</p>
              )}
            </div>
            <div className="add-note">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add an internal note (no email will be sent)..."
                rows={2}
              />
              <button 
                className="send-note"
                onClick={handleAddNote}
                disabled={!newNote.trim() || loading}
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="panel-footer action-footer">
          <button 
            className="btn-footer btn-footer-accept"
            onClick={() => handleStatusChange('confirmed')}
            disabled={loading || status === 'confirmed' || status === 'closed'}
          >
            Confirmed
          </button>
          <button 
            className="btn-footer btn-footer-start"
            onClick={() => handleStatusChange('in_progress')}
            disabled={
              loading || 
              status === 'in_progress' || 
              status === 'closed' ||
              status === 'confirmed'
            }
          >
            Start
          </button>
          <button 
            className="btn-footer btn-footer-close"
            onClick={handleClose}
            disabled={loading || status === 'closed'}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default TicketDetailPanel
