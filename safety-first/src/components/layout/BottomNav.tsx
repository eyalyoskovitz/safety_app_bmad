import { useLocation, useNavigate } from 'react-router-dom'
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material'
import ListIcon from '@mui/icons-material/List'
import ArchiveIcon from '@mui/icons-material/Archive'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import { useAuth } from '../../features/auth'

/**
 * BottomNav Component
 *
 * Bottom navigation bar with tabs:
 * - "רשימה" (List) - Incident list view
 * - "ארכיון" (Archive) - Archived incidents
 * - "משתמשים" (Users) - User management (IT Admin only)
 *
 * Features:
 * - RTL layout (Hebrew right-to-left)
 * - 48px minimum touch targets (theme handles this)
 * - Fixed at bottom of screen
 * - Highlights active tab based on current route
 * - Uses React Router for navigation
 * - Shows User Management tab only for IT Admin
 */
export const BottomNav = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { role } = useAuth()

  const isITAdmin = role === 'it_admin'

  // Derive active tab value from current route (avoid setState-in-effect)
  // Tab order: 0=List, 1=Archive, 2=Users (IT Admin only)
  const value = (() => {
    if (location.pathname.startsWith('/manage/archive')) return 1
    if (location.pathname.startsWith('/manage/users')) return isITAdmin ? 2 : 1
    if (location.pathname.startsWith('/manage/incidents') || location.pathname === '/manage') return 0
    return 0
  })()


  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    // Navigate based on tab selection
    // Tab order: 0=List, 1=Archive, 2=Users (IT Admin only)
    if (newValue === 0) {
      navigate('/manage/incidents')
    } else if (newValue === 1) {
      navigate('/manage/archive')
    } else if (newValue === 2) {
      navigate('/manage/users')
    }
  }

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: (theme) => theme.zIndex.appBar,
      }}
      elevation={3}
    >
      <BottomNavigation
        value={value}
        onChange={handleChange}
        showLabels
        sx={{
          height: (theme) => theme.spacing(7), // 56px (7 * 8px)
          '& .MuiBottomNavigationAction-root': {
            minHeight: (theme) => theme.spacing(6), // 48px minimum touch target
            paddingTop: 1,
            paddingBottom: 1,
          },
        }}
      >
        {/* List Tab */}
        <BottomNavigationAction
          label="רשימה"
          icon={<ListIcon />}
          aria-label="רשימת אירועים"
        />

        {/* Archive Tab */}
        <BottomNavigationAction
          label="ארכיון"
          icon={<ArchiveIcon />}
          aria-label="ארכיון אירועים"
        />

        {/* User Management Tab (IT Admin only) */}
        {isITAdmin && (
          <BottomNavigationAction
            label="משתמשים"
            icon={<AdminPanelSettingsIcon />}
            aria-label="ניהול משתמשים"
          />
        )}
      </BottomNavigation>
    </Paper>
  )
}
