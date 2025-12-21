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
  telegramBot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true })
  
  // Handle incoming messages
  telegramBot.on('message', async (msg) => {
    const chatId = msg.chat.id.toString()
    const text = msg.text || ''
    const userId = msg.from?.id
    const userName = msg.from?.first_name || msg.from?.username || 'Guest'
    const userPhone = msg.from?.phone_number || null
    
    console.log('Telegram message received:', { chatId, text, userId, userName, userPhone })
    
    // Handle /start command
    if (text.startsWith('/start')) {
      try {
        // Extract identifier from message (e.g., /start +353851097425 or /start email@example.com)
        const identifier = text.split(' ')[1] || null
        
        if (identifier) {
          // Try to find guest by phone or email
          const { data: guests } = await supabase
            .from('guests')
            .select('id, name, contact_phone, contact_email')
            .or(`contact_phone.ilike.%${identifier}%,contact_email.ilike.%${identifier}%`)
            .limit(1)
          
          if (guests && guests.length > 0) {
            // Update guest with chat ID
            await supabase
              .from('guests')
              .update({ telegram_chat_id: chatId })
              .eq('id', guests[0].id)
            
            await telegramBot.sendMessage(chatId, 
              `Hello ${guests[0].name}! ✅\n\n` +
              `You've been successfully registered with The Fitz Hotel concierge.\n\n` +
              `Your Telegram chat ID: ${chatId}\n\n` +
              `You can now receive messages from our concierge team.`
            )
          } else {
            await telegramBot.sendMessage(chatId, 
              `Hello ${userName}! 👋\n\n` +
              `Guest not found with that identifier.\n\n` +
              `Your Telegram chat ID is: ${chatId}\n\n` +
              `Please contact the concierge to link your account.`
            )
          }
        } else {
          // No identifier provided, just welcome them
          await telegramBot.sendMessage(chatId, 
            `Welcome to The Fitz Hotel Concierge! 👋\n\n` +
            `Your Telegram chat ID: ${chatId}\n\n` +
            `To register, send: /start followed by your phone number or email\n` +
            `Example: /start +353851097425\n\n` +
            `Or contact the concierge to link your account.`
          )
        }
      } catch (error) {
        console.error('Error handling /start command:', error)
        await telegramBot.sendMessage(chatId, 
          'Sorry, there was an error processing your request. Please try again later.'
        )
      }
    } else {
      // For any other message, acknowledge it
      await telegramBot.sendMessage(chatId, 
        `Thank you for your message, ${userName}! 💬\n\n` +
        `The concierge team will respond shortly.\n\n` +
        `Your chat ID: ${chatId}`
      )
    }
  })
  
  console.log('Telegram bot initialized and listening for messages')
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
      // Use telegram_chat_id if available, otherwise try phone number
      const telegramChatId = guest.telegram_chat_id || guest.contact_phone
      
      if (!telegramChatId) {
        return res.status(400).json({ error: 'Guest has no Telegram chat ID or phone number' })
      }

      // Send Telegram message
      if (process.env.TELEGRAM_BOT_TOKEN && telegramBot) {
        try {
          const telegramMessage = messageSubject ? `*${messageSubject}*\n\n${messageContent}` : messageContent
          // Format chat ID or phone number (remove spaces, dashes, etc.)
          const chatId = telegramChatId.replace(/[\s\-\(\)]/g, '')
          
          await telegramBot.sendMessage(chatId, telegramMessage, {
            parse_mode: 'Markdown'
          })
        } catch (telegramError) {
          console.error('Telegram send error:', telegramError)
          sendStatus = 'failed'
          
          // Provide user-friendly error messages
          if (telegramError.response?.body?.description) {
            const errorDesc = telegramError.response.body.description
            if (errorDesc.includes('chat not found')) {
              sendError = 'Telegram chat not found. The phone number or chat ID may not be valid, or the user may not have started a conversation with the bot. Please ensure the guest has messaged your Telegram bot first to get their chat ID.'
            } else if (errorDesc.includes('bot was blocked')) {
              sendError = 'The user has blocked the Telegram bot. Please ask them to unblock it.'
            } else {
              sendError = `Telegram error: ${errorDesc}`
            }
          } else {
            sendError = telegramError.message || 'Failed to send Telegram message'
          }
        }
      } else {
        console.log('Telegram message would be sent (demo mode):', { chatId: telegramChatId, content: messageContent })
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

