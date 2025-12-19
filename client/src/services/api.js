const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

async function request(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  }

  // Add auth token if available
  const token = localStorage.getItem('auth_token')
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(url, {
    ...options,
    headers
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(error.error || 'Request failed')
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}

// Auth
export const auth = {
  login: (email, password) => 
    request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),
  me: () => request('/api/auth/me')
}

// Timeline
export const timeline = {
  get: (date, status) => {
    const params = new URLSearchParams()
    if (date) params.set('date', date)
    if (status) params.set('status', status)
    return request(`/api/timeline?${params}`)
  },
  getNotes: (date) => {
    const params = new URLSearchParams()
    if (date) params.set('date', date)
    return request(`/api/timeline/notes?${params}`)
  },
  createNote: (content, priority) =>
    request('/api/timeline/notes', {
      method: 'POST',
      body: JSON.stringify({ content, priority })
    }),
  updateNote: (id, content, priority) =>
    request(`/api/timeline/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ content, priority })
    })
}

// Guests
export const guests = {
  list: (search, room) => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (room) params.set('room', room)
    return request(`/api/guests?${params}`)
  },
  get: (id) => request(`/api/guests/${id}`),
  create: (data) => 
    request('/api/guests', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  update: (id, data) =>
    request(`/api/guests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  delete: (id) =>
    request(`/api/guests/${id}`, { method: 'DELETE' })
}

// Tickets
export const tickets = {
  list: (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.status) params.set('status', filters.status)
    if (filters.type) params.set('type', filters.type)
    if (filters.date) params.set('date', filters.date)
    if (filters.guest_id) params.set('guest_id', filters.guest_id)
    return request(`/api/tickets?${params}`)
  },
  get: (id) => request(`/api/tickets/${id}`),
  create: (data) =>
    request('/api/tickets', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  update: (id, data) =>
    request(`/api/tickets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  addNote: (id, note) =>
    request(`/api/tickets/${id}/notes`, {
      method: 'POST',
      body: JSON.stringify({ note })
    }),
  close: (id) =>
    request(`/api/tickets/${id}/close`, { method: 'PUT' })
}

// Messages
export const messages = {
  send: (guest_id, subject, content, template) =>
    request('/api/messages/send', {
      method: 'POST',
      body: JSON.stringify({ guest_id, subject, content, template })
    }),
  getForGuest: (guestId) => request(`/api/messages/guest/${guestId}`)
}

// Transport
export const transport = {
  getFlights: () => request('/api/transport/flights'),
  getTraffic: () => request('/api/transport/traffic'),
  getRail: () => request('/api/transport/rail'),
  getBus: () => request('/api/transport/bus'),
  getGuestETA: (guestId) => request(`/api/transport/eta/${guestId}`)
}

export default {
  auth,
  timeline,
  guests,
  tickets,
  messages,
  transport
}



