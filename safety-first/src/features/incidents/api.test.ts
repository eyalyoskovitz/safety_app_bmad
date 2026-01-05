import { describe, it, expect, vi, beforeEach } from 'vitest'
import { submitIncident, getActiveLocations } from './api'
import { supabase } from '../../lib/supabase'
import type { IncidentFormData } from './types'

// Mock Supabase client
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
  },
}))

describe('submitIncident', () => {
  const mockFormData: IncidentFormData = {
    reporter_name: 'Test Reporter',
    severity: 'minor',
    location_id: 'loc-1',
    incident_date: '2025-01-05T14:30:00',
    description: 'Test description',
    photo_url: null,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should successfully submit an incident', async () => {
    // Mock successful RPC call
    vi.mocked(supabase.rpc).mockResolvedValueOnce({
      data: null,
      error: null,
    } as any)

    // Mock successful insert
    const mockInsert = vi.fn().mockResolvedValueOnce({
      data: null,
      error: null,
    })
    vi.mocked(supabase.from).mockReturnValueOnce({
      insert: mockInsert,
    } as any)

    await submitIncident(mockFormData)

    expect(supabase.rpc).toHaveBeenCalledWith('check_and_increment_daily_count', {
      p_daily_limit: 5,
    })
    expect(supabase.from).toHaveBeenCalledWith('incidents')
    expect(mockInsert).toHaveBeenCalledWith([
      {
        reporter_name: 'Test Reporter',
        severity: 'minor',
        location_id: 'loc-1',
        incident_date: '2025-01-05T14:30:00',
        description: 'Test description',
        photo_url: null,
        status: 'new',
        is_anonymous: false,
      },
    ])
  })

  it('should throw Hebrew error when daily limit is exceeded', async () => {
    // Mock RPC error with DAILY_LIMIT_EXCEEDED
    vi.mocked(supabase.rpc).mockResolvedValue({
      data: null,
      error: {
        message: 'DAILY_LIMIT_EXCEEDED: Maximum reports reached',
      },
    } as any)

    await expect(submitIncident(mockFormData)).rejects.toThrow(
      'המערכת הגיעה למגבלת הדיווחים היומית. אנא פנה לממונה הבטיחות'
    )
  })

  it('should throw Hebrew error when RPC check fails', async () => {
    // Mock RPC error (not limit related)
    vi.mocked(supabase.rpc).mockResolvedValue({
      data: null,
      error: {
        message: 'Database error',
      },
    } as any)

    await expect(submitIncident(mockFormData)).rejects.toThrow('שגיאה בבדיקת מגבלת דיווחים')
  })

  it('should throw Hebrew error for network/connection errors', async () => {
    // Mock successful RPC
    vi.mocked(supabase.rpc).mockResolvedValue({
      data: null,
      error: null,
    } as any)

    // Mock insert with network error
    const mockInsert = vi.fn().mockResolvedValue({
      data: null,
      error: {
        message: 'Failed to fetch',
        code: 'PGRST301',
      },
    })
    vi.mocked(supabase.from).mockReturnValue({
      insert: mockInsert,
    } as any)

    await expect(submitIncident(mockFormData)).rejects.toThrow('אין חיבור לאינטרנט')
  })

  it('should throw Hebrew error for generic database errors', async () => {
    // Mock successful RPC
    vi.mocked(supabase.rpc).mockResolvedValue({
      data: null,
      error: null,
    } as any)

    // Mock insert with generic error
    const mockInsert = vi.fn().mockResolvedValue({
      data: null,
      error: {
        message: 'Database constraint violation',
      },
    })
    vi.mocked(supabase.from).mockReturnValue({
      insert: mockInsert,
    } as any)

    await expect(submitIncident(mockFormData)).rejects.toThrow('שגיאה בשמירת הדיווח')
  })

  it('should set is_anonymous to true when reporter_name is null', async () => {
    // Mock successful RPC call
    vi.mocked(supabase.rpc).mockResolvedValue({
      data: null,
      error: null,
    } as any)

    // Mock successful insert
    const mockInsert = vi.fn().mockResolvedValue({
      data: null,
      error: null,
    })
    vi.mocked(supabase.from).mockReturnValue({
      insert: mockInsert,
    } as any)

    await submitIncident({ ...mockFormData, reporter_name: null })

    expect(mockInsert).toHaveBeenCalledWith([
      expect.objectContaining({
        reporter_name: null,
        is_anonymous: true,
      }),
    ])
  })
})

describe('getActiveLocations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch active locations successfully', async () => {
    const mockLocations = [
      { id: 'loc-1', name_he: 'מיקום 1' },
      { id: 'loc-2', name_he: 'מיקום 2' },
    ]

    const mockOrder = vi.fn().mockResolvedValue({
      data: mockLocations,
      error: null,
    })
    const mockEq = vi.fn().mockReturnValue({
      order: mockOrder,
    })
    const mockSelect = vi.fn().mockReturnValue({
      eq: mockEq,
    })
    vi.mocked(supabase.from).mockReturnValue({
      select: mockSelect,
    } as any)

    const result = await getActiveLocations()

    expect(supabase.from).toHaveBeenCalledWith('plant_locations')
    expect(mockSelect).toHaveBeenCalledWith('id, name_he')
    expect(mockEq).toHaveBeenCalledWith('is_active', true)
    expect(mockOrder).toHaveBeenCalledWith('name_he', { ascending: true })
    expect(result).toEqual(mockLocations)
  })

  it('should throw error when fetch fails', async () => {
    const mockOrder = vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'Network error' },
    })
    const mockEq = vi.fn().mockReturnValue({
      order: mockOrder,
    })
    const mockSelect = vi.fn().mockReturnValue({
      eq: mockEq,
    })
    vi.mocked(supabase.from).mockReturnValue({
      select: mockSelect,
    } as any)

    await expect(getActiveLocations()).rejects.toThrow('Failed to fetch locations: Network error')
  })
})
