import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  InputAdornment,
  Box,
  Typography
} from '@mui/material'
import { Visibility, VisibilityOff, ContentCopy } from '@mui/icons-material'
import { resetUserPassword } from '../api'
import { AppAlert } from '../../../components/feedback/AppAlert'
import type { User } from '../types'

interface ResetPasswordDialogProps {
  user: User | null
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function ResetPasswordDialog({
  user,
  open,
  onClose,
  onSuccess
}: ResetPasswordDialogProps) {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [newPassword, setNewPassword] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [touched, setTouched] = useState(false) // Track if user has interacted with field

  const validatePassword = (pwd: string): boolean => {
    // Check minimum length
    if (pwd.length < 8) {
      setError('הסיסמה חייבת להכיל לפחות 8 תווים')
      return false
    }

    // Check for spaces
    if (/\s/.test(pwd)) {
      setError('הסיסמה לא יכולה להכיל רווחים')
      return false
    }

    // Check alphanumeric only (English letters and numbers)
    if (!/^[a-zA-Z0-9]+$/.test(pwd)) {
      setError('הסיסמה חייבת להכיל רק אותיות באנגלית ומספרים')
      return false
    }

    setError(null)
    return true
  }

  const handleReset = async () => {
    if (!user) return

    // Frontend validation
    if (!validatePassword(password)) {
      return
    }

    try {
      setIsResetting(true)
      setError(null)
      const resetPassword = await resetUserPassword(user.id, password)
      setNewPassword(resetPassword)
      // Success state: show password for copying
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה באיפוס הסיסמה')
    } finally {
      setIsResetting(false)
    }
  }

  const handleCopy = async () => {
    if (newPassword) {
      await navigator.clipboard.writeText(newPassword)
    }
  }

  const handleClose = () => {
    // Reset all state when closing
    setPassword('')
    setShowPassword(false)
    setNewPassword(null)
    setError(null)
    setIsResetting(false)
    setTouched(false)
    onClose()
  }

  const handleSuccessClose = () => {
    handleClose()
    onSuccess()
  }

  if (!user) return null

  // Success state - display new password
  if (newPassword) {
    return (
      <Dialog open={open} onClose={handleSuccessClose} maxWidth="sm" fullWidth>
        <DialogTitle>הסיסמה אופסה בהצלחה</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <AppAlert severity="success">הסיסמה של {user.full_name} אופסה בהצלחה!</AppAlert>

            <Box
              sx={{
                p: 2,
                bgcolor: 'grey.100',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'grey.300'
              }}
            >
              <Typography variant="body2" color="text.secondary" gutterBottom>
                סיסמה חדשה:
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography
                  variant="h6"
                  sx={{ fontFamily: 'monospace', wordBreak: 'break-all', flex: 1 }}
                  dir="ltr"
                >
                  {newPassword}
                </Typography>
                <IconButton
                  onClick={handleCopy}
                  size="small"
                  sx={{ flexShrink: 0 }}
                  title="העתק"
                >
                  <ContentCopy />
                </IconButton>
              </Box>
            </Box>

            <AppAlert severity="info">
              העבר את הסיסמה למשתמש באופן אישי (טלפון או פנים אל פנים)
            </AppAlert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSuccessClose} variant="contained">
            סגור
          </Button>
        </DialogActions>
      </Dialog>
    )
  }

  // Input state - enter new password
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>איפוס סיסמה</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <Typography>
            איפוס סיסמה עבור: <strong>{user.full_name}</strong> ({user.email})
          </Typography>

          <TextField
            label="סיסמה חדשה"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setTouched(true)
              if (touched && error) validatePassword(e.target.value) // Validate on change if field was touched and error exists
            }}
            onBlur={() => {
              setTouched(true)
              validatePassword(password)
            }}
            fullWidth
            autoFocus
            dir="ltr"
            error={touched && !!error}
            helperText={(touched && error) || 'לפחות 8 תווים - אותיות באנגלית ומספרים בלבד'}
            sx={{
              '& .MuiInputLabel-root': {
                right: '22px !important',
                left: 'auto !important'
              },
              '& .MuiInputLabel-shrink': {
                right: '26px !important'
              }
            }}
            InputLabelProps={{
              shrink: password.length > 0 ? true : undefined
            }}
            InputProps={{
              endAdornment: password.length > 0 ? (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ) : null
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isResetting}>
          ביטול
        </Button>
        <Button
          onClick={handleReset}
          variant="contained"
          disabled={isResetting || password.length < 8 || /\s/.test(password) || !/^[a-zA-Z0-9]+$/.test(password)}
        >
          {isResetting ? 'מאפס...' : 'איפוס'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
