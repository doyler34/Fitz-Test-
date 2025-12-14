import { Router } from 'express'
import supabase from '../db/supabase.js'

const router = Router()

// GET /api/guests - List all guests
router.get('/', async (req, res) => {
  try {
    const { search, room } = req.query
    
    let query = supabase
      .from('guests')
      .select('*')
      .order('created_at', { ascending: false })

    if (search) {
      query = query.ilike('name', `%${search}%`)
    }

    if (room) {
      query = query.eq('room_number', room)
    }

    const { data, error } = await query

    if (error) throw error
    res.json(data)
  } catch (err) {
    console.error('Get guests error:', err)
    res.status(500).json({ error: 'Failed to fetch guests' })
  }
})

// GET /api/guests/:id - Get single guest
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const { data: guest, error } = await supabase
      .from('guests')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !guest) {
      return res.status(404).json({ error: 'Guest not found' })
    }

    // Get related tickets
    const { data: tickets } = await supabase
      .from('tickets')
      .select('*')
      .eq('guest_id', id)
      .order('created_at', { ascending: false })

    // Get messages
    const { data: messages } = await supabase
      .from('messages')
      .select('*')
      .eq('guest_id', id)
      .order('sent_at', { ascending: false })

    res.json({ ...guest, tickets: tickets || [], messages: messages || [] })
  } catch (err) {
    console.error('Get guest error:', err)
    res.status(500).json({ error: 'Failed to fetch guest' })
  }
})

// POST /api/guests - Create guest
router.post('/', async (req, res) => {
  try {
    const {
      name,
      room_number,
      contact_phone,
      contact_email,
      arrival_method,
      flight_number,
      notes
    } = req.body

    if (!name || !room_number) {
      return res.status(400).json({ error: 'Name and room number required' })
    }

    const { data, error } = await supabase
      .from('guests')
      .insert({
        name,
        room_number,
        contact_phone,
        contact_email,
        arrival_method,
        flight_number,
        notes
      })
      .select()
      .single()

    if (error) throw error
    res.status(201).json(data)
  } catch (err) {
    console.error('Create guest error:', err)
    res.status(500).json({ error: 'Failed to create guest' })
  }
})

// PUT /api/guests/:id - Update guest
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body

    const { data, error } = await supabase
      .from('guests')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    res.json(data)
  } catch (err) {
    console.error('Update guest error:', err)
    res.status(500).json({ error: 'Failed to update guest' })
  }
})

// DELETE /api/guests/:id - Delete guest
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const { error } = await supabase
      .from('guests')
      .delete()
      .eq('id', id)

    if (error) throw error
    res.status(204).send()
  } catch (err) {
    console.error('Delete guest error:', err)
    res.status(500).json({ error: 'Failed to delete guest' })
  }
})

export default router

