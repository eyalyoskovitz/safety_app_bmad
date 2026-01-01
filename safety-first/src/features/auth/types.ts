import type { User, Session } from '@supabase/supabase-js'

/**
 * User Roles in the System
 *
 * - manager: Can view/resolve incidents assigned to them
 * - safety_officer: Can view/manage all incidents, assign to managers
 * - plant_manager: Can view all incidents (read-only)
 * - it_admin: Can manage users + access all incidents
 */
export type UserRole = 'manager' | 'safety_officer' | 'plant_manager' | 'it_admin'

/**
 * Authentication Context Value
 *
 * Provides auth state and methods to all components via useAuth hook.
 */
export interface AuthContextValue {
  /** Current authenticated user (null if not authenticated) */
  user: User | null
  /** Current session (null if not authenticated) */
  session: Session | null
  /** Current user role (null if not authenticated or not loaded) */
  role: UserRole | null
  /** Loading state while checking authentication */
  loading: boolean
  /** Login function - calls Supabase signInWithPassword */
  login: (email: string, password: string) => Promise<void>
  /** Logout function - calls Supabase signOut */
  logout: () => Promise<void>
}

/**
 * Login Credentials
 *
 * Used for form data when logging in.
 */
export interface LoginCredentials {
  email: string
  password: string
}
