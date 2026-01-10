/**
 * Security Verification Test
 * Confirms anonymous users CANNOT read incident data
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

async function verifySecurityModel() {
  console.log('🔒 Security Verification Test\n')

  // Test 1: Confirm anonymous users cannot SELECT incidents
  console.log('Test 1: Verify anonymous users CANNOT read incidents')
  const { data: incidents, error: selectError } = await supabase
    .from('incidents')
    .select('*')

  if (selectError) {
    console.log('❌ SELECT failed with error:', selectError.message)
    console.log('   This might indicate RLS is TOO restrictive (unexpected)')
  } else if (!incidents || incidents.length === 0) {
    console.log('✅ PASS: Anonymous SELECT returned empty array')
    console.log('   RLS correctly filters all incidents from anonymous users')
  } else {
    console.log('🚨 SECURITY ISSUE: Anonymous user can read incidents!')
    console.log(`   Found ${incidents.length} incident(s)`)
    console.log('   This means the GRANT SELECT permission is still active')
    console.log('   YOU MUST RUN: REVOKE SELECT ON public.incidents FROM anon;')
    return false
  }

  // Test 2: Confirm INSERT without .select() works
  console.log('\nTest 2: Verify anonymous INSERT works (without .select())')

  const { data: locations } = await supabase
    .from('plant_locations')
    .select('id')
    .limit(1)

  if (!locations || locations.length === 0) {
    console.log('❌ Cannot test - no plant locations found')
    return false
  }

  const { error: insertError } = await supabase
    .from('incidents')
    .insert({
      severity: 'minor',
      location_id: locations[0].id,
      is_anonymous: true,
      description: 'Security verification test'
    })

  if (insertError) {
    console.log('❌ FAIL: Anonymous INSERT failed')
    console.log('   Error:', insertError.message)
    return false
  } else {
    console.log('✅ PASS: Anonymous INSERT succeeded')
  }

  // Test 3: Confirm INSERT with .select() fails (expected)
  console.log('\nTest 3: Verify INSERT with .select() fails (expected behavior)')

  const { error: insertSelectError } = await supabase
    .from('incidents')
    .insert({
      severity: 'minor',
      location_id: locations[0].id,
      is_anonymous: true,
      description: 'Test with select'
    })
    .select()

  if (insertSelectError) {
    console.log('✅ PASS: INSERT with .select() correctly failed')
    console.log('   Error:', insertSelectError.message)
    console.log('   This is EXPECTED - anon cannot SELECT incident data')
  } else {
    console.log('🚨 SECURITY ISSUE: INSERT with .select() succeeded!')
    console.log('   This means anon has SELECT permission (DANGEROUS)')
    console.log('   YOU MUST RUN: REVOKE SELECT ON public.incidents FROM anon;')
    return false
  }

  return true
}

verifySecurityModel()
  .then(success => {
    if (success) {
      console.log('\n═══════════════════════════════════════════════════════')
      console.log('✅ Security Verification PASSED!')
      console.log('═══════════════════════════════════════════════════════')
      console.log('\n🔒 Security Model is correct:')
      console.log('   • Anonymous users CAN insert incidents')
      console.log('   • Anonymous users CANNOT read incidents')
      console.log('   • Privacy is protected')
    } else {
      console.log('\n❌ Security Verification FAILED')
      process.exit(1)
    }
  })
  .catch(error => {
    console.error('\n❌ Test execution failed:', error)
    process.exit(1)
  })
