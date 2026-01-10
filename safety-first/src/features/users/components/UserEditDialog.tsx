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
  TextField,
  Box,
  Typography
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import SaveIcon from '@mui/icons-material/Save'
import LockResetIcon from '@mui/icons-material/LockReset'
import { updateUser, deleteUser } from '../api'
import { ROLE_LABELS } from '../utils'
import { ConfirmDeleteDialog } from './ConfirmDeleteDialog'
import { ResetPasswordDialog } from './ResetPasswordDialog'
import { AppSnackbar } from '../../../components/feedback/AppSnackbar'
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
  // Form state (role and full_name are editable)
  const [role, setRole] = useState<'manager' | 'it_admin'>('manager')
  const [fullName, setFullName] = useState('')

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Validation state
  const [fullNameError, setFullNameError] = useState('')

  // Delete confirmation state
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Reset password dialog state
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false)

  // Check if this is the current user (for self-deletion prevention)
  const isSelf = user?.id === currentUserId

  // Clear messages when dialog opens
  useEffect(() => {
    if (open) {
      setErrorMessage(null)
      setSuccessMessage(null)
    }
  }, [open])

  // Initialize role and full_name when user prop changes
  useEffect(() => {
    if (user) {
      setRole(user.role)
      setFullName(user.full_name || '')
      setFullNameError('')
    }
  }, [user])

  // Validate full name
  const validateFullName = (value: string): boolean => {
    if (!value || value.trim().length < 2) {
      setFullNameError('נדרש שם מלא (לפחות 2 תווים)')
      return false
    }
    setFullNameError('')
    return true
  }

  // Check if this is a self-demotion attempt (frontend validation)
  const isSelfDemotion = (): boolean => {
    if (!user) return false
    return user.id === currentUserId && role === 'manager' && user.role === 'it_admin'
  }

  // Check if any changes were made
  const hasChanges = (): boolean => {
    if (!user) return false
    return role !== user.role || fullName.trim() !== (user.full_name || '').trim()
  }

  // Handle form submission
  const handleSubmit = async () => {
    if (!user) return

    // Validate full name
    if (!validateFullName(fullName)) {
      return
    }

    // Frontend self-demotion check
    if (isSelfDemotion()) {
      setErrorMessage('לא ניתן להסיר הרשאת מנהל מעצמך')
      return
    }

    try {
      setIsSubmitting(true)
      setErrorMessage(null)

      // Build updates object (only include changed fields)
      const updates: { role?: 'manager' | 'it_admin'; full_name?: string } = {}
      if (role !== user.role) {
        updates.role = role
      }
      if (fullName.trim() !== (user.full_name || '').trim()) {
        updates.full_name = fullName.trim()
      }

      await updateUser(user.id, updates)

      // Success!
      setSuccessMessage('המשתמש עודכן בהצלחה')

      // Call success callback (will refresh list and close dialog)
      setTimeout(() => {
        onSuccess()
      }, 1000) // Brief delay to show success message
    } catch (error) {
      // Show error message (from API with Hebrew message)
      const errorMsg = error instanceof Error ? error.message : 'שגיאה בעדכון המשתמש'
      setErrorMessage(errorMsg)

      // Don't close dialog - keep it open for user to retry
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle dialog close
  const handleClose = () => {
    if (!isSubmitting && !isDeleting) {
      setErrorMessage(null)
      setSuccessMessage(null)
      setFullNameError('')
      setIsConfirmDeleteOpen(false)
      setIsResetPasswordOpen(false)
      onClose()
    }
  }

  // Handle password reset success
  const handlePasswordResetSuccess = () => {
    setSuccessMessage('הסיסמה אופסה בהצלחה')
    setIsResetPasswordOpen(false)
    // Call success callback to refresh list (optional, password reset doesn't change list)
    setTimeout(() => {
      onSuccess()
    }, 1000)
  }

  // Handle delete user
  const handleDelete = async () => {
    if (!user) return

    // Frontend self-deletion check (defense in depth)
    if (isSelf) {
      setErrorMessage('לא ניתן להסיר את עצמך מהמערכת')
      setIsConfirmDeleteOpen(false)
      return
    }

    try {
      setIsDeleting(true)
      setErrorMessage(null)

      await deleteUser(user.id)

      // Success!
      setSuccessMessage('המשתמש הוסר בהצלחה')
      setIsConfirmDeleteOpen(false)

      // Call success callback (will refresh list and close dialog)
      setTimeout(() => {
        onSuccess()
      }, 1000) // Brief delay to show success message
    } catch (error) {
      // Show error message (from API with Hebrew message)
      const errorMsg = error instanceof Error ? error.message : 'שגיאה במחיקת המשתמש'
      setErrorMessage(errorMsg)
      setIsConfirmDeleteOpen(false)
      // Don't close main dialog - keep it open for user to see error
    } finally {
      setIsDeleting(false)
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

            {/* Full Name (editable) */}
            <TextField
              label="שם מלא"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value)
                if (fullNameError) validateFullName(e.target.value)
              }}
              onBlur={() => validateFullName(fullName)}
              error={!!fullNameError}
              helperText={fullNameError}
              required
              fullWidth
              disabled={isSubmitting || isDeleting}
              sx={{
                '& .MuiInputLabel-root': {
                  right: '22px !important',
                  left: 'auto !important'
                },
                '& .MuiInputLabel-shrink': {
                  right: '26px !important'
                }
              }}
              inputProps={{ dir: 'rtl' }}
            />

            {/* Role dropdown (editable) */}
            <FormControl
              fullWidth
              required
              disabled={isSubmitting || isDeleting}
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

        <DialogActions sx={{
          flexDirection: 'column',
          gap: 1.5,
          px: 3,
          pb: 2,
          pt: 2
        }}>
          {/* First row: Reset Password and Remove User buttons */}
          <Box sx={{ display: 'flex', gap: 1, width: '100%', justifyContent: 'flex-start' }}>
            {/* Reset Password button */}
            <Button
              variant="outlined"
              onClick={() => setIsResetPasswordOpen(true)}
              disabled={isSubmitting || isDeleting}
              startIcon={<LockResetIcon />}
              sx={{
                flex: 1,
                whiteSpace: 'nowrap',
                '& .MuiButton-startIcon': {
                  marginRight: '8px',
                  marginLeft: 0
                }
              }}
            >
              איפוס סיסמה
            </Button>

            {/* Remove User button - hidden for self */}
            {!isSelf && (
              <Button
                color="error"
                variant="outlined"
                onClick={() => setIsConfirmDeleteOpen(true)}
                disabled={isSubmitting || isDeleting}
                sx={{
                  flex: 1,
                  whiteSpace: 'nowrap',
                  '& .MuiButton-startIcon': {
                    marginRight: '12px',
                    marginLeft: 0
                  }
                }}
                startIcon={<DeleteIcon />}
              >
                הסר
              </Button>
            )}
          </Box>

          {/* Second row: Save and Cancel buttons */}
          <Box sx={{ display: 'flex', gap: 1, width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={handleClose} disabled={isSubmitting || isDeleting}>
              ביטול
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={isSubmitting || isDeleting || !hasChanges()}
              startIcon={<SaveIcon />}
              sx={{
                '& .MuiButton-startIcon': {
                  marginRight: '8px',
                  marginLeft: 0
                }
              }}
            >
              {isSubmitting ? 'שומר...' : 'שמור'}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <ConfirmDeleteDialog
        user={user}
        open={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />

      {/* Reset Password Dialog */}
      <ResetPasswordDialog
        user={user}
        open={isResetPasswordOpen}
        onClose={() => setIsResetPasswordOpen(false)}
        onSuccess={handlePasswordResetSuccess}
      />

      {/* Success Snackbar */}
      <AppSnackbar
        open={!!successMessage}
        message={successMessage || ''}
        severity="success"
        onClose={() => setSuccessMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />

      {/* Error Snackbar */}
      <AppSnackbar
        open={!!errorMessage}
        message={errorMessage || ''}
        severity="error"
        onClose={() => setErrorMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </>
  )
}
