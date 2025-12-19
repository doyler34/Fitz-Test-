import { useState } from 'react'
import { Filter, RefreshCw, FileText, X } from 'lucide-react'
import TimelineRow from '../components/TimelineRow'
import TicketDetailPanel from '../components/TicketDetailPanel'
import StatusBadge from '../components/StatusBadge'
import { useFilters } from '../hooks/useFilters'
import './Dashboard.css'

function Dashboard() {
  const { 
    selectedDate, 
    setSelectedDate,
    selectedDepartment,
    setSelectedDepartment,
    selectedStatus,
    setSelectedStatus,
    searchTerm,
    filteredTickets,
    loading,
    refreshData,
    clearFilters
  } = useFilters()

  const [selectedItem, setSelectedItem] = useState(null)

  // Build active filters list
  const activeFilters = []
  const today = new Date().toISOString().slice(0, 10)
  
  if (selectedDate === today) {
    activeFilters.push({ key: 'date', label: 'Date TODAY' })
  } else if (selectedDate) {
    activeFilters.push({ key: 'date', label: `Date ${selectedDate}` })
  }
  if (selectedDepartment && selectedDepartment !== 'All') {
    activeFilters.push({ key: 'dept', label: `Dept: ${selectedDepartment}` })
  }
  if (selectedStatus && selectedStatus !== 'All') {
    activeFilters.push({ key: 'status', label: `Status: ${selectedStatus}` })
  }

  const removeFilter = (filterKey) => {
    if (filterKey === 'date') {
      setSelectedDate(today)
    } else if (filterKey === 'status') {
      setSelectedStatus('All')
    } else if (filterKey === 'dept') {
      setSelectedDepartment('All')
    }
  }

  const handleItemClick = (item) => {
    setSelectedItem(item)
  }

  // Group items by hour for timeline display
  const groupedItems = (filteredTickets || []).reduce((acc, item) => {
    const time = item.time || item.scheduled_time
    if (!time) return acc
    const hour = new Date(time).getHours()
    const key = `${hour.toString().padStart(2, '0')}:00`
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {})

  // Get hours that have items
  const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`)
  const currentHour = new Date().getHours()
  const relevantHours = hours.filter(h => {
    const hour = parseInt(h)
    return groupedItems[h]?.length > 0 || (hour >= 6 && hour <= 22)
  })

  const formatHour = (hour) => {
    const h = parseInt(hour)
    if (h === 0) return '12am'
    if (h < 12) return `${h}am`
    if (h === 12) return '12pm'
    return `${h - 12}pm`
  }

  // Separate notes from regular items
  const noteItems = (filteredTickets || []).filter(i => i.type === 'note' || i.type === 'internal_request')

  return (
    <div className="dashboard">
      {/* Filter Bar */}
      <div className="dashboard-filters">
        <div className="filter-left">
          <button 
            className={`filter-btn ${selectedDate === today ? 'active' : ''}`}
            onClick={() => setSelectedDate(today)}
          >
            Today
          </button>
          <button 
            className="filter-btn"
            onClick={() => setSelectedDate('')}
          >
            All Time
          </button>
          <input 
            type="date" 
            className="filter-date"
            value={selectedDate || ''}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          <div className="filter-search">
            <input type="text" placeholder="Search Tickets" value={searchTerm || ''} readOnly />
          </div>
        </div>
        <div className="filter-right">
          <div className="filter-dropdown">
            <Filter size={14} />
            Filters
          </div>
          <div className="status-filters">
            <button 
              className={`status-filter ${selectedStatus === 'Open' ? 'active' : ''}`}
              onClick={() => setSelectedStatus(selectedStatus === 'Open' ? 'All' : 'Open')}
            >
              Open
            </button>
            <button 
              className={`status-filter ${selectedStatus === 'Closed' ? 'active' : ''}`}
              onClick={() => setSelectedStatus(selectedStatus === 'Closed' ? 'All' : 'Closed')}
            >
              Closed
            </button>
            <button 
              className={`status-filter all ${selectedStatus === 'All' ? 'active' : ''}`}
              onClick={() => setSelectedStatus('All')}
            >
              All
            </button>
          </div>
          <button className="refresh-btn" onClick={refreshData} title="Refresh">
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
          {activeFilters.length > 0 && (
            <button className="clear-filters" onClick={clearFilters}>Clear</button>
          )}
        </div>
        <div className="date-info">
          {selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          }) : 'All Dates'}
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
          {noteItems.slice(0, 2).map(note => (
            <div key={note.id} className="note-row" onClick={() => handleItemClick(note)}>
              <div className="note-icon">
                <FileText size={16} />
              </div>
              <div className="note-label">NOTES</div>
              <div className="note-content">{note.summary}</div>
              <div className="note-status">
                <button className={`status-badge status-${(note.status || 'open').toLowerCase()}`}>
                  {(note.status || 'OPEN').toUpperCase()}
                </button>
              </div>
              {note.alerts?.length > 0 && <div className="note-alert">ROLL</div>}
            </div>
          ))}
        </div>
      )}

      {/* Timeline - Desktop */}
      <div className="timeline desktop-timeline">
        {loading ? (
          <div className="loading-message">Loading...</div>
        ) : relevantHours.length === 0 ? (
          <div className="empty-message">No tickets for selected filters</div>
        ) : (
          relevantHours.map(hour => (
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
          ))
        )}
      </div>

      {/* Mobile Card List */}
      <div className="mobile-ticket-list">
        {loading ? (
          <div className="loading-message">Loading...</div>
        ) : (filteredTickets || []).filter(item => item.type !== 'note').length === 0 ? (
          <div className="empty-message">No tickets for selected filters</div>
        ) : (
          (filteredTickets || [])
            .filter(item => item.type !== 'note')
            .map(item => {
              const time = new Date(item.time || item.scheduled_time)
              const timeStr = time.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
              })
              return (
                <div 
                  key={item.id} 
                  className={[
                    'mobile-ticket-card',
                    (item.priority === 'high' || item.priority === 'urgent') ? 'ticket-urgent' : 
                    item.status === 'open' ? 'ticket-open' :
                    item.status === 'pending' ? 'ticket-pending' :
                    item.status === 'confirmed' ? 'ticket-confirmed' :
                    item.status === 'closed' ? 'ticket-closed' :
                    item.status === 'transferred' ? 'ticket-transferred' :
                    item.status === 'in_progress' ? 'ticket-in-progress' :
                    item.status === 'ordered' || item.status === 'ord' ? 'ticket-ordered' : ''
                  ].filter(Boolean).join(' ')}
                  onClick={() => handleItemClick(item)}
                >
                  <div className="mobile-card-header">
                    <div className="mobile-card-time">{timeStr}</div>
                    <StatusBadge status={item.status} />
                  </div>
                  <div className="mobile-card-guest">
                    {item.guestName || item.guest_name || 'Internal'}
                    {item.roomNumber || item.room_number ? ` • Room ${item.roomNumber || item.room_number}` : ''}
                  </div>
                  <div className="mobile-card-summary">{item.summary}</div>
                  {(item.priority === 'high' || item.priority === 'urgent') && (
                    <div className="mobile-card-priority">
                      {item.priority?.toUpperCase()} Priority
                    </div>
                  )}
                </div>
              )
            })
        )}
      </div>

      {/* Footer Stats */}
      <div className="dashboard-footer">
        <div className="total-count">TOTAL TICKETS: {filteredTickets?.length || 0}</div>
        <div className="pagination">
          <button>&lt;</button>
          <span>1 / {Math.ceil((filteredTickets?.length || 0) / 10) || 1}</span>
          <button>&gt;</button>
        </div>
      </div>

      {/* Detail Panel */}
      {selectedItem && (
        <TicketDetailPanel 
          item={selectedItem} 
          onClose={() => setSelectedItem(null)}
          onUpdate={refreshData}
        />
      )}
    </div>
  )
}

export default Dashboard
