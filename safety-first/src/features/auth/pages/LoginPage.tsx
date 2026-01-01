import { Box, Card, CardContent, Typography } from '@mui/material'
import { LoginForm } from '../components/LoginForm'

/**
 * LoginPage Component
 *
 * Full-page login screen with centered card layout.
 *
 * Features:
 * - Centered card with login form
 * - Hebrew title "התחברות"
 * - Mobile-first responsive layout
 * - No app shell (standalone page before authentication)
 *
 * Used for: Initial login before accessing protected routes
 */
export const LoginPage = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingInline: 2, // 16px horizontal margins (RTL-aware)
        paddingBlock: 2, // 16px vertical padding
        backgroundColor: (theme) => theme.palette.grey[50],
      }}
    >
      <Card
        sx={{
          maxWidth: '400px',
          width: '100%',
        }}
      >
        <CardContent
          sx={{
            paddingInline: 3, // 24px horizontal padding (RTL-aware)
            paddingBlock: 3, // 24px vertical padding
          }}
        >
          {/* Title */}
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 600,
              textAlign: 'center',
              mb: 3,
            }}
          >
            התחברות
          </Typography>

          {/* Login Form */}
          <LoginForm />
        </CardContent>
      </Card>
    </Box>
  )
}
