import { useState } from 'react'
import imageCompression from 'browser-image-compression'
import { supabase } from '../../../lib/supabase'

interface PhotoUploadResult {
  isUploading: boolean
  uploadError: string | null
  photoUrl: string | null
  uploadPhoto: (file: File) => Promise<void>
  resetUpload: () => void
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB before compression
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

/**
 * Custom hook for photo upload to Supabase Storage
 *
 * Features:
 * - Client-side file validation (size, type)
 * - Image compression (target 1MB, max 1920px)
 * - Background upload to Supabase Storage
 * - Hebrew error messages
 * - Public URL generation
 *
 * @returns {PhotoUploadResult} Upload state and functions
 */
export const usePhotoUpload = (): PhotoUploadResult => {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)

  const uploadPhoto = async (file: File) => {
    try {
      setIsUploading(true)
      setUploadError(null)

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        throw new Error('קובץ גדול מדי (מקסימום 10MB)')
      }

      // Validate MIME type
      if (!ALLOWED_TYPES.includes(file.type)) {
        throw new Error('סוג קובץ לא נתמך')
      }

      // Compress image using web worker (non-blocking)
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        initialQuality: 0.8,
        fileType: 'image/jpeg'
      })

      // Generate unique file path with timestamp
      const timestamp = Date.now()
      const filePath = `incidents/${timestamp}.jpg`

      // Upload to Supabase Storage
      const { error } = await supabase.storage
        .from('incident-photos')
        .upload(filePath, compressedFile, {
          contentType: 'image/jpeg',
          upsert: false
        })

      if (error) throw error

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('incident-photos')
        .getPublicUrl(filePath)

      setPhotoUrl(urlData.publicUrl)
    } catch (err) {
      console.error('Photo upload failed:', err)

      // Check for network errors
      if (err instanceof Error) {
        const errorMessage = err.message.toLowerCase()
        if (errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('connection')) {
          setUploadError('אין חיבור לאינטרנט')
        } else {
          setUploadError(err.message)
        }
      } else {
        setUploadError('העלאת התמונה נכשלה')
      }
    } finally {
      setIsUploading(false)
    }
  }

  const resetUpload = () => {
    setPhotoUrl(null)
    setUploadError(null)
    setIsUploading(false)
  }

  return {
    isUploading,
    uploadError,
    photoUrl,
    uploadPhoto,
    resetUpload
  }
}
