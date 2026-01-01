import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material'
import { useAuth } from '../hooks/useAuth'
import { getHebrewErrorMessage } from '../api'

/**
 * LoginForm Component
 *
 * Provides email/password login form with Hebrew labels and error messages.
 *
 * Features:
 * - Email and password fields (required)
 * - Email format validation
 * - Hebrew error messages
 * - Loading state during submission
 * - Redirects to /manage/incidents after successful login
 *
 * Used in: LoginPage
 */
export const LoginForm = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Basic validation
    if (!email || !password) {
      setError('נא למלא את כל השדות')
      return
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('כתובת דוא"ל לא תקינה')
      return
    }

    setIsSubmitting(true)

    try {
      await login(email, password)
      // Always redirect to incidents page after login (safe for all roles)
      navigate('/manage/incidents', { replace: true })
    } catch (err) {
      console.error('Login error:', err)
      setError(getHebrewErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        width: '100%',
      }}
    >
      {/* Error message */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Email field */}
      <TextField
        label="דוא״ל"
        type="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value)
          setError(null) // Clear error when user starts typing
        }}
        required
        fullWidth
        disabled={isSubmitting}
        autoComplete="email"
        sx={{
          '& .MuiInputBase-root': {
            minHeight: (theme) => theme.spacing(6), // 48px touch target
          },
        }}
      />

      {/* Password field */}
      <TextField
        label="סיסמה"
        type="password"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value)
          setError(null) // Clear error when user starts typing
        }}
        required
        fullWidth
        disabled={isSubmitting}
        autoComplete="current-password"
        sx={{
          '& .MuiInputBase-root': {
            minHeight: (theme) => theme.spacing(6), // 48px touch target
          },
        }}
      />

      {/* Submit button */}
      <Button
        type="submit"
        variant="contained"
        fullWidth
        disabled={isSubmitting}
        sx={{
          minHeight: (theme) => theme.spacing(6), // 48px touch target
          mt: 1,
        }}
      >
        {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'התחבר'}
      </Button>
    </Box>
  )
}
