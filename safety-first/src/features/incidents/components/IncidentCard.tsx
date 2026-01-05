import { Card, CardContent, Typography, Box, Chip } from '@mui/material'
import { CameraAlt as CameraIcon } from '@mui/icons-material'
import { format } from 'date-fns'
import type { Incident } from '../types'
import { SeverityIndicator } from './SeverityIndicator'
import { StatusChip } from './StatusChip'

interface IncidentCardProps {
  incident: Incident
  onClick?: () => void
}

/**
 * Card displaying incident summary
 * Shows: severity, location, date, status
 * RTL layout, touch-friendly (48px minimum)
 */
export function IncidentCard({ incident, onClick }: IncidentCardProps) {
  // Format date as DD/MM/YYYY (Israeli format)
  const formattedDate = format(new Date(incident.created_at), 'dd/MM/yyyy HH:mm')

  return (
    <Card
      onClick={onClick}
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        minHeight: 48,
        width: '100%',
        display: 'block',
        boxSizing: 'border-box',
        '&:hover': onClick ? {
          bgcolor: 'action.hover',
        } : undefined,
      }}
    >
      <CardContent sx={{ width: '100%', p: 2 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            width: '100%',
          }}
        >
          {/* Top row: Severity and Photo indicator */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <SeverityIndicator severity={incident.severity} />
            {incident.photo_url && (
              <Chip
                icon={<CameraIcon sx={{ marginInlineEnd: '4px !important' }} />}
                label="תמונה"
                size="small"
                variant="outlined"
                sx={{
                  fontSize: '0.75rem',
                  '& .MuiChip-icon': {
                    marginInlineStart: '8px',
                    marginInlineEnd: '-4px',
                  }
                }}
              />
            )}
          </Box>

          {/* Date */}
          <Typography variant="body2" color="text.secondary">
            {formattedDate}
          </Typography>

          {/* Description preview (if exists) */}
          {incident.description && (
            <Typography
              variant="body2"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {incident.description}
            </Typography>
          )}

          {/* Status chip */}
          <Box>
            <StatusChip status={incident.status} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}
