import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  InputAdornment,
  Box,
} from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import { createUser } from '../api'
import { ROLE_LABELS } from '../utils'
import { AppSnackbar } from '../../../components/feedback/AppSnackbar'

interface UserFormProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

/**
 * Dialog form for adding a new user
 * Includes email, full name, role dropdown, and password fields
 * Validates all fields and handles submission with Hebrew error messages
 */
export function UserForm({ open, onClose, onSuccess }: UserFormProps) {
  // Form state
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<'manager' | 'it_admin'>('manager')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Validation state
  const [emailError, setEmailError] = useState('')
  const [fullNameError, setFullNameError] = useState('')
  const [passwordError, setPasswordError] = useState('')

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  // Validate email format
  const validateEmail = (value: string): boolean => {
    if (!value) {
      setEmailError('נדרש אימייל')
      return false
    }
    if (!emailRegex.test(value)) {
      setEmailError('כתובת אימייל לא תקינה')
      return false
    }
    setEmailError('')
    return true
  }

  // Validate full name
  const validateFullName = (value: string): boolean => {
    if (!value || value.trim().length < 2) {
      setFullNameError('נדרש שם מלא (לפחות 2 תווים)')
      return false
    }
    setFullNameError('')
    return true
  }

  // Validate password
  const validatePassword = (value: string): boolean => {
    if (!value) {
      setPasswordError('נדרשת סיסמה')
      return false
    }
    if (value.length < 8) {
      setPasswordError('הסיסמה חייבת להכיל לפחות 8 תווים')
      return false
    }
    // Check for spaces
    if (/\s/.test(value)) {
      setPasswordError('הסיסמה לא יכולה להכיל רווחים')
      return false
    }
    // Check alphanumeric only (English letters and numbers)
    if (!/^[a-zA-Z0-9]+$/.test(value)) {
      setPasswordError('הסיסמה חייבת להכיל רק אותיות באנגלית ומספרים')
      return false
    }
    setPasswordError('')
    return true
  }

  // Check if form is valid
  const isFormValid = (): boolean => {
    return (
      emailRegex.test(email) &&
      fullName.trim().length >= 2 &&
      password.length >= 8 &&
      !/\s/.test(password) &&  // No spaces
      /^[a-zA-Z0-9]+$/.test(password) &&  // Alphanumeric only
      !!role
    )
  }

  // Handle form submission
  const handleSubmit = async () => {
    // Validate all fields
    const isEmailValid = validateEmail(email)
    const isFullNameValid = validateFullName(fullName)
    const isPasswordValid = validatePassword(password)

    if (!isEmailValid || !isFullNameValid || !isPasswordValid) {
      return
    }

    try {
      setIsSubmitting(true)
      setErrorMessage(null)

      await createUser({
        email,
        full_name: fullName,
        role,
        password,
      })

      // Success!
      setSuccessMessage('המשתמש נוסף בהצלחה')

      // Clear form
      setEmail('')
      setFullName('')
      setRole('manager')
      setPassword('')
      setShowPassword(false)

      // Call success callback
      onSuccess()
    } catch (error) {
      // Show error message
      const errorMsg = error instanceof Error ? error.message : 'שגיאה ביצירת המשתמש'
      setErrorMessage(errorMsg)

      // Don't close form - preserve data for user to correct
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle dialog close
  const handleClose = () => {
    if (!isSubmitting) {
      // Clear form
      setEmail('')
      setFullName('')
      setRole('manager')
      setPassword('')
      setShowPassword(false)
      setEmailError('')
      setFullNameError('')
      setPasswordError('')
      setErrorMessage(null)
      onClose()
    }
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        fullScreen={false}
        disableRestoreFocus
      >
        <DialogTitle>הוסף משתמש חדש</DialogTitle>

        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {/* Email field */}
            <TextField
              label="אימייל"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (emailError) validateEmail(e.target.value)
              }}
              onBlur={() => validateEmail(email)}
              error={!!emailError}
              helperText={emailError}
              required
              fullWidth
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
              inputProps={{ dir: 'rtl' }}
            />

            {/* Full Name field */}
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
              inputProps={{ dir: 'rtl' }}
            />

            {/* Role dropdown */}
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

            {/* Password field */}
            <TextField
              label="סיסמה"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (passwordError) validatePassword(e.target.value)
              }}
              onBlur={() => validatePassword(password)}
              error={!!passwordError}
              helperText={passwordError || 'לפחות 8 תווים - אותיות באנגלית ומספרים בלבד'}
              required
              fullWidth
              disabled={isSubmitting}
              dir="ltr"
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
                      disabled={isSubmitting}
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
          <Button onClick={handleClose} disabled={isSubmitting}>
            ביטול
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={isSubmitting || !isFormValid()}
            startIcon={<PersonAddIcon />}
            sx={{
              '& .MuiButton-startIcon': {
                marginLeft: '12px',
                marginRight: 0
              }
            }}
          >
            {isSubmitting ? 'שומר...' : 'הוסף'}
          </Button>
        </DialogActions>
      </Dialog>

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
