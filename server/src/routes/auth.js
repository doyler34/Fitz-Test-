import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import supabase from '../db/supabase.js'

const router = Router()

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production'

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' })
    }

    const { data: staff, error } = await supabase
      .from('staff')
      .select('*')
      .eq('email', email.toLowerCase())
      .single()

    if (error || !staff) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const validPassword = await bcrypt.compare(password, staff.password_hash)
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const token = jwt.sign(
      { id: staff.id, email: staff.email, role: staff.role },
      JWT_SECRET,
      { expiresIn: '8h' }
    )

    res.json({
      token,
      user: {
        id: staff.id,
        name: staff.name,
        email: staff.email,
        role: staff.role
      }
    })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: 'Login failed' })
  }
})

// GET /api/auth/me - Get current user
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' })
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, JWT_SECRET)

    const { data: staff } = await supabase
      .from('staff')
      .select('id, name, email, role')
      .eq('id', decoded.id)
      .single()

    if (!staff) {
      return res.status(401).json({ error: 'User not found' })
    }

    res.json(staff)
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' })
  }
})

export default router



