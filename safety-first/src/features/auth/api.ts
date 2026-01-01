import { supabase } from '../../lib/supabase'
import type { Session } from '@supabase/supabase-js'

/**
 * Auth API Module
 *
 * Provides authentication-related API calls to Supabase.
 * All functions throw errors on failure (to be caught by calling code).
 */

/**
 * Login with email and password
 *
 * @param email - User email address
 * @param password - User password
 * @returns Session data
 * @throws AuthError if login fails
 */
export const login = async (
  email: string,
  password: string
): Promise<Session> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw error
  }

  if (!data.session) {
    throw new Error('No session returned')
  }

  return data.session
}

/**
 * Logout current user
 *
 * Clears session from Supabase and localStorage.
 *
 * @throws AuthError if logout fails
 */
export const logout = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut()

  if (error) {
    throw error
  }
}

/**
 * Get current session
 *
 * Checks for existing session in localStorage.
 *
 * @returns Current session or null if not authenticated
 */
export const getCurrentSession = async (): Promise<Session | null> => {
  const { data, error } = await supabase.auth.getSession()

  if (error) {
    console.error('Error getting session:', error)
    return null
  }

  return data.session
}

/**
 * Map Supabase auth error to Hebrew error message
 *
 * @param error - Supabase AuthError
 * @returns Hebrew error message
 */
export const getHebrewErrorMessage = (error: unknown): string => {
  const message = typeof error === 'object' && error !== null && 'message' in error
    ? String((error as { message: unknown }).message)
    : String(error ?? '')

  if (message.includes('Invalid login credentials')) {
    return 'שם משתמש או סיסמה שגויים'
  }
  if (message.includes('Email not confirmed')) {
    return 'יש לאמת את כתובת הדוא"ל'
  }
  if (message.includes('network') || message.includes('Network')) {
    return 'אין חיבור לאינטרנט'
  }
  if (message.includes('Too many requests')) {
    return 'נסיונות רבים מדי. נסה שוב מאוחר יותר'
  }
  return 'שגיאה בהתחברות. נסה שוב'
}
