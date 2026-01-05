export type Severity = 'unknown' | 'near-miss' | 'minor' | 'major' | 'critical'
export type IncidentStatus = 'new' | 'assigned' | 'resolved'

export interface PlantLocation {
  id: string           // UUID
  name_he: string      // Hebrew name (for display)
}

export interface IncidentFormData {
  reporter_name: string | null      // null for anonymous
  severity: Severity
  location_id: string | null         // UUID (will be dropdown in Story 2.2)
  incident_date: string               // ISO 8601 timestamp
  description: string | null
  photo_url: string | null            // Supabase Storage URL (Story 2.6)
}

export interface Incident extends IncidentFormData {
  id: string                          // UUID
  status: IncidentStatus
  assigned_to: string | null          // UUID
  assigned_at: string | null
  resolution_notes: string | null
  resolved_at: string | null
  created_at: string
  updated_at: string
}
