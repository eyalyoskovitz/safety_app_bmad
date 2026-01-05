import { Box, Typography, Card, CardActionArea, CardContent } from '@mui/material'
import { Assignment as ReportIcon, Login as LoginIcon } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

/**
 * Landing Page - Main entry point for all users
 *
 * Provides two primary actions:
 * 1. Submit a Report (public access)
 * 2. Sign In (for managers)
 */
export function LandingPage() {
  const navigate = useNavigate()

  const handleReportClick = () => {
    navigate('/report')
  }

  const handleLoginClick = () => {
    navigate('/login')
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: 2,
        backgroundColor: 'background.default',
      }}
    >
      {/* Title */}
      <Typography
        variant="h3"
        component="h1"
        sx={{
          mb: 6,
          fontWeight: 700,
          textAlign: 'center',
          color: 'primary.main',
        }}
      >
        ברוכים הבאים לקודם בטיחות
      </Typography>

      {/* Action Cards Container */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          width: '100%',
          maxWidth: 400,
        }}
      >
        {/* Submit Report Card */}
        <Card
          elevation={3}
          sx={{
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'scale(1.02)',
              boxShadow: 6,
            },
          }}
        >
          <CardActionArea
            onClick={handleReportClick}
            sx={{
              minHeight: 180,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              padding: 4,
            }}
          >
            <CardContent
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <ReportIcon
                sx={{
                  fontSize: 80,
                  color: 'primary.main',
                }}
              />
              <Typography
                variant="h5"
                component="div"
                sx={{
                  fontWeight: 600,
                  textAlign: 'center',
                }}
              >
                דיווח על אירוע
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>

        {/* Sign In Card */}
        <Card
          elevation={3}
          sx={{
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'scale(1.02)',
              boxShadow: 6,
            },
          }}
        >
          <CardActionArea
            onClick={handleLoginClick}
            sx={{
              minHeight: 180,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              padding: 4,
            }}
          >
            <CardContent
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <LoginIcon
                sx={{
                  fontSize: 80,
                  color: 'primary.main',
                }}
              />
              <Typography
                variant="h5"
                component="div"
                sx={{
                  fontWeight: 600,
                  textAlign: 'center',
                }}
              >
                כניסה למערכת
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      </Box>
    </Box>
  )
}
