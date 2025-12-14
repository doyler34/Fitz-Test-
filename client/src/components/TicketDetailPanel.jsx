import { useState, useEffect } from 'react'
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

  // Get the ticket ID from item
  const ticketId = item?.id

  // Fetch full ticket details with notes
  useEffect(() => {
    if (ticketId) {
      fetchTicketDetails()
    }
  }, [ticketId])

  const fetchTicketDetails = async () => {
    try {
      const data = await ticketsApi.get(ticketId)
      if (data?.notes) {
        setNotes(data.notes)
      }
      if (data?.status) {
        setStatus(data.status.toLowerCase())
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
          {/* Info Section */}
          <div className="info-section">
            <div className="info-row">
              <Clock size={16} />
              <span>{formattedTime}</span>
            </div>
            {guestName && (
              <div className="info-row">
                <User size={16} />
                <span>{guestName}</span>
              </div>
            )}
            {roomNumber && (
              <div className="info-row">
                <MapPin size={16} />
                <span>Room {roomNumber}</span>
              </div>
            )}
          </div>

          {/* Status Section */}
          <div className="status-section">
            <label>Status</label>
            <div className="status-options">
              {['open', 'pending', 'confirmed', 'in_progress', 'closed'].map(s => (
                <button
                  key={s}
                  className={`status-option ${status === s ? 'active' : ''}`}
                  onClick={() => handleStatusChange(s)}
                  disabled={loading}
                >
                  {s.replace('_', ' ').charAt(0).toUpperCase() + s.replace('_', ' ').slice(1)}
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

        <div className="panel-footer">
          <button 
            className="btn-secondary"
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            className="btn-danger"
            onClick={handleClose}
            disabled={status === 'closed' || loading}
          >
            {status === 'closed' ? 'Closed' : 'Close Ticket'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default TicketDetailPanel
