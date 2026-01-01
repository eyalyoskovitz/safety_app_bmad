import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import type { AuthContextValue } from '../types'

/**
 * useAuth Hook
 *
 * Provides access to authentication state and methods.
 *
 * Returns:
 * - user: Current authenticated user (null if not authenticated)
 * - session: Current session (null if not authenticated)
 * - role: Current user role (null if not authenticated or not loaded)
 * - loading: Loading state while checking authentication
 * - login: Function to log in with email/password
 * - logout: Function to log out
 *
 * Throws error if used outside AuthProvider.
 *
 * Usage:
 * ```typescript
 * const { user, session, role, loading, login, logout } = useAuth()
 *
 * if (loading) return <CircularProgress />
 * if (!user) return <LoginPage />
 * if (role === 'it_admin') return <AdminDashboard />
 * ```
 */
export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
