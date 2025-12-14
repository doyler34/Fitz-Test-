import { useState, useEffect } from 'react'
import { Filter, RefreshCw, FileText, X } from 'lucide-react'
import TimelineRow from '../components/TimelineRow'
import TicketDetailPanel from '../components/TicketDetailPanel'
import { useFilters } from '../hooks/useFilters'
import { timeline as timelineApi } from '../services/api'
import './Dashboard.css'

// Demo data for when API is not available
const generateDemoData = () => {
  const now = new Date()
  return [
    {
      id: 'note-1',
      type: 'note',
      time: now.toISOString(),
      guestName: null,
      roomNumber: null,
      summary: 'There is an incoming package from FEDEX that is high priority to be sent to the guest M...',
      status: 'open',
      priority: 'high',
      hasAlert: false,
      department: 'concierge'
    },
    {
      id: 'note-2',
      type: 'note',
      time: now.toISOString(),
      guestName: null,
      roomNumber: null,
      summary: 'Please check the tickets for King Lion Musical tomorrow, theater is asking for extra info...',
      status: 'open',
      priority: 'normal',
      hasAlert: true,
      department: 'concierge'
    },
    {
      id: 'ticket-1',
      type: 'ticket',
      ticketType: 'reminder',
      time: new Date(now.setHours(6, 15)).toISOString(),
      guestName: 'VAUGH, VIRGINIA',
      roomNumber: '101',
      summary: 'CAR SERVICE Call 555-027-68...',
      status: 'open',
      priority: 'normal',
      hasAlert: true,
      department: 'concierge'
    },
    {
      id: 'ticket-2',
      type: 'ticket',
      ticketType: 'reminder',
      time: new Date(new Date().setHours(6, 30)).toISOString(),
      guestName: 'GOMEZ, CHARLOTTE',
      roomNumber: '712',
      summary: 'WAKE UP CALL Guest asked for a Wake up Call at 6:30',
      status: 'open',
      priority: 'normal',
      hasAlert: true,
      department: 'front_desk'
    },
    {
      id: 'ticket-3',
      type: 'ticket',
      ticketType: 'guest_request',
      time: new Date(new Date().setHours(8, 15)).toISOString(),
      guestName: 'VAUGH, VIRGINIA',
      roomNumber: '101',
      summary: 'TOUR Historical Monuments Walking Tour',
      status: 'pending',
      priority: 'normal',
      hasAlert: true,
      department: 'concierge'
    },
    {
      id: 'ticket-4',
      type: 'ticket',
      ticketType: 'guest_request',
      time: new Date(new Date().setHours(10, 0)).toISOString(),
      guestName: 'LEE, DOROTHY',
      roomNumber: '707',
      summary: 'DELIVER Two towels and an extra pillow',
      status: 'open',
      priority: 'high',
      hasAlert: true,
      department: 'housekeeping'
    },
    {
      id: 'ticket-5',
      type: 'ticket',
      ticketType: 'guest_request',
      time: new Date(new Date().setHours(10, 30)).toISOString(),
      guestName: 'BALLARD, JOHN',
      roomNumber: '312',
      summary: 'RESTAURANT RESERVATION The Breakfast, 5 peop...',
      status: 'confirmed',
      priority: 'normal',
      hasAlert: true,
      department: 'concierge'
    },
    {
      id: 'ticket-6',
      type: 'ticket',
      ticketType: 'guest_request',
      time: new Date(new Date().setHours(12, 0)).toISOString(),
      guestName: 'ARMSTRONG, MILT...',
      roomNumber: '803',
      summary: 'FLOWERS Guest asked for beautiful flowers on the b...',
      status: 'open',
      priority: 'normal',
      hasAlert: true,
      department: 'concierge'
    },
    {
      id: 'ticket-7',
      type: 'ticket',
      ticketType: 'guest_request',
      time: new Date(new Date().setHours(12, 15)).toISOString(),
      guestName: 'PARKS, FRANCIS',
      roomNumber: '302',
      summary: 'RESTAURANT RESERVATION Buddakan, 4 people, 0...',
      status: 'closed',
      priority: 'normal',
      hasAlert: false,
      department: 'concierge'
    },
    {
      id: 'ticket-8',
      type: 'ticket',
      ticketType: 'internal_request',
      time: new Date(new Date().setHours(12, 20)).toISOString(),
      guestName: 'CRUZ, CHRIS',
      roomNumber: '622',
      summary: 'FIX Bathroom sink',
      status: 'transferred',
      priority: 'normal',
      hasAlert: true,
      department: 'maintenance'
    },
    {
      id: 'ticket-9',
      type: 'ticket',
      ticketType: 'guest_request',
      time: new Date(new Date().setHours(12, 20)).toISOString(),
      guestName: 'MUNOZ, ELSIE',
      roomNumber: '610',
      summary: 'RESTAURANT RESERVATION Braseiro, 5 people, 06...',
      status: 'confirmed',
      priority: 'normal',
      hasAlert: true,
      department: 'concierge'
    },
    {
      id: 'ticket-10',
      type: 'ticket',
      ticketType: 'guest_request',
      time: new Date(new Date().setHours(13, 30)).toISOString(),
      guestName: 'FOWLER, DERRICK',
      roomNumber: '712',
      summary: 'TRANSPORTATION Airport Shuttle, JFK Airport, 5 pe...',
      status: 'open',
      priority: 'normal',
      hasAlert: true,
      department: 'concierge'
    },
    {
      id: 'ticket-11',
      type: 'ticket',
      ticketType: 'internal_request',
      time: new Date(new Date().setHours(14, 0)).toISOString(),
      guestName: null,
      roomNumber: '405',
      summary: 'CLEAN Deep cleaning requested after checkout',
      status: 'pending',
      priority: 'normal',
      hasAlert: false,
      department: 'housekeeping'
    },
    {
      id: 'ticket-12',
      type: 'ticket',
      ticketType: 'internal_request',
      time: new Date(new Date().setHours(15, 0)).toISOString(),
      guestName: null,
      roomNumber: '301',
      summary: 'FIX AC not cooling properly',
      status: 'open',
      priority: 'high',
      hasAlert: true,
      department: 'maintenance'
    }
  ]
}

function Dashboard() {
  const { 
    selectedDate, 
    setSelectedDate,
    selectedDepartment, 
    statusFilter, 
    setStatusFilter,
    searchQuery,
    setSummary,
    setDepartmentCounts
  } = useFilters()

  const [allItems, setAllItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState(null)
  const [activeFilters, setActiveFilters] = useState([])

  useEffect(() => {
    loadTimeline()
  }, [selectedDate])

  useEffect(() => {
    // Update active filters display
    const filters = []
    if (selectedDate.toDateString() === new Date().toDateString()) {
      filters.push({ key: 'date', label: 'Date TODAY' })
    } else {
      filters.push({ key: 'date', label: `Date ${selectedDate.toLocaleDateString()}` })
    }
    if (selectedDepartment && selectedDepartment !== 'all') {
      const deptNames = {
        concierge: 'Concierge',
        front_desk: 'Front Desk',
        housekeeping: 'Housekeeping',
        maintenance: 'Maintenance'
      }
      filters.push({ key: 'dept', label: `Dept: ${deptNames[selectedDepartment] || selectedDepartment}` })
    }
    if (statusFilter !== 'all') {
      filters.push({ key: 'status', label: `Status: ${statusFilter}` })
    }
    setActiveFilters(filters)
  }, [selectedDate, selectedDepartment, statusFilter])

  useEffect(() => {
    // Calculate department counts and summary from items
    const counts = {
      concierge: 0,
      front_desk: 0,
      housekeeping: 0,
      maintenance: 0
    }
    let pending = 0
    let alerts = 0
    let arrivals = 4 // Demo value

    allItems.forEach(item => {
      if (item.department) {
        counts[item.department] = (counts[item.department] || 0) + 1
      }
      if (item.status === 'pending') pending++
      if (item.hasAlert && item.status !== 'closed') alerts++
    })

    setDepartmentCounts(counts)
    setSummary({ arrivals, pending, alerts })
  }, [allItems, setDepartmentCounts, setSummary])

  const loadTimeline = async () => {
    setLoading(true)
    try {
      const dateStr = selectedDate.toISOString().split('T')[0]
      const data = await timelineApi.get(dateStr, statusFilter)
      setAllItems(data.items || [])
    } catch (err) {
      console.log('Using demo data:', err.message)
      setAllItems(generateDemoData())
    } finally {
      setLoading(false)
    }
  }

  // Filter items based on all active filters
  const filteredItems = allItems.filter(item => {
    // Department filter
    if (selectedDepartment !== 'all' && item.department !== selectedDepartment) {
      return false
    }
    // Status filter
    if (statusFilter !== 'all' && item.status !== statusFilter) {
      return false
    }
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesName = item.guestName?.toLowerCase().includes(query)
      const matchesRoom = item.roomNumber?.includes(query)
      const matchesSummary = item.summary?.toLowerCase().includes(query)
      if (!matchesName && !matchesRoom && !matchesSummary) {
        return false
      }
    }
    return true
  })

  const handleItemClick = (item) => {
    setSelectedItem(item)
  }

  const removeFilter = (filterKey) => {
    if (filterKey === 'date') {
      setSelectedDate(new Date())
    } else if (filterKey === 'status') {
      setStatusFilter('all')
    }
  }

  const clearAllFilters = () => {
    setSelectedDate(new Date())
    setStatusFilter('all')
  }

  // Group items by hour for timeline display
  const groupedItems = filteredItems.reduce((acc, item) => {
    const hour = new Date(item.time).getHours()
    const key = `${hour.toString().padStart(2, '0')}:00`
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {})

  // Get relevant hours
  const currentHour = new Date().getHours()
  const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`)
  const relevantHours = hours.filter(h => {
    const hour = parseInt(h)
    return groupedItems[h]?.length > 0 || (hour >= currentHour - 1 && hour <= currentHour + 12)
  })

  // Separate notes from regular items
  const noteItems = filteredItems.filter(i => i.type === 'note')

  const formatHour = (hour) => {
    const h = parseInt(hour)
    if (h === 0) return '12am'
    if (h < 12) return `${h}am`
    if (h === 12) return '12pm'
    return `${h - 12}pm`
  }

  return (
    <div className="dashboard">
      {/* Filter Bar */}
      <div className="dashboard-filters">
        <div className="filter-left">
          <button 
            className={`filter-btn ${selectedDate.toDateString() === new Date().toDateString() ? 'active' : ''}`}
            onClick={() => setSelectedDate(new Date())}
          >
            Today
          </button>
          <button className="filter-btn">
            All Time
          </button>
          <input 
            type="date" 
            className="filter-date"
            value={selectedDate.toISOString().split('T')[0]}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
          />
          <div className="filter-search">
            <input type="text" placeholder="Search Tickets" />
          </div>
        </div>
        <div className="filter-right">
          <div className="filter-dropdown">
            <Filter size={14} />
            Filters
          </div>
          <div className="status-filters">
            <button 
              className={`status-filter ${statusFilter === 'open' ? 'active' : ''}`}
              onClick={() => setStatusFilter(statusFilter === 'open' ? 'all' : 'open')}
            >
              Open
            </button>
            <button 
              className={`status-filter ${statusFilter === 'closed' ? 'active' : ''}`}
              onClick={() => setStatusFilter(statusFilter === 'closed' ? 'all' : 'closed')}
            >
              Closed
            </button>
            <button 
              className={`status-filter all ${statusFilter === 'all' ? 'active' : ''}`}
              onClick={() => setStatusFilter('all')}
            >
              All
            </button>
          </div>
          <button className="refresh-btn" onClick={loadTimeline} title="Refresh">
            <RefreshCw size={16} className={loading ? 'spinning' : ''} />
          </button>
        </div>
      </div>

      {/* Date Header */}
      <div className="dashboard-header">
        <div className="filter-info">
          Filtered By: 
          {activeFilters.map(f => (
            <span key={f.key} className="filter-tag">
              {f.label}
              <button onClick={() => removeFilter(f.key)}>×</button>
            </span>
          ))}
          <button className="clear-filters" onClick={clearAllFilters}>Clear</button>
        </div>
        <div className="date-info">
          {selectedDate.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          })}
        </div>
        <div className="column-headers">
          <span>FOR</span>
          <span>ROOM</span>
          <span>SUMMARY</span>
          <span>STATUS</span>
          <span>ALERTS</span>
        </div>
      </div>

      {/* Notes Section */}
      {noteItems.length > 0 && (
        <div className="notes-section">
          {noteItems.map(note => (
            <div key={note.id} className="note-row" onClick={() => handleItemClick(note)}>
              <div className="note-icon">
                <FileText size={16} />
              </div>
              <div className="note-label">NOTES</div>
              <div className="note-content">{note.summary}</div>
              <div className="note-status">
                <button className={`status-badge status-${note.status}`}>
                  {note.status.toUpperCase()}
                </button>
              </div>
              {note.hasAlert && <div className="note-alert">ROLL</div>}
            </div>
          ))}
        </div>
      )}

      {/* Timeline */}
      <div className="timeline">
        {relevantHours.map(hour => (
          <div key={hour} className="timeline-hour">
            <div className="hour-label">{formatHour(hour)}</div>
            <div className="hour-items">
              {(groupedItems[hour] || [])
                .filter(item => item.type !== 'note')
                .map(item => (
                  <TimelineRow 
                    key={item.id} 
                    item={item} 
                    onClick={handleItemClick}
                  />
                ))
              }
            </div>
          </div>
        ))}
      </div>

      {/* Footer Stats */}
      <div className="dashboard-footer">
        <div className="total-count">TOTAL TICKETS: {filteredItems.length}</div>
        <div className="pagination">
          <button>&lt;</button>
          <span>1 / {Math.ceil(filteredItems.length / 10) || 1}</span>
          <button>&gt;</button>
        </div>
      </div>

      {/* Detail Panel */}
      {selectedItem && (
        <TicketDetailPanel 
          item={selectedItem} 
          onClose={() => setSelectedItem(null)}
          onUpdate={loadTimeline}
        />
      )}
    </div>
  )
}

export default Dashboard
