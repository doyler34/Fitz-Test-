import { useState } from 'react'
import { ChevronLeft, ChevronRight, Clock, Users, AlertCircle } from 'lucide-react'
import { useFilters } from '../hooks/useFilters'
import './Sidebar.css'

function Sidebar() {
  const { 
    selectedDate, 
    setSelectedDate, 
    selectedDepartment, 
    setSelectedDepartment,
    departmentCounts,
    overviewCounts
  } = useFilters()

  const [viewDate, setViewDate] = useState(new Date(selectedDate || new Date()))
  
  const today = new Date()
  const currentMonth = viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })
  
  // Generate calendar days
  const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1)
  const lastDay = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0)
  const startPadding = firstDay.getDay()
  
  const days = []
  // Previous month padding
  for (let i = 0; i < startPadding; i++) {
    const prevDate = new Date(firstDay)
    prevDate.setDate(prevDate.getDate() - (startPadding - i))
    days.push({ date: prevDate, isOtherMonth: true })
  }
  // Current month days
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push({ 
      date: new Date(viewDate.getFullYear(), viewDate.getMonth(), i),
      isOtherMonth: false 
    })
  }

  const prevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))
  }

  const isToday = (date) => {
    return date.toDateString() === today.toDateString()
  }

  const isSelected = (date) => {
    const selected = new Date(selectedDate)
    return date.toDateString() === selected.toDateString()
  }

  const handleDateClick = (date) => {
    setSelectedDate(date.toISOString().slice(0, 10))
  }

  const totalCount = (departmentCounts?.concierge || 0) + 
                     (departmentCounts?.frontDesk || 0) + 
                     (departmentCounts?.housekeeping || 0) + 
                     (departmentCounts?.maintenance || 0)

  const departments = [
    { id: 'All', name: 'All Departments', count: departmentCounts?.total || 0 },
    { id: 'Concierge', name: 'Concierge', count: departmentCounts?.concierge || 0 },
    { id: 'Front Desk', name: 'Front Desk', count: departmentCounts?.frontDesk || 0 },
    { id: 'Housekeeping', name: 'Housekeeping', count: departmentCounts?.housekeeping || 0 },
    { id: 'Maintenance', name: 'Maintenance', count: departmentCounts?.maintenance || 0 },
  ]

  return (
    <aside className="sidebar">
      {/* Calendar */}
      <div className="sidebar-section">
        <div className="calendar-header">
          <button className="calendar-nav" onClick={prevMonth}>
            <ChevronLeft size={16} />
          </button>
          <span className="calendar-month">{currentMonth}</span>
          <button className="calendar-nav" onClick={nextMonth}>
            <ChevronRight size={16} />
          </button>
        </div>
        <div className="calendar-grid">
          <div className="calendar-weekdays">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
              <span key={i} className="weekday">{day}</span>
            ))}
          </div>
          <div className="calendar-days">
            {days.map((day, i) => (
              <button
                key={i}
                className={`calendar-day ${day.isOtherMonth ? 'other-month' : ''} ${isToday(day.date) ? 'today' : ''} ${isSelected(day.date) ? 'selected' : ''}`}
                onClick={() => handleDateClick(day.date)}
              >
                {day.date.getDate()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Department Filter */}
      <div className="sidebar-section">
        <div className="section-header">
          <span>Departments</span>
        </div>
        <div className="department-list">
          {departments.map(dept => (
            <button 
              key={dept.id} 
              className={`department-item ${selectedDepartment === dept.id ? 'active' : ''}`}
              onClick={() => setSelectedDepartment(dept.id)}
            >
              <span className="dept-name">{dept.name}</span>
              <span className="dept-count">{dept.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Today's Summary */}
      <div className="sidebar-section">
        <div className="section-header">
          <span>Today's Overview</span>
        </div>
        <div className="summary-cards">
          <div className="summary-card">
            <div className="summary-icon arrivals">
              <Users size={16} />
            </div>
            <div className="summary-info">
              <span className="summary-value">{overviewCounts?.arrivals || 0}</span>
              <span className="summary-label">Arrivals</span>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon pending">
              <Clock size={16} />
            </div>
            <div className="summary-info">
              <span className="summary-value">{overviewCounts?.pending || 0}</span>
              <span className="summary-label">Pending</span>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon alerts">
              <AlertCircle size={16} />
            </div>
            <div className="summary-info">
              <span className="summary-value">{overviewCounts?.alerts || 0}</span>
              <span className="summary-label">Alerts</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
