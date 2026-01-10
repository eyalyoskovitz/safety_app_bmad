/**
 * Verify anon key is loaded correctly
 */

import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
config({ path: resolve(__dirname, '../../.env.local') })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

console.log('Environment Variables Check:')
console.log('============================')
console.log('VITE_SUPABASE_URL:', supabaseUrl)
console.log('VITE_SUPABASE_ANON_KEY (first 50 chars):', supabaseAnonKey?.substring(0, 50) + '...')
console.log('VITE_SUPABASE_ANON_KEY (last 20 chars):', '...' + supabaseAnonKey?.substring(supabaseAnonKey.length - 20))
console.log('Key length:', supabaseAnonKey?.length)
console.log('Key starts with "eyJ":', supabaseAnonKey?.startsWith('eyJ'))
console.log()

// Decode the JWT to see what role it contains
if (supabaseAnonKey?.startsWith('eyJ')) {
  try {
    const parts = supabaseAnonKey.split('.')
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString())
    console.log('JWT Payload:')
    console.log('  Role:', payload.role)
    console.log('  Issuer:', payload.iss)
    console.log('  Full payload:', JSON.stringify(payload, null, 2))
  } catch (e) {
    console.error('Failed to decode JWT:', e)
  }
}
