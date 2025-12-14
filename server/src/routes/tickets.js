import { Router } from 'express'
import supabase from '../db/supabase.js'

const router = Router()

// GET /api/tickets - List tickets with filters
router.get('/', async (req, res) => {
  try {
    const { status, type, date, guest_id } = req.query
    
    let query = supabase
      .from('tickets')
      .select(`
        *,
        guest:guests(id, name, room_number)
      `)
      .order('scheduled_time', { ascending: true })

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (type) {
      query = query.eq('type', type)
    }

    if (date) {
      // Filter by date
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)
      
      query = query
        .gte('scheduled_time', startOfDay.toISOString())
        .lte('scheduled_time', endOfDay.toISOString())
    }

    if (guest_id) {
      query = query.eq('guest_id', guest_id)
    }

    const { data, error } = await query

    if (error) throw error
    res.json(data)
  } catch (err) {
    console.error('Get tickets error:', err)
    res.status(500).json({ error: 'Failed to fetch tickets' })
  }
})

// GET /api/tickets/:id - Get single ticket with notes
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const { data: ticket, error } = await supabase
      .from('tickets')
      .select(`
        *,
        guest:guests(id, name, room_number, contact_email),
        notes:ticket_notes(
          id,
          note,
          created_at,
          staff:staff(id, name)
        )
      `)
      .eq('id', id)
      .single()

    if (error || !ticket) {
      return res.status(404).json({ error: 'Ticket not found' })
    }

    res.json(ticket)
  } catch (err) {
    console.error('Get ticket error:', err)
    res.status(500).json({ error: 'Failed to fetch ticket' })
  }
})

// POST /api/tickets - Create ticket
router.post('/', async (req, res) => {
  try {
    const {
      type,
      guest_id,
      guest_name,
      room_number,
      summary,
      scheduled_time,
      priority,
      assigned_to
    } = req.body

    if (!summary) {
      return res.status(400).json({ error: 'Summary required' })
    }

    const { data, error } = await supabase
      .from('tickets')
      .insert({
        type: type || 'guest_request',
        guest_id,
        guest_name,
        room_number,
        summary,
        scheduled_time: scheduled_time || new Date().toISOString(),
        status: 'open',
        priority: priority || 'normal',
        assigned_to
      })
      .select()
      .single()

    if (error) throw error
    res.status(201).json(data)
  } catch (err) {
    console.error('Create ticket error:', err)
    res.status(500).json({ error: 'Failed to create ticket' })
  }
})

// PUT /api/tickets/:id - Update ticket
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body

    updates.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('tickets')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    res.json(data)
  } catch (err) {
    console.error('Update ticket error:', err)
    res.status(500).json({ error: 'Failed to update ticket' })
  }
})

// POST /api/tickets/:id/notes - Add note to ticket
router.post('/:id/notes', async (req, res) => {
  try {
    const { id } = req.params
    const { note, staff_id } = req.body

    if (!note) {
      return res.status(400).json({ error: 'Note content required' })
    }

    const { data, error } = await supabase
      .from('ticket_notes')
      .insert({
        ticket_id: id,
        staff_id,
        note
      })
      .select()
      .single()

    if (error) throw error
    res.status(201).json(data)
  } catch (err) {
    console.error('Add note error:', err)
    res.status(500).json({ error: 'Failed to add note' })
  }
})

// PUT /api/tickets/:id/close - Close ticket
router.put('/:id/close', async (req, res) => {
  try {
    const { id } = req.params

    const { data, error } = await supabase
      .from('tickets')
      .update({ 
        status: 'closed',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    res.json(data)
  } catch (err) {
    console.error('Close ticket error:', err)
    res.status(500).json({ error: 'Failed to close ticket' })
  }
})

export default router

