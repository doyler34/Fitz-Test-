import { Router } from 'express'
import supabase from '../db/supabase.js'

const router = Router()

// Verify cron request is from Vercel
const verifyCron = (req, res, next) => {
  const authHeader = req.headers.authorization
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  next()
}

// GET /api/cron/flights - Poll flight status (called every 5 mins)
router.get('/flights', verifyCron, async (req, res) => {
  try {
    // Get all guests with flight numbers
    const { data: guests, error: guestsError } = await supabase
      .from('guests')
      .select('id, flight_number')
      .not('flight_number', 'is', null)

    if (guestsError) throw guestsError

    const flightNumbers = [...new Set(guests?.map(g => g.flight_number) || [])]
    
    if (flightNumbers.length === 0) {
      return res.json({ message: 'No flights to track', updated: 0 })
    }

    // In production, call actual flight API here
    // For now, update cache with simulated data
    const FLIGHT_API_KEY = process.env.FLIGHT_API_KEY
    
    if (FLIGHT_API_KEY) {
      // Example: AviationStack API call
      // const response = await fetch(`http://api.aviationstack.com/v1/flights?access_key=${FLIGHT_API_KEY}&flight_iata=${flightNumbers.join(',')}`)
      // const flightData = await response.json()
    }

    // Update flight cache (placeholder for actual implementation)
    for (const flightNumber of flightNumbers) {
      await supabase
        .from('flight_cache')
        .upsert({
          flight_number: flightNumber,
          last_updated: new Date().toISOString()
        }, {
          onConflict: 'flight_number'
        })
    }

    res.json({
      message: 'Flight data updated',
      tracked: flightNumbers.length,
      timestamp: new Date().toISOString()
    })
  } catch (err) {
    console.error('Cron flights error:', err)
    res.status(500).json({ error: 'Failed to update flight data' })
  }
})

// GET /api/cron/traffic - Poll traffic data (called every 10 mins)
router.get('/traffic', verifyCron, async (req, res) => {
  try {
    const GOOGLE_MAPS_KEY = process.env.GOOGLE_MAPS_API_KEY
    const TOMTOM_KEY = process.env.TOMTOM_API_KEY
    
    // Dublin Airport coordinates
    const origin = '53.4264,-6.2499'
    // Hotel coordinates (placeholder - update with actual hotel location)
    const destination = process.env.HOTEL_COORDINATES || '53.3498,-6.2603'
    
    let travelTime = null
    let trafficStatus = 'unknown'
    
    if (GOOGLE_MAPS_KEY) {
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destination}&departure_time=now&key=${GOOGLE_MAPS_KEY}`
        )
        const data = await response.json()
        
        if (data.rows?.[0]?.elements?.[0]?.duration_in_traffic) {
          travelTime = Math.round(data.rows[0].elements[0].duration_in_traffic.value / 60)
          const normalTime = Math.round(data.rows[0].elements[0].duration.value / 60)
          
          if (travelTime > normalTime * 1.5) {
            trafficStatus = 'heavy'
          } else if (travelTime > normalTime * 1.2) {
            trafficStatus = 'moderate'
          } else {
            trafficStatus = 'light'
          }
        }
      } catch (apiError) {
        console.error('Google Maps API error:', apiError)
      }
    }

    // Update traffic cache
    await supabase
      .from('transport_cache')
      .upsert({
        route_key: 'dublin_airport_to_hotel',
        transport_type: 'road',
        travel_time_mins: travelTime,
        traffic_status: trafficStatus,
        last_updated: new Date().toISOString()
      }, {
        onConflict: 'route_key'
      })

    res.json({
      message: 'Traffic data updated',
      travel_time_mins: travelTime,
      traffic_status: trafficStatus,
      timestamp: new Date().toISOString()
    })
  } catch (err) {
    console.error('Cron traffic error:', err)
    res.status(500).json({ error: 'Failed to update traffic data' })
  }
})

// GET /api/cron/transport - Poll rail/bus status
router.get('/transport', verifyCron, async (req, res) => {
  try {
    // Irish Rail API (free, no key required)
    // https://api.irishrail.ie/realtime/realtime.asmx
    
    try {
      const railResponse = await fetch(
        'https://api.irishrail.ie/realtime/realtime.asmx/getCurrentTrainsXML'
      )
      // Parse XML response and update cache
      // (simplified - would need XML parser in production)
    } catch (railError) {
      console.error('Irish Rail API error:', railError)
    }

    res.json({
      message: 'Transport data updated',
      timestamp: new Date().toISOString()
    })
  } catch (err) {
    console.error('Cron transport error:', err)
    res.status(500).json({ error: 'Failed to update transport data' })
  }
})

export default router



