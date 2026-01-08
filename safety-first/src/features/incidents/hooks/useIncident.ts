import { useState, useEffect, useCallback } from 'react'
import { getIncidentById } from '../api'
import type { Incident } from '../types'

export function useIncident(id: string) {
  const [incident, setIncident] = useState<Incident | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchIncident = useCallback(async () => {
    if (!id) return

    try {
      setIsLoading(true)
      const data = await getIncidentById(id)
      setIncident(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה בטעינת הדיווח')
      setIncident(null)
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchIncident()
  }, [fetchIncident])

  return { incident, isLoading, error, refetch: fetchIncident }
}
