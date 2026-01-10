import { useState } from 'react'
import type { FC } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  CircularProgress,
  Stack,
  Divider,
  Button,
} from '@mui/material'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import ImageIcon from '@mui/icons-material/Image'
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd'
import ArchiveIcon from '@mui/icons-material/Archive'
import UnarchiveIcon from '@mui/icons-material/Unarchive'
import { format } from 'date-fns'
import { useIncident } from '../hooks/useIncident'
import { useAuth } from '../../auth/hooks/useAuth'
import { StatusChip } from '../components/StatusChip'
import { SeverityIndicator } from '../components/SeverityIndicator'
import { PhotoViewer } from '../components/PhotoViewer'
import { AssignmentSheet } from '../components/AssignmentSheet'
import { ResolutionDialog } from '../components/ResolutionDialog'
import { ArchiveDialog } from '../components/ArchiveDialog'
import { resolveIncident, reopenIncident, archiveIncident, restoreIncident } from '../api'
import { AppSnackbar } from '../../../components/feedback/AppSnackbar'
import { AppAlert } from '../../../components/feedback/AppAlert'

export const IncidentDetailPage: FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, role } = useAuth()
  const { incident, isLoading, error, refetch } = useIncident(id || '')
  const [photoViewerOpen, setPhotoViewerOpen] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [showResolveDialog, setShowResolveDialog] = useState(false)
  const [isResolving, setIsResolving] = useState(false)
  const [resolutionNotes, setResolutionNotes] = useState('')
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)
  const [isArchiving, setIsArchiving] = useState(false)
  const [archiveReason, setArchiveReason] = useState('')
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  })

  const handleAssignmentComplete = () => {
    refetch()
    setSnackbar({
      open: true,
      message: 'האירוע שויך בהצלחה',
      severity: 'success'
    })
  }

  const handleResolve = async () => {
    if (!incident) return

    setIsResolving(true)
    try {
      await resolveIncident(incident.id, resolutionNotes)
      setShowResolveDialog(false)
      setResolutionNotes('')
      setSnackbar({
        open: true,
        message: 'האירוע נסגר בהצלחה',
        severity: 'success'
      })
      // Refresh incident data
      refetch()
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'שגיאה בסגירת האירוע. נסה שוב',
        severity: 'error'
      })
    } finally {
      setIsResolving(false)
    }
  }

  const handleReopen = async () => {
    if (!incident) return

    try {
      await reopenIncident(incident.id)
      setSnackbar({
        open: true,
        message: 'האירוע נפתח מחדש',
        severity: 'success'
      })
      // Refresh incident data
      refetch()
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'שגיאה בפתיחת האירוע מחדש. נסה שוב',
        severity: 'error'
      })
    }
  }

  const handleArchive = async () => {
    if (!incident) return

    setIsArchiving(true)
    try {
      await archiveIncident(incident.id, archiveReason)
      setShowArchiveDialog(false)
      setArchiveReason('')
      setSnackbar({
        open: true,
        message: 'האירוע הועבר לארכיון',
        severity: 'success'
      })
      // Navigate back to incident list
      navigate('/manage/incidents')
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'שגיאה בהעברה לארכיון. נסה שוב',
        severity: 'error'
      })
    } finally {
      setIsArchiving(false)
    }
  }

  const handleRestore = async () => {
    if (!incident) return

    try {
      await restoreIncident(incident.id)
      setSnackbar({
        open: true,
        message: 'האירוע שוחזר בהצלחה',
        severity: 'success'
      })
      // Refresh incident data
      refetch()
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'שגיאה בשחזור האירוע. נסה שוב',
        severity: 'error'
      })
    }
  }

  const showAssignButton = incident && (incident.status === 'new' || incident.status === 'assigned')

  // Show resolve button only to the assigned user when status is 'assigned'
  const canResolve = incident && incident.status === 'assigned' && incident.assigned_to === user?.id

  // Show reopen button to all users when status is 'resolved'
  const canReopen = incident && incident.status === 'resolved'

  // Show archive button only to IT Admin when incident is not already archived
  const isAdmin = role === 'it_admin'
  const canArchive = incident && incident.status !== 'archived' && isAdmin

  // Show restore button only to IT Admin when incident is archived
  const canRestore = incident && incident.status === 'archived' && isAdmin

  // Smart back navigation - go to previous page or default to incidents list
  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/manage/incidents')
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  // Error state
  if (error || !incident) {
    return (
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton onClick={handleBack} sx={{ marginInlineEnd: 1 }}>
            <ArrowForwardIcon />
          </IconButton>
          <Typography variant="h6">פרטי דיווח</Typography>
        </Box>
        <AppAlert severity="error">{error || 'הדיווח לא נמצא'}</AppAlert>
      </Box>
    )
  }

  const reporterDisplay = incident.reporter_name || 'אנונימי'
  const incidentDate = format(new Date(incident.incident_date), 'dd/MM/yyyy HH:mm')
  const createdDate = format(new Date(incident.created_at), 'dd/MM/yyyy HH:mm')

  // Extract location name from joined data
  const locationName = (incident as any).plant_locations?.name_he || 'לא צוין'

  // Extract assigned user name from joined data
  const assignedUserName = (incident as any).assigned_user?.full_name || incident.assigned_to

  // Extract assigner name (who assigned the incident)
  const assignerName = (incident as any).assigner?.full_name || 'לא ידוע'

  // Extract archiver name (who archived the incident)
  const archiverName = (incident as any).archiver?.full_name || 'לא ידוע'

  return (
    <Box sx={{ pb: 8 }}>
      {/* Header with back button */}
      <Box sx={{ display: 'flex', alignItems: 'center', p: 2, bgcolor: 'background.paper' }}>
        <IconButton onClick={handleBack} sx={{ marginInlineEnd: 1 }}>
          <ArrowForwardIcon />
        </IconButton>
        <Typography variant="h6">פרטי דיווח</Typography>
      </Box>

      {/* Photo Section */}
      {incident.photo_url ? (
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: 300,
            bgcolor: 'grey.100',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={() => setPhotoViewerOpen(true)}
        >
          <img
            src={incident.photo_url}
            alt="תמונת דיווח"
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              display: 'block',
            }}
          />
        </Box>
      ) : (
        <Box
          sx={{
            height: 200,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'grey.200',
            gap: 1,
          }}
        >
          <ImageIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
          <Typography variant="h6" color="text.secondary">
            אין תמונה
          </Typography>
        </Box>
      )}

      {/* Incident Details Card */}
      <Card sx={{ m: 2, maxWidth: { md: '1200px' }, mx: { md: 'auto' } }}>
        <CardContent>
          <Stack spacing={2}>
            {/* Status, Severity, and Action Buttons */}
            <Box sx={{
              display: { xs: 'flex', md: 'grid' },
              gridTemplateColumns: { md: '1fr 1fr 1fr' },
              flexWrap: { xs: 'wrap' },
              gap: 2,
              alignItems: 'center'
            }}>
              <Box>
                <StatusChip status={incident.status} />
              </Box>
              <Box>
                <SeverityIndicator severity={incident.severity} />
              </Box>
              <Box sx={{
                display: 'flex',
                gap: 1,
                marginInlineStart: { xs: 'auto', md: 0 },
                justifyContent: { xs: 'flex-start', md: 'flex-start' }
              }}>
                {showAssignButton && (
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<AssignmentIndIcon />}
                    onClick={() => setSheetOpen(true)}
                    sx={{
                      fontSize: '0.8rem',
                      py: 0.5,
                      px: 1.5,
                      '& .MuiButton-startIcon': {
                        marginInlineEnd: { xs: 0.5, sm: 1 }
                      }
                    }}
                  >
                    שיוך
                  </Button>
                )}
                {canResolve && (
                  <Button
                    size="small"
                    variant="contained"
                    color="success"
                    onClick={() => {
                      setResolutionNotes(incident.resolution_notes || '')
                      setShowResolveDialog(true)
                    }}
                    sx={{
                      fontSize: '0.8rem',
                      py: 0.5,
                      px: 1.5
                    }}
                  >
                    סיום טיפול
                  </Button>
                )}
                {canReopen && (
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={handleReopen}
                    sx={{
                      fontSize: '0.8rem',
                      py: 0.5,
                      px: 1.5
                    }}
                  >
                    פתח מחדש
                  </Button>
                )}
                {canArchive && (
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<ArchiveIcon />}
                    onClick={() => setShowArchiveDialog(true)}
                    sx={{
                      fontSize: '0.8rem',
                      py: 0.5,
                      px: 1.5,
                      '& .MuiButton-startIcon': {
                        marginInlineEnd: { xs: 0.5, sm: 1 }
                      }
                    }}
                  >
                    ארכיון
                  </Button>
                )}
                {canRestore && (
                  <Button
                    size="small"
                    variant="outlined"
                    color="primary"
                    startIcon={<UnarchiveIcon />}
                    onClick={handleRestore}
                    sx={{
                      fontSize: '0.8rem',
                      py: 0.5,
                      px: 1.5,
                      '& .MuiButton-startIcon': {
                        marginInlineEnd: { xs: 0.5, sm: 1 }
                      }
                    }}
                  >
                    שחזור
                  </Button>
                )}
              </Box>
            </Box>

            <Divider />

            {/* Basic Info - Responsive Grid */}
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
              gap: 2
            }}>
              {/* Date/Time */}
              <Box>
                <Typography variant="caption" color="text.secondary">
                  תאריך ושעה
                </Typography>
                <Typography variant="body1">{incidentDate}</Typography>
              </Box>

              {/* Location */}
              <Box>
                <Typography variant="caption" color="text.secondary">
                  מיקום
                </Typography>
                <Typography variant="body1">{locationName}</Typography>
              </Box>

              {/* Reporter */}
              <Box>
                <Typography variant="caption" color="text.secondary">
                  מדווח
                </Typography>
                <Typography variant="body1">{reporterDisplay}</Typography>
              </Box>

              {/* Created timestamp */}
              <Box>
                <Typography variant="caption" color="text.secondary">
                  נוצר ב
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {createdDate}
                </Typography>
              </Box>

              {/* Description - Under Location */}
              <Box>
                <Typography variant="caption" color="text.secondary">
                  תיאור
                </Typography>
                <Typography variant="body1">{incident.description || 'אין תיאור'}</Typography>
              </Box>
            </Box>

            {/* Assignment Info (if assigned) */}
            {incident.assigned_to && (
              <>
                <Divider />
                <Typography variant="subtitle2" color="primary">
                  שיוך
                </Typography>
                <Box sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
                  gap: 2,
                  alignItems: 'start'
                }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      משויך ל
                    </Typography>
                    <Typography variant="body1">{assignedUserName}</Typography>
                  </Box>
                  {incident.assigned_at && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        תאריך שיוך
                      </Typography>
                      <Typography variant="body1">
                        {format(new Date(incident.assigned_at), 'dd/MM/yyyy HH:mm')}
                      </Typography>
                    </Box>
                  )}
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      שויך על ידי
                    </Typography>
                    <Typography variant="body1">{assignerName}</Typography>
                  </Box>
                </Box>
              </>
            )}

            {/* Resolution Info (if resolved or reopened - show history) */}
            {incident.resolved_at && (
              <>
                <Divider />
                <Typography variant="subtitle2" color="success.main">
                  פתרון
                </Typography>
                <Box sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
                  gap: 2
                }}>
                  {incident.resolved_at && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        תאריך פתרון
                      </Typography>
                      <Typography variant="body1">
                        {format(new Date(incident.resolved_at), 'dd/MM/yyyy HH:mm')}
                      </Typography>
                    </Box>
                  )}
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      מה נעשה
                    </Typography>
                    <Typography variant="body1">
                      {incident.resolution_notes || 'אין מידע'}
                    </Typography>
                  </Box>
                </Box>
              </>
            )}

            {/* Archive Info (if archived) */}
            {incident.status === 'archived' && incident.archived_at && (
              <>
                <Divider />
                <Typography variant="subtitle2" color="text.secondary">
                  ארכיון
                </Typography>
                <Box sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
                  gap: 2
                }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      תאריך ארכוב
                    </Typography>
                    <Typography variant="body1">
                      {format(new Date(incident.archived_at), 'dd/MM/yyyy HH:mm')}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      ארכוב על ידי
                    </Typography>
                    <Typography variant="body1">{archiverName}</Typography>
                  </Box>
                  {incident.archive_reason && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        סיבת ארכוב
                      </Typography>
                      <Typography variant="body1">{incident.archive_reason}</Typography>
                    </Box>
                  )}
                </Box>
              </>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* Assignment Sheet */}
      {incident && (
        <AssignmentSheet
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          incidentId={incident.id}
          onAssigned={handleAssignmentComplete}
        />
      )}

      {/* Photo Viewer Modal */}
      <PhotoViewer
        open={photoViewerOpen}
        photoUrl={incident.photo_url}
        onClose={() => setPhotoViewerOpen(false)}
      />

      {/* Resolution Dialog */}
      <ResolutionDialog
        open={showResolveDialog}
        onClose={() => setShowResolveDialog(false)}
        onConfirm={handleResolve}
        isSubmitting={isResolving}
        notes={resolutionNotes}
        onNotesChange={setResolutionNotes}
      />

      {/* Archive Dialog */}
      <ArchiveDialog
        open={showArchiveDialog}
        onClose={() => setShowArchiveDialog(false)}
        onConfirm={handleArchive}
        isSubmitting={isArchiving}
        reason={archiveReason}
        onReasonChange={setArchiveReason}
      />

      {/* Success/Error Snackbar */}
      <AppSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />
    </Box>
  )
}
