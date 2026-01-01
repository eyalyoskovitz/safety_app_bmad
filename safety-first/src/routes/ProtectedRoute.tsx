import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { CircularProgress, Box } from '@mui/material'
import { useAuth } from '../features/auth'

interface ProtectedRouteProps {
  children: ReactNode
}

/**
 * ProtectedRoute Component
 *
 * Route guard for authenticated pages.
 *
 * Behavior:
 * - Shows loading spinner while checking authentication status
 * - Redirects to /login if not authenticated (with original URL in query param)
 * - Renders children if authenticated
 *
 * Implementation (Story 1.5):
 * - Uses useAuth() hook to access auth state
 * - Stores original destination in redirect query param
 * - LoginForm will redirect back to original destination after login
 */
export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth()
  const location = useLocation()

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  // Redirect to login if not authenticated
  // Store current location in redirect query param for post-login navigation
  if (!user) {
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(location.pathname)}`}
        replace
      />
    )
  }

  // User is authenticated, render protected content
  return <>{children}</>
}
