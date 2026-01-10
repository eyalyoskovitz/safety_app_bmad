import type { FC } from 'react'
import { useRef, useState } from 'react'
import { Button, Box, IconButton, Typography, CircularProgress, Dialog } from '@mui/material'
import { CameraAlt, Close } from '@mui/icons-material'
import { AppAlert } from '../../../components/feedback/AppAlert'

interface PhotoCaptureProps {
  photo: File | null
  previewUrl: string | null
  isUploading: boolean
  uploadError: string | null
  onPhotoCapture: (file: File) => void
  onPhotoRemove: () => void
}

/**
 * PhotoCapture Component - Mobile-first photo capture with preview
 *
 * Features:
 * - Camera-first on mobile (capture="environment" for rear camera)
 * - File picker fallback on desktop
 * - Thumbnail preview with remove button
 * - Upload progress indicator
 * - Hebrew error messages
 * - Click to view full size in modal
 *
 * @param {PhotoCaptureProps} props - Component props
 */
export const PhotoCapture: FC<PhotoCaptureProps> = ({
  photo,
  previewUrl,
  isUploading,
  uploadError,
  onPhotoCapture,
  onPhotoRemove
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [fullscreenOpen, setFullscreenOpen] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onPhotoCapture(file)
      // Reset input so same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleImageClick = () => {
    setFullscreenOpen(true)
  }

  const handleFullscreenClose = () => {
    setFullscreenOpen(false)
  }

  return (
    <Box>
      {/* Hidden file input with mobile camera capture */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {/* Preview or Capture Button */}
      {!photo ? (
        <Button
          variant="outlined"
          startIcon={<CameraAlt />}
          fullWidth
          onClick={() => fileInputRef.current?.click()}
          sx={{ gap: 1 }} // Add spacing between icon and text for RTL
        >
          הוסף תמונה
        </Button>
      ) : (
        <Box sx={{ position: 'relative' }}>
          {/* Thumbnail preview - clickable to open full size */}
          <Box
            onClick={handleImageClick}
            sx={{
              width: '100%',
              height: 250,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'grey.100',
              borderRadius: 2,
              overflow: 'hidden',
              cursor: 'pointer',
              border: '1px solid',
              borderColor: 'divider',
              '&:hover': {
                opacity: 0.9
              }
            }}
          >
            <img
              src={previewUrl || ''}
              alt="תצוגה מקדימה"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                display: 'block'
              }}
            />
          </Box>

          {/* Remove button overlay */}
          <IconButton
            onClick={(e) => {
              e.stopPropagation() // Prevent opening image when clicking remove
              onPhotoRemove()
            }}
            disabled={isUploading}
            sx={{
              position: 'absolute',
              top: 8,
              left: 8, // Changed from right: 8 for RTL
              bgcolor: 'rgba(0,0,0,0.6)',
              color: 'white',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
              zIndex: 1
            }}
          >
            <Close />
          </IconButton>

          {/* Upload progress indicator */}
          {isUploading && (
            <Box
              sx={{
                position: 'absolute',
                bottom: 8,
                left: 8,
                right: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                bgcolor: 'rgba(255,255,255,0.9)',
                p: 1,
                borderRadius: 1
              }}
            >
              <CircularProgress size={20} />
              <Typography variant="caption">מעלה תמונה...</Typography>
            </Box>
          )}
        </Box>
      )}

      {/* Error message display */}
      {uploadError && (
        <AppAlert severity="error" sx={{ mt: 2 }}>
          {uploadError}
        </AppAlert>
      )}

      {/* Fullscreen image dialog */}
      <Dialog
        open={fullscreenOpen}
        onClose={handleFullscreenClose}
        maxWidth={false}
        PaperProps={{
          sx: {
            bgcolor: 'rgba(0, 0, 0, 0.9)',
            boxShadow: 'none',
            maxWidth: '95vw',
            maxHeight: '95vh',
            m: 0
          }
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2
          }}
        >
          {/* Close button */}
          <IconButton
            onClick={handleFullscreenClose}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: 'rgba(255,255,255,0.2)',
              color: 'white',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
              zIndex: 1
            }}
          >
            <Close />
          </IconButton>

          {/* Full size image */}
          <img
            src={previewUrl || ''}
            alt="תצוגה מלאה"
            style={{
              maxWidth: '100%',
              maxHeight: '90vh',
              objectFit: 'contain'
            }}
          />
        </Box>
      </Dialog>
    </Box>
  )
}
