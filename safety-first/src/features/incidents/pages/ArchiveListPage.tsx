import { Box, CircularProgress, Stack, IconButton, Typography } from '@mui/material'
import { Refresh as RefreshIcon } from '@mui/icons-material'
import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '../../../components/layout/AppShell'
import { useArchivedIncidents } from '../hooks/useArchivedIncidents'
import { IncidentCard } from '../components/IncidentCard'
import { EmptyState } from '../components/EmptyState'
import { AppSnackbar } from '../../../components/feedback/AppSnackbar'

const SCROLL_POSITION_KEY = 'archive-list-scroll-position'

/**
 * Archive list page
 * Displays all archived incidents as cards
 * Protected route - requires authentication
 */
export function ArchiveListPage() {
  const navigate = useNavigate()
  const { incidents, isLoading, error, refetch } = useArchivedIncidents()
  const [showError, setShowError] = useState(true)
  const hasRestoredScroll = useRef(false)

  const handleRefresh = async () => {
    await refetch()
  }

  const handleCloseError = () => {
    setShowError(false)
  }

  // Restore scroll position once after incidents load
  useEffect(() => {
    if (!isLoading && !hasRestoredScroll.current) {
      const savedPosition = sessionStorage.getItem(SCROLL_POSITION_KEY)
      if (savedPosition) {
        hasRestoredScroll.current = true
        const timeoutId = setTimeout(() => {
          window.scrollTo(0, parseInt(savedPosition, 10))
          sessionStorage.removeItem(SCROLL_POSITION_KEY)
        }, 50)
        return () => clearTimeout(timeoutId)
      }
    }
  }, [isLoading])

  // Handle navigation and save scroll position immediately
  const handleIncidentClick = (incidentId: string) => {
    sessionStorage.setItem(SCROLL_POSITION_KEY, window.scrollY.toString())
    navigate(`/manage/incidents/${incidentId}`)
  }

  return (
    <AppShell>
      {/* Page Title and Refresh Button */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
          ארכיון
        </Typography>
        <IconButton
          onClick={handleRefresh}
          disabled={isLoading}
          aria-label="רענן"
          size="large"
        >
          <RefreshIcon />
        </IconButton>
      </Box>

      {/* Loading state */}
      {isLoading && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '50vh',
          }}
        >
          <CircularProgress />
        </Box>
      )}

      {/* Error snackbar */}
      {error && (
        <AppSnackbar
          open={showError}
          message={error}
          severity="error"
          onClose={handleCloseError}
        />
      )}

      {/* Empty state - no archived incidents */}
      {!isLoading && !error && incidents.length === 0 && <EmptyState variant="no-archived" />}

      {/* Archived incident list */}
      {!isLoading && !error && incidents.length > 0 && (
        <Stack spacing={2} sx={{ width: '100%' }}>
          {incidents.map((incident) => (
            <IncidentCard
              key={incident.id}
              incident={incident}
              onClick={() => handleIncidentClick(incident.id)}
            />
          ))}
        </Stack>
      )}
    </AppShell>
  )
}
