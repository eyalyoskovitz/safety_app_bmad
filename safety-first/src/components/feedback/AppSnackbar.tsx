import { Snackbar, Alert, type AlertColor } from '@mui/material'

interface AppSnackbarProps {
  open: boolean
  message: string
  severity: AlertColor
  onClose: () => void
  autoHideDuration?: number
  anchorOrigin?: {
    vertical: 'top' | 'bottom'
    horizontal: 'left' | 'center' | 'right'
  }
}

/**
 * Reusable snackbar component with proper RTL alignment
 * Fixes icon and close button alignment issues in Hebrew UI
 */
export function AppSnackbar({
  open,
  message,
  severity,
  onClose,
  autoHideDuration = severity === 'success' ? 3000 : 6000,
  anchorOrigin = { vertical: 'top', horizontal: 'center' },
}: AppSnackbarProps) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={anchorOrigin}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        variant="filled"
        sx={{
          width: '100%',
          minWidth: 280,
          alignItems: 'center',
          '& .MuiAlert-icon': {
            marginInlineEnd: 1,
            marginInlineStart: 0,
          },
          '& .MuiAlert-message': {
            flex: 1,
            textAlign: 'start',
          },
          '& .MuiAlert-action': {
            marginInlineStart: 1,
            marginInlineEnd: 0,
            paddingInlineStart: 1,
          },
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  )
}
