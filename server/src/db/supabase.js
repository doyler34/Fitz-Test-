import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load env vars (for local dev, Vercel injects them automatically)
dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY

console.log('Supabase URL:', supabaseUrl ? 'Set' : 'NOT SET')
console.log('Supabase Key:', supabaseKey ? 'Set' : 'NOT SET')

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase credentials not found. Database operations will fail.')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder'
)

export default supabase

