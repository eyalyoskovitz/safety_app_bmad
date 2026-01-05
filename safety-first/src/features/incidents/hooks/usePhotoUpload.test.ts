import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { usePhotoUpload } from './usePhotoUpload'
import { supabase } from '../../../lib/supabase'
import imageCompression from 'browser-image-compression'

// Mock Supabase client
vi.mock('../../../lib/supabase', () => ({
  supabase: {
    storage: {
      from: vi.fn(),
    },
  },
}))

// Mock image compression
vi.mock('browser-image-compression', () => ({
  default: vi.fn(),
}))

describe('usePhotoUpload', () => {
  const createMockFile = (size: number, type: string): File => {
    const blob = new Blob(['a'.repeat(size)], { type })
    return new File([blob], 'test.jpg', { type })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with default state', () => {
    const { result } = renderHook(() => usePhotoUpload())

    expect(result.current.isUploading).toBe(false)
    expect(result.current.uploadError).toBe(null)
    expect(result.current.photoUrl).toBe(null)
  })

  it('should reject files larger than 10MB', async () => {
    const { result } = renderHook(() => usePhotoUpload())
    const largeFile = createMockFile(11 * 1024 * 1024, 'image/jpeg')

    await act(async () => {
      await result.current.uploadPhoto(largeFile)
    })

    expect(result.current.uploadError).toBe('קובץ גדול מדי (מקסימום 10MB)')
    expect(result.current.isUploading).toBe(false)
  })

  it('should reject unsupported file types', async () => {
    const { result } = renderHook(() => usePhotoUpload())
    const invalidFile = createMockFile(1024, 'image/gif')

    await act(async () => {
      await result.current.uploadPhoto(invalidFile)
    })

    expect(result.current.uploadError).toBe('סוג קובץ לא נתמך')
    expect(result.current.isUploading).toBe(false)
  })

  it('should successfully upload a valid photo', async () => {
    const { result } = renderHook(() => usePhotoUpload())
    const validFile = createMockFile(1024, 'image/jpeg')
    const compressedFile = new File([new Blob(['compressed'])], 'compressed.jpg', {
      type: 'image/jpeg',
    })

    // Mock image compression
    vi.mocked(imageCompression).mockResolvedValue(compressedFile as any)

    // Mock successful upload
    const mockUpload = vi.fn().mockResolvedValue({
      data: { path: 'incidents/12345.jpg' },
      error: null,
    })
    const mockGetPublicUrl = vi.fn().mockReturnValue({
      data: { publicUrl: 'https://example.com/incidents/12345.jpg' },
    })
    vi.mocked(supabase.storage.from).mockReturnValue({
      upload: mockUpload,
      getPublicUrl: mockGetPublicUrl,
    } as any)

    await act(async () => {
      await result.current.uploadPhoto(validFile)
    })

    await waitFor(() => {
      expect(result.current.isUploading).toBe(false)
    })

    expect(imageCompression).toHaveBeenCalledWith(validFile, {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      initialQuality: 0.8,
      fileType: 'image/jpeg',
    })
    expect(mockUpload).toHaveBeenCalledWith(
      expect.stringMatching(/^incidents\/\d+\.jpg$/),
      compressedFile,
      {
        contentType: 'image/jpeg',
        upsert: false,
      }
    )
    expect(result.current.photoUrl).toBe('https://example.com/incidents/12345.jpg')
    expect(result.current.uploadError).toBe(null)
  })

  it('should handle network errors during upload', async () => {
    const { result } = renderHook(() => usePhotoUpload())
    const validFile = createMockFile(1024, 'image/jpeg')
    const compressedFile = new File([new Blob(['compressed'])], 'compressed.jpg', {
      type: 'image/jpeg',
    })

    vi.mocked(imageCompression).mockResolvedValue(compressedFile as any)

    // Mock upload with network error
    const mockUpload = vi.fn().mockResolvedValue({
      data: null,
      error: new Error('Network connection failed'),
    })
    vi.mocked(supabase.storage.from).mockReturnValue({
      upload: mockUpload,
    } as any)

    await act(async () => {
      await result.current.uploadPhoto(validFile)
    })

    await waitFor(() => {
      expect(result.current.isUploading).toBe(false)
    })

    expect(result.current.uploadError).toBe('אין חיבור לאינטרנט')
    expect(result.current.photoUrl).toBe(null)
  })

  it('should handle generic upload errors', async () => {
    const { result } = renderHook(() => usePhotoUpload())
    const validFile = createMockFile(1024, 'image/jpeg')
    const compressedFile = new File([new Blob(['compressed'])], 'compressed.jpg', {
      type: 'image/jpeg',
    })

    vi.mocked(imageCompression).mockResolvedValue(compressedFile as any)

    // Mock upload with generic error
    const mockUpload = vi.fn().mockResolvedValue({
      data: null,
      error: new Error('Storage quota exceeded'),
    })
    vi.mocked(supabase.storage.from).mockReturnValue({
      upload: mockUpload,
    } as any)

    await act(async () => {
      await result.current.uploadPhoto(validFile)
    })

    await waitFor(() => {
      expect(result.current.isUploading).toBe(false)
    })

    expect(result.current.uploadError).toBe('Storage quota exceeded')
    expect(result.current.photoUrl).toBe(null)
  })

  it('should reset upload state', async () => {
    const { result } = renderHook(() => usePhotoUpload())
    const validFile = createMockFile(1024, 'image/jpeg')
    const compressedFile = new File([new Blob(['compressed'])], 'compressed.jpg', {
      type: 'image/jpeg',
    })

    vi.mocked(imageCompression).mockResolvedValue(compressedFile as any)

    const mockUpload = vi.fn().mockResolvedValue({
      data: { path: 'incidents/12345.jpg' },
      error: null,
    })
    const mockGetPublicUrl = vi.fn().mockReturnValue({
      data: { publicUrl: 'https://example.com/incidents/12345.jpg' },
    })
    vi.mocked(supabase.storage.from).mockReturnValue({
      upload: mockUpload,
      getPublicUrl: mockGetPublicUrl,
    } as any)

    // Upload a photo
    await act(async () => {
      await result.current.uploadPhoto(validFile)
    })

    await waitFor(() => {
      expect(result.current.photoUrl).toBe('https://example.com/incidents/12345.jpg')
    })

    // Reset upload
    act(() => {
      result.current.resetUpload()
    })

    expect(result.current.photoUrl).toBe(null)
    expect(result.current.uploadError).toBe(null)
    expect(result.current.isUploading).toBe(false)
  })
})
