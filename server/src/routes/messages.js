import { Router } from 'express'
import { Resend } from 'resend'
import supabase from '../db/supabase.js'

const router = Router()

// Only initialize Resend if API key is present
let resend = null
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY)
}

// POST /api/messages/send - Send email to guest
router.post('/send', async (req, res) => {
  try {
    const { guest_id, subject, content, template } = req.body

    // Get guest details
    const { data: guest, error: guestError } = await supabase
      .from('guests')
      .select('*')
      .eq('id', guest_id)
      .single()

    if (guestError || !guest) {
      return res.status(404).json({ error: 'Guest not found' })
    }

    if (!guest.contact_email) {
      return res.status(400).json({ error: 'Guest has no email address' })
    }

    // Build email content based on template
    let emailSubject = subject
    let emailContent = content

    if (template === 'pre_arrival') {
      emailSubject = emailSubject || `Welcome to The Fitz - We're expecting you!`
      emailContent = emailContent || `
Dear ${guest.name},

We're delighted to welcome you to The Fitz Hotel. 

Your room ${guest.room_number} is being prepared for your arrival.

If you need any assistance or have special requests, please don't hesitate to reply to this email or contact our concierge team.

Safe travels!

Warm regards,
The Fitz Concierge Team
      `.trim()
    } else if (template === 'delay_notification') {
      emailSubject = emailSubject || `Flight Update - The Fitz Concierge`
      emailContent = emailContent || `
Dear ${guest.name},

We noticed your flight may be delayed. Please don't worry - we'll hold your room and have everything ready for your arrival.

If your plans change, please let us know and we'll be happy to assist.

Safe travels!

Warm regards,
The Fitz Concierge Team
      `.trim()
    }

    // Send email via Resend
    if (process.env.RESEND_API_KEY) {
      const { data: emailData, error: emailError } = await resend.emails.send({
        from: process.env.EMAIL_FROM || 'concierge@thefitz.hotel',
        to: guest.contact_email,
        subject: emailSubject,
        text: emailContent
      })

      if (emailError) {
        console.error('Email send error:', emailError)
        // Continue to log the message even if send fails
      }
    }

    // Log message to database
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert({
        guest_id,
        channel: 'email',
        subject: emailSubject,
        content: emailContent,
        status: 'sent'
      })
      .select()
      .single()

    if (messageError) throw messageError

    res.status(201).json({
      success: true,
      message
    })
  } catch (err) {
    console.error('Send message error:', err)
    res.status(500).json({ error: 'Failed to send message' })
  }
})

// GET /api/messages/guest/:guestId - Get message history for guest
router.get('/guest/:guestId', async (req, res) => {
  try {
    const { guestId } = req.params

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('guest_id', guestId)
      .order('sent_at', { ascending: false })

    if (error) throw error
    res.json(data || [])
  } catch (err) {
    console.error('Get messages error:', err)
    res.status(500).json({ error: 'Failed to fetch messages' })
  }
})

export default router

