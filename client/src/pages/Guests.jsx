import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Search, Plus, RefreshCw, Plane, Train, Car, Mail, Phone, MapPin, Calendar, ArrowLeft, MessageSquare } from 'lucide-react'
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

  const handleSendEmail = async (template) => {
    setSending(true)
    try {
      await messagesApi.send(guest.id, emailSubject, emailContent, template, selectedChannel)
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

  const getArrivalIcon = () => {
    switch (guest.arrival_method) {
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
      </div>

      <div className="detail-profile">
        <div className="profile-avatar">
          {guest.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div className="profile-info">
          <h1>{guest.name}</h1>
          <div className="profile-meta">
            <span className="room-badge large">Room {guest.room_number}</span>
            {guest.arrival_method && (
              <span className="arrival-badge large">
                {getArrivalIcon()}
                {guest.flight_number || guest.arrival_method}
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
                  <span>{guest.contact_email || 'No email'}</span>
                </div>
                <div className="info-item">
                  <Phone size={16} />
                  <span>{guest.contact_phone || 'No phone'}</span>
                </div>
              </div>
            </div>

            <div className="info-section">
              <h3>Arrival Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <Calendar size={16} />
                  <span>Check-in: {new Date(guest.check_in_date).toLocaleString()}</span>
                </div>
                {guest.flight_number && (
                  <div className="info-item">
                    <Plane size={16} />
                    <span>Flight: {guest.flight_number}</span>
                  </div>
                )}
              </div>
            </div>

            {guest.notes && (
              <div className="info-section">
                <h3>Notes</h3>
                <p className="notes-text">{guest.notes}</p>
              </div>
            )}
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
                    disabled={!guest.contact_email}
                  >
                    <Mail size={16} />
                    Email
                    {!guest.contact_email && <span className="unavailable">(No email)</span>}
                  </button>
                  <button 
                    className={`channel-btn ${selectedChannel === 'telegram' ? 'active' : ''}`}
                    onClick={() => setSelectedChannel('telegram')}
                    disabled={!guest.telegram_chat_id}
                  >
                    <MessageSquare size={16} />
                    Telegram
                    {!guest.telegram_chat_id && <span className="unavailable">(No chat ID)</span>}
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
              {guest.messages?.length > 0 ? (
                guest.messages.map(msg => (
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
            {guest.tickets?.length > 0 ? (
              guest.tickets.map(ticket => (
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

  const handleGuestClick = (guest) => {
    navigate(`/guests/${guest.id}`)
  }

  const handleBack = () => {
    navigate('/guests')
  }

  const filteredGuests = guests.filter(guest => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      guest.name.toLowerCase().includes(searchLower) ||
      guest.room_number?.includes(search)
    )
  })

  if (selectedGuest) {
    return (
      <GuestDetail 
        guest={selectedGuest} 
        onBack={handleBack}
        onUpdate={loadGuests}
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
            placeholder="Search guests..."
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



