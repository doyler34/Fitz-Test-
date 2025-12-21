import { useState, useEffect } from 'react'
import { Search, Plus, RefreshCw } from 'lucide-react'
import StatusBadge from '../components/StatusBadge'
import TicketModal from '../components/TicketModal'
import TicketDetailPanel from '../components/TicketDetailPanel'
import { useFilters } from '../hooks/useFilters'
import { tickets as ticketsApi } from '../services/api'
import './Tickets.css'

// Demo tickets
const demoTickets = [
  {
    id: '1',
    type: 'guest_request',
    guest_name: 'VAUGH, VIRGINIA',
    room_number: '101',
    summary: 'CAR SERVICE - Airport pickup arrangement for tomorrow',
    status: 'open',
    priority: 'high',
    scheduled_time: new Date(new Date().setHours(14, 0)).toISOString(),
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    type: 'reminder',
    guest_name: 'GOMEZ, CHARLOTTE',
    room_number: '712',
    summary: 'WAKE UP CALL - Guest requested 6:30 AM wake up call',
    status: 'pending',
    priority: 'normal',
    scheduled_time: new Date(new Date().setHours(6, 30)).toISOString(),
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    type: 'guest_request',
    guest_name: 'BALLARD, JOHN',
    room_number: '312',
    summary: 'RESTAURANT RESERVATION - The Ivy, 8pm, party of 4',
    status: 'confirmed',
    priority: 'normal',
    scheduled_time: new Date(new Date().setHours(20, 0)).toISOString(),
    created_at: new Date().toISOString()
  },
  {
    id: '4',
    type: 'guest_request',
    guest_name: 'LEE, DOROTHY',
    room_number: '707',
    summary: 'DELIVER - Two extra towels and a pillow',
    status: 'open',
    priority: 'high',
    scheduled_time: new Date().toISOString(),
    created_at: new Date().toISOString()
  },
  {
    id: '5',
    type: 'internal_request',
    guest_name: null,
    room_number: '622',
    summary: 'FIX - Bathroom sink leak reported',
    status: 'transferred',
    priority: 'normal',
    scheduled_time: new Date().toISOString(),
    created_at: new Date().toISOString()
  },
  {
    id: '6',
    type: 'guest_request',
    guest_name: 'PARKS, FRANCIS',
    room_number: '302',
    summary: 'RESTAURANT RESERVATION - Buddakan, party of 4',
    status: 'closed',
    priority: 'normal',
    scheduled_time: new Date(new Date().setHours(19, 0)).toISOString(),
    created_at: new Date(Date.now() - 86400000).toISOString()
  }
]

function Tickets() {
  const { searchQuery, statusFilter: globalStatusFilter, selectedDepartment } = useFilters()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    loadTickets()
  }, [statusFilter, typeFilter])

  // Sync with global search
  useEffect(() => {
    setSearch(searchQuery)
  }, [searchQuery])

  const loadTickets = async () => {
    setLoading(true)
    try {
      const filters = {}
      if (statusFilter !== 'all') filters.status = statusFilter
      if (typeFilter !== 'all') filters.type = typeFilter
      
      const data = await ticketsApi.list(filters)
      setTickets(data)
    } catch (err) {
      console.log('Using demo tickets:', err.message)
      let filtered = demoTickets
      if (statusFilter !== 'all') {
        filtered = filtered.filter(t => t.status === statusFilter)
      }
      if (typeFilter !== 'all') {
        filtered = filtered.filter(t => t.type === typeFilter)
      }
      setTickets(filtered)
    } finally {
      setLoading(false)
    }
  }

  const filteredTickets = tickets.filter(ticket => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      ticket.guest_name?.toLowerCase().includes(searchLower) ||
      ticket.room_number?.includes(search) ||
      ticket.summary?.toLowerCase().includes(searchLower)
    )
  })

  const handleTicketClick = (ticket) => {
    setSelectedTicket({
      id: `ticket-${ticket.id}`,
      type: 'ticket',
      ticketType: ticket.type,
      time: ticket.scheduled_time,
      guestName: ticket.guest_name,
      roomNumber: ticket.room_number,
      summary: ticket.summary,
      status: ticket.status,
      priority: ticket.priority,
      data: ticket
    })
  }

  const formatTime = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const getTypeLabel = (type) => {
    switch (type) {
      case 'guest_request': return 'Guest'
      case 'internal_request': return 'Internal'
      case 'reminder': return 'Reminder'
      default: return type
    }
  }

  return (
    <div className="tickets-page">
      {/* Header */}
      <div className="tickets-header">
        <h1>Tickets</h1>
        <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
          <Plus size={16} />
          New Ticket
        </button>
      </div>

      {/* Filters */}
      <div className="tickets-filters">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search tickets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <label>Status:</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="open">Open</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="closed">Closed</option>
            <option value="transferred">Transferred</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Type:</label>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="all">All Types</option>
            <option value="guest_request">Guest Request</option>
            <option value="internal_request">Internal</option>
            <option value="reminder">Reminder</option>
          </select>
        </div>

        <button className="refresh-btn" onClick={loadTickets}>
          <RefreshCw size={16} className={loading ? 'spinning' : ''} />
        </button>
      </div>

      {/* Tickets Table - Desktop */}
      <div className="tickets-table desktop-table">
        <div className="table-header">
          <span>Time</span>
          <span>Type</span>
          <span>Guest</span>
          <span>Room</span>
          <span>Summary</span>
          <span>Status</span>
          <span>Priority</span>
        </div>
        <div className="table-body">
          {loading ? (
            <div className="loading-state">Loading tickets...</div>
          ) : filteredTickets.length === 0 ? (
            <div className="empty-state">No tickets found</div>
          ) : (
            filteredTickets.map(ticket => {
              const status = (ticket.status || 'open').toLowerCase()
              const priority = (ticket.priority || 'normal').toLowerCase()
              
              return (
              <div 
                key={ticket.id} 
                className={`table-row ${ticket.priority === 'high' || ticket.priority === 'urgent' ? 'high-priority' : ''}`}
                data-status={status}
                data-priority={priority}
                onClick={() => handleTicketClick(ticket)}
              >
                <span className="col-time">{formatTime(ticket.scheduled_time)}</span>
                <span className="col-type">
                  <span className="type-badge">{getTypeLabel(ticket.type)}</span>
                </span>
                <span className="col-guest">{ticket.guest_name || '—'}</span>
                <span className="col-room">{ticket.room_number || '—'}</span>
                <span className="col-summary">{ticket.summary}</span>
                <span className="col-status">
                  <StatusBadge status={ticket.status} />
                </span>
                <span className={`col-priority priority-${ticket.priority}`}>
                  {ticket.priority}
                </span>
              </div>
              )
            })
          )}
        </div>
      </div>

      {/* Mobile Card List */}
      <div className="mobile-tickets-list">
        {loading ? (
          <div className="loading-state">Loading tickets...</div>
        ) : filteredTickets.length === 0 ? (
          <div className="empty-state">No tickets found</div>
        ) : (
          filteredTickets.map(ticket => {
            const status = (ticket.status || 'open').toLowerCase()
            const priority = (ticket.priority || 'normal').toLowerCase()
            
            return (
            <div 
              key={ticket.id} 
              className={`mobile-ticket-card ${ticket.priority === 'high' || ticket.priority === 'urgent' ? 'high-priority' : ''}`}
              data-status={status}
              data-priority={priority}
              onClick={() => handleTicketClick(ticket)}
            >
              <div className="mobile-card-header">
                <div className="mobile-card-time">{formatTime(ticket.scheduled_time)}</div>
                <StatusBadge status={ticket.status} />
              </div>
              <div className="mobile-card-type">
                <span className="type-badge">{getTypeLabel(ticket.type)}</span>
                {ticket.priority && (
                  <span className={`priority-badge priority-${ticket.priority}`}>
                    {ticket.priority}
                  </span>
                )}
              </div>
              <div className="mobile-card-guest">
                {ticket.guest_name || 'Internal'} {ticket.room_number ? `• Room ${ticket.room_number}` : ''}
              </div>
              <div className="mobile-card-summary">{ticket.summary}</div>
            </div>
            )
          })
        )}
      </div>

      {/* Stats Footer */}
      <div className="tickets-footer">
        <div className="stats">
          <span>Total: {filteredTickets.length}</span>
          <span>Open: {filteredTickets.filter(t => t.status === 'open').length}</span>
          <span>Pending: {filteredTickets.filter(t => t.status === 'pending').length}</span>
          <span>Closed: {filteredTickets.filter(t => t.status === 'closed').length}</span>
        </div>
      </div>

      {/* Detail Panel */}
      {selectedTicket && (
        <TicketDetailPanel
          item={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onUpdate={loadTickets}
        />
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <TicketModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false)
            loadTickets()
          }}
        />
      )}
    </div>
  )
}

export default Tickets

