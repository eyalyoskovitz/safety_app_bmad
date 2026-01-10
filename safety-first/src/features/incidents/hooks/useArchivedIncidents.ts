import { useState, useEffect } from 'react'
import { getArchivedIncidents } from '../api'
import type { Incident } from '../types'

interface UseArchivedIncidentsReturn {
  incidents: Incident[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * Hook to fetch all archived incidents for the archive list view
 * Provides loading, error, and refetch capabilities
 */
export function useArchivedIncidents(): UseArchivedIncidentsReturn {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchIncidents = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await getArchivedIncidents()
      setIncidents(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה בטעינת הארכיון')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchIncidents()
  }, [])

  return {
    incidents,
    isLoading,
    error,
    refetch: fetchIncidents,
  }
}
