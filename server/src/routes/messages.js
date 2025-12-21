import { Router } from 'express'
import { Resend } from 'resend'
import TelegramBot from 'node-telegram-bot-api'
import supabase from '../db/supabase.js'

const router = Router()

// Only initialize Resend if API key is present
let resend = null
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY)
}

// Initialize Telegram bot if token is present
let telegramBot = null
if (process.env.TELEGRAM_BOT_TOKEN) {
  telegramBot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false })
}

// POST /api/messages/send - Send message (email or telegram) to guest
router.post('/send', async (req, res) => {
  try {
    const { guest_id, subject, content, template, channel = 'email' } = req.body

    // Get guest details
    const { data: guest, error: guestError } = await supabase
      .from('guests')
      .select('*')
      .eq('id', guest_id)
      .single()

    if (guestError || !guest) {
      return res.status(404).json({ error: 'Guest not found' })
    }

    // Build message content based on template
    let messageSubject = subject
    let messageContent = content

    if (template === 'pre_arrival') {
      messageSubject = messageSubject || `Welcome to The Fitz - We're expecting you!`
      messageContent = messageContent || `
Dear ${guest.name},

We're delighted to welcome you to The Fitz Hotel. 

Your room ${guest.room_number} is being prepared for your arrival.

If you need any assistance or have special requests, please don't hesitate to contact our concierge team.

Safe travels!

Warm regards,
The Fitz Concierge Team
      `.trim()
    } else if (template === 'delay_notification') {
      messageSubject = messageSubject || `Flight Update - The Fitz Concierge`
      messageContent = messageContent || `
Dear ${guest.name},

We noticed your flight may be delayed. Please don't worry - we'll hold your room and have everything ready for your arrival.

If your plans change, please let us know and we'll be happy to assist.

Safe travels!

Warm regards,
The Fitz Concierge Team
      `.trim()
    }

    let sendStatus = 'sent'
    let sendError = null

    // Send via selected channel
    if (channel === 'email') {
      if (!guest.contact_email) {
        return res.status(400).json({ error: 'Guest has no email address' })
      }

      // Send email via Resend
      if (process.env.RESEND_API_KEY && resend) {
        const { data: emailData, error: emailError } = await resend.emails.send({
          from: process.env.EMAIL_FROM || 'concierge@thefitz.hotel',
          to: guest.contact_email,
          subject: messageSubject,
          text: messageContent
        })

        if (emailError) {
          console.error('Email send error:', emailError)
          sendStatus = 'failed'
          sendError = emailError.message
        }
      } else {
        console.log('Email would be sent (demo mode):', { to: guest.contact_email, subject: messageSubject })
      }
    } else if (channel === 'telegram') {
      if (!guest.telegram_chat_id) {
        return res.status(400).json({ error: 'Guest has no Telegram chat ID' })
      }

      // Send Telegram message
      if (process.env.TELEGRAM_BOT_TOKEN && telegramBot) {
        try {
          const telegramMessage = messageSubject ? `*${messageSubject}*\n\n${messageContent}` : messageContent
          await telegramBot.sendMessage(guest.telegram_chat_id, telegramMessage, {
            parse_mode: 'Markdown'
          })
        } catch (telegramError) {
          console.error('Telegram send error:', telegramError)
          sendStatus = 'failed'
          sendError = telegramError.message
        }
      } else {
        console.log('Telegram message would be sent (demo mode):', { chatId: guest.telegram_chat_id, content: messageContent })
      }
    } else {
      return res.status(400).json({ error: 'Invalid channel. Use "email" or "telegram"' })
    }

    // Log message to database
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert({
        guest_id,
        channel: channel,
        subject: messageSubject,
        content: messageContent,
        status: sendStatus
      })
      .select()
      .single()

    if (messageError) throw messageError

    res.status(201).json({
      success: true,
      message,
      error: sendError || null
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

