// ** React Imports
import React from 'react'

// ** MUI Imports
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Alert, Box } from '@mui/material'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

interface EventActionConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  action: 'cancel' | 'complete'
  eventTitle: string
  eventDate: string
  isRecurring?: boolean
  isFutureEvent?: boolean
  loading?: boolean
}

const EventActionConfirmDialog: React.FC<EventActionConfirmDialogProps> = ({
  open,
  onClose,
  onConfirm,
  action,
  eventTitle,
  eventDate,
  isRecurring = false,
  isFutureEvent = false,
  loading = false
}) => {
  const actionConfig = {
    cancel: {
      title: 'Anulează Eveniment',
      icon: 'tabler:ban',
      color: 'warning' as const,
      confirmText: 'Anulează Eveniment',
      message: isRecurring
        ? 'Aceasta va anula această apariție specifică a evenimentului recurent.'
        : 'Acest eveniment va fi anulat permanent și eliminat din calendar.',
      warningText: isFutureEvent
        ? 'Această acțiune va anula o apariție a evenimentului din viitor.'
        : 'Această acțiune nu poate fi anulată.'
    },
    complete: {
      title: 'Finalizează Eveniment',
      icon: 'tabler:check-circle',
      color: 'success' as const,
      confirmText: 'Marchează ca Finalizat',
      message: 'Marchează acest eveniment ca finalizat și înregistrează prezența.',
      warningText: isFutureEvent
        ? 'Marchezi un eveniment din viitor ca finalizat.'
        : 'Aceasta va marca evenimentul ca finalizat în înregistrările tale.'
    }
  }

  const config = actionConfig[action]

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='sm'
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2
        }
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          pb: 2
        }}
      >
        <Icon icon={config.icon} fontSize='1.5rem' color={config.color === 'warning' ? 'orange' : 'green'} />
        <Typography variant='h6' component='span'>
          {config.title}
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant='subtitle1' sx={{ fontWeight: 600, mb: 1 }}>
            {eventTitle}
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            {eventDate}
          </Typography>
        </Box>

        <Typography variant='body1' sx={{ mb: 2 }}>
          {config.message}
        </Typography>

        <Alert severity={config.color === 'warning' ? 'warning' : 'info'} sx={{ mt: 2 }}>
          {config.warningText}
        </Alert>

        {isRecurring && (
          <Alert severity='info' sx={{ mt: 2 }}>
            <Typography variant='body2'>
              <strong>Notă:</strong> Această acțiune afectează doar această apariție specifică. Seria recurentă va
              continua cu alte evenimente programate.
            </Typography>
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={onClose} disabled={loading} variant='outlined' color='inherit'>
          Anulează
        </Button>
        <Button
          onClick={onConfirm}
          disabled={loading}
          variant='contained'
          color={config.color}
          startIcon={loading ? <Icon icon='tabler:loader' className='animate-spin' /> : <Icon icon={config.icon} />}
        >
          {loading ? 'Se procesează...' : config.confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default EventActionConfirmDialog
