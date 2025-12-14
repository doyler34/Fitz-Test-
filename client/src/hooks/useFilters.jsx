import { createContext, useContext, useState, useCallback } from 'react'

const FilterContext = createContext(null)

export function FilterProvider({ children }) {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedDepartment, setSelectedDepartment] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [ticketType, setTicketType] = useState('all')

  // Summary counts (will be updated from timeline data)
  const [summary, setSummary] = useState({
    arrivals: 0,
    pending: 0,
    alerts: 0
  })

  // Department counts
  const [departmentCounts, setDepartmentCounts] = useState({
    concierge: 0,
    front_desk: 0,
    housekeeping: 0,
    maintenance: 0
  })

  const resetFilters = useCallback(() => {
    setSelectedDate(new Date())
    setSelectedDepartment('concierge')
    setStatusFilter('all')
    setSearchQuery('')
    setTicketType('all')
  }, [])

  const value = {
    // Date
    selectedDate,
    setSelectedDate,
    
    // Department
    selectedDepartment,
    setSelectedDepartment,
    
    // Status
    statusFilter,
    setStatusFilter,
    
    // Search
    searchQuery,
    setSearchQuery,
    
    // Ticket type
    ticketType,
    setTicketType,
    
    // Summary
    summary,
    setSummary,
    
    // Department counts
    departmentCounts,
    setDepartmentCounts,
    
    // Actions
    resetFilters
  }

  return (
    <FilterContext.Provider value={value}>
      {children}
    </FilterContext.Provider>
  )
}

export function useFilters() {
  const context = useContext(FilterContext)
  if (!context) {
    throw new Error('useFilters must be used within a FilterProvider')
  }
  return context
}

export default useFilters

