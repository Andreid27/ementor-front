// ** MUI Imports
import Dialog from '@mui/material/Dialog'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Theme } from '@mui/material/styles'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components Imports
import AdmissionResultForm from './AdmissionResultForm'

// ** Types
import type { AdmissionResult } from './types'

interface AdmissionResultDialogProps {
  student: { studentUserId: string; studentName: string } | null
  onClose: () => void
  onSaved: (result: AdmissionResult) => void
}

/** The admission result form over the student list, for an active or a former student. */
const AdmissionResultDialog = ({ student, onClose, onSaved }: AdmissionResultDialogProps) => {
  const fullScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'))

  return (
    <Dialog
      open={Boolean(student)}
      onClose={onClose}
      maxWidth='md'
      fullWidth
      fullScreen={fullScreen}
      aria-labelledby='admission-result-title'
    >
      <DialogTitle id='admission-result-title' sx={{ pr: 14 }}>
        Rezultat admitere
        <Typography component='span' variant='body2' sx={{ display: 'block', mt: 0.5, color: 'text.secondary' }}>
          {student?.studentName}
        </Typography>
      </DialogTitle>
      <IconButton aria-label='Închide' onClick={onClose} sx={{ position: 'absolute', top: 12, right: 12 }}>
        <Icon icon='tabler:x' fontSize={20} />
      </IconButton>
      <DialogContent sx={{ pb: 6 }}>
        {/* Keyed by student, so another row never shows the previous student's answers. */}
        {student && (
          <AdmissionResultForm
            key={student.studentUserId}
            studentId={student.studentUserId}
            onCancel={onClose}
            onSaved={result => {
              onSaved(result)
              onClose()
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

export default AdmissionResultDialog
