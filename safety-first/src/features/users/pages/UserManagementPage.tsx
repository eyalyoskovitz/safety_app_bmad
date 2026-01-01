import { Box, Typography } from '@mui/material'
import { AppShell } from '../../../components/layout/AppShell'

/**
 * User Management Page (Placeholder)
 *
 * Temporary placeholder for user management functionality.
 * Full implementation will be in Story 5.1+.
 *
 * Access: IT Admin only (enforced by RoleRoute)
 */
export const UserManagementPage = () => {
  return (
    <AppShell>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '50vh',
          paddingInline: (theme) => theme.spacing(2),
          textAlign: 'center',
        }}
      >
        <Typography
          variant="h5"
          component="h2"
          sx={{
            marginBlockEnd: (theme) => theme.spacing(2),
            fontWeight: 'bold',
          }}
        >
          ניהול משתמשים
        </Typography>

        <Typography
          variant="body1"
          sx={{
            color: (theme) => theme.palette.text.secondary,
          }}
        >
          דף זה יהיה זמין בקרוב (Story 5.1)
        </Typography>

        <Typography
          variant="caption"
          sx={{
            marginBlockStart: (theme) => theme.spacing(2),
            color: (theme) => theme.palette.text.disabled,
          }}
        >
          (גישה: מנהל IT בלבד)
        </Typography>
      </Box>
    </AppShell>
  )
}
