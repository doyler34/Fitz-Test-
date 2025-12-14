import { Router } from 'express'
import supabase from '../db/supabase.js'

const router = Router()

// GET /api/transport/flights - Get cached flight data
router.get('/flights', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('flight_cache')
      .select('*')
      .order('arrival_time', { ascending: true })

    if (error) throw error
    res.json(data || [])
  } catch (err) {
    console.error('Get flights error:', err)
    res.status(500).json({ error: 'Failed to fetch flight data' })
  }
})

// GET /api/transport/traffic - Get cached traffic data
router.get('/traffic', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('transport_cache')
      .select('*')
      .eq('route_key', 'dublin_airport_to_hotel')
      .single()

    if (error && error.code !== 'PGRST116') throw error
    
    res.json(data || {
      route_key: 'dublin_airport_to_hotel',
      travel_time_mins: null,
      traffic_status: 'unknown',
      last_updated: null
    })
  } catch (err) {
    console.error('Get traffic error:', err)
    res.status(500).json({ error: 'Failed to fetch traffic data' })
  }
})

// GET /api/transport/rail - Get Irish Rail status
router.get('/rail', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('transport_cache')
      .select('*')
      .eq('transport_type', 'rail')
      .order('last_updated', { ascending: false })

    if (error) throw error
    res.json(data || [])
  } catch (err) {
    console.error('Get rail error:', err)
    res.status(500).json({ error: 'Failed to fetch rail data' })
  }
})

// GET /api/transport/bus - Get bus disruption status
router.get('/bus', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('transport_cache')
      .select('*')
      .eq('transport_type', 'bus')
      .order('last_updated', { ascending: false })

    if (error) throw error
    res.json(data || [])
  } catch (err) {
    console.error('Get bus error:', err)
    res.status(500).json({ error: 'Failed to fetch bus data' })
  }
})

// GET /api/transport/eta/:guestId - Calculate ETA for guest
router.get('/eta/:guestId', async (req, res) => {
  try {
    const { guestId } = req.params

    // Get guest with flight info
    const { data: guest, error: guestError } = await supabase
      .from('guests')
      .select('*, flight_data:flight_cache(*)')
      .eq('id', guestId)
      .single()

    if (guestError || !guest) {
      return res.status(404).json({ error: 'Guest not found' })
    }

    // Get current traffic data
    const { data: traffic } = await supabase
      .from('transport_cache')
      .select('*')
      .eq('route_key', 'dublin_airport_to_hotel')
      .single()

    const flightData = guest.flight_data?.[0]
    let eta = null
    let etaDetails = {}

    if (flightData?.arrival_time && traffic?.travel_time_mins) {
      const flightArrival = new Date(flightData.arrival_time)
      // Add buffer for deplaning/customs (30 mins) + travel time
      const bufferMins = 30
      const totalMins = bufferMins + traffic.travel_time_mins
      
      eta = new Date(flightArrival.getTime() + totalMins * 60000)
      
      etaDetails = {
        flight_arrival: flightArrival.toISOString(),
        buffer_minutes: bufferMins,
        travel_minutes: traffic.travel_time_mins,
        traffic_status: traffic.traffic_status,
        estimated_arrival: eta.toISOString()
      }
    }

    res.json({
      guest_id: guestId,
      guest_name: guest.name,
      flight_number: guest.flight_number,
      eta: eta?.toISOString() || null,
      details: etaDetails
    })
  } catch (err) {
    console.error('Calculate ETA error:', err)
    res.status(500).json({ error: 'Failed to calculate ETA' })
  }
})

export default router

