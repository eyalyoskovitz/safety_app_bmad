import type { ReactNode } from 'react'
import { CircularProgress, Box } from '@mui/material'
import { useAuth } from '../features/auth'
import type { UserRole } from '../features/auth/types'
import { AccessDenied } from '../components/feedback/AccessDenied'

/**
 * RoleRoute Component Props
 */
interface RoleRouteProps {
  /** Content to render if user has allowed role */
  children: ReactNode
  /** Array of roles allowed to access this route */
  allowedRoles: UserRole[]
}

/**
 * RoleRoute Component
 *
 * Protects routes by checking if the user's role is in the allowedRoles array.
 * Shows a loading spinner while checking, access denied message if role not allowed,
 * or renders children if role is allowed.
 *
 * Usage:
 * ```typescript
 * <RoleRoute allowedRoles={['it_admin']}>
 *   <UserManagementPage />
 * </RoleRoute>
 * ```
 *
 * Access Control:
 * - Shows loading spinner while auth/role is being determined
 * - Shows AccessDenied if user role is not in allowedRoles
 * - Renders children if user role is in allowedRoles
 */
export const RoleRoute = ({ children, allowedRoles }: RoleRouteProps) => {
  const { role, loading } = useAuth()

  // Show loading spinner while determining role
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  // Show access denied if no role or role not in allowed list
  if (!role || !allowedRoles.includes(role)) {
    return <AccessDenied />
  }

  // Render children if role is allowed
  return <>{children}</>
}
