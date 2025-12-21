import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Search, Plus, RefreshCw, Plane, Train, Car, Mail, Phone, MapPin, Calendar, ArrowLeft, MessageSquare, Edit2, Save, X } from 'lucide-react'
import { guests as guestsApi, messages as messagesApi } from '../services/api'
import './Guests.css'

// Demo guests
const demoGuests = [
  {
    id: '1',
    name: 'Virginia Vaugh',
    room_number: '101',
    contact_email: 'virginia.v@email.com',
    contact_phone: '+1 555-027-6800',
    arrival_method: 'flight',
    flight_number: 'EI123',
    check_in_date: new Date(Date.now() + 3600000).toISOString(),
    notes: 'VIP Guest - Prefers quiet room',
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Charlotte Gomez',
    room_number: '712',
    contact_email: 'c.gomez@email.com',
    contact_phone: '+1 555-234-5678',
    arrival_method: 'train',
    flight_number: null,
    check_in_date: new Date(Date.now() + 7200000).toISOString(),
    notes: 'Celebrating anniversary',
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    name: 'John Ballard',
    room_number: '312',
    contact_email: 'jballard@email.com',
    contact_phone: '+1 555-345-6789',
    arrival_method: 'car',
    flight_number: null,
    check_in_date: new Date(Date.now() + 10800000).toISOString(),
    notes: 'Business traveler - needs early checkout',
    created_at: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Dorothy Lee',
    room_number: '707',
    contact_email: 'dorothy.lee@email.com',
    contact_phone: '+1 555-456-7890',
    arrival_method: 'flight',
    flight_number: 'BA456',
    check_in_date: new Date(Date.now() + 14400000).toISOString(),
    notes: null,
    created_at: new Date().toISOString()
  }
]

function GuestCard({ guest, onClick }) {
  const getArrivalIcon = () => {
    switch (guest.arrival_method) {
      case 'flight': return <Plane size={14} />
      case 'train': return <Train size={14} />
      case 'car': return <Car size={14} />
      default: return null
    }
  }

  const checkInTime = new Date(guest.check_in_date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })

  return (
    <div className="guest-card" onClick={() => onClick(guest)}>
      <div className="guest-avatar">
        {guest.name.split(' ').map(n => n[0]).join('')}
      </div>
      <div className="guest-info">
        <h3>{guest.name}</h3>
        <div className="guest-meta">
          <span className="room-badge">Room {guest.room_number}</span>
          {guest.arrival_method && (
            <span className="arrival-badge">
              {getArrivalIcon()}
              {guest.flight_number || guest.arrival_method}
            </span>
          )}
        </div>
        <div className="guest-checkin">
          <Calendar size={12} />
          {checkInTime}
        </div>
      </div>
    </div>
  )
}

function GuestDetail({ guest, onBack, onUpdate }) {
  const [activeTab, setActiveTab] = useState('info')
  const [emailSubject, setEmailSubject] = useState('')
  const [emailContent, setEmailContent] = useState('')
  const [selectedChannel, setSelectedChannel] = useState('email')
  const [sending, setSending] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedGuest, setEditedGuest] = useState(guest)
  const [saving, setSaving] = useState(false)

  const handleSendEmail = async (template) => {
    setSending(true)
    try {
      await messagesApi.send(editedGuest.id, emailSubject, emailContent, template, selectedChannel)
      setEmailSubject('')
      setEmailContent('')
      alert(`${selectedChannel === 'email' ? 'Email' : 'Telegram message'} sent successfully!`)
    } catch (err) {
      console.error(`Failed to send ${selectedChannel}:`, err)
      alert(`Message sent (demo mode)`)
    } finally {
      setSending(false)
    }
  }

  useEffect(() => {
    setEditedGuest(guest)
  }, [guest])

  const handleSave = async () => {
    setSaving(true)
    try {
      await guestsApi.update(guest.id, editedGuest)
      setIsEditing(false)
      onUpdate()
      // Reload guest detail
      const updated = await guestsApi.get(guest.id)
      setEditedGuest(updated)
    } catch (err) {
      console.error('Failed to update guest:', err)
      alert('Failed to update guest. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditedGuest(guest)
    setIsEditing(false)
  }

  const getArrivalIcon = () => {
    switch (editedGuest.arrival_method) {
      case 'flight': return <Plane size={16} />
      case 'train': return <Train size={16} />
      case 'car': return <Car size={16} />
      default: return null
    }
  }

  return (
    <div className="guest-detail">
      <div className="detail-header">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={18} />
          Back to Guests
        </button>
        {!isEditing ? (
          <button className="edit-btn" onClick={() => setIsEditing(true)}>
            <Edit2 size={16} />
            Edit Profile
          </button>
        ) : (
          <div className="edit-actions">
            <button className="cancel-btn" onClick={handleCancel}>
              <X size={16} />
              Cancel
            </button>
            <button className="save-btn" onClick={handleSave} disabled={saving}>
              <Save size={16} />
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}
      </div>

      <div className="detail-profile">
        <div className="profile-avatar">
          {editedGuest.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div className="profile-info">
          {isEditing ? (
            <input
              type="text"
              className="edit-name-input"
              value={editedGuest.name}
              onChange={(e) => setEditedGuest({ ...editedGuest, name: e.target.value })}
              placeholder="Guest Name"
            />
          ) : (
            <h1>{editedGuest.name}</h1>
          )}
          <div className="profile-meta">
            {isEditing ? (
              <input
                type="text"
                className="edit-room-input"
                value={editedGuest.room_number || ''}
                onChange={(e) => setEditedGuest({ ...editedGuest, room_number: e.target.value })}
                placeholder="Room Number"
              />
            ) : (
              <span className="room-badge large">Room {editedGuest.room_number}</span>
            )}
            {editedGuest.arrival_method && (
              <span className="arrival-badge large">
                {getArrivalIcon()}
                {editedGuest.flight_number || editedGuest.arrival_method}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="detail-tabs">
        <button 
          className={`tab ${activeTab === 'info' ? 'active' : ''}`}
          onClick={() => setActiveTab('info')}
        >
          Information
        </button>
        <button 
          className={`tab ${activeTab === 'messages' ? 'active' : ''}`}
          onClick={() => setActiveTab('messages')}
        >
          Messages
        </button>
        <button 
          className={`tab ${activeTab === 'tickets' ? 'active' : ''}`}
          onClick={() => setActiveTab('tickets')}
        >
          Tickets
        </button>
      </div>

      <div className="detail-content">
        {activeTab === 'info' && (
          <div className="info-tab">
            <div className="info-section">
              <h3>Contact Details</h3>
              <div className="info-grid">
                <div className="info-item">
                  <Mail size={16} />
                  {isEditing ? (
                    <input
                      type="email"
                      className="edit-field"
                      value={editedGuest.contact_email || ''}
                      onChange={(e) => setEditedGuest({ ...editedGuest, contact_email: e.target.value })}
                      placeholder="Email"
                    />
                  ) : (
                    <span>{editedGuest.contact_email || 'No email'}</span>
                  )}
                </div>
                <div className="info-item">
                  <Phone size={16} />
                  {isEditing ? (
                    <input
                      type="tel"
                      className="edit-field"
                      value={editedGuest.contact_phone || ''}
                      onChange={(e) => setEditedGuest({ ...editedGuest, contact_phone: e.target.value })}
                      placeholder="Phone"
                    />
                  ) : (
                    <span>{editedGuest.contact_phone || 'No phone'}</span>
                  )}
                </div>
                <div className="info-item">
                  <MessageSquare size={16} />
                  {isEditing ? (
                    <input
                      type="text"
                      className="edit-field"
                      value={editedGuest.telegram_chat_id || ''}
                      onChange={(e) => setEditedGuest({ ...editedGuest, telegram_chat_id: e.target.value })}
                      placeholder="Telegram Chat ID"
                    />
                  ) : (
                    <span>{editedGuest.telegram_chat_id || 'No Telegram chat ID'}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="info-section">
              <h3>Arrival Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <Calendar size={16} />
                  {isEditing ? (
                    <input
                      type="datetime-local"
                      className="edit-field"
                      value={editedGuest.check_in_date ? new Date(editedGuest.check_in_date).toISOString().slice(0, 16) : ''}
                      onChange={(e) => setEditedGuest({ ...editedGuest, check_in_date: new Date(e.target.value).toISOString() })}
                    />
                  ) : (
                    <span>Check-in: {new Date(editedGuest.check_in_date).toLocaleString()}</span>
                  )}
                </div>
                <div className="info-item">
                  <Plane size={16} />
                  {isEditing ? (
                    <select
                      className="edit-field"
                      value={editedGuest.arrival_method || ''}
                      onChange={(e) => setEditedGuest({ ...editedGuest, arrival_method: e.target.value })}
                    >
                      <option value="">Select method</option>
                      <option value="flight">Flight</option>
                      <option value="train">Train</option>
                      <option value="car">Car</option>
                      <option value="bus">Bus</option>
                    </select>
                  ) : (
                    <span>Arrival: {editedGuest.arrival_method || 'Not specified'}</span>
                  )}
                </div>
                {editedGuest.arrival_method === 'flight' && (
                  <div className="info-item">
                    <Plane size={16} />
                    {isEditing ? (
                      <input
                        type="text"
                        className="edit-field"
                        value={editedGuest.flight_number || ''}
                        onChange={(e) => setEditedGuest({ ...editedGuest, flight_number: e.target.value })}
                        placeholder="Flight Number"
                      />
                    ) : (
                      <span>Flight: {editedGuest.flight_number || 'Not specified'}</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="info-section">
              <h3>Notes</h3>
              {isEditing ? (
                <textarea
                  className="edit-notes"
                  value={editedGuest.notes || ''}
                  onChange={(e) => setEditedGuest({ ...editedGuest, notes: e.target.value })}
                  placeholder="Notes about the guest..."
                  rows={4}
                />
              ) : (
                <p className="notes-text">{editedGuest.notes || 'No notes'}</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="messages-tab">
            <div className="send-message">
              <h3>Send Message</h3>
              
              {/* Channel Selector */}
              <div className="channel-selector">
                <label>Channel:</label>
                <div className="channel-buttons">
                  <button 
                    className={`channel-btn ${selectedChannel === 'email' ? 'active' : ''}`}
                    onClick={() => setSelectedChannel('email')}
                    disabled={!editedGuest.contact_email}
                  >
                    <Mail size={16} />
                    Email
                    {!editedGuest.contact_email && <span className="unavailable">(No email)</span>}
                  </button>
                  <button 
                    className={`channel-btn ${selectedChannel === 'telegram' ? 'active' : ''}`}
                    onClick={() => setSelectedChannel('telegram')}
                    disabled={!editedGuest.telegram_chat_id}
                  >
                    <MessageSquare size={16} />
                    Telegram
                    {!editedGuest.telegram_chat_id && <span className="unavailable">(No chat ID)</span>}
                  </button>
                </div>
              </div>

              <div className="quick-templates">
                <button onClick={() => handleSendEmail('pre_arrival')}>
                  Pre-Arrival Welcome
                </button>
                <button onClick={() => handleSendEmail('delay_notification')}>
                  Delay Notification
                </button>
              </div>
              <div className="message-form">
                <input
                  type="text"
                  placeholder="Subject (optional for Telegram)"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                />
                <textarea
                  placeholder="Message content..."
                  value={emailContent}
                  onChange={(e) => setEmailContent(e.target.value)}
                  rows={4}
                />
                <button 
                  className="send-btn"
                  onClick={() => handleSendEmail(null)}
                  disabled={sending || (!emailContent)}
                >
                  {sending ? 'Sending...' : `Send ${selectedChannel === 'email' ? 'Email' : 'Telegram Message'}`}
                </button>
              </div>
            </div>

            <div className="message-history">
              <h3>Message History</h3>
              {editedGuest.messages?.length > 0 ? (
                editedGuest.messages.map(msg => (
                  <div key={msg.id} className="message-item">
                    <div className="message-meta">
                      <span className={`message-channel channel-${msg.channel}`}>
                        {msg.channel === 'email' ? <Mail size={12} /> : <MessageSquare size={12} />}
                        {msg.channel}
                      </span>
                      <span className="message-time">
                        {new Date(msg.sent_at).toLocaleString()}
                      </span>
                    </div>
                    {msg.subject && <p className="message-subject">{msg.subject}</p>}
                    <p className="message-content">{msg.content}</p>
                  </div>
                ))
              ) : (
                <p className="no-messages">No messages sent yet</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'tickets' && (
          <div className="tickets-tab">
            <h3>Related Tickets</h3>
            {editedGuest.tickets?.length > 0 ? (
              editedGuest.tickets.map(ticket => (
                <div key={ticket.id} className="ticket-item">
                  <div className="ticket-status">{ticket.status}</div>
                  <div className="ticket-content">
                    <span className="ticket-summary">{ticket.summary}</span>
                    <span className="ticket-time">
                      {new Date(ticket.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-tickets">No tickets for this guest</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function Guests() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [guests, setGuests] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedGuest, setSelectedGuest] = useState(null)

  useEffect(() => {
    loadGuests()
  }, [])

  useEffect(() => {
    if (id) {
      loadGuestDetail(id)
    } else {
      setSelectedGuest(null)
    }
  }, [id])

  const loadGuests = async () => {
    setLoading(true)
    try {
      const data = await guestsApi.list(search)
      setGuests(data)
    } catch (err) {
      console.log('Using demo guests:', err.message)
      setGuests(demoGuests)
    } finally {
      setLoading(false)
    }
  }

  const loadGuestDetail = async (guestId) => {
    try {
      const data = await guestsApi.get(guestId)
      setSelectedGuest(data)
    } catch (err) {
      console.log('Using demo guest:', err.message)
      const demo = demoGuests.find(g => g.id === guestId)
      if (demo) {
        setSelectedGuest({ ...demo, tickets: [], messages: [] })
      }
    }
  }

  const handleGuestUpdate = () => {
    loadGuests()
    if (selectedGuest) {
      loadGuestDetail(selectedGuest.id)
    }
  }

  const handleGuestClick = (guest) => {
    navigate(`/guests/${guest.id}`)
  }

  const handleBack = () => {
    navigate('/guests')
  }

  // Helper function to get last name from full name
  const getLastName = (name) => {
    const parts = name.trim().split(/\s+/)
    return parts.length > 1 ? parts[parts.length - 1] : parts[0]
  }

  // Sort guests alphabetically by last name
  const sortedGuests = [...guests].sort((a, b) => {
    const lastNameA = getLastName(a.name).toLowerCase()
    const lastNameB = getLastName(b.name).toLowerCase()
    if (lastNameA < lastNameB) return -1
    if (lastNameA > lastNameB) return 1
    // If last names are equal, sort by first name
    const firstNameA = a.name.trim().split(/\s+/)[0].toLowerCase()
    const firstNameB = b.name.trim().split(/\s+/)[0].toLowerCase()
    return firstNameA.localeCompare(firstNameB)
  })

  // Filter guests with search prioritizing last name
  const filteredGuests = sortedGuests.filter(guest => {
    if (!search) return true
    const searchLower = search.toLowerCase().trim()
    const nameParts = guest.name.toLowerCase().split(/\s+/)
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : nameParts[0]
    const firstName = nameParts[0]
    
    // Prioritize last name match
    if (lastName.startsWith(searchLower)) return true
    if (lastName.includes(searchLower)) return true
    
    // Then check first name
    if (firstName.startsWith(searchLower)) return true
    if (firstName.includes(searchLower)) return true
    
    // Then check full name
    if (guest.name.toLowerCase().includes(searchLower)) return true
    
    // Finally check room number
    if (guest.room_number?.toLowerCase().includes(searchLower)) return true
    
    return false
  })

  if (selectedGuest) {
    return (
      <GuestDetail 
        guest={selectedGuest} 
        onBack={handleBack}
        onUpdate={handleGuestUpdate}
      />
    )
  }

  return (
    <div className="guests-page">
      <div className="guests-header">
        <h1>Guests</h1>
        <button className="btn-primary">
          <Plus size={16} />
          Add Guest
        </button>
      </div>

      <div className="guests-filters">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by last name, first name, or room..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="refresh-btn" onClick={loadGuests}>
          <RefreshCw size={16} className={loading ? 'spinning' : ''} />
        </button>
      </div>

      <div className="guests-grid">
        {loading ? (
          <div className="loading-state">Loading guests...</div>
        ) : filteredGuests.length === 0 ? (
          <div className="empty-state">No guests found</div>
        ) : (
          filteredGuests.map(guest => (
            <GuestCard
              key={guest.id}
              guest={guest}
              onClick={handleGuestClick}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default Guests



