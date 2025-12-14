import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { tickets as ticketsApi, guests as guestsApi } from '../services/api';

const FilterContext = createContext();

// Fallback demo data in case API is unavailable
const demoTickets = [
  {
    id: 'demo-1',
    type: 'guest_request',
    guest_name: 'John Smith',
    room_number: '101',
    summary: 'Airport pickup arrangement',
    status: 'open',
    priority: 'high',
    scheduled_time: new Date().toISOString(),
    department: 'Concierge',
  },
  {
    id: 'demo-2',
    type: 'reminder',
    guest_name: 'Mary Johnson',
    room_number: '205',
    summary: 'Wake up call requested for 7:00 AM',
    status: 'pending',
    priority: 'normal',
    scheduled_time: new Date().toISOString(),
    department: 'Front Desk',
  },
  {
    id: 'demo-3',
    type: 'guest_request',
    guest_name: 'Robert Williams',
    room_number: '312',
    summary: 'Restaurant reservation at The Ivy - 8pm, 4 people',
    status: 'confirmed',
    priority: 'normal',
    scheduled_time: new Date().toISOString(),
    department: 'Concierge',
  },
];

export const FilterProvider = ({ children }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [tickets, setTickets] = useState([]);
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch tickets from API
  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filters = {};
      if (selectedStatus && selectedStatus !== 'All') {
        filters.status = selectedStatus.toLowerCase();
      }
      if (selectedType && selectedType !== 'All') {
        filters.type = selectedType.toLowerCase();
      }
      if (selectedDate) {
        filters.date = selectedDate;
      }
      
      const data = await ticketsApi.list(filters);
      
      // Normalize ticket data from API
      const normalizedTickets = (data || []).map(ticket => ({
        id: ticket.id,
        type: ticket.type || 'guest_request',
        guestName: ticket.guest_name || '',
        guest_name: ticket.guest_name || '',
        roomNumber: ticket.room_number || '',
        room_number: ticket.room_number || '',
        summary: ticket.summary || '',
        status: capitalizeFirst(ticket.status || 'open'),
        priority: ticket.priority || 'normal',
        time: ticket.scheduled_time || ticket.created_at,
        scheduled_time: ticket.scheduled_time || ticket.created_at,
        department: getDepartmentFromType(ticket.type),
        alerts: ticket.priority === 'high' || ticket.priority === 'urgent' ? ['Alert active'] : [],
      }));
      
      setTickets(normalizedTickets);
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
      setError(err.message);
      // Use demo data as fallback
      setTickets(demoTickets.map(t => ({
        ...t,
        guestName: t.guest_name,
        roomNumber: t.room_number,
        time: t.scheduled_time,
        status: capitalizeFirst(t.status),
        alerts: t.priority === 'high' ? ['Alert active'] : [],
      })));
    } finally {
      setLoading(false);
    }
  }, [selectedDate, selectedStatus, selectedType]);

  // Fetch guests from API
  const fetchGuests = useCallback(async () => {
    try {
      const data = await guestsApi.list(searchTerm);
      setGuests(data || []);
    } catch (err) {
      console.error('Failed to fetch guests:', err);
      setGuests([]);
    }
  }, [searchTerm]);

  // Load data on mount and when filters change
  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  useEffect(() => {
    fetchGuests();
  }, [fetchGuests]);

  // Helper functions
  function capitalizeFirst(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  function getDepartmentFromType(type) {
    switch (type) {
      case 'internal_request':
        return 'Maintenance';
      case 'reminder':
        return 'Front Desk';
      case 'guest_request':
      default:
        return 'Concierge';
    }
  }

  // Client-side filtering for search and department
  const filteredTickets = tickets.filter((ticket) => {
    const guestName = ticket.guestName || ticket.guest_name || '';
    const roomNumber = ticket.roomNumber || ticket.room_number || '';
    
    const matchesSearch =
      guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      roomNumber.includes(searchTerm) ||
      (ticket.summary || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment =
      selectedDepartment === 'All' || ticket.department === selectedDepartment;

    return matchesSearch && matchesDepartment;
  });

  const clearFilters = () => {
    setSelectedDate(new Date().toISOString().slice(0, 10));
    setSearchTerm('');
    setSelectedStatus('All');
    setSelectedType('All');
    setSelectedDepartment('All');
  };

  const departmentCounts = tickets.reduce(
    (acc, ticket) => {
      acc.total++;
      if (ticket.department === 'Concierge') acc.concierge++;
      if (ticket.department === 'Front Desk') acc.frontDesk++;
      if (ticket.department === 'Housekeeping') acc.housekeeping++;
      if (ticket.department === 'Maintenance') acc.maintenance++;
      return acc;
    },
    { total: 0, concierge: 0, frontDesk: 0, housekeeping: 0, maintenance: 0 }
  );

  const overviewCounts = {
    arrivals: guests.filter(
      (g) => g.check_in_date && new Date(g.check_in_date).toISOString().slice(0, 10) === selectedDate
    ).length,
    pending: tickets.filter((t) => t.status?.toLowerCase() === 'pending').length,
    alerts: tickets.filter((t) => t.alerts && t.alerts.length > 0).length,
  };

  // Function to refresh data
  const refreshData = () => {
    fetchTickets();
    fetchGuests();
  };

  // Function to add a new ticket (optimistic update)
  const addTicket = async (ticketData) => {
    try {
      const newTicket = await ticketsApi.create(ticketData);
      await fetchTickets(); // Refresh the list
      return newTicket;
    } catch (err) {
      console.error('Failed to create ticket:', err);
      throw err;
    }
  };

  // Function to update a ticket
  const updateTicket = async (id, ticketData) => {
    try {
      const updated = await ticketsApi.update(id, ticketData);
      await fetchTickets(); // Refresh the list
      return updated;
    } catch (err) {
      console.error('Failed to update ticket:', err);
      throw err;
    }
  };

  return (
    <FilterContext.Provider
      value={{
        selectedDate,
        setSelectedDate,
        searchTerm,
        setSearchTerm,
        selectedStatus,
        setSelectedStatus,
        selectedType,
        setSelectedType,
        selectedDepartment,
        setSelectedDepartment,
        tickets,
        filteredTickets,
        guests,
        loading,
        error,
        clearFilters,
        departmentCounts,
        overviewCounts,
        refreshData,
        addTicket,
        updateTicket,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};

export const useFilters = () => useContext(FilterContext);
