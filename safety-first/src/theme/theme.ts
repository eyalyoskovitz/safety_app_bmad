import { createTheme } from '@mui/material/styles'

/**
 * Safety First MUI Theme Configuration
 *
 * CRITICAL REQUIREMENTS:
 * - RTL (Right-to-Left) for Hebrew
 * - 16px base font size minimum
 * - 48px minimum touch targets for factory workers
 * - Color palette matches UX specification
 */

const theme = createTheme({
  // RTL Direction for Hebrew
  direction: 'rtl',

  // Typography Configuration
  typography: {
    fontSize: 16, // Base font size (16px minimum per spec)
    htmlFontSize: 16,
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },

  // Color Palette (UX Specification)
  palette: {
    primary: {
      main: '#1976D2', // Blue - Actions, links, interactive elements
    },
    error: {
      main: '#D32F2F', // Red - Critical severity, errors
    },
    warning: {
      main: '#F57C00', // Orange - High severity, assigned status
    },
    info: {
      main: '#FBC02D', // Yellow - Medium severity
    },
    success: {
      main: '#388E3C', // Green - Low severity, success, resolved status
    },
    grey: {
      500: '#9E9E9E', // Unknown severity, neutral elements
    },
  },

  // Component Overrides - Touch Targets (48px minimum)
  components: {
    // Buttons - 48px minimum height
    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: 48,
          fontSize: 16,
        },
      },
    },

    // Icon Buttons - 48px x 48px minimum
    MuiIconButton: {
      styleOverrides: {
        root: {
          minWidth: 48,
          minHeight: 48,
        },
      },
    },

    // Fab (Floating Action Button) - Already meets 56px default
    MuiFab: {
      styleOverrides: {
        root: {
          minWidth: 56,
          minHeight: 56,
        },
      },
    },

    // Checkbox - 48px touch target
    MuiCheckbox: {
      styleOverrides: {
        root: {
          padding: 12, // 24px + 48px = adequate touch target
        },
      },
    },

    // Radio - 48px touch target
    MuiRadio: {
      styleOverrides: {
        root: {
          padding: 12,
        },
      },
    },

    // Switch - 48px touch target
    MuiSwitch: {
      styleOverrides: {
        root: {
          padding: 12,
        },
      },
    },

    // Bottom Navigation - 48px minimum
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          minHeight: 56, // Slightly larger for thumb-friendly navigation
        },
      },
    },

    // List Item Button - 48px minimum
    MuiListItemButton: {
      styleOverrides: {
        root: {
          minHeight: 48,
        },
      },
    },

    // Chip - Touch-friendly sizing
    MuiChip: {
      styleOverrides: {
        root: {
          minHeight: 32, // Chips are informational, not primary interactive
          fontSize: 14,
        },
      },
    },
  },
})

export default theme
