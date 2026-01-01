import { useLocation, useNavigate } from 'react-router-dom'
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material'
import ListIcon from '@mui/icons-material/List'
import PersonIcon from '@mui/icons-material/Person'

/**
 * BottomNav Component
 *
 * Bottom navigation bar with two tabs:
 * - "רשימה" (List) - Incident list view
 * - "שלי" (My Items) - My assigned incidents
 *
 * Features:
 * - RTL layout (Hebrew right-to-left)
 * - 48px minimum touch targets (theme handles this)
 * - Fixed at bottom of screen
 * - Highlights active tab based on current route
 * - Uses React Router for navigation
 */
export const BottomNav = () => {
  const navigate = useNavigate()
  const location = useLocation()
  // Derive active tab value from current route (avoid setState-in-effect)
  const value = (() => {
    if (location.pathname.startsWith('/manage/my-incidents')) return 1
    if (location.pathname.startsWith('/manage/incidents') || location.pathname === '/manage') return 0
    return 0
  })()


  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    // Navigate based on tab selection; value is derived from location.pathname
    if (newValue === 0) {
      navigate('/manage/incidents')
    } else if (newValue === 1) {
      navigate('/manage/my-incidents')
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

        {/* My Items Tab */}
        <BottomNavigationAction
          label="שלי"
          icon={<PersonIcon />}
          aria-label="האירועים שלי"
        />
      </BottomNavigation>
    </Paper>
  )
}
