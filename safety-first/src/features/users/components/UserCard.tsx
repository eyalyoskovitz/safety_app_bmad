import { Card, CardContent, Typography, Chip, Box } from '@mui/material'
import type { User } from '../types'
import { getRoleLabel } from '../utils'

interface UserCardProps {
  user: User
  onClick?: (user: User) => void
}

/**
 * Displays a user card with name, email, and role chip
 * Used in UserListPage to show individual users
 * Clickable when onClick handler is provided
 */
export function UserCard({ user, onClick }: UserCardProps) {
  // Get role display text and color
  const getRoleInfo = (role: string) => {
    const label = getRoleLabel(role)
    const color = role === 'it_admin' ? '#1976d2' : '#757575' // Blue for IT Admin, Gray for Manager
    return { label, color }
  }

  const roleInfo = getRoleInfo(user.role)

  return (
    <Card
      onClick={() => onClick?.(user)}
      sx={{
        marginBlockEnd: 2,
        minHeight: 48,
        width: '100%',
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': {
          boxShadow: 3,
        },
      }}
    >
      <CardContent sx={{ width: '100%', p: 1.5 }}>
        <Box sx={{ width: '100%' }}>
          {/* Mobile view: Vertical layout */}
          <Box sx={{ display: { xs: 'flex', lg: 'none' }, flexDirection: 'column', gap: 0.5 }}>
            {/* User Name */}
            <Typography variant="body1" component="h2" fontWeight={600}>
              {user.full_name || user.email}
            </Typography>

            {/* Email */}
            <Typography variant="body2" color="text.secondary">
              {user.email}
            </Typography>

            {/* Role Chip */}
            <Box>
              <Chip
                label={roleInfo.label}
                size="small"
                sx={{
                  backgroundColor: roleInfo.color,
                  color: 'white',
                  fontWeight: 500,
                }}
              />
            </Box>
          </Box>

          {/* Desktop view: Grid layout - one line with fixed spacing */}
          <Box
            sx={{
              display: { xs: 'none', lg: 'grid' },
              gridTemplateColumns: '2fr 2fr 1fr',
              gap: 2,
              alignItems: 'center',
            }}
          >
            {/* Column 1: Name */}
            <Typography
              variant="body1"
              component="h2"
              fontWeight={600}
              sx={{
                gridColumn: '1',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user.full_name || user.email}
            </Typography>

            {/* Column 2: Email */}
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                gridColumn: '2',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user.email}
            </Typography>

            {/* Column 3: Role Chip */}
            <Box sx={{ gridColumn: '3', justifySelf: 'start' }}>
              <Chip
                label={roleInfo.label}
                size="small"
                sx={{
                  backgroundColor: roleInfo.color,
                  color: 'white',
                  fontWeight: 500,
                }}
              />
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}
