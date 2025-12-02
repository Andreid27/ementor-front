import { useState } from 'react'
import Box from '@mui/material/Box'
import { Button } from '@mui/material'
import Typography from '@mui/material/Typography'
import {
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Backdrop,
  Alert,
  AlertTitle,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material'
import Icon from 'src/@core/components/icon'
import { BankTransferPaymentDTO } from 'src/generated/profile-service'
import { profileServiceClient } from 'src/services'

interface PaymentRejectionDialogProps {
  open: boolean
  payment: BankTransferPaymentDTO | null
  onClose: () => void
  onSuccess: () => void
  getUserName: (userId: string | undefined) => string
  formatCurrency: (amount: number | undefined, currency: string | undefined) => string
}

const PaymentRejectionDialog: React.FC<PaymentRejectionDialogProps> = ({
  open,
  payment,
  onClose,
  onSuccess,
  getUserName,
  formatCurrency
}) => {
  const [rejectingPayment, setRejectingPayment] = useState<boolean>(false)
  const [processingStep, setProcessingStep] = useState<string>('')
  const [successDialogOpen, setSuccessDialogOpen] = useState<boolean>(false)
  const [errorDialogOpen, setErrorDialogOpen] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [errorDetails, setErrorDetails] = useState<string>('')
  const [rejectedPaymentDetails, setRejectedPaymentDetails] = useState<BankTransferPaymentDTO | null>(null)

  const handleRejectPaymentSubmit = async () => {
    if (!payment?.id) return

    setRejectingPayment(true)
    setProcessingStep('Verificare plată...')

    try {
      // Step 1: Validate payment
      setProcessingStep('Se validează plata...')
      await new Promise(resolve => setTimeout(resolve, 500)) // Brief pause for user to see the step

      // Step 2: Reject payment
      setProcessingStep('Se respinge plata...')
      await profileServiceClient.payment.rejectPayment({
        paymentConfirmationRequest: {
          paymentId: payment.id,
          generateInvoice: false
        }
      })

      // Step 3: Success
      setProcessingStep('Finalizare...')
      setRejectedPaymentDetails(payment)
      onClose()

      // Show success dialog
      setTimeout(() => {
        setSuccessDialogOpen(true)
        setRejectingPayment(false)
        setProcessingStep('')
      }, 300)

      // Notify parent component
      onSuccess()
    } catch (error: any) {
      console.error('Failed to reject payment:', error)

      // Extract error details
      const errorMsg = error?.response?.data?.message || error?.message || 'A apărut o eroare necunoscută'
      const errorDetail = error?.response?.data?.detail || error?.response?.statusText || ''

      setErrorMessage(errorMsg)
      setErrorDetails(errorDetail)
      onClose()

      // Show error dialog
      setTimeout(() => {
        setErrorDialogOpen(true)
        setRejectingPayment(false)
        setProcessingStep('')
      }, 300)
    }
  }

  const handleRetry = () => {
    setErrorDialogOpen(false)
    // Reopen the rejection dialog to retry
    if (payment) {
      setTimeout(() => {
        // The parent component should handle reopening the dialog
        handleRejectPaymentSubmit()
      }, 300)
    }
  }

  return (
    <>
      {/* Backdrop with loading progress */}
      <Backdrop
        open={rejectingPayment}
        sx={{
          color: '#fff',
          zIndex: theme => theme.zIndex.drawer + 2,
          flexDirection: 'column',
          gap: 3
        }}
      >
        <CircularProgress size={60} thickness={4} sx={{ color: 'error.main' }} />
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant='h5' sx={{ mb: 1, fontWeight: 600 }}>
            Se procesează respingerea
          </Typography>
          <Typography variant='body1' sx={{ mb: 2, opacity: 0.9 }}>
            {processingStep || 'Vă rugăm așteptați...'}
          </Typography>
          <Alert severity='warning' sx={{ mt: 2, backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
            <AlertTitle>Operațiune critică</AlertTitle>
            Nu închideți această fereastră până la finalizare
          </Alert>
        </Box>
      </Backdrop>

      {/* Success Dialog */}
      <Dialog
        open={successDialogOpen}
        onClose={() => setSuccessDialogOpen(false)}
        maxWidth='sm'
        fullWidth
        PaperProps={{
          sx: {
            borderTop: '4px solid',
            borderColor: 'error.main'
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2, pb: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              backgroundColor: 'error.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Icon icon='tabler:x' fontSize='2rem' style={{ color: 'white' }} />
          </Box>
          <Box>
            <Typography variant='h5' sx={{ fontWeight: 600, color: 'error.main' }}>
              Plată respinsă cu succes
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              {new Date().toLocaleString('ro-RO', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Typography>
          </Box>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ pt: 3 }}>
          <Alert severity='info' sx={{ mb: 3 }}>
            <AlertTitle>Respingere finalizată</AlertTitle>
            Plata a fost respinsă cu succes și toate datele au fost actualizate.
          </Alert>

          {rejectedPaymentDetails && (
            <Box sx={{ mb: 3 }}>
              <Typography variant='subtitle2' sx={{ mb: 2, fontWeight: 600 }}>
                Detalii plată:
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <Icon icon='tabler:coin' />
                  </ListItemIcon>
                  <ListItemText
                    primary='Sumă'
                    secondary={formatCurrency(rejectedPaymentDetails.amount, rejectedPaymentDetails.currency)}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Icon icon='tabler:user' />
                  </ListItemIcon>
                  <ListItemText primary='Plătitor' secondary={getUserName(rejectedPaymentDetails.payerId)} />
                </ListItem>
                {rejectedPaymentDetails.referenceCode && (
                  <ListItem>
                    <ListItemIcon>
                      <Icon icon='tabler:barcode' />
                    </ListItemIcon>
                    <ListItemText primary='Cod referință' secondary={rejectedPaymentDetails.referenceCode} />
                  </ListItem>
                )}
              </List>
            </Box>
          )}

          <Alert severity='warning' icon={<Icon icon='tabler:info-circle' />}>
            <AlertTitle>Ce urmează?</AlertTitle>
            <Typography variant='body2' sx={{ mb: 1 }}>
              • Plata a fost marcată ca respinsă în sistem
            </Typography>
            <Typography variant='body2'>• Utilizatorul va fi notificat automat prin email</Typography>
          </Alert>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setSuccessDialogOpen(false)} variant='contained' color='error' size='large' fullWidth>
            Am înțeles
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error Dialog */}
      <Dialog
        open={errorDialogOpen}
        onClose={() => setErrorDialogOpen(false)}
        maxWidth='sm'
        fullWidth
        PaperProps={{
          sx: {
            borderTop: '4px solid',
            borderColor: 'error.main'
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2, pb: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              backgroundColor: 'error.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Icon icon='tabler:alert-circle' fontSize='2rem' style={{ color: 'white' }} />
          </Box>
          <Box>
            <Typography variant='h5' sx={{ fontWeight: 600, color: 'error.main' }}>
              Eroare la respingerea plății
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              {new Date().toLocaleString('ro-RO', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Typography>
          </Box>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ pt: 3 }}>
          <Alert severity='error' sx={{ mb: 3 }}>
            <AlertTitle>Respingere eșuată</AlertTitle>
            {errorMessage}
          </Alert>

          {errorDetails && (
            <Box sx={{ mb: 3, p: 2, backgroundColor: 'action.hover', borderRadius: 1 }}>
              <Typography variant='caption' sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
                Detalii tehnice:
              </Typography>
              <Typography variant='caption' sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                {errorDetails}
              </Typography>
            </Box>
          )}

          {payment && (
            <Box sx={{ mb: 3 }}>
              <Typography variant='subtitle2' sx={{ mb: 2, fontWeight: 600 }}>
                Plata pentru care a eșuat respingerea:
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <Icon icon='tabler:coin' />
                  </ListItemIcon>
                  <ListItemText primary='Sumă' secondary={formatCurrency(payment.amount, payment.currency)} />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Icon icon='tabler:user' />
                  </ListItemIcon>
                  <ListItemText primary='Plătitor' secondary={getUserName(payment.payerId)} />
                </ListItem>
                {payment.referenceCode && (
                  <ListItem>
                    <ListItemIcon>
                      <Icon icon='tabler:barcode' />
                    </ListItemIcon>
                    <ListItemText primary='Cod referință' secondary={payment.referenceCode} />
                  </ListItem>
                )}
              </List>
            </Box>
          )}

          <Alert severity='warning' icon={<Icon icon='tabler:help-circle' />}>
            <AlertTitle>Ce să faci?</AlertTitle>
            <Typography variant='body2' sx={{ mb: 1 }}>
              • Verifică conexiunea la internet
            </Typography>
            <Typography variant='body2' sx={{ mb: 1 }}>
              • Încearcă să reîncarci pagina
            </Typography>
            <Typography variant='body2' sx={{ mb: 1 }}>
              • Contactează echipa de suport dacă problema persistă
            </Typography>
            <Typography variant='body2' sx={{ mt: 2, fontWeight: 600 }}>
              📧 Support: support@ementor.com
            </Typography>
          </Alert>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => setErrorDialogOpen(false)} variant='outlined' color='error' sx={{ flex: 1 }}>
            Închide
          </Button>
          <Button
            onClick={handleRetry}
            variant='contained'
            color='primary'
            startIcon={<Icon icon='tabler:refresh' />}
            sx={{ flex: 1 }}
          >
            Încearcă din nou
          </Button>
        </DialogActions>
      </Dialog>

      {/* Rejection Confirmation Dialog */}
      <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ color: 'error.main' }}>Respinge plata</DialogTitle>
        <DialogContent>
          <Alert severity='warning' sx={{ mb: 2 }}>
            <AlertTitle>Atenție</AlertTitle>
            Această acțiune va respinge plata. Utilizatorul va fi notificat.
          </Alert>
          <Typography variant='body1' sx={{ mb: 2 }}>
            Ești sigur că vrei să respingi această plată?
          </Typography>
          {payment && (
            <Box>
              <Typography variant='body2' sx={{ mb: 1 }}>
                <strong>Sumă:</strong> {formatCurrency(payment.amount, payment.currency)}
              </Typography>
              <Typography variant='body2' sx={{ mb: 1 }}>
                <strong>Plătitor:</strong> {getUserName(payment.payerId)}
              </Typography>
              {payment.referenceCode && (
                <Typography variant='body2' sx={{ mb: 2 }}>
                  <strong>Cod referință:</strong> {payment.referenceCode}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={rejectingPayment}>
            Anulează
          </Button>
          <Button
            onClick={handleRejectPaymentSubmit}
            variant='contained'
            color='error'
            disabled={rejectingPayment}
            startIcon={rejectingPayment ? <CircularProgress size={16} /> : <Icon icon='tabler:x' />}
          >
            {rejectingPayment ? 'Se respinge...' : 'Respinge plata'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default PaymentRejectionDialog
