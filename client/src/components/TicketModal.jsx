import { useState } from 'react'
import { X } from 'lucide-react'
import { useFilters } from '../hooks/useFilters'
import './TicketModal.css'

function TicketModal({ type = 'guest_request', onClose, onCreated }) {
  const { addTicket } = useFilters()
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
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await addTicket(formData)
      setSuccess(true)
      setTimeout(() => {
        onCreated?.()
        onClose()
      }, 500)
    } catch (err) {
      setError(err.message || 'Failed to create request. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const isGuestRequest = formData.type === 'guest_request'

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
            {success && <div className="form-success">Request created successfully!</div>}

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

            {isGuestRequest && (
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
            )}

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
            <button type="submit" className="btn-primary" disabled={loading || success}>
              {loading ? 'Creating...' : success ? 'Created!' : 'Create Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TicketModal
