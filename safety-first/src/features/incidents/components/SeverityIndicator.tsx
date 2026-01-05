import { Box, Typography } from '@mui/material'
import { Circle as CircleIcon } from '@mui/icons-material'
import type { Severity } from '../types'

interface SeverityIndicatorProps {
  severity: Severity
}

// Hebrew labels for severity
const SEVERITY_LABELS: Record<Severity, string> = {
  unknown: 'לא ידוע',
  'near-miss': 'כמעט תאונה',
  minor: 'קל',
  major: 'בינוני',
  critical: 'חמור',
}

// Colors for severity levels (per UX spec)
const SEVERITY_COLORS: Record<Severity, string> = {
  unknown: '#9e9e9e',      // Grey
  'near-miss': '#2196f3',  // Blue
  minor: '#fdd835',        // Yellow
  major: '#ff9800',        // Orange
  critical: '#f44336',     // Red
}

/**
 * Displays severity indicator with color-coded icon and label
 * Grey (unknown), Blue (near-miss), Yellow (minor), Orange (major), Red (critical)
 */
export function SeverityIndicator({ severity }: SeverityIndicatorProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <CircleIcon
        sx={{
          fontSize: 16,
          color: SEVERITY_COLORS[severity],
        }}
      />
      <Typography
        variant="body2"
        sx={{
          color: SEVERITY_COLORS[severity],
          fontWeight: 500,
        }}
      >
        {SEVERITY_LABELS[severity]}
      </Typography>
    </Box>
  )
}
