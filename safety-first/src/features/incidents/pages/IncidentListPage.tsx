import { Typography, Box, Card, CardContent } from '@mui/material'
import { AppShell } from '../../../components/layout/AppShell'

/**
 * IncidentListPage - Placeholder Component
 *
 * Lists all incidents (authenticated view)
 *
 * Current: Placeholder "Coming Soon" message
 * Future: Full incident list with filtering and sorting
 */
export const IncidentListPage = () => {
  return (
    <AppShell>
      <Box sx={{ py: 2 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          רשימת אירועים
        </Typography>

        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              בקרוב...
            </Typography>
            <Typography variant="body1" color="text.secondary">
              עמוד זה יציג רשימה של כל האירועים במערכת.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              תכונות עתידיות:
            </Typography>
            <ul style={{ marginInlineStart: '20px' }}>
              <li>רשימת אירועים עם פרטים</li>
              <li>סינון לפי סטטוס וחומרה</li>
              <li>מיון לפי תאריך</li>
              <li>חיפוש אירועים</li>
            </ul>
          </CardContent>
        </Card>
      </Box>
    </AppShell>
  )
}
