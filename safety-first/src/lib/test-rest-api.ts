/**
 * Test Supabase REST API directly (bypassing JS client)
 */

import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
config({ path: resolve(__dirname, '../../.env.local') })

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!

async function testRestAPI() {
  console.log('🔍 Testing Supabase REST API directly...\n')

  // First get a location ID
  const locationsResponse = await fetch(
    `${supabaseUrl}/rest/v1/plant_locations?select=id&limit=1`,
    {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      }
    }
  )

  const locations = await locationsResponse.json()
  console.log('Locations fetch status:', locationsResponse.status)
  console.log('Locations:', locations)

  if (!locations || locations.length === 0) {
    console.error('No locations found')
    return
  }

  const locationId = locations[0].id

  // Now try to insert an incident
  // Note: Using return=minimal because anon role cannot SELECT incidents
  // Using return=representation would fail with 401/42501 due to RLS
  console.log('\nAttempting INSERT via REST API with return=minimal...')
  const insertResponse = await fetch(
    `${supabaseUrl}/rest/v1/incidents`,
    {
      method: 'POST',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'  // Changed from return=representation
      },
      body: JSON.stringify({
        severity: 'minor',
        location_id: locationId,
        is_anonymous: true,
        description: 'Test via REST API',
        incident_date: new Date().toISOString()
      })
    }
  )

  console.log('INSERT status:', insertResponse.status)
  console.log('INSERT status text:', insertResponse.statusText)

  const insertResult = await insertResponse.text()
  console.log('INSERT response:', insertResult || '(no content - expected with return=minimal)')

  if (insertResponse.ok) {
    console.log('\n✅ REST API INSERT succeeded!')
    console.log('   Note: No data returned (return=minimal) because anon cannot SELECT incidents')
  } else {
    console.log('\n❌ REST API INSERT failed')
    console.log('   This should not happen with return=minimal')
  }
}

testRestAPI().catch(console.error)
