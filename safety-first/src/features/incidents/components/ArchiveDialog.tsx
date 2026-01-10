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

interface ArchiveDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  isSubmitting: boolean
  reason: string
  onReasonChange: (reason: string) => void
}

export const ArchiveDialog: FC<ArchiveDialogProps> = ({
  open,
  onClose,
  onConfirm,
  isSubmitting,
  reason,
  onReasonChange
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>העברה לארכיון</DialogTitle>
      <DialogContent>
        <Typography>
          האם אתה בטוח שברצונך להעביר את האירוע לארכיון?
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          אירועים בארכיון לא יוצגו ברשימה הראשית.
        </Typography>

        <TextField
          fullWidth
          multiline
          rows={3}
          label="סיבת הארכוב (לא חובה)"
          placeholder="למשל: דיווח כפול, טעות, לא רלוונטי..."
          value={reason}
          onChange={(e) => onReasonChange(e.target.value)}
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
          {isSubmitting ? 'מעביר...' : 'אשר'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
