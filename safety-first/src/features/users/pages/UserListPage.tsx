import { useState } from 'react'
import { Container, Typography, Box, CircularProgress, Alert, IconButton, Button } from '@mui/material'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import AddIcon from '@mui/icons-material/Add'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/hooks/useAuth'
import { useUsers } from '../hooks/useUsers'
import { UserCard } from '../components/UserCard'
import { UserForm } from '../components/UserForm'
import { UserEditDialog } from '../components/UserEditDialog'
import type { User } from '../types'

/**
 * User Management page (IT Admin only)
 * Displays list of all users with their roles
 */
export function UserListPage() {
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()
  const { users, isLoading, error, refetch } = useUsers()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const handleBack = () => {
    navigate('/manage/incidents')
  }

  const handleAddUserSuccess = () => {
    refetch() // Refresh user list
    setIsFormOpen(false) // Close dialog
  }

  const handleEditUserSuccess = () => {
    refetch() // Refresh user list
    setSelectedUser(null) // Close dialog
  }

  return (
    <Container maxWidth="lg" sx={{ paddingBlockStart: 3, paddingBlockEnd: 3 }}>
      {/* Page Header with Back Button and Add User Button */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, marginBlockEnd: 3 }}>
        <IconButton
          onClick={handleBack}
          aria-label="חזור לרשימת אירועים"
          sx={{
            minWidth: 48,
            minHeight: 48,
          }}
        >
          <ArrowForwardIcon />
        </IconButton>
        <Typography
          variant="h4"
          component="h1"
          sx={{ flexGrow: 1 }}
        >
          ניהול משתמשים
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsFormOpen(true)}
          sx={{ gap: 1 }}
        >
          הוסף משתמש
        </Button>
      </Box>

      {/* Loading State */}
      {isLoading && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '50vh',
          }}
        >
          <CircularProgress />
        </Box>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <Alert severity="error" sx={{ marginBlockEnd: 2 }}>
          {error}
        </Alert>
      )}

      {/* Empty State */}
      {!isLoading && !error && users.length === 0 && (
        <Alert severity="info">
          לא נמצאו משתמשים במערכת
        </Alert>
      )}

      {/* Users List */}
      {!isLoading && !error && users.length > 0 && (
        <Box>
          {users.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              onClick={setSelectedUser}
            />
          ))}
        </Box>
      )}

      {/* Add User Dialog */}
      <UserForm
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={handleAddUserSuccess}
      />

      {/* Edit User Dialog */}
      <UserEditDialog
        user={selectedUser}
        open={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        onSuccess={handleEditUserSuccess}
        currentUserId={currentUser?.id || ''}
      />
    </Container>
  )
}
