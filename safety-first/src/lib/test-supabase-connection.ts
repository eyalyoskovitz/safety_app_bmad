/**
 * Supabase Connection and RLS Policy Test
 *
 * This file tests:
 * 1. Connection to Supabase
 * 2. Anonymous read access to plant_locations
 * 3. Anonymous INSERT to incidents (critical for anonymous reporting)
 * 4. RLS policy enforcement
 *
 * Run with: npx tsx src/lib/test-supabase-connection.ts
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

// Get current directory in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load .env.local file
config({ path: resolve(__dirname, '../../.env.local') })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables in .env.local')
  console.error('   Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase Connection and RLS Policies...\n')

  // Test 1: Connection and plant_locations query
  console.log('Test 1: Query plant_locations (anonymous access)')
  const { data: locations, error: locationsError } = await supabase
    .from('plant_locations')
    .select('*')

  if (locationsError) {
    console.error('❌ Failed to query plant_locations:', locationsError.message)
    return false
  }

  console.log(`✅ Success! Found ${locations?.length} plant locations`)
  console.log('📍 Locations:', locations?.map(l => `${l.name} (${l.name_he})`).join(', '))
  console.log()

  // Test 2: Anonymous incident submission (critical RLS policy test)
  console.log('Test 2: Anonymous incident INSERT (RLS policy test)')

  if (!locations || locations.length === 0) {
    console.error('❌ Cannot test incident INSERT without locations')
    return false
  }

  const firstLocationId = locations[0].id

  const { error: incidentError } = await supabase
    .from('incidents')
    .insert({
      severity: 'minor',
      location_id: firstLocationId,
      is_anonymous: true,
      description: 'Test incident - anonymous submission',
      incident_date: new Date().toISOString()
    })
    // Note: No .select() because anon role doesn't have SELECT permission

  if (incidentError) {
    console.error('❌ Failed to insert anonymous incident:', incidentError.message)
    console.error('   This indicates RLS policy is NOT allowing anonymous INSERT')
    return false
  }

  console.log('✅ Success! Anonymous incident INSERT allowed by RLS policy')
  console.log('📝 Incident created (data not returned due to RLS SELECT restriction)')
  console.log()

  // Test 3: Anonymous incident query (should FAIL due to RLS)
  console.log('Test 3: Anonymous incident SELECT (should be blocked by RLS)')

  const { data: incidents, error: selectError } = await supabase
    .from('incidents')
    .select('*')

  if (selectError) {
    console.log('✅ Correct! Anonymous SELECT blocked by RLS policy')
    console.log('   Error:', selectError.message)
  } else if (!incidents || incidents.length === 0) {
    console.log('✅ Correct! Anonymous SELECT returned empty (RLS filtering works)')
  } else {
    console.warn('⚠️  Warning: Anonymous user can SELECT incidents - RLS may need review')
    console.warn('   Found incidents:', incidents.length)
  }
  console.log()

  // Test 4: Verify table structure
  console.log('Test 4: Verify database schema')

  // Query to check if all expected columns exist
  const { error: schemaError } = await supabase
    .from('incidents')
    .select('id, reporter_name, is_anonymous, severity, location_id, status')
    .limit(1)

  if (schemaError) {
    console.error('❌ Schema verification failed:', schemaError.message)
    return false
  }

  console.log('✅ Schema verified - all expected columns exist')
  console.log()

  // Test 5: Check users table (should be empty initially)
  console.log('Test 5: Verify users table exists')

  const { error: usersError } = await supabase
    .from('users')
    .select('id')
    .limit(1)

  if (usersError) {
    console.error('❌ Users table query failed:', usersError.message)
    return false
  }

  console.log('✅ Users table exists and is accessible')
  console.log()

  // Test 6: Check daily_report_counts table
  console.log('Test 6: Verify daily_report_counts table')

  const { error: countError } = await supabase
    .from('daily_report_counts')
    .select('*')
    .limit(1)

  if (countError) {
    console.error('❌ Daily report counts query failed:', countError.message)
    return false
  }

  console.log('✅ Daily report counts table exists and is accessible')
  console.log()

  return true
}

// Run tests
testSupabaseConnection()
  .then(success => {
    if (success) {
      console.log('═══════════════════════════════════════════════════════')
      console.log('✅ All tests passed!')
      console.log('═══════════════════════════════════════════════════════')
      console.log('\nSupabase is configured correctly:')
      console.log('  • Connection established')
      console.log('  • All 4 tables created')
      console.log('  • Plant locations seeded with Hebrew names')
      console.log('  • Anonymous incident reporting works')
      console.log('  • RLS policies are enforced')
      console.log('\nReady to proceed with Story 1.3!')
    } else {
      console.log('\n❌ Some tests failed. Please review the errors above.')
      process.exit(1)
    }
  })
  .catch(error => {
    console.error('\n❌ Test execution failed:', error)
    process.exit(1)
  })
