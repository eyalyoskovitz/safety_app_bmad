import type { FC } from 'react'
import { useState, useEffect } from 'react'
import {
  Container,
  Stack,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  ToggleButtonGroup,
  ToggleButton,
  CircularProgress,
  Snackbar,
  Alert,
  IconButton,
  Box,
  type SelectChangeEvent
} from '@mui/material'
import {
  HelpOutline,
  Warning,
  ErrorOutline,
  Error as ErrorIcon,
  Cancel,
  Home as HomeIcon
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { getActiveLocations, submitIncident } from '../api'
import type { PlantLocation, Severity, IncidentFormData } from '../types'
import { PhotoCapture } from '../components/PhotoCapture'
import { usePhotoUpload } from '../hooks/usePhotoUpload'

// Severity options with Hebrew labels, colors, and icons
const SEVERITY_OPTIONS = [
  { value: 'unknown' as Severity, label: 'לא ידוע', color: '#9E9E9E', icon: HelpOutline },
  { value: 'near-miss' as Severity, label: 'כמעט', color: '#2196F3', icon: Warning },
  { value: 'minor' as Severity, label: 'קל', color: '#FBC02D', icon: ErrorOutline },
  { value: 'major' as Severity, label: 'בינוני', color: '#F57C00', icon: ErrorIcon },
  { value: 'critical' as Severity, label: 'חמור', color: '#D32F2F', icon: Cancel },
] as const

export const ReportPage: FC = () => {
  const navigate = useNavigate()
  const [locations, setLocations] = useState<PlantLocation[]>([])
  const [selectedLocation, setSelectedLocation] = useState<string>('')
  const [isLoadingLocations, setIsLoadingLocations] = useState(true)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [severity, setSeverity] = useState<Severity>('unknown')
  const [incidentDate, setIncidentDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0] // YYYY-MM-DD
  })
  const [incidentTime, setIncidentTime] = useState<string>(() => {
    return new Date().toTimeString().slice(0, 5) // HH:MM
  })
  const [description, setDescription] = useState<string>('')
  const [reporterName, setReporterName] = useState<string>('')

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessSnackbar, setShowSuccessSnackbar] = useState(false)
  const [showErrorSnackbar, setShowErrorSnackbar] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>('')

  // Photo state
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null)
  const { isUploading, uploadError, photoUrl, uploadPhoto, resetUpload } = usePhotoUpload()

  const MAX_DESCRIPTION_LENGTH = 500

  // Clear photo preview if upload fails
  useEffect(() => {
    if (uploadError) {
      setPhotoFile(null)
      setPhotoPreviewUrl(null)
    }
  }, [uploadError])

  useEffect(() => {
    async function fetchLocations() {
      try {
        setIsLoadingLocations(true)
        setLocationError(null)
        const data = await getActiveLocations()
        setLocations(data)
      } catch (err) {
        setLocationError('לא ניתן לטעון מיקומים')
        console.error('Failed to fetch locations:', err)
      } finally {
        setIsLoadingLocations(false)
      }
    }
    fetchLocations()
  }, [])

  const handleLocationChange = (event: SelectChangeEvent<string>) => {
    setSelectedLocation(event.target.value)
  }

  const handleSeverityChange = (
    _event: React.MouseEvent<HTMLElement>,
    newValue: Severity | null
  ) => {
    setSeverity(newValue || 'unknown') // Fallback to unknown if null
  }

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIncidentDate(event.target.value)
  }

  const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIncidentTime(event.target.value)
  }

  const handleDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(event.target.value)
  }

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setReporterName(event.target.value)
  }

  const handlePhotoCapture = (file: File) => {
    setPhotoFile(file)

    // Create preview URL using FileReader
    const reader = new FileReader()
    reader.onload = (e) => {
      setPhotoPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Upload to Supabase (async/non-blocking)
    uploadPhoto(file)
  }

  const handlePhotoRemove = () => {
    setPhotoFile(null)
    setPhotoPreviewUrl(null)
    resetUpload()
  }

  const isFormValid = (): boolean => {
    return selectedLocation !== ''
  }

  const handleSubmit = async () => {
    if (!isFormValid()) {
      setErrorMessage('נא לבחור מיקום')
      setShowErrorSnackbar(true)
      return
    }

    try {
      setIsSubmitting(true)
      setErrorMessage('')
      setShowErrorSnackbar(false)

      const formData: IncidentFormData = {
        reporter_name: reporterName.trim() || null,
        severity,
        location_id: selectedLocation || null,
        incident_date: `${incidentDate}T${incidentTime}:00`,
        description: description.trim() || null,
        photo_url: photoUrl
      }

      await submitIncident(formData)

      setShowSuccessSnackbar(true)
      resetForm()
    } catch (err) {
      console.error('Submit error:', err)
      setErrorMessage(err instanceof Error ? err.message : 'שגיאה בשמירת הדיווח')
      setShowErrorSnackbar(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setSelectedLocation('')
    setSeverity('unknown')
    setIncidentDate(new Date().toISOString().split('T')[0])
    setIncidentTime(new Date().toTimeString().slice(0, 5))
    setDescription('')
    setReporterName('')
    handlePhotoRemove()
  }

  return (
    <>
      <Container
        maxWidth="sm"
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 3,
        }}
      >
      <Stack spacing={3} sx={{ width: '100%' }}>
        {/* Home Button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <IconButton
            onClick={() => navigate('/')}
            aria-label="חזרה לדף הבית"
            size="large"
          >
            <HomeIcon />
          </IconButton>
        </Box>

        <Typography variant="h4" component="h1">
          דיווח אירוע בטיחות
        </Typography>

        <FormControl fullWidth error={!!locationError}>
          <InputLabel id="location-label" shrink>מיקום</InputLabel>
          <Select
            labelId="location-label"
            label="מיקום"
            value={selectedLocation}
            onChange={handleLocationChange}
            disabled={isLoadingLocations || !!locationError}
            displayEmpty
            renderValue={(selected) => {
              if (!selected) {
                return <span style={{ paddingRight: '10px' }}>בחר מיקום</span>
              }
              const location = locations.find(loc => loc.id === selected)
              return location?.name_he || ''
            }}
          >
            {locations.map((location) => (
              <MenuItem key={location.id} value={location.id}>
                {location.name_he}
              </MenuItem>
            ))}
          </Select>
          {isLoadingLocations && (
            <FormHelperText>טוען מיקומים...</FormHelperText>
          )}
          {locationError && (
            <FormHelperText error>
              {locationError}
              <Button size="small" onClick={() => window.location.reload()}>
                נסה שוב
              </Button>
            </FormHelperText>
          )}
        </FormControl>

        <ToggleButtonGroup
          value={severity}
          exclusive
          onChange={handleSeverityChange}
          fullWidth
          sx={{
            display: 'flex',
            gap: 1,
          }}
        >
          {SEVERITY_OPTIONS.map((option) => {
            const Icon = option.icon
            return (
              <ToggleButton
                key={option.value}
                value={option.value}
                sx={{
                  flex: 1,
                  flexDirection: 'column',
                  gap: 0.3,
                  border: 'none',
                  bgcolor: 'transparent',
                  color: option.color,
                  padding: 1,
                  '&.Mui-selected': {
                    bgcolor: 'transparent',
                    color: option.color,
                    borderBottom: `3px solid ${option.color}`,
                  },
                  '&:hover': {
                    bgcolor: 'transparent',
                    opacity: 0.7,
                  },
                }}
              >
                <Icon sx={{ fontSize: 28 }} />
                <Typography variant="caption" sx={{ fontSize: 11, whiteSpace: 'nowrap' }}>
                  {option.label}
                </Typography>
              </ToggleButton>
            )
          })}
        </ToggleButtonGroup>

        <TextField
          label="תאריך"
          type="date"
          value={incidentDate}
          onChange={handleDateChange}
          fullWidth
          InputLabelProps={{ shrink: true }}
          inputProps={{
            max: new Date().toISOString().split('T')[0]
          }}
        />

        <TextField
          label="שעה"
          type="time"
          value={incidentTime}
          onChange={handleTimeChange}
          fullWidth
          InputLabelProps={{ shrink: true }}
          inputProps={{
            step: 300
          }}
        />

        <TextField
          label="שם"
          placeholder="הכנס שם (לא חובה)"
          value={reporterName}
          onChange={handleNameChange}
          fullWidth
          InputLabelProps={{ shrink: true }}
        />

        <TextField
          label="תיאור"
          placeholder="הכנס תיאור (לא חובה)"
          value={description}
          onChange={handleDescriptionChange}
          multiline
          rows={4}
          fullWidth
          InputLabelProps={{ shrink: true }}
          inputProps={{
            maxLength: MAX_DESCRIPTION_LENGTH
          }}
          helperText={`${description.length}/${MAX_DESCRIPTION_LENGTH} תווים`}
        />

        <PhotoCapture
          photo={photoFile}
          previewUrl={photoPreviewUrl}
          isUploading={isUploading}
          uploadError={uploadError}
          onPhotoCapture={handlePhotoCapture}
          onPhotoRemove={handlePhotoRemove}
        />

        <Button
          variant="contained"
          size="large"
          fullWidth
          disabled={isSubmitting || isLoadingLocations}
          onClick={handleSubmit}
          startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : undefined}
        >
          {isSubmitting ? 'שולח...' : 'שלח דיווח'}
        </Button>
      </Stack>
    </Container>

    <Snackbar
      open={showSuccessSnackbar}
      autoHideDuration={5000}
      onClose={() => setShowSuccessSnackbar(false)}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      sx={{ top: 24 }}
    >
      <Alert
        onClose={() => setShowSuccessSnackbar(false)}
        severity="success"
        variant="filled"
        sx={{ width: '100%' }}
      >
        הדיווח נשלח בהצלחה
      </Alert>
    </Snackbar>

    <Snackbar
      open={showErrorSnackbar}
      onClose={() => setShowErrorSnackbar(false)}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      sx={{ top: 24 }}
    >
      <Alert
        onClose={() => setShowErrorSnackbar(false)}
        severity="error"
        variant="filled"
        sx={{ width: '100%' }}
      >
        {errorMessage}
      </Alert>
    </Snackbar>
    </>
  )
}
