import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './theme/ThemeProvider'
import { AuthProvider } from './features/auth'
import { AppRoutes } from './routes'

/**
 * Safety First - Main Application Component
 *
 * App structure:
 * - ThemeProvider: RTL support, MUI theme, Hebrew locale
 * - AuthProvider: Authentication state and session management
 * - BrowserRouter: React Router 7 for client-side routing
 * - AppRoutes: Route configuration
 */
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
