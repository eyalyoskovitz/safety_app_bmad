import { Box, Typography } from '@mui/material'
import { Inbox as InboxIcon } from '@mui/icons-material'
import type { FC } from 'react'

interface EmptyStateProps {
  variant?: 'no-incidents' | 'no-results' | 'no-archived'
}

const MESSAGES = {
  'no-incidents': 'אין דיווחים במערכת',
  'no-results': 'אין דיווחים בסטטוס זה',
  'no-archived': 'אין אירועים בארכיון',
}

/**
 * Empty state component displayed when no incidents exist
 * Shows icon and friendly Hebrew message
 * @param variant - 'no-incidents' (default) or 'no-results' (when filter yields nothing)
 */
export const EmptyState: FC<EmptyStateProps> = ({ variant = 'no-incidents' }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
        gap: 2,
        color: 'text.secondary',
      }}
    >
      <InboxIcon sx={{ fontSize: 64, opacity: 0.5 }} />
      <Typography variant="h6" color="text.secondary">
        {MESSAGES[variant]}
      </Typography>
    </Box>
  )
}
