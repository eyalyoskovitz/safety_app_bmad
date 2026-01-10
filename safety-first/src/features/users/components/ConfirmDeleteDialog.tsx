import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import type { User } from '../types'

interface ConfirmDeleteDialogProps {
  user: User | null
  open: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  isDeleting: boolean
}

/**
 * Confirmation dialog before user deletion
 * Displays warning and user details
 * Shows loading state during deletion
 */
export function ConfirmDeleteDialog({
  user,
  open,
  onClose,
  onConfirm,
  isDeleting
}: ConfirmDeleteDialogProps) {
  // Don't render if no user selected
  if (!user) return null

  return (
    <Dialog
      open={open}
      onClose={isDeleting ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      disableRestoreFocus
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <WarningAmberIcon color="error" />
        הסרת משתמש
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography>
            האם אתה בטוח שברצונך להסיר את המשתמש?
          </Typography>

          {/* User details */}
          <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              שם: {user.full_name || 'לא צוין'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              אימייל: {user.email}
            </Typography>
          </Box>

          <Typography variant="body2" color="error">
            פעולה זו אינה ניתנת לביטול
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={isDeleting}>
          ביטול
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="error"
          disabled={isDeleting}
          startIcon={isDeleting ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          {isDeleting ? 'מוחק...' : 'מחק'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
