import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ReportPage } from './ReportPage'
import * as api from '../api'

// Mock the API module
vi.mock('../api', () => ({
  getActiveLocations: vi.fn(),
  submitIncident: vi.fn(),
}))

// Mock usePhotoUpload hook
vi.mock('../hooks/usePhotoUpload', () => ({
  usePhotoUpload: () => ({
    isUploading: false,
    uploadError: null,
    photoUrl: null,
    uploadPhoto: vi.fn(),
    resetUpload: vi.fn(),
  }),
}))

describe('ReportPage', () => {
  const mockLocations = [
    { id: 'loc-1', name_he: 'מיקום 1' },
    { id: 'loc-2', name_he: 'מיקום 2' },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(api.getActiveLocations).mockResolvedValue(mockLocations)
  })

  it('renders the public report form with Hebrew labels', async () => {
    render(<ReportPage />)

    expect(screen.getByRole('heading', { name: /דיווח אירוע בטיחות/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/מיקום/i)).toBeInTheDocument()

    // Wait for locations to load
    await waitFor(() => {
      expect(screen.queryByText(/טוען מיקומים/i)).not.toBeInTheDocument()
    })

    expect(screen.getByLabelText(/תאריך/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/שעה/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/שם/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/תיאור/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /שלח דיווח/i })).toBeInTheDocument()
  })

  it('should successfully submit a report', async () => {
    const user = userEvent.setup()
    vi.mocked(api.submitIncident).mockResolvedValue()

    render(<ReportPage />)

    // Wait for locations to load
    await waitFor(() => {
      expect(screen.queryByText(/טוען מיקומים/i)).not.toBeInTheDocument()
    })

    // Select location
    const locationSelect = screen.getByLabelText(/מיקום/i)
    await user.click(locationSelect)

    const option = await screen.findByText('מיקום 1')
    await user.click(option)

    // Fill in description
    const descriptionField = screen.getByLabelText(/תיאור/i)
    await user.type(descriptionField, 'Test incident description')

    // Submit form
    const submitButton = screen.getByRole('button', { name: /שלח דיווח/i })
    await user.click(submitButton)

    // Verify submit was called
    await waitFor(() => {
      expect(api.submitIncident).toHaveBeenCalledWith(
        expect.objectContaining({
          location_id: 'loc-1',
          description: 'Test incident description',
          severity: 'unknown',
        })
      )
    })

    // Verify success message
    await waitFor(() => {
      expect(screen.getByText(/הדיווח נשלח בהצלחה/i)).toBeInTheDocument()
    })
  })

  it('should show error message when submit fails', async () => {
    const user = userEvent.setup()
    vi.mocked(api.submitIncident).mockRejectedValue(new Error('אין חיבור לאינטרנט'))

    render(<ReportPage />)

    // Wait for locations to load
    await waitFor(() => {
      expect(screen.queryByText(/טוען מיקומים/i)).not.toBeInTheDocument()
    })

    // Select location
    const locationSelect = screen.getByLabelText(/מיקום/i)
    await user.click(locationSelect)
    const option = await screen.findByText('מיקום 1')
    await user.click(option)

    // Submit form
    const submitButton = screen.getByRole('button', { name: /שלח דיווח/i })
    await user.click(submitButton)

    // Verify error message
    await waitFor(() => {
      expect(screen.getByText(/אין חיבור לאינטרנט/i)).toBeInTheDocument()
    })
  })

  it('should require location to be selected', async () => {
    const user = userEvent.setup()

    render(<ReportPage />)

    // Wait for locations to load
    await waitFor(() => {
      expect(screen.queryByText(/טוען מיקומים/i)).not.toBeInTheDocument()
    })

    // Try to submit without selecting location
    const submitButton = screen.getByRole('button', { name: /שלח דיווח/i })
    await user.click(submitButton)

    // Verify validation error
    await waitFor(() => {
      expect(screen.getByText(/נא לבחור מיקום/i)).toBeInTheDocument()
    })

    // Verify submitIncident was not called
    expect(api.submitIncident).not.toHaveBeenCalled()
  })

  it('should handle location loading error', async () => {
    vi.mocked(api.getActiveLocations).mockRejectedValue(new Error('Network error'))

    render(<ReportPage />)

    // Verify error message
    await waitFor(() => {
      expect(screen.getByText(/לא ניתן לטעון מיקומים/i)).toBeInTheDocument()
    })

    // Verify location dropdown is disabled when there's an error (MUI uses aria-disabled)
    const locationSelect = screen.getByLabelText(/מיקום/i)
    expect(locationSelect).toHaveAttribute('aria-disabled', 'true')
  })

  it('should set is_anonymous when reporter name is empty', async () => {
    const user = userEvent.setup()
    vi.mocked(api.submitIncident).mockResolvedValue()

    render(<ReportPage />)

    // Wait for locations to load
    await waitFor(() => {
      expect(screen.queryByText(/טוען מיקומים/i)).not.toBeInTheDocument()
    })

    // Select location
    const locationSelect = screen.getByLabelText(/מיקום/i)
    await user.click(locationSelect)
    const option = await screen.findByText('מיקום 1')
    await user.click(option)

    // Leave reporter name empty and submit
    const submitButton = screen.getByRole('button', { name: /שלח דיווח/i })
    await user.click(submitButton)

    // Verify submitIncident was called with reporter_name: null
    await waitFor(() => {
      expect(api.submitIncident).toHaveBeenCalledWith(
        expect.objectContaining({
          reporter_name: null,
        })
      )
    })
  })
})
