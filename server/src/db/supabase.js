import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

// Load env vars (for local dev, Vercel injects them automatically)
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY

console.log('Supabase URL:', supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'NOT SET')
console.log('Supabase Key:', supabaseKey ? `${supabaseKey.substring(0, 10)}...` : 'NOT SET')

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase credentials not found. Database operations will fail.')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder'
)

export default supabase

