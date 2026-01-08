import { supabase } from '../../lib/supabase'
import { supabaseAdmin } from '../../lib/supabaseAdmin'
import type { User } from './types'

/**
 * Fetch all users sorted by full name
 * Used by UserListPage to display all system users
 * @param role - Optional role filter (e.g., 'manager')
 * @returns Array of users
 */
export async function getUsers(role?: string): Promise<User[]> {
  let query = supabase
    .from('users')
    .select('*')
    .order('full_name', { ascending: true })

  // Filter by role if specified
  if (role) {
    query = query.eq('role', role)
  }

  const { data, error } = await query

  if (error) {
    console.error('Failed to fetch users:', error)
    throw new Error('שגיאה בטעינת רשימת משתמשים')
  }

  return data || []
}

/**
 * Create new user with Supabase Auth and users table entry
 * Requires admin privileges (uses service role key)
 * @param userData - User data including email, full_name, role, password
 * @returns Created user
 * @throws Error with Hebrew message on failure
 */
export async function createUser(userData: {
  email: string
  full_name: string
  role: 'manager' | 'it_admin'
  password: string
}): Promise<User> {
  try {
    // Step 1: Create auth user with admin API
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true, // Auto-confirm for internal users
      user_metadata: {
        full_name: userData.full_name
      }
    })

    if (authError) {
      console.error('Failed to create auth user:', authError)

      // Handle duplicate email error
      if (authError.message?.includes('already registered') || authError.code === '23505') {
        throw new Error('כתובת האימייל כבר קיימת במערכת')
      }

      throw new Error('שגיאה ביצירת המשתמש. נסה שוב.')
    }

    if (!authData.user) {
      throw new Error('שגיאה ביצירת המשתמש. נסה שוב.')
    }

    // Step 2: Upsert user record in users table (handles auto-created profiles from trigger)
    // Database trigger auto-creates user profile, so we use upsert to update with our data
    const { data: userData2, error: dbError } = await supabase
      .from('users')
      .upsert({
        id: authData.user.id,
        email: userData.email,
        full_name: userData.full_name,
        role: userData.role
      }, {
        onConflict: 'id' // Update if user already exists (from trigger)
      })
      .select()
      .single()

    if (dbError) {
      console.error('Failed to create user record:', dbError)

      // Handle duplicate email error at database level
      if (dbError.code === '23505') {
        throw new Error('כתובת האימייל כבר קיימת במערכת')
      }

      throw new Error('שגיאה ביצירת המשתמש. נסה שוב.')
    }

    return userData2
  } catch (error) {
    // Re-throw errors with Hebrew messages
    if (error instanceof Error) {
      throw error
    }
    throw new Error('שגיאה ביצירת המשתמש. נסה שוב.')
  }
}

/**
 * Update user's role
 * Requires IT Admin privileges
 * Prevents self-demotion (IT Admin cannot demote themselves to Manager)
 * @param userId - UUID of user to update
 * @param newRole - New role (manager or it_admin)
 * @returns Updated user
 * @throws Error with Hebrew message on failure
 */
export async function updateUserRole(
  userId: string,
  newRole: 'manager' | 'it_admin'
): Promise<User> {
  try {
    // Get current user session for self-demotion check (backend validation)
    const { data: { user: currentUser } } = await supabase.auth.getUser()

    if (!currentUser) {
      throw new Error('נדרשת התחברות')
    }

    // Backend self-demotion prevention (defense in depth)
    if (currentUser.id === userId && newRole !== 'it_admin') {
      throw new Error('לא ניתן להסיר הרשאת מנהל מעצמך')
    }

    // Update user role in database
    const { data, error } = await supabase
      .from('users')
      .update({ role: newRole })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('Failed to update user role:', error)

      // Handle not found error
      if (error.code === 'PGRST116') {
        throw new Error('המשתמש לא נמצא')
      }

      throw new Error('שגיאת רשת. נסה שוב.')
    }

    if (!data) {
      throw new Error('המשתמש לא נמצא')
    }

    return data
  } catch (error) {
    // Re-throw errors with Hebrew messages
    if (error instanceof Error) {
      throw error
    }
    throw new Error('שגיאה בעדכון התפקיד. נסה שוב.')
  }
}
