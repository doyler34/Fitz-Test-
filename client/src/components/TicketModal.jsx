import { useState } from 'react'
import { X, Check } from 'lucide-react'
import { tickets as ticketsApi } from '../services/api'
import { useFilters } from '../hooks/useFilters'
import './TicketModal.css'

function TicketModal({ type = 'guest_request', onClose, onCreated }) {
  const { refreshData } = useFilters()
  const [formData, setFormData] = useState({
    type,
    department: type === 'internal_request' ? 'maintenance' : 'concierge',
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
    setFormData(prev => {
      const updated = { ...prev, [name]: value }
      // Auto-set department based on type
      if (name === 'type') {
        if (value === 'internal_request') {
          updated.department = 'maintenance'
        } else if (value === 'reminder') {
          updated.department = 'front_desk'
        } else {
          updated.department = 'concierge'
        }
      }
      return updated
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.summary.trim()) {
      setError('Summary is required')
      return
    }
    
    setLoading(true)
    setError(null)

    try {
      await ticketsApi.create(formData)
      setSuccess(true)
      refreshData?.()
      setTimeout(() => {
        onCreated?.()
        onClose()
      }, 1000)
    } catch (err) {
      console.error('Failed to create ticket:', err)
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
            {success && (
              <div className="form-success">
                <Check size={16} />
                Request created successfully!
              </div>
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
              <label>Department</label>
              <select 
                name="department" 
                value={formData.department}
                onChange={handleChange}
              >
                <option value="concierge">Concierge</option>
                <option value="front_desk">Front Desk</option>
                <option value="housekeeping">Housekeeping</option>
                <option value="maintenance">Maintenance</option>
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

            {!isGuestRequest && (
              <div className="form-group">
                <label>Room Number (optional)</label>
                <input
                  type="text"
                  name="room_number"
                  value={formData.room_number}
                  onChange={handleChange}
                  placeholder="e.g. 101"
                />
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
