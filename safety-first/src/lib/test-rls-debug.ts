/**
 * Debug RLS Policy Issues
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
config({ path: resolve(__dirname, '../../.env.local') })

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function debugRLS() {
  console.log('🔍 Debugging RLS Policies...\n')

  // Check current user role
  const { data: { user } } = await supabase.auth.getUser()
  console.log('Current user:', user ? user.email : 'Anonymous (anon role)')
  console.log('Role:', user ? 'authenticated' : 'anon')
  console.log()

  // Get a location ID first
  const { data: locations } = await supabase
    .from('plant_locations')
    .select('id')
    .limit(1)

  if (!locations || locations.length === 0) {
    console.error('No locations found')
    return
  }

  const locationId = locations[0].id
  console.log('Using location ID:', locationId)
  console.log()

  // Try to insert with minimal data
  console.log('Attempting INSERT with minimal data...')
  const { data, error } = await supabase
    .from('incidents')
    .insert({
      location_id: locationId,
      severity: 'unknown',
      status: 'new'
    })
    .select()

  if (error) {
    console.error('❌ INSERT failed')
    console.error('Error code:', error.code)
    console.error('Error message:', error.message)
    console.error('Error details:', error.details)
    console.error('Error hint:', error.hint)
  } else {
    console.log('✅ INSERT succeeded!')
    console.log('Created incident:', data)
  }
}

debugRLS().catch(console.error)
