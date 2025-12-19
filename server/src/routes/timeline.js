import { Router } from 'express'
import supabase from '../db/supabase.js'

const router = Router()

// GET /api/timeline - Get aggregated timeline items for dashboard
router.get('/', async (req, res) => {
  try {
    const { date, status } = req.query
    
    const targetDate = date ? new Date(date) : new Date()
    const startOfDay = new Date(targetDate)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(targetDate)
    endOfDay.setHours(23, 59, 59, 999)

    // Get tickets for the day
    let ticketQuery = supabase
      .from('tickets')
      .select(`
        *,
        guest:guests(id, name, room_number)
      `)
      .gte('scheduled_time', startOfDay.toISOString())
      .lte('scheduled_time', endOfDay.toISOString())
      .order('scheduled_time', { ascending: true })

    if (status && status !== 'all') {
      ticketQuery = ticketQuery.eq('status', status)
    }

    const { data: tickets, error: ticketsError } = await ticketQuery

    if (ticketsError) throw ticketsError

    // Get arrival alerts (guests with flights arriving today)
    const { data: arrivals, error: arrivalsError } = await supabase
      .from('guests')
      .select(`
        *,
        flight_data:flight_cache(*)
      `)
      .not('flight_number', 'is', null)
      .gte('check_in_date', startOfDay.toISOString())
      .lte('check_in_date', endOfDay.toISOString())

    // Build timeline items
    const timelineItems = []

    // Add tickets to timeline
    if (tickets) {
      tickets.forEach(ticket => {
        timelineItems.push({
          id: `ticket-${ticket.id}`,
          type: 'ticket',
          ticketType: ticket.type,
          time: ticket.scheduled_time,
          guestName: ticket.guest?.name || ticket.guest_name,
          roomNumber: ticket.guest?.room_number || ticket.room_number,
          summary: ticket.summary,
          status: ticket.status,
          priority: ticket.priority,
          hasAlert: ticket.priority === 'high',
          data: ticket
        })
      })
    }

    // Add arrival alerts to timeline
    if (arrivals) {
      arrivals.forEach(guest => {
        const flightData = guest.flight_data?.[0]
        const isDelayed = flightData?.delay_minutes > 15
        
        timelineItems.push({
          id: `arrival-${guest.id}`,
          type: 'arrival',
          time: flightData?.arrival_time || guest.check_in_date,
          guestName: guest.name,
          roomNumber: guest.room_number,
          summary: `Flight ${guest.flight_number}${isDelayed ? ' - DELAYED' : ''}`,
          status: isDelayed ? 'delayed' : 'on_time',
          hasAlert: isDelayed,
          data: { guest, flight: flightData }
        })
      })
    }

    // Sort by time
    timelineItems.sort((a, b) => new Date(a.time) - new Date(b.time))

    // Group by hour for timeline display
    const grouped = {}
    timelineItems.forEach(item => {
      const hour = new Date(item.time).getHours()
      const hourKey = `${hour.toString().padStart(2, '0')}:00`
      if (!grouped[hourKey]) {
        grouped[hourKey] = []
      }
      grouped[hourKey].push(item)
    })

    res.json({
      date: targetDate.toISOString().split('T')[0],
      items: timelineItems,
      grouped,
      counts: {
        total: timelineItems.length,
        open: timelineItems.filter(i => i.status === 'open').length,
        pending: timelineItems.filter(i => i.status === 'pending').length,
        confirmed: timelineItems.filter(i => i.status === 'confirmed').length,
        closed: timelineItems.filter(i => i.status === 'closed').length
      }
    })
  } catch (err) {
    console.error('Get timeline error:', err)
    res.status(500).json({ error: 'Failed to fetch timeline' })
  }
})

// GET /api/timeline/notes - Get internal notes for the day
router.get('/notes', async (req, res) => {
  try {
    const { date } = req.query
    
    const targetDate = date ? new Date(date) : new Date()
    const startOfDay = new Date(targetDate)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(targetDate)
    endOfDay.setHours(23, 59, 59, 999)

    const { data, error } = await supabase
      .from('internal_notes')
      .select(`
        *,
        staff:staff(id, name)
      `)
      .gte('created_at', startOfDay.toISOString())
      .lte('created_at', endOfDay.toISOString())
      .order('created_at', { ascending: false })

    if (error) throw error
    res.json(data || [])
  } catch (err) {
    console.error('Get notes error:', err)
    res.status(500).json({ error: 'Failed to fetch notes' })
  }
})

// POST /api/timeline/notes - Create internal note
router.post('/notes', async (req, res) => {
  try {
    const { content, priority, staff_id } = req.body

    if (!content) {
      return res.status(400).json({ error: 'Note content required' })
    }

    const { data, error } = await supabase
      .from('internal_notes')
      .insert({
        content,
        priority: priority || 'normal',
        staff_id
      })
      .select()
      .single()

    if (error) throw error
    res.status(201).json(data)
  } catch (err) {
    console.error('Create note error:', err)
    res.status(500).json({ error: 'Failed to create note' })
  }
})

// PUT /api/timeline/notes/:id - Update internal note
router.put('/notes/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { content, priority } = req.body

    if (!content) {
      return res.status(400).json({ error: 'Note content required' })
    }

    const { data, error } = await supabase
      .from('internal_notes')
      .update({
        content,
        priority: priority || 'normal'
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    res.json(data)
  } catch (err) {
    console.error('Update note error:', err)
    res.status(500).json({ error: 'Failed to update note' })
  }
})

export default router



