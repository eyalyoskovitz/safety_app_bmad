import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles'
import { CssBaseline } from '@mui/material'
import { CacheProvider } from '@emotion/react'
import createCache from '@emotion/cache'
import theme from './theme'

/**
 * RTL Cache for Emotion
 *
 * MUI 7 has improved RTL support. Starting with basic cache configuration.
 * If visual issues appear, we may need to add stylis-plugin-rtl.
 */
const cacheRtl = createCache({
  key: 'muirtl',
  prepend: true,
})

interface ThemeProviderProps {
  children: ReactNode
}

/**
 * Theme Provider Component
 *
 * Wraps the application with:
 * 1. Emotion RTL cache for proper CSS direction
 * 2. MUI theme with RTL configuration
 * 3. Sets document direction to RTL
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  // Set document direction to RTL on mount
  useEffect(() => {
    document.documentElement.dir = 'rtl'
    document.documentElement.lang = 'he' // Hebrew language code
  }, [])

  return (
    <CacheProvider value={cacheRtl}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </CacheProvider>
  )
}
