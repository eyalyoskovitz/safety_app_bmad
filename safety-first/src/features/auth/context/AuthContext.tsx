/* eslint-disable react-refresh/only-export-components */
import { createContext, useEffect, useState, useCallback, useRef } from 'react'
import type { ReactNode } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '../../../lib/supabase'
import type { AuthContextValue, UserRole } from '../types'

/**
 * Authentication Context
 *
 * Provides authentication state (user, session, loading) and methods (login, logout)
 * to all components in the application tree.
 */
export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

/**
 * AuthProvider Component
 *
 * Wraps the application and provides authentication state to all children.
 *
 * Features:
 * - Checks for existing session on mount
 * - Listens for auth state changes (login, logout, token refresh)
 * - Stores session in React state
 * - Provides login and logout functions
 *
 * Usage:
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 */
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [role, setRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(true)

  // Ref to prevent duplicate fetches within same session (reset on unmount)
  const hasRoleRef = useRef(false)
  // Ref to track if initialization is complete
  const isInitialized = useRef(false)

  /**
   * Fetch User Role from Database
   *
   * Queries the users table to get the role for the authenticated user.
   */
  const fetchUserRole = useCallback(async (userId: string): Promise<UserRole | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('[AuthContext] Error fetching user role:', error.message)
        return null
      }

      return (data?.role as UserRole) || null
    } catch (err) {
      console.error('[AuthContext] Unexpected error fetching role:', err)
      return null
    }
  }, [])

  useEffect(() => {
    let mounted = true

    // Initialize auth state
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (!mounted) return

      setSession(session)
      setUser(session?.user ?? null)

      // Mark initialization as complete
      isInitialized.current = true

      // Fetch role if we have a session
      if (session?.user && !hasRoleRef.current) {
        hasRoleRef.current = true
        const userRole = await fetchUserRole(session.user.id)
        if (mounted && userRole) {
          setRole(userRole)
        }
      }

      setLoading(false)
    }

    initializeAuth()

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      // Ignore events that fire before initialization completes to prevent race conditions
      if (!isInitialized.current && event !== 'SIGNED_OUT') {
        return
      }

      setSession(session)
      setUser(session?.user ?? null)

      if (event === 'SIGNED_IN' && session?.user) {
        // User just signed in - fetch their role (but only if we don't have it yet)
        if (!hasRoleRef.current) {
          hasRoleRef.current = true
          const userRole = await fetchUserRole(session.user.id)
          if (mounted && userRole) {
            setRole(userRole)
          }
          setLoading(false)
        }
      } else if (event === 'SIGNED_OUT') {
        // User signed out - clear role
        setRole(null)
        hasRoleRef.current = false
        setLoading(false)
      }
      // For other events (TOKEN_REFRESHED, INITIAL_SESSION), don't change loading state
      // Loading is managed by initializeAuth()
    })

    // Cleanup
    return () => {
      mounted = false
      subscription.unsubscribe()
      // Reset refs so next mount starts fresh (important for page navigation)
      hasRoleRef.current = false
      isInitialized.current = false
    }
  }, [fetchUserRole])

  /**
   * Login function
   *
   * Calls Supabase signInWithPassword and updates auth state.
   * Throws error if login fails (to be caught by form component).
   */
  const login = async (email: string, password: string): Promise<void> => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw error
    }

    // Session and user will be updated via onAuthStateChange listener
  }

  /**
   * Logout function
   *
   * Calls Supabase signOut and clears auth state.
   * Throws error if logout fails.
   */
  const logout = async (): Promise<void> => {
    const { error } = await supabase.auth.signOut()

    if (error) {
      throw error
    }

    // Session and user will be cleared via onAuthStateChange listener
  }

  const value: AuthContextValue = {
    user,
    session,
    role,
    loading,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
