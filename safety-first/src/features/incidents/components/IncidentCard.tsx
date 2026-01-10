import { Card, CardContent, Typography, Box } from '@mui/material'
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
      <CardContent sx={{ width: '100%', p: 1.5 }}>
        {/* Desktop: Grid layout | Mobile: Flex layout */}
        <Box
          sx={{
            width: '100%',
          }}
        >
          {/* Mobile view: Flex-based layout */}
          <Box sx={{ display: { xs: 'flex', lg: 'none' }, flexDirection: 'column', gap: 1 }}>
            {/* Line 1: Date */}
            <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
              {formattedDate}
            </Typography>

            {/* Line 2: Status, Severity, Assigned, Photo - horizontal */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              <StatusChip status={incident.status} />
              <SeverityIndicator severity={incident.severity} />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="body2" color="text.secondary">
                  משויך ל:
                </Typography>
                <Typography variant="body2" fontWeight={500} sx={{ whiteSpace: 'nowrap' }}>
                  {incident.assigned_user?.full_name || 'לא משויך'}
                </Typography>
              </Box>
              {incident.photo_url && <CameraIcon sx={{ fontSize: 20, color: 'action.active' }} />}
            </Box>

            {/* Line 3: Description (if exists) */}
            {incident.description && (
              <Typography
                variant="body2"
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {incident.description}
              </Typography>
            )}
          </Box>

          {/* Desktop view: Grid-based layout */}
          <Box
            sx={{
              display: { xs: 'none', lg: 'grid' },
              gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr',
              gridTemplateRows: 'auto auto',
              gap: 1,
            }}
          >
            {/* Row 1: Status | Date | Severity | Assigned | Photo */}
            <Box sx={{ gridColumn: '1', gridRow: '1', justifySelf: 'start' }}>
              <StatusChip status={incident.status} />
            </Box>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                gridColumn: '2',
                gridRow: '1',
                whiteSpace: 'nowrap',
                justifySelf: 'start',
              }}
            >
              {formattedDate}
            </Typography>

            <Box sx={{ gridColumn: '3', gridRow: '1', justifySelf: 'start' }}>
              <SeverityIndicator severity={incident.severity} />
            </Box>

            <Box
              sx={{
                gridColumn: '4',
                gridRow: '1',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                justifySelf: 'start',
              }}
            >
              <Typography variant="body2" color="text.secondary">
                משויך ל:
              </Typography>
              <Typography variant="body2" fontWeight={500} sx={{ whiteSpace: 'nowrap' }}>
                {incident.assigned_user?.full_name || 'לא משויך'}
              </Typography>
            </Box>

            {incident.photo_url && (
              <Box sx={{ gridColumn: '5', gridRow: '1', justifySelf: 'end' }}>
                <CameraIcon sx={{ fontSize: 20, color: 'action.active' }} />
              </Box>
            )}

            {/* Row 2: Description (if exists) - aligned with second column */}
            {incident.description && (
              <Typography
                variant="body2"
                sx={{
                  gridColumn: '2 / -1',
                  gridRow: '2',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  justifySelf: 'start',
                }}
              >
                {incident.description}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}
