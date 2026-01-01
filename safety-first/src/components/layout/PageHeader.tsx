import { AppBar, Toolbar, Typography, IconButton, Box } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import LogoutIcon from '@mui/icons-material/Logout'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../features/auth'

/**
 * PageHeader Component
 *
 * App header with:
 * - App title "קודם בטיחות" (Safety First)
 * - Report button (navigates to report form)
 * - Logout button
 *
 * Features:
 * - RTL layout (Hebrew right-to-left)
 * - 48px touch targets (theme handles this)
 * - Fixed at top for consistent navigation
 */
export const PageHeader = () => {
  const navigate = useNavigate()
  const { logout } = useAuth()

  const handleReportClick = () => {
    // Navigate to report form (route will be created in future story)
    navigate('/report')
  }

  const handleLogoutClick = async () => {
    try {
      await logout()
      navigate('/login', { replace: true })
    } catch (error) {
      console.error('Logout error:', error)
      // Still redirect to login even if logout fails
      // This ensures user can't get stuck in authenticated state
      navigate('/login', { replace: true })
    }
  }

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar
        sx={{
          minHeight: (theme) => theme.spacing(7), // 56px (7 * 8px)
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {/* App Title */}
        <Typography
          variant="h6"
          component="h1"
          sx={{
            flexGrow: 1,
            fontWeight: 600,
          }}
        >
          קודם בטיחות
        </Typography>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          {/* Report Button */}
          <IconButton
            color="inherit"
            aria-label="דווח על אירוע"
            onClick={handleReportClick}
            sx={{
              minWidth: (theme) => theme.spacing(6), // 48px minimum touch target
              minHeight: (theme) => theme.spacing(6),
            }}
          >
            <AddIcon />
          </IconButton>

          {/* Logout Button */}
          <IconButton
            color="inherit"
            aria-label="התנתק"
            onClick={handleLogoutClick}
            sx={{
              minWidth: (theme) => theme.spacing(6), // 48px minimum touch target
              minHeight: (theme) => theme.spacing(6),
            }}
          >
            <LogoutIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  )
}
