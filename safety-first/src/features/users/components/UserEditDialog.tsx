import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  Box,
  Typography,
} from '@mui/material'
import { updateUserRole } from '../api'
import { ROLE_LABELS } from '../utils'
import type { User } from '../types'

interface UserEditDialogProps {
  user: User | null
  open: boolean
  onClose: () => void
  onSuccess: () => void
  currentUserId: string
}

/**
 * Dialog for editing a user's role
 * Displays email and full name as read-only
 * Allows changing role with self-demotion prevention
 */
export function UserEditDialog({
  user,
  open,
  onClose,
  onSuccess,
  currentUserId
}: UserEditDialogProps) {
  // Form state (only role is editable)
  const [role, setRole] = useState<'manager' | 'it_admin'>('manager')

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Initialize role when user prop changes
  useEffect(() => {
    if (user) {
      setRole(user.role)
    }
  }, [user])

  // Check if this is a self-demotion attempt (frontend validation)
  const isSelfDemotion = (): boolean => {
    if (!user) return false
    return user.id === currentUserId && role === 'manager' && user.role === 'it_admin'
  }

  // Handle form submission
  const handleSubmit = async () => {
    if (!user) return

    // Frontend self-demotion check
    if (isSelfDemotion()) {
      setErrorMessage('לא ניתן להסיר הרשאת מנהל מעצמך')
      return
    }

    try {
      setIsSubmitting(true)
      setErrorMessage(null)

      await updateUserRole(user.id, role)

      // Success!
      setSuccessMessage('התפקיד עודכן בהצלחה')

      // Call success callback (will refresh list and close dialog)
      setTimeout(() => {
        onSuccess()
      }, 1000) // Brief delay to show success message
    } catch (error) {
      // Show error message (from API with Hebrew message)
      const errorMsg = error instanceof Error ? error.message : 'שגיאה בעדכון התפקיד'
      setErrorMessage(errorMsg)

      // Don't close dialog - keep it open for user to retry
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle dialog close
  const handleClose = () => {
    if (!isSubmitting) {
      setErrorMessage(null)
      setSuccessMessage(null)
      onClose()
    }
  }

  // Don't render if no user selected
  if (!user) return null

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        disableRestoreFocus
      >
        <DialogTitle>עריכת משתמש</DialogTitle>

        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {/* Email (read-only) */}
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                אימייל
              </Typography>
              <Typography variant="body1">
                {user.email}
              </Typography>
            </Box>

            {/* Full Name (read-only) */}
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                שם מלא
              </Typography>
              <Typography variant="body1">
                {user.full_name || 'לא צוין'}
              </Typography>
            </Box>

            {/* Role dropdown (editable) */}
            <FormControl
              fullWidth
              required
              disabled={isSubmitting}
              sx={{
                '& .MuiInputLabel-root': {
                  right: '22px !important',
                  left: 'auto !important'
                },
                '& .MuiInputLabel-shrink': {
                  right: '26px !important'
                }
              }}
            >
              <InputLabel>תפקיד</InputLabel>
              <Select
                value={role}
                label="תפקיד"
                onChange={(e) => setRole(e.target.value as 'manager' | 'it_admin')}
                inputProps={{ dir: 'rtl' }}
              >
                {Object.entries(ROLE_LABELS).map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={isSubmitting}>
            ביטול
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={isSubmitting || role === user.role}
          >
            {isSubmitting ? 'שומר...' : 'שמור שינויים'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar
        open={!!errorMessage}
        autoHideDuration={6000}
        onClose={() => setErrorMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setErrorMessage(null)}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </>
  )
}
