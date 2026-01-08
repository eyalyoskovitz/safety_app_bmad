import { useState, useMemo } from 'react'
import type { FC } from 'react'
import {
  SwipeableDrawer,
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import { useUsers } from '../../users/hooks/useUsers'
import { assignIncident } from '../api'

interface AssignmentSheetProps {
  open: boolean
  onClose: () => void
  incidentId: string
  onAssigned: () => void
}

export const AssignmentSheet: FC<AssignmentSheetProps> = ({
  open,
  onClose,
  incidentId,
  onAssigned
}) => {
  const { users, isLoading, error } = useUsers('manager')
  const [isAssigning, setIsAssigning] = useState(false)
  const [assignError, setAssignError] = useState<string | null>(null)
  const [searchText, setSearchText] = useState('')

  // Filter users based on search text
  const filteredUsers = useMemo(() => {
    if (!searchText.trim()) return users

    const search = searchText.toLowerCase()
    return users.filter(user =>
      user.full_name?.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search)
    )
  }, [users, searchText])

  const handleSelectUser = async (userId: string) => {
    try {
      setIsAssigning(true)
      setAssignError(null)
      await assignIncident(incidentId, userId)
      onAssigned()
      onClose()
    } catch (err) {
      setAssignError(err instanceof Error ? err.message : 'שגיאה בשיוך האירוע')
      setIsAssigning(false)
    }
  }

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      onOpen={() => {}}
      sx={{ '& .MuiDrawer-paper': { maxHeight: '70vh', borderRadius: '16px 16px 0 0' } }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
          שיוך למנהל
        </Typography>

        {/* Search Field */}
        {!isLoading && !error && users.length > 0 && (
          <TextField
            fullWidth
            placeholder="חפש לפי שם או אימייל..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            disabled={isAssigning}
          />
        )}

        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {assignError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {assignError}
          </Alert>
        )}

        {!isLoading && !error && users.length === 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            לא נמצאו מנהלים במערכת. יש להוסיף משתמשים עם תפקיד "מנהל" דרך ניהול משתמשים.
          </Alert>
        )}

        {!isLoading && !error && users.length > 0 && filteredUsers.length === 0 && (
          <Alert severity="info" sx={{ mb: 2 }}>
            לא נמצאו תוצאות לחיפוש "{searchText}"
          </Alert>
        )}

        {!isLoading && !error && filteredUsers.length > 0 && (
          <Box sx={{ maxHeight: '50vh', overflowY: 'auto' }}>
            {filteredUsers.map(user => (
              <Card
                key={user.id}
                onClick={() => !isAssigning && handleSelectUser(user.id)}
                sx={{
                  mb: 1,
                  cursor: isAssigning ? 'not-allowed' : 'pointer',
                  opacity: isAssigning ? 0.6 : 1,
                  '&:hover': {
                    bgcolor: isAssigning ? 'inherit' : 'action.hover'
                  },
                  transition: 'background-color 0.2s'
                }}
              >
                <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {user.full_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user.email}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}

        {isAssigning && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, mt: 2 }}>
            <CircularProgress size={20} />
            <Typography variant="body2" color="text.secondary">
              משייך...
            </Typography>
          </Box>
        )}
      </Box>
    </SwipeableDrawer>
  )
}
