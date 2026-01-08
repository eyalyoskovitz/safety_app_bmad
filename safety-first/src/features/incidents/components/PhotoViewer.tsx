import type { FC } from 'react'
import { Dialog, IconButton, Box } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

interface PhotoViewerProps {
  open: boolean
  photoUrl: string | null
  onClose: () => void
}

export const PhotoViewer: FC<PhotoViewerProps> = ({ open, photoUrl, onClose }) => {
  if (!photoUrl) return null

  return (
    <Dialog fullScreen open={open} onClose={onClose}>
      <Box sx={{ position: 'relative', height: '100%', bgcolor: 'black' }}>
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', top: 16, right: 16, color: 'white', zIndex: 1 }}
          aria-label="סגור"
        >
          <CloseIcon />
        </IconButton>
        <img
          src={photoUrl}
          alt="תמונת דיווח"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
        />
      </Box>
    </Dialog>
  )
}
