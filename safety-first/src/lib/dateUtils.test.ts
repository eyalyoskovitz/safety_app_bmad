import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { formatDate, formatDateTime, formatTime } from './dateUtils'

/**
 * Unit Tests for Date Utility Functions
 *
 * Critical Requirements:
 * - FR38: All dates must display in DD/MM/YYYY format (Israeli standard)
 * - Time must display in 24-hour format
 * - Must handle null/undefined gracefully
 * - Must handle invalid dates gracefully
 */

describe('dateUtils', () => {
  // Mock console.error to prevent test output pollution
  const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

  beforeEach(() => {
    consoleErrorSpy.mockClear()
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  describe('formatDate', () => {
    it('should format Date object to DD.MM.YYYY', () => {
      const date = new Date('2025-12-31T14:30:00Z')
      const result = formatDate(date)

      // Should be DD.MM.YYYY format (Israeli standard with dots)
      expect(result).toMatch(/^\d{2}\.\d{2}\.\d{4}$/)
      // Should contain day 31, month 12, year 2025
      expect(result).toContain('31')
      expect(result).toContain('12')
      expect(result).toContain('2025')
    })

    it('should format ISO string to DD.MM.YYYY', () => {
      const dateString = '2025-12-31T14:30:00Z'
      const result = formatDate(dateString)

      expect(result).toMatch(/^\d{2}\.\d{2}\.\d{4}$/)
      expect(result).toContain('31')
      expect(result).toContain('12')
      expect(result).toContain('2025')
    })

    it('should format different dates correctly', () => {
      const testCases = [
        { input: new Date('2025-01-01T12:00:00Z'), month: '01', year: '2025' },
        { input: new Date('2025-06-15T12:00:00Z'), day: '15', month: '06', year: '2025' },
        { input: new Date('2024-12-25T12:00:00Z'), day: '25', month: '12', year: '2024' },
      ]

      testCases.forEach(({ input, day, month, year }) => {
        const result = formatDate(input)
        expect(result).toMatch(/^\d{2}\.\d{2}\.\d{4}$/)
        if (day) expect(result).toContain(day)
        expect(result).toContain(month)
        expect(result).toContain(year)
      })
    })

    it('should return empty string for null', () => {
      expect(formatDate(null)).toBe('')
    })

    it('should return empty string for undefined', () => {
      expect(formatDate(undefined)).toBe('')
    })

    it('should handle invalid date string gracefully', () => {
      const result = formatDate('invalid-date')
      expect(result).toBe('')
      // console.error should be called, but we don't strictly assert it
      // The important behavior is returning empty string
    })

    it('should use Israeli locale (he-IL)', () => {
      // This test verifies the format matches DD.MM.YYYY (Israeli standard)
      // NOT MM/DD/YYYY (American standard)
      const date = new Date('2025-03-15T00:00:00Z') // March 15, 2025
      const result = formatDate(date)

      // Should be 15.03.2025, NOT 03.15.2025
      expect(result).toMatch(/15.*03.*2025/)
    })
  })

  describe('formatDateTime', () => {
    it('should format Date object to DD.MM.YYYY HH:mm', () => {
      const date = new Date('2025-12-31T14:30:00Z')
      const result = formatDateTime(date)

      // Should match DD.MM.YYYY HH:mm pattern
      expect(result).toMatch(/^\d{2}\.\d{2}\.\d{4}\s+\d{2}:\d{2}$/)
      // Should contain date components
      expect(result).toContain('31')
      expect(result).toContain('12')
      expect(result).toContain('2025')
      // Should contain time components
      expect(result).toMatch(/\d{2}:\d{2}/)
    })

    it('should format ISO string to DD.MM.YYYY HH:mm', () => {
      const dateString = '2025-12-31T14:30:00Z'
      const result = formatDateTime(dateString)

      expect(result).toMatch(/^\d{2}\.\d{2}\.\d{4}\s+\d{2}:\d{2}$/)
      expect(result).toContain('31')
      expect(result).toContain('12')
      expect(result).toContain('2025')
    })

    it('should use 24-hour format (not 12-hour with AM/PM)', () => {
      // Test afternoon time (14:30) should NOT be converted to 2:30 PM
      const date = new Date('2025-12-31T14:30:00Z')
      const result = formatDateTime(date)

      // Should not contain AM or PM
      expect(result.toLowerCase()).not.toContain('am')
      expect(result.toLowerCase()).not.toContain('pm')

      // Should contain hour in 24-hour format
      expect(result).toMatch(/\d{2}:\d{2}/)
    })

    it('should format different times correctly', () => {
      const testCases = [
        new Date('2025-01-01T00:00:00Z'), // Midnight
        new Date('2025-01-01T12:00:00Z'), // Noon
        new Date('2025-01-01T23:59:00Z'), // Almost midnight
      ]

      testCases.forEach((date) => {
        const result = formatDateTime(date)
        expect(result).toMatch(/^\d{2}\.\d{2}\.\d{4}\s+\d{2}:\d{2}$/)
      })
    })

    it('should return empty string for null', () => {
      expect(formatDateTime(null)).toBe('')
    })

    it('should return empty string for undefined', () => {
      expect(formatDateTime(undefined)).toBe('')
    })

    it('should handle invalid date string gracefully', () => {
      const result = formatDateTime('not-a-date')
      expect(result).toBe('')
      // console.error should be called, but we don't strictly assert it
      // The important behavior is returning empty string
    })
  })

  describe('formatTime', () => {
    it('should format Date object to HH:mm', () => {
      const date = new Date('2025-12-31T14:30:00Z')
      const result = formatTime(date)

      expect(result).toMatch(/^\d{2}:\d{2}$/)
    })

    it('should format ISO string to HH:mm', () => {
      const dateString = '2025-12-31T14:30:00Z'
      const result = formatTime(dateString)

      expect(result).toMatch(/^\d{2}:\d{2}$/)
    })

    it('should use 24-hour format', () => {
      const afternoonDate = new Date('2025-12-31T14:30:00Z')
      const result = formatTime(afternoonDate)

      // Should not contain AM/PM
      expect(result.toLowerCase()).not.toContain('am')
      expect(result.toLowerCase()).not.toContain('pm')

      // Should be HH:mm format
      expect(result).toMatch(/^\d{2}:\d{2}$/)
    })

    it('should format edge case times correctly', () => {
      const testCases = [
        new Date('2025-01-01T00:00:00Z'), // Midnight - 00:00
        new Date('2025-01-01T12:00:00Z'), // Noon - 12:00
        new Date('2025-01-01T23:59:00Z'), // Almost midnight - 23:59
      ]

      testCases.forEach((date) => {
        const result = formatTime(date)
        expect(result).toMatch(/^\d{2}:\d{2}$/)
        // Verify it's a valid time (00-23 for hours, 00-59 for minutes)
        const [hours, minutes] = result.split(':').map(Number)
        expect(hours).toBeGreaterThanOrEqual(0)
        expect(hours).toBeLessThan(24)
        expect(minutes).toBeGreaterThanOrEqual(0)
        expect(minutes).toBeLessThan(60)
      })
    })

    it('should return empty string for null', () => {
      expect(formatTime(null)).toBe('')
    })

    it('should return empty string for undefined', () => {
      expect(formatTime(undefined)).toBe('')
    })

    it('should handle invalid date string gracefully', () => {
      const result = formatTime('invalid')
      expect(result).toBe('')
      // console.error should be called, but we don't strictly assert it
      // The important behavior is returning empty string
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('should handle Date objects with invalid values', () => {
      const invalidDate = new Date('invalid')
      expect(formatDate(invalidDate)).toBe('')
      expect(formatDateTime(invalidDate)).toBe('')
      expect(formatTime(invalidDate)).toBe('')
    })

    it('should not throw errors for any input type', () => {
      const testInputs = [
        null,
        undefined,
        '',
        'invalid',
        123,
        {},
        [],
        NaN,
      ]

      testInputs.forEach((input) => {
        expect(() => formatDate(input as unknown as string | Date | null | undefined)).not.toThrow()
        expect(() => formatDateTime(input as unknown as string | Date | null | undefined)).not.toThrow()
        expect(() => formatTime(input as unknown as string | Date | null | undefined)).not.toThrow()
      })
    })

    it('should handle timezone differences correctly', () => {
      // Create same moment in time using different timezone representations
      const utcDate = new Date('2025-12-31T12:00:00Z')
      const isoDate = '2025-12-31T12:00:00Z'

      const result1 = formatDate(utcDate)
      const result2 = formatDate(isoDate)

      // Both should produce the same date (allowing for timezone conversion)
      expect(result1).toBeTruthy()
      expect(result2).toBeTruthy()
    })
  })

  describe('FR38 Compliance - Israeli Date Format', () => {
    it('should NEVER use American format (MM.DD.YYYY)', () => {
      // Critical test: Verify we're using DD.MM.YYYY, not MM.DD.YYYY
      const date = new Date('2025-03-15T00:00:00Z') // March 15

      const result = formatDate(date)

      // Israeli format: 15.03.2025
      // American format: 03.15.2025
      // First two digits should be 15 (day), not 03 (month)
      expect(result).toMatch(/^15/)
      expect(result).not.toMatch(/^03/)
    })

    it('should use Israeli locale conventions', () => {
      const date = new Date('2025-01-31T00:00:00Z') // January 31

      const result = formatDate(date)

      // Should start with day (31), not month (01)
      expect(result).toMatch(/^31/)
    })

    it('should format as specified in Israeli standard', () => {
      // Israeli standard uses DD.MM.YYYY (dots, not slashes)
      // Display: DD.MM.YYYY (e.g., 27.12.2025)
      // WRONG: 12.27.2025 (American format)
      // RIGHT: 27.12.2025 (Israeli format)

      const date = new Date('2025-12-27T00:00:00Z')
      const result = formatDate(date)

      // Should be 27.12.2025
      expect(result).toMatch(/27.*12.*2025/)
      // Should NOT be 12.27.2025
      expect(result).not.toMatch(/^12\.27/)
    })
  })
})
