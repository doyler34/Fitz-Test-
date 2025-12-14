import express from 'express'
import cors from 'cors'
import authRoutes from '../src/routes/auth.js'
import guestRoutes from '../src/routes/guests.js'
import ticketRoutes from '../src/routes/tickets.js'
import timelineRoutes from '../src/routes/timeline.js'
import messageRoutes from '../src/routes/messages.js'
import transportRoutes from '../src/routes/transport.js'
import cronRoutes from '../src/routes/cron.js'

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    supabase_url: process.env.SUPABASE_URL ? 'configured' : 'missing',
    supabase_key: process.env.SUPABASE_ANON_KEY ? 'configured' : 'missing'
  })
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/guests', guestRoutes)
app.use('/api/tickets', ticketRoutes)
app.use('/api/timeline', timelineRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/transport', transportRoutes)
app.use('/api/cron', cronRoutes)

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Internal server error' })
})

export default app

