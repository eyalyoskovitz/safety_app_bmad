/**
 * User type matching database schema
 * Role restricted to manager | it_admin
 *
 * Note: Only managers/admins (~10-15 users) have accounts.
 * Production line employees use public reporting without accounts.
 */
export interface User {
  id: string
  email: string
  full_name: string | null
  role: 'manager' | 'it_admin'
  created_at: string
  updated_at: string
}
