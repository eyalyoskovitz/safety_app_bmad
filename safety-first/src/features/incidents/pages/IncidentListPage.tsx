import { Box, CircularProgress, Snackbar, Alert, Stack, IconButton, Typography } from '@mui/material'
import { Refresh as RefreshIcon } from '@mui/icons-material'
import { useState, useMemo } from 'react'
import { AppShell } from '../../../components/layout/AppShell'
import { useIncidents } from '../hooks/useIncidents'
import { IncidentCard } from '../components/IncidentCard'
import { EmptyState } from '../components/EmptyState'
import { SortControl } from '../components/SortControl'
import { FilterControl } from '../components/FilterControl'

/**
 * Incident list page for Manager
 * Displays all incidents as cards with status and severity indicators
 * Protected route - requires authentication
 */
export function IncidentListPage() {
  const { incidents, isLoading, error, refetch } = useIncidents()
  const [showError, setShowError] = useState(true)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Filter and sort incidents client-side
  const filteredAndSortedIncidents = useMemo(() => {
    let result = incidents || []

    // Filter by status
    if (statusFilter !== 'all') {
      result = result.filter((inc) => inc.status === statusFilter)
    }

    // Sort by date
    result = [...result].sort((a, b) => {
      const dateA = new Date(a.created_at).getTime()
      const dateB = new Date(b.created_at).getTime()
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB
    })

    return result
  }, [incidents, statusFilter, sortOrder])

  const handleRefresh = async () => {
    await refetch()
  }

  const handleCloseError = () => {
    setShowError(false)
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
          </Box>
        </Stack>
      )}

      {/* Error snackbar */}
      {error && (
        <Snackbar
          open={showError}
          onClose={handleCloseError}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
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
              onClick={() => {
                // Story 3.3 will implement navigation to detail view
                console.log('Navigate to incident:', incident.id)
              }}
            />
          ))}
        </Stack>
      )}
    </AppShell>
  )
}
