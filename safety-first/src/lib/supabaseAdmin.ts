import { createClient } from '@supabase/supabase-js'

/**
 * Supabase Admin Client
 *
 * CRITICAL SECURITY NOTE:
 * This client uses the service role key which has FULL database access,
 * bypassing all RLS policies. Use ONLY for admin operations like creating users.
 *
 * For MVP: Used client-side (acceptable for internal tool with IT Admin-only access)
 * Post-MVP: Move to Supabase Edge Function for better security
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseServiceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase admin environment variables. Please check your .env.local file.')
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
    flowType: 'pkce'
  }
})
