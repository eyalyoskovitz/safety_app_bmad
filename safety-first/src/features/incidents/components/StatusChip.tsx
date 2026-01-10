import { Chip } from '@mui/material'
import type { IncidentStatus } from '../types'

interface StatusChipProps {
  status: IncidentStatus
}

// Hebrew labels for status
const STATUS_LABELS: Record<IncidentStatus, string> = {
  new: 'חדש',
  assigned: 'משוייך',
  resolved: 'טופל',
  archived: 'בארכיון',
}

// MUI theme colors for status (semantic colors per UX spec)
const STATUS_COLORS: Record<IncidentStatus, 'primary' | 'warning' | 'success' | 'default'> = {
  new: 'primary',      // Blue
  assigned: 'warning',  // Orange
  resolved: 'success',  // Green
  archived: 'default',  // Grey
}

/**
 * Displays incident status with semantic color coding
 * Blue (new), Orange (assigned), Green (resolved)
 */
export function StatusChip({ status }: StatusChipProps) {
  return (
    <Chip
      label={STATUS_LABELS[status]}
      color={STATUS_COLORS[status]}
      size="small"
    />
  )
}
