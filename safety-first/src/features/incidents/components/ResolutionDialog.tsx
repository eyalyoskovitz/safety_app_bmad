import type { FC } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  TextField
} from '@mui/material'

interface ResolutionDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  isSubmitting: boolean
  notes: string
  onNotesChange: (notes: string) => void
}

export const ResolutionDialog: FC<ResolutionDialogProps> = ({
  open,
  onClose,
  onConfirm,
  isSubmitting,
  notes,
  onNotesChange
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>סיום טיפול באירוע</DialogTitle>
      <DialogContent>
        <Typography>
          האם אתה בטוח שברצונך לסגור את האירוע?
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          לאחר הסגירה, האירוע יסומן כטופל.
        </Typography>

        <TextField
          fullWidth
          multiline
          rows={3}
          label="מה נעשה (לא חובה)"
          placeholder="תיאור הפעולות שבוצעו"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          sx={{
            mt: 2,
            '& .MuiInputLabel-root': {
              right: '22px !important',
              left: 'auto !important'
            },
            '& .MuiInputLabel-shrink': {
              right: '26px !important'
            }
          }}
          inputProps={{ dir: 'rtl' }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          ביטול
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          disabled={isSubmitting}
          autoFocus
        >
          {isSubmitting ? 'שומר...' : 'סגור אירוע'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
