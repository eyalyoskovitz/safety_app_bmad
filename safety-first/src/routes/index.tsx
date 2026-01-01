import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { RoleRoute } from './RoleRoute'
import { IncidentListPage } from '../features/incidents/pages/IncidentListPage'
import { MyIncidentsPage } from '../features/incidents/pages/MyIncidentsPage'
import { LoginPage } from '../features/auth/pages/LoginPage'
import { UserManagementPage } from '../features/users/pages/UserManagementPage'

/**
 * App Routes Configuration
 *
 * Route Structure:
 * - /login - Login page (public)
 * - /manage/incidents - Main incident list (protected, all authenticated users)
 * - /manage/my-incidents - My assigned incidents (protected, all authenticated users)
 * - /manage/users - User management (protected, IT Admin only)
 * - /manage - Redirects to /manage/incidents
 * - / - Redirects to /manage/incidents (temporary, will be public report form in Epic 2)
 *
 * Protected routes require authentication (enforced by ProtectedRoute component)
 * Role-specific routes use RoleRoute component for role-based access control
 */
export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />

      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/manage/incidents" replace />} />

      {/* Protected authenticated routes */}
      <Route
        path="/manage"
        element={<Navigate to="/manage/incidents" replace />}
      />

      <Route
        path="/manage/incidents"
        element={
          <ProtectedRoute>
            <IncidentListPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/manage/my-incidents"
        element={
          <ProtectedRoute>
            <MyIncidentsPage />
          </ProtectedRoute>
        }
      />

      {/* Role-protected routes - IT Admin only */}
      <Route
        path="/manage/users"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['it_admin']}>
              <UserManagementPage />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      {/* Catch-all: redirect to incidents list */}
      <Route path="*" element={<Navigate to="/manage/incidents" replace />} />
    </Routes>
  )
}
