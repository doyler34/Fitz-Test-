import { useState } from 'react'
import { X } from 'lucide-react'
import { tickets as ticketsApi } from '../services/api'
import './TicketModal.css'

// Local storage key for demo tickets
const DEMO_TICKETS_KEY = 'fitz_companion_tickets'

function TicketModal({ type = 'guest_request', onClose, onCreated }) {
  const [formData, setFormData] = useState({
    type,
    guest_name: '',
    room_number: '',
    summary: '',
    scheduled_time: new Date().toISOString().slice(0, 16),
    priority: 'normal'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const saveDemoTicket = (ticketData) => {
    // Save to localStorage for demo mode
    const existing = JSON.parse(localStorage.getItem(DEMO_TICKETS_KEY) || '[]')
    const newTicket = {
      id: `demo-${Date.now()}`,
      ...ticketData,
      status: 'open',
      hasAlert: ticketData.priority === 'high',
      department: ticketData.type === 'internal_request' ? 'maintenance' : 'concierge',
      created_at: new Date().toISOString()
    }
    existing.push(newTicket)
    localStorage.setItem(DEMO_TICKETS_KEY, JSON.stringify(existing))
    return newTicket
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await ticketsApi.create(formData)
      onCreated?.()
    } catch (err) {
      // API failed, save locally for demo
      console.log('API unavailable, saving locally:', err.message)
      saveDemoTicket(formData)
      onCreated?.()
    } finally {
      setLoading(false)
    }
  }

  const isGuestRequest = type === 'guest_request'

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isGuestRequest ? 'New Guest Request' : 'New Internal Request'}</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="form-error">{error}</div>}

            {isGuestRequest && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label>Guest Name</label>
                    <input
                      type="text"
                      name="guest_name"
                      value={formData.guest_name}
                      onChange={handleChange}
                      placeholder="Enter guest name"
                    />
                  </div>
                  <div className="form-group">
                    <label>Room Number</label>
                    <input
                      type="text"
                      name="room_number"
                      value={formData.room_number}
                      onChange={handleChange}
                      placeholder="e.g. 101"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="form-group">
              <label>Request Type</label>
              <select 
                name="type" 
                value={formData.type}
                onChange={handleChange}
              >
                <option value="guest_request">Guest Request</option>
                <option value="internal_request">Internal Request</option>
                <option value="reminder">Reminder</option>
              </select>
            </div>

            <div className="form-group">
              <label>Summary *</label>
              <textarea
                name="summary"
                value={formData.summary}
                onChange={handleChange}
                placeholder="Describe the request..."
                rows={3}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Scheduled Time</label>
                <input
                  type="datetime-local"
                  name="scheduled_time"
                  value={formData.scheduled_time}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select 
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TicketModal

