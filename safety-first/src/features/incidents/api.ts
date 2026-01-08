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
 * Includes assigned user details for assignee display and filtering
 */
export async function getIncidents(): Promise<Incident[]> {
  const { data, error } = await supabase
    .from('incidents')
    .select(`
      *,
      assigned_user:users!incidents_assigned_to_fkey (
        id,
        full_name,
        email
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch incidents:', error)
    throw new Error('שגיאה בטעינת הדיווחים')
  }

  return data || []
}

/**
 * Fetch all manager users for assignee filter
 * Used to populate assignee filter dropdown
 * Only returns users with role='manager' (excludes it_admin)
 */
export async function getManagers(): Promise<Array<{ id: string; full_name: string }>> {
  const { data, error } = await supabase
    .from('users')
    .select('id, full_name')
    .eq('role', 'manager')
    .order('full_name', { ascending: true })

  if (error) {
    console.error('Failed to fetch managers:', error)
    throw new Error('שגיאה בטעינת רשימת מנהלים')
  }

  return data || []
}

/**
 * Fetch a single incident by ID for detail view
 * Includes location name, assigned user, and assigner details via joins
 */
export async function getIncidentById(id: string): Promise<Incident> {
  const { data, error } = await supabase
    .from('incidents')
    .select(`
      *,
      plant_locations (
        id,
        name_he
      ),
      assigned_user:users!incidents_assigned_to_fkey (
        id,
        full_name,
        email
      ),
      assigner:users!incidents_assigned_by_fkey (
        id,
        full_name,
        email
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Failed to fetch incident:', error)
    throw new Error('שגיאה בטעינת פרטי הדיווח')
  }

  if (!data) {
    throw new Error('הדיווח לא נמצא')
  }

  return data
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

/**
 * Assign an incident to a responsible manager
 * @param incidentId - The incident ID to assign
 * @param userId - The user ID to assign to
 * @returns Updated incident
 */
export async function assignIncident(incidentId: string, userId: string): Promise<Incident> {
  // Get current user (the one assigning)
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('incidents')
    .update({
      status: 'assigned',
      assigned_to: userId,
      assigned_by: user?.id || null,
      assigned_at: new Date().toISOString()
    })
    .eq('id', incidentId)
    .select()
    .single()

  if (error) {
    console.error('Failed to assign incident:', error)
    throw new Error('שגיאה בשיוך האירוע')
  }

  if (!data) {
    throw new Error('האירוע לא נמצא')
  }

  return data
}

/**
 * Mark an incident as resolved
 * @param incidentId - The incident ID to resolve
 * @param resolutionNotes - Optional notes explaining what was done to resolve the incident
 * @returns Updated incident
 */
export async function resolveIncident(incidentId: string, resolutionNotes?: string): Promise<Incident> {
  const { data, error } = await supabase
    .from('incidents')
    .update({
      status: 'resolved',
      resolved_at: new Date().toISOString(),
      resolution_notes: resolutionNotes || null
    })
    .eq('id', incidentId)
    .select()
    .single()

  if (error) {
    console.error('Failed to resolve incident:', error)
    throw new Error('שגיאה בעדכון האירוע')
  }

  if (!data) {
    throw new Error('האירוע לא נמצא')
  }

  return data
}

/**
 * Reopen a resolved incident back to assigned status
 * @param incidentId - The incident ID to reopen
 * @returns Updated incident
 * @description Changes status from 'resolved' to 'assigned', preserving all resolution history
 */
export async function reopenIncident(incidentId: string): Promise<Incident> {
  const { data, error } = await supabase
    .from('incidents')
    .update({
      status: 'assigned'
    })
    .eq('id', incidentId)
    .select()
    .single()

  if (error) {
    console.error('Failed to reopen incident:', error)
    throw new Error('שגיאה בפתיחת האירוע מחדש')
  }

  if (!data) {
    throw new Error('האירוע לא נמצא')
  }

  return data
}
