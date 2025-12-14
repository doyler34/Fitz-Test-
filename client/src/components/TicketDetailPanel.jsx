import { useState } from 'react'
import { X, Clock, User, MapPin, Send, Bell, Mail } from 'lucide-react'
import StatusBadge from './StatusBadge'
import { tickets as ticketsApi } from '../services/api'
import './TicketDetailPanel.css'

function TicketDetailPanel({ item, onClose, onUpdate }) {
  const [newNote, setNewNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(item.status)

  const handleStatusChange = async (newStatus) => {
    setLoading(true)
    try {
      if (item.data?.id) {
        await ticketsApi.update(item.data.id, { status: newStatus })
      }
      setStatus(newStatus)
      onUpdate?.()
    } catch (err) {
      console.error('Failed to update status:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddNote = async () => {
    if (!newNote.trim()) return
    setLoading(true)
    try {
      if (item.data?.id) {
        await ticketsApi.addNote(item.data.id, newNote)
      }
      setNewNote('')
      onUpdate?.()
    } catch (err) {
      console.error('Failed to add note:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = async () => {
    setLoading(true)
    try {
      if (item.data?.id) {
        await ticketsApi.close(item.data.id)
      }
      setStatus('closed')
      onUpdate?.()
    } catch (err) {
      console.error('Failed to close ticket:', err)
    } finally {
      setLoading(false)
    }
  }

  const time = new Date(item.time)
  const formattedTime = time.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })

  return (
    <div className="detail-panel-overlay" onClick={onClose}>
      <div className="detail-panel" onClick={e => e.stopPropagation()}>
        <div className="panel-header">
          <div className="panel-title">
            <span className="ticket-type">{item.ticketType?.toUpperCase() || 'TICKET'}</span>
            <h3>{item.summary}</h3>
          </div>
          <button className="panel-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="panel-body">
          {/* Info Section */}
          <div className="info-section">
            <div className="info-row">
              <Clock size={16} />
              <span>{formattedTime}</span>
            </div>
            {item.guestName && (
              <div className="info-row">
                <User size={16} />
                <span>{item.guestName}</span>
              </div>
            )}
            {item.roomNumber && (
              <div className="info-row">
                <MapPin size={16} />
                <span>Room {item.roomNumber}</span>
              </div>
            )}
          </div>

          {/* Status Section */}
          <div className="status-section">
            <label>Status</label>
            <div className="status-options">
              {['open', 'pending', 'confirmed', 'closed'].map(s => (
                <button
                  key={s}
                  className={`status-option ${status === s ? 'active' : ''}`}
                  onClick={() => handleStatusChange(s)}
                  disabled={loading}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="actions-section">
            <button className="action-btn">
              <Bell size={16} />
              Set Alert
            </button>
            <button className="action-btn">
              <Mail size={16} />
              Email Guest
            </button>
          </div>

          {/* Notes Section */}
          <div className="notes-section">
            <label>Notes</label>
            <div className="notes-list">
              {item.data?.notes?.length > 0 ? (
                item.data.notes.map(note => (
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
                placeholder="Add a note..."
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
            className="btn-danger"
            onClick={handleClose}
            disabled={status === 'closed' || loading}
          >
            Close Ticket
          </button>
        </div>
      </div>
    </div>
  )
}

export default TicketDetailPanel

