import { Box, Typography, Button } from '@mui/material'
import { Lock as LockIcon } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

/**
 * AccessDenied Component
 *
 * Displays a Hebrew error message when a user tries to access a route
 * they don't have permission for.
 *
 * Features:
 * - Centered layout with lock icon
 * - Hebrew title and message
 * - Button to navigate back to incidents page
 * - Mobile-first responsive design
 * - RTL-aware layout
 */
export const AccessDenied = () => {
  const navigate = useNavigate()

  const handleGoBack = () => {
    navigate('/manage/incidents')
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        paddingInline: (theme) => theme.spacing(2),
        textAlign: 'center',
      }}
    >
      {/* Lock Icon */}
      <LockIcon
        sx={{
          fontSize: 80,
          color: (theme) => theme.palette.error.main,
          marginBlockEnd: (theme) => theme.spacing(2),
        }}
      />

      {/* Title */}
      <Typography
        variant="h4"
        component="h1"
        sx={{
          marginBlockEnd: (theme) => theme.spacing(2),
          fontWeight: 'bold',
        }}
      >
        אין הרשאה
      </Typography>

      {/* Message */}
      <Typography
        variant="body1"
        sx={{
          marginBlockEnd: (theme) => theme.spacing(4),
          color: (theme) => theme.palette.text.secondary,
        }}
      >
        אין לך הרשאה לגשת לעמוד זה
      </Typography>

      {/* Go Back Button */}
      <Button
        variant="contained"
        color="primary"
        onClick={handleGoBack}
        sx={{
          minHeight: 48, // Minimum touch target
          paddingInline: (theme) => theme.spacing(4),
        }}
      >
        חזרה לדף האירועים
      </Button>
    </Box>
  )
}
