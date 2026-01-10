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
 * Update user's role and/or full name
 * Requires IT Admin privileges
 * Prevents self-demotion (IT Admin cannot demote themselves to Manager)
 * @param userId - UUID of user to update
 * @param updates - Object with optional role and full_name updates
 * @returns Updated user
 * @throws Error with Hebrew message on failure
 */
export async function updateUser(
  userId: string,
  updates: {
    role?: 'manager' | 'it_admin'
    full_name?: string
  }
): Promise<User> {
  try {
    // Get current user session for self-demotion check (backend validation)
    const { data: { user: currentUser } } = await supabase.auth.getUser()

    if (!currentUser) {
      throw new Error('נדרשת התחברות')
    }

    // Validate full_name if provided
    if (updates.full_name !== undefined) {
      if (!updates.full_name || updates.full_name.trim().length < 2) {
        throw new Error('נדרש שם מלא (לפחות 2 תווים)')
      }
    }

    // Backend self-demotion prevention (defense in depth)
    if (updates.role && currentUser.id === userId && updates.role !== 'it_admin') {
      throw new Error('לא ניתן להסיר הרשאת מנהל מעצמך')
    }

    // Build update object (only include fields that are provided)
    const updateData: Partial<User> = {}
    if (updates.role !== undefined) {
      updateData.role = updates.role
    }
    if (updates.full_name !== undefined) {
      updateData.full_name = updates.full_name.trim()
    }

    // Update user in database
    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('Failed to update user:', error)

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
    throw new Error('שגיאה בעדכון המשתמש. נסה שוב.')
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
 * @deprecated Use updateUser() instead for more flexibility
 */
export async function updateUserRole(
  userId: string,
  newRole: 'manager' | 'it_admin'
): Promise<User> {
  return updateUser(userId, { role: newRole })
}

/**
 * Delete user from Supabase Auth and users table
 * Requires IT Admin privileges
 * Prevents self-deletion (IT Admin cannot delete themselves)
 * @param userId - UUID of user to delete
 * @throws Error with Hebrew message on failure
 */
export async function deleteUser(userId: string): Promise<void> {
  try {
    // Get current user session for self-deletion check (backend validation)
    const { data: { user: currentUser } } = await supabase.auth.getUser()

    if (!currentUser) {
      throw new Error('נדרשת התחברות')
    }

    // Backend self-deletion prevention (defense in depth)
    if (currentUser.id === userId) {
      throw new Error('לא ניתן להסיר את עצמך מהמערכת')
    }

    // Step 1: Delete from Supabase Auth FIRST (prevents login immediately)
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (authError) {
      console.error('Failed to delete auth user:', authError)

      // Handle not found error
      if (authError.message?.includes('not found') || authError.message?.includes('User not found')) {
        throw new Error('המשתמש לא נמצא')
      }

      throw new Error('שגיאה במחיקת המשתמש. נסה שוב.')
    }

    // Step 2: Delete from users table (cleanup)
    // Note: If auth delete succeeded but this fails, user is locked out (acceptable - manual cleanup)
    const { error: dbError } = await supabase
      .from('users')
      .delete()
      .eq('id', userId)

    if (dbError) {
      console.error('Failed to delete user record:', dbError)
      // Auth user already deleted, so user can't login anyway
      // Log but don't throw - main security goal achieved
      console.warn('User auth deleted but database record cleanup failed. Manual cleanup may be needed.')
    }
  } catch (error) {
    // Re-throw errors with Hebrew messages
    if (error instanceof Error) {
      throw error
    }
    throw new Error('שגיאה במחיקת המשתמש. נסה שוב.')
  }
}

/**
 * Reset user password using Supabase Admin API
 * Requires IT Admin privileges
 * @param userId - UUID of user to reset
 * @param newPassword - New password (min 8 chars)
 * @returns New password (for IT Admin to communicate to user out-of-band)
 * @throws Error with Hebrew message on failure
 */
export async function resetUserPassword(
  userId: string,
  newPassword: string
): Promise<string> {
  try {
    // Validate password length (min 8 chars)
    if (newPassword.length < 8) {
      throw new Error('הסיסמה חייבת להכיל לפחות 8 תווים')
    }

    // Validate no spaces
    if (/\s/.test(newPassword)) {
      throw new Error('הסיסמה לא יכולה להכיל רווחים')
    }

    // Validate alphanumeric only (English letters and numbers)
    if (!/^[a-zA-Z0-9]+$/.test(newPassword)) {
      throw new Error('הסיסמה חייבת להכיל רק אותיות באנגלית ומספרים')
    }

    // Update password via Supabase Admin
    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword
    })

    if (error) {
      console.error('Failed to reset password:', error)

      // Handle not found error
      if (error.message?.includes('not found') || error.message?.includes('User not found')) {
        throw new Error('המשתמש לא נמצא')
      }

      throw new Error('שגיאה באיפוס הסיסמה. נסה שוב.')
    }

    // Return new password (for IT Admin to communicate out-of-band)
    return newPassword
  } catch (error) {
    // Re-throw errors with Hebrew messages
    if (error instanceof Error) {
      throw error
    }
    throw new Error('שגיאה באיפוס הסיסמה. נסה שוב.')
  }
}
