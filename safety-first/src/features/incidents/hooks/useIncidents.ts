import { useState, useEffect } from 'react'
import { getIncidents } from '../api'
import type { Incident } from '../types'

interface UseIncidentsReturn {
  incidents: Incident[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * Hook to fetch all incidents for the list view
 * Provides loading, error, and refetch capabilities
 */
export function useIncidents(): UseIncidentsReturn {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchIncidents = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await getIncidents()
      setIncidents(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה בטעינת הדיווחים')
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
