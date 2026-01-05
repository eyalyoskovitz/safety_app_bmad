import { supabase } from '../../lib/supabase'
import type { PlantLocation, IncidentFormData, Incident } from './types'

export async function getActiveLocations(): Promise<PlantLocation[]> {
  const { data, error } = await supabase
    .from('plant_locations')
    .select('id, name_he')
    .eq('is_active', true)
    .order('name_he', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch locations: ${error.message}`)
  }

  return data || []
}

/**
 * Fetch all incidents for Safety Officer list view
 * Ordered by created_at DESC (newest first)
 */
export async function getIncidents(): Promise<Incident[]> {
  const { data, error } = await supabase
    .from('incidents')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch incidents:', error)
    throw new Error('שגיאה בטעינת הדיווחים')
  }

  return data || []
}

/**
 * Submit a new incident report to the database
 */
export async function submitIncident(formData: IncidentFormData): Promise<void> {
  try {
    // 1. Check daily limit (atomic operation via database function)
    // Get limit from environment variable, default to 15
    const dailyLimit = Number(import.meta.env.VITE_DAILY_REPORT_LIMIT) || 15

    const { error: limitError } = await supabase
      .rpc('check_and_increment_daily_count', { p_daily_limit: dailyLimit })

    if (limitError) {
      console.error('Daily limit check failed:', limitError)

      // Check if daily limit exceeded
      if (limitError.message?.includes('DAILY_LIMIT_EXCEEDED')) {
        throw new Error('המערכת הגיעה למגבלת הדיווחים היומית. אנא פנה לממונה הבטיחות')
      }

      // Other database errors during limit check
      throw new Error('שגיאה בבדיקת מגבלת דיווחים')
    }

    // 2. Insert incident (existing code)
    const { error } = await supabase
      .from('incidents')
      .insert([{
        reporter_name: formData.reporter_name,
        severity: formData.severity,
        location_id: formData.location_id,
        incident_date: formData.incident_date,
        description: formData.description,
        photo_url: formData.photo_url,
        status: 'new',
        is_anonymous: !formData.reporter_name
      }])

    if (error) {
      console.error('Failed to submit incident:', error)

      // Check for network/connection errors
      const errorMessage = error.message?.toLowerCase() || ''
      const errorCode = typeof error === 'object' && error !== null && 'code' in error
        ? (error as { code: string }).code
        : undefined

      if (
        errorMessage.includes('fetch') ||
        errorMessage.includes('network') ||
        errorMessage.includes('connection') ||
        errorMessage.includes('failed to fetch') ||
        errorCode === 'PGRST301'
      ) {
        throw new Error('אין חיבור לאינטרנט')
      }

      // Generic database error
      throw new Error('שגיאה בשמירת הדיווח')
    }
  } catch (err) {
    // If it's already our Error with Hebrew message, re-throw
    if (err instanceof Error && (
      err.message === 'אין חיבור לאינטרנט' ||
      err.message === 'שגיאה בשמירת הדיווח' ||
      err.message === 'המערכת הגיעה למגבלת הדיווחים היומית. אנא פנה לממונה הבטיחות' ||
      err.message === 'שגיאה בבדיקת מגבלת דיווחים'
    )) {
      throw err
    }
    // Network exceptions from fetch
    throw new Error('אין חיבור לאינטרנט')
  }
}
