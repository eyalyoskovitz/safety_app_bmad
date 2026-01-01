import { Typography, Box, Card, CardContent } from '@mui/material'
import { AppShell } from '../../../components/layout/AppShell'

/**
 * MyIncidentsPage - Placeholder Component
 *
 * Shows incidents assigned to current user (authenticated view)
 *
 * Current: Placeholder "Coming Soon" message
 * Future: List of assigned incidents with quick actions
 */
export const MyIncidentsPage = () => {
  return (
    <AppShell>
      <Box sx={{ py: 2 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          האירועים שלי
        </Typography>

        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              בקרוב...
            </Typography>
            <Typography variant="body1" color="text.secondary">
              עמוד זה יציג את האירועים שהוקצו לך.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              תכונות עתידיות:
            </Typography>
            <ul style={{ marginInlineStart: '20px' }}>
              <li>אירועים שהוקצו לי</li>
              <li>סימון כפתור</li>
              <li>הוספת הערות</li>
              <li>עדכון סטטוס</li>
            </ul>
          </CardContent>
        </Card>
      </Box>
    </AppShell>
  )
}
