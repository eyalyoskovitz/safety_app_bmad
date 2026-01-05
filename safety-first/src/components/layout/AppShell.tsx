import type { ReactNode } from 'react'
import { Box } from '@mui/material'
import { PageHeader } from './PageHeader'
import { BottomNav } from './BottomNav'

interface AppShellProps {
  children: ReactNode
}

/**
 * AppShell Component
 *
 * Main application layout wrapper with:
 * - Fixed header at top (PageHeader)
 * - Scrollable content area in middle
 * - Fixed bottom navigation (BottomNav)
 *
 * Features:
 * - Mobile-first design
 * - 16px horizontal margins for content
 * - RTL-aware layout
 * - Content area scrolls independently
 * - Proper spacing to avoid header/nav overlap
 */
export const AppShell = ({ children }: AppShellProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        width: '100%',
      }}
    >
      {/* Fixed Header */}
      <PageHeader />

      {/* Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          marginTop: (theme) => theme.spacing(7), // Header height (56px = 7 * 8px)
          marginBottom: (theme) => theme.spacing(7), // Bottom nav height (56px = 7 * 8px)
          paddingInline: 2, // 16px horizontal margins (RTL-aware)
          paddingBlock: 2, // 16px vertical padding
          overflowY: 'auto',
          width: '100%',
          maxWidth: '100%',
          // Optional: max width for larger screens
          '@media (min-width: 768px)': {
            maxWidth: '1200px',
            marginInline: 'auto',
          },
        }}
      >
        {children}
      </Box>

      {/* Fixed Bottom Navigation */}
      <BottomNav />
    </Box>
  )
}
