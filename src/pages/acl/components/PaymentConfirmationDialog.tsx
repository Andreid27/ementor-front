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
  FormControlLabel,
  Checkbox,
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

interface PaymentConfirmationDialogProps {
  open: boolean
  payment: BankTransferPaymentDTO | null
  onClose: () => void
  onSuccess: () => void
  getUserName: (userId: string | undefined) => string
  formatCurrency: (amount: number | undefined, currency: string | undefined) => string
}

const PaymentConfirmationDialog: React.FC<PaymentConfirmationDialogProps> = ({
  open,
  payment,
  onClose,
  onSuccess,
  getUserName,
  formatCurrency
}) => {
  const [confirmingPayment, setConfirmingPayment] = useState<boolean>(false)
  const [generateInvoice, setGenerateInvoice] = useState<boolean>(true)
  const [processingStep, setProcessingStep] = useState<string>('')
  const [successDialogOpen, setSuccessDialogOpen] = useState<boolean>(false)
  const [errorDialogOpen, setErrorDialogOpen] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [errorDetails, setErrorDetails] = useState<string>('')
  const [confirmedPaymentDetails, setConfirmedPaymentDetails] = useState<BankTransferPaymentDTO | null>(null)

  const handleConfirmPaymentSubmit = async () => {
    if (!payment?.id) return

    setConfirmingPayment(true)
    setProcessingStep('Verificare plată...')

    try {
      // Step 1: Validate payment
      setProcessingStep('Se validează plata...')
      await new Promise(resolve => setTimeout(resolve, 500)) // Brief pause for user to see the step

      // Step 2: Confirm payment
      setProcessingStep(generateInvoice ? 'Se confirmă plata și se generează factura...' : 'Se confirmă plata...')
      await profileServiceClient.payment.confirmPayment({
        paymentConfirmationRequest: {
          paymentId: payment.id,
          generateInvoice: generateInvoice
        }
      })

      // Step 3: Success
      setProcessingStep('Finalizare...')
      setConfirmedPaymentDetails(payment)
      onClose()

      // Show success dialog
      setTimeout(() => {
        setSuccessDialogOpen(true)
        setConfirmingPayment(false)
        setProcessingStep('')
      }, 300)

      // Notify parent component
      onSuccess()
    } catch (error: any) {
      console.error('Failed to confirm payment:', error)

      // Extract error details
      const errorMsg = error?.response?.data?.message || error?.message || 'A apărut o eroare necunoscută'
      const errorDetail = error?.response?.data?.detail || error?.response?.statusText || ''

      setErrorMessage(errorMsg)
      setErrorDetails(errorDetail)
      onClose()

      // Show error dialog
      setTimeout(() => {
        setErrorDialogOpen(true)
        setConfirmingPayment(false)
        setProcessingStep('')
      }, 300)
    }
  }

  const handleRetry = () => {
    setErrorDialogOpen(false)
    // Reopen the confirmation dialog to retry
    if (payment) {
      setTimeout(() => {
        // The parent component should handle reopening the dialog
        handleConfirmPaymentSubmit()
      }, 300)
    }
  }

  return (
    <>
      {/* Backdrop with loading progress */}
      <Backdrop
        open={confirmingPayment}
        sx={{
          color: '#fff',
          zIndex: theme => theme.zIndex.drawer + 2,
          flexDirection: 'column',
          gap: 3
        }}
      >
        <CircularProgress size={60} thickness={4} sx={{ color: 'primary.main' }} />
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant='h5' sx={{ mb: 1, fontWeight: 600 }}>
            Se procesează plata
          </Typography>
          <Typography variant='body1' sx={{ mb: 2, opacity: 0.9 }}>
            {processingStep || 'Vă rugăm așteptați...'}
          </Typography>
          <Alert severity='info' sx={{ mt: 2, backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
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
            borderColor: 'success.main'
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2, pb: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              backgroundColor: 'success.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Icon icon='tabler:check' fontSize='2rem' style={{ color: 'white' }} />
          </Box>
          <Box>
            <Typography variant='h5' sx={{ fontWeight: 600, color: 'success.main' }}>
              Plată confirmată cu succes
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
          <Alert severity='success' sx={{ mb: 3 }}>
            <AlertTitle>Confirmare finalizată</AlertTitle>
            Plata a fost confirmată cu succes și toate datele au fost actualizate.
          </Alert>

          {confirmedPaymentDetails && (
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
                    secondary={formatCurrency(confirmedPaymentDetails.amount, confirmedPaymentDetails.currency)}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Icon icon='tabler:user' />
                  </ListItemIcon>
                  <ListItemText primary='Plătitor' secondary={getUserName(confirmedPaymentDetails.payerId)} />
                </ListItem>
                {confirmedPaymentDetails.referenceCode && (
                  <ListItem>
                    <ListItemIcon>
                      <Icon icon='tabler:barcode' />
                    </ListItemIcon>
                    <ListItemText primary='Cod referință' secondary={confirmedPaymentDetails.referenceCode} />
                  </ListItem>
                )}
                <ListItem>
                  <ListItemIcon>
                    <Icon icon={generateInvoice ? 'tabler:file-invoice' : 'tabler:file-off'} />
                  </ListItemIcon>
                  <ListItemText
                    primary='Factură'
                    secondary={generateInvoice ? 'Generată automat' : 'Nu s-a generat factură'}
                  />
                </ListItem>
              </List>
            </Box>
          )}

          <Alert severity='info' icon={<Icon icon='tabler:info-circle' />}>
            <AlertTitle>Ce urmează?</AlertTitle>
            <Typography variant='body2' sx={{ mb: 1 }}>
              • Plata a fost marcată ca confirmată în sistem
            </Typography>
            {generateInvoice && (
              <Typography variant='body2' sx={{ mb: 1 }}>
                • Factura a fost generată și este disponibilă pentru descărcare
              </Typography>
            )}
            <Typography variant='body2'>• Utilizatorul va fi notificat automat prin email</Typography>
          </Alert>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => setSuccessDialogOpen(false)}
            variant='contained'
            color='success'
            size='large'
            fullWidth
          >
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
              Eroare la confirmarea plății
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
            <AlertTitle>Confirmare eșuată</AlertTitle>
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
                Plata pentru care a eșuat confirmarea:
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

      {/* Confirmation Dialog */}
      <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
        <DialogTitle>Confirmă plata</DialogTitle>
        <DialogContent>
          <Typography variant='body1' sx={{ mb: 2 }}>
            Ești sigur că vrei să confirmi această plată?
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
              <FormControlLabel
                control={
                  <Checkbox
                    checked={generateInvoice}
                    onChange={e => setGenerateInvoice(e.target.checked)}
                    color='primary'
                  />
                }
                label='Generează factură'
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={confirmingPayment}>
            Anulează
          </Button>
          <Button
            onClick={handleConfirmPaymentSubmit}
            variant='contained'
            color='success'
            disabled={confirmingPayment}
            startIcon={confirmingPayment ? <CircularProgress size={16} /> : <Icon icon='tabler:check' />}
          >
            {confirmingPayment ? 'Se confirmă...' : 'Confirmă plata'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default PaymentConfirmationDialog
