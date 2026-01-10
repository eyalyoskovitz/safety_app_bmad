import { Alert, type AlertColor } from '@mui/material'
import type { ReactNode } from 'react'

interface AppAlertProps {
  severity: AlertColor
  children: ReactNode
  onClose?: () => void
  sx?: object
}

/**
 * Reusable Alert component with proper RTL alignment
 * Fixes icon, text, and close button alignment issues in Hebrew UI
 */
export function AppAlert({ severity, children, onClose, sx }: AppAlertProps) {
  return (
    <Alert
      severity={severity}
      onClose={onClose}
      sx={{
        alignItems: 'center',
        '& .MuiAlert-icon': {
          marginInlineEnd: 1.5,
          marginInlineStart: 0,
          padding: 0,
        },
        '& .MuiAlert-message': {
          flex: 1,
          padding: 0,
        },
        '& .MuiAlert-action': {
          marginInlineStart: 1,
          marginInlineEnd: 0,
          paddingInlineStart: 1,
          paddingTop: 0,
        },
        ...sx,
      }}
    >
      {children}
    </Alert>
  )
}
