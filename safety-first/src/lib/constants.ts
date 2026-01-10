/**
 * Application Constants
 *
 * Centralized constants used throughout the application.
 * All user-facing messages are in Hebrew.
 */

/**
 * Error Messages (Hebrew)
 *
 * All error messages displayed to users.
 */
export const ERROR_MESSAGES = {
  /** Access denied - user doesn't have permission */
  ACCESS_DENIED: 'אין הרשאה לפעולה זו',
  /** User role not found in database */
  NO_ROLE: 'לא נמצא תפקיד למשתמש',
  /** Error fetching user role from database */
  ROLE_FETCH_ERROR: 'שגיאה בטעינת הרשאות משתמש',
} as const
