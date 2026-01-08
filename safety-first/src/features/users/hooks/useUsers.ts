import { useState, useEffect, useCallback } from 'react'
import { getUsers } from '../api'
import type { User } from '../types'

interface UseUsersResult {
  users: User[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

/**
 * Hook to fetch users list
 * @param role - Optional role filter (e.g., 'manager')
 * @returns Users list with loading, error states, and refetch function
 */
export function useUsers(role?: string): UseUsersResult {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await getUsers(role)
      setUsers(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה בטעינת המשתמשים')
      setUsers([])
    } finally {
      setIsLoading(false)
    }
  }, [role])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // Refetch function to manually trigger user list refresh
  const refetch = useCallback(() => {
    fetchUsers()
  }, [fetchUsers])

  return { users, isLoading, error, refetch }
}
