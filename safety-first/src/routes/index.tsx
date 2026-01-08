import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { RoleRoute } from './RoleRoute'
import { LandingPage } from '../features/home/pages/LandingPage'
import { IncidentListPage } from '../features/incidents/pages/IncidentListPage'
import { IncidentDetailPage } from '../features/incidents/pages/IncidentDetailPage'
import { MyIncidentsPage } from '../features/incidents/pages/MyIncidentsPage'
import { ReportPage } from '../features/incidents/pages/ReportPage'
import { LoginPage } from '../features/auth/pages/LoginPage'
import { UserListPage } from '../features/users/pages/UserListPage'

/**
 * App Routes Configuration
 *
 * Route Structure:
 * ==========================================
 * PUBLIC ROUTES (no authentication required)
 * ==========================================
 * - / - Public incident report form (primary route)
 * - /report - Public incident report form (alternate route)
 * - /login - Login page
 *
 * ==========================================
 * PROTECTED ROUTES (authentication required)
 * ==========================================
 * - /manage/incidents - Main incident list (protected, all authenticated users)
 * - /manage/my-incidents - My assigned incidents (protected, all authenticated users)
 * - /manage/users - User management (protected, IT Admin only)
 * - /manage - Redirects to /manage/incidents
 *
 * Protected routes require authentication (enforced by ProtectedRoute component)
 * Role-specific routes use RoleRoute component for role-based access control
 */
export const AppRoutes = () => {
  return (
    <Routes>
      {/* ========================================== */}
      {/* PUBLIC ROUTES (no authentication required) */}
      {/* ========================================== */}

      {/* Landing page - Primary route */}
      <Route path="/" element={<LandingPage />} />

      {/* Public report form */}
      <Route path="/report" element={<ReportPage />} />

      {/* Login page */}
      <Route path="/login" element={<LoginPage />} />

      {/* ========================================== */}
      {/* PROTECTED ROUTES (authentication required) */}
      {/* ========================================== */}

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
        path="/manage/incidents/:id"
        element={
          <ProtectedRoute>
            <IncidentDetailPage />
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
              <UserListPage />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      {/* Catch-all: redirect to incidents list */}
      <Route path="*" element={<Navigate to="/manage/incidents" replace />} />
    </Routes>
  )
}
