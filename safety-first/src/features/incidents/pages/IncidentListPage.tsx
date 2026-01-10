import { Box, CircularProgress, Stack, IconButton, Typography } from '@mui/material'
import { Refresh as RefreshIcon } from '@mui/icons-material'
import { useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '../../../components/layout/AppShell'
import { useIncidents } from '../hooks/useIncidents'
import { getManagers } from '../api'
import { IncidentCard } from '../components/IncidentCard'
import { EmptyState } from '../components/EmptyState'
import { SortControl } from '../components/SortControl'
import { FilterControl } from '../components/FilterControl'
import { AssigneeFilter } from '../components/AssigneeFilter'
import { AppSnackbar } from '../../../components/feedback/AppSnackbar'

const SCROLL_POSITION_KEY = 'incident-list-scroll-position'

/**
 * Incident list page for Manager
 * Displays all incidents as cards with status and severity indicators
 * Protected route - requires authentication
 */
export function IncidentListPage() {
  const navigate = useNavigate()
  const { incidents, isLoading, error, refetch } = useIncidents()
  const [showError, setShowError] = useState(true)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all')
  const [managers, setManagers] = useState<Array<{ id: string; full_name: string }>>([])
  const hasRestoredScroll = useRef(false)

  // Fetch managers for assignee filter on mount
  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const managersList = await getManagers()
        setManagers(managersList)
      } catch (err) {
        console.error('Failed to fetch managers:', err)
        // Continue without managers - filter will just show "הכל"
      }
    }
    fetchManagers()
  }, [])

  // Filter and sort incidents client-side
  const filteredAndSortedIncidents = useMemo(() => {
    let result = incidents || []

    // Filter by status
    if (statusFilter !== 'all') {
      result = result.filter((inc) => inc.status === statusFilter)
    }

    // Filter by assignee
    if (assigneeFilter !== 'all') {
      result = result.filter((inc) => inc.assigned_to === assigneeFilter)
    }

    // Sort by date
    result = [...result].sort((a, b) => {
      const dateA = new Date(a.created_at).getTime()
      const dateB = new Date(b.created_at).getTime()
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB
    })

    return result
  }, [incidents, statusFilter, assigneeFilter, sortOrder])

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
        // Small delay to ensure DOM is fully rendered
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
    // Save scroll position immediately
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
          דיווחים
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

      {/* Sort and Filter Controls */}
      {!isLoading && !error && incidents.length > 0 && (
        <Stack spacing={2} sx={{ mb: 3 }}>
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            {/* Sort Control with Label */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                מיין:
              </Typography>
              <SortControl value={sortOrder} onChange={setSortOrder} />
            </Box>

            {/* Filter Control with Label */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                הצג:
              </Typography>
              <FilterControl value={statusFilter} onChange={setStatusFilter} />
            </Box>

            {/* Assignee Filter with Label */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                שיוך:
              </Typography>
              <AssigneeFilter
                value={assigneeFilter}
                onChange={setAssigneeFilter}
                managers={managers}
              />
            </Box>
          </Box>
        </Stack>
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

      {/* Empty state - no incidents at all */}
      {!isLoading && !error && incidents.length === 0 && <EmptyState variant="no-incidents" />}

      {/* Empty state - filter yields no results */}
      {!isLoading && !error && incidents.length > 0 && filteredAndSortedIncidents.length === 0 && (
        <EmptyState variant="no-results" />
      )}

      {/* Incident list */}
      {!isLoading && !error && filteredAndSortedIncidents.length > 0 && (
        <Stack spacing={2} sx={{ width: '100%' }}>
          {filteredAndSortedIncidents.map((incident) => (
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
