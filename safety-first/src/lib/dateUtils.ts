/**
 * Date Formatting Utilities for Safety First
 *
 * CRITICAL: All dates must display in Israeli format (DD/MM/YYYY)
 * - Display format: DD/MM/YYYY (e.g., 31/12/2025)
 * - Time format: 24-hour (e.g., 14:30)
 * - Database format: ISO 8601 (handled by Supabase)
 *
 * Uses native Intl.DateTimeFormat with 'he-IL' locale for proper formatting.
 */

/**
 * Format date to DD/MM/YYYY (Israeli standard)
 *
 * @param date - Date object, ISO string, or null/undefined
 * @returns Formatted date string or empty string if null/undefined
 *
 * @example
 * formatDate(new Date('2025-12-31'))  // "31.12.2025"
 * formatDate('2025-12-31T14:30:00Z')  // "31.12.2025"
 * formatDate(null)                     // ""
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return ''

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date

    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      console.error('Invalid date provided to formatDate:', date)
      return ''
    }

    // Format using he-IL locale which gives DD.MM.YYYY (Israeli standard with dots)
    const formatted = new Intl.DateTimeFormat('he-IL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(dateObj)

    // Remove any non-standard characters (some locales add LTR/RTL marks)
    return formatted.replace(/[\u200E\u200F]/g, '')
  } catch (error) {
    console.error('Error formatting date:', error)
    return ''
  }
}

/**
 * Format date and time to DD/MM/YYYY HH:mm (Israeli standard, 24-hour)
 *
 * @param date - Date object, ISO string, or null/undefined
 * @returns Formatted date-time string or empty string if null/undefined
 *
 * @example
 * formatDateTime(new Date('2025-12-31T14:30:00Z'))  // "31.12.2025 14:30"
 * formatDateTime('2025-12-31T09:15:00Z')            // "31.12.2025 09:15"
 * formatDateTime(null)                               // ""
 */
export function formatDateTime(
  date: string | Date | null | undefined
): string {
  if (!date) return ''

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date

    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      console.error('Invalid date provided to formatDateTime:', date)
      return ''
    }

    // Format date and time separately for consistent output
    const datePart = new Intl.DateTimeFormat('he-IL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(dateObj)

    const timePart = new Intl.DateTimeFormat('he-IL', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false, // 24-hour format
    }).format(dateObj)

    // Combine with space, remove LTR/RTL marks and commas
    return `${datePart} ${timePart}`
      .replace(/[\u200E\u200F,]/g, '')
      .trim()
  } catch (error) {
    console.error('Error formatting date-time:', error)
    return ''
  }
}

/**
 * Format time only to HH:mm (24-hour format)
 *
 * @param date - Date object, ISO string, or null/undefined
 * @returns Formatted time string or empty string if null/undefined
 *
 * @example
 * formatTime(new Date('2025-12-31T14:30:00Z'))  // "14:30"
 * formatTime('2025-12-31T09:15:00Z')            // "09:15"
 */
export function formatTime(date: string | Date | null | undefined): string {
  if (!date) return ''

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date

    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      console.error('Invalid date provided to formatTime:', date)
      return ''
    }

    const formatted = new Intl.DateTimeFormat('he-IL', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false, // 24-hour format
    }).format(dateObj)

    // Remove any non-standard characters
    return formatted.replace(/[\u200E\u200F]/g, '')
  } catch (error) {
    console.error('Error formatting time:', error)
    return ''
  }
}
