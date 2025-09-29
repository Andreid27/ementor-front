// ** React Imports
import { Fragment, useState, useEffect } from 'react'
import { useRouter } from 'next/router'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Step from '@mui/material/Step'
import Grid from '@mui/material/Grid'
import { Button } from '@mui/material'
import Divider from '@mui/material/Divider'
import Stepper from '@mui/material/Stepper'
import StepLabel from '@mui/material/StepLabel'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Paper from '@mui/material/Paper'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import Avatar from '@mui/material/Avatar'
import Stack from '@mui/material/Stack'
import CircularProgress from '@mui/material/CircularProgress'
import Chip from '@mui/material/Chip'

// ** MUI Icons
import SchoolIcon from '@mui/icons-material/School'
import ReceiptIcon from '@mui/icons-material/Receipt'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'

// ** Third Party Imports
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'

// ** Custom Components Imports
import StepperCustomDot from './StepperCustomDot'
import CustomTextField from 'src/@core/components/mui/text-field'
import CrmLastTransaction from 'src/views/dashboards/crm/CrmLastTransaction'

// ** API Imports
import { profileServiceClient } from 'src/services'
import {
  GenerateReferenceRequest,
  PaymentReferenceDTO,
  BankAccountDTO,
  WalletSummaryDTO
} from 'src/generated/profile-service'

// ** Styled Components
import StepperWrapper from 'src/@core/styles/mui/stepper'
import Fade from '@mui/material/Fade'

// ** TypeScript Interfaces
interface StepData {
  title: string
  subtitle: string
}

interface AmountFormData {
  amount: number
}

const steps: StepData[] = [
  {
    title: 'Suma de plată',
    subtitle: 'Introduceți suma dorită'
  },
  {
    title: 'Detalii transfer',
    subtitle: 'Cod referință și cont bancar'
  },
  {
    title: 'Confirmare',
    subtitle: 'Finalizare proces'
  }
]

const defaultAmountValues: AmountFormData = {
  amount: 0
}

const amountSchema = yup.object().shape({
  amount: yup
    .number()
    .typeError('Suma trebuie să fie un număr')
    .required('Suma este obligatorie')
    .min(1, 'Suma minimă este 1 RON')
})

const PaymentProcess = () => {
  const router = useRouter()

  // Local state
  const [activeStep, setActiveStep] = useState<number>(0)
  const [displayedStep, setDisplayedStep] = useState<number>(0)
  const [contentVisible, setContentVisible] = useState<boolean>(true)
  const [stripeTrigger, setStripeTrigger] = useState<number>(0)
  const [sendAnimating, setSendAnimating] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [paymentReference, setPaymentReference] = useState<PaymentReferenceDTO | null>(null)
  const [selectedBankAccount, setSelectedBankAccount] = useState<BankAccountDTO | null>(null)
  const [walletSummary, setWalletSummary] = useState<WalletSummaryDTO | null>(null)

  // Constants
  const PROFESSOR_ID = 'eff2d861-d4a8-4b40-bc5e-71f21080da5d'
  const CURRENCY = 'RON'

  const {
    control: amountControl,
    handleSubmit: handleAmountSubmit,
    formState: { errors: amountErrors },
    setValue: setAmountValue,
    watch: watchAmount,
    reset: amountReset
  } = useForm<AmountFormData>({
    defaultValues: defaultAmountValues,
    resolver: yupResolver(amountSchema)
  })

  const currentAmount = watchAmount('amount')

  // Wallet is provided by CrmLastTransaction via onWalletLoaded callback

  // Handle Stepper
  const handleBack = (): void => {
    setActiveStep(prevActiveStep => prevActiveStep - 1)
  }

  const handleReset = (): void => {
    setActiveStep(0)
    setPaymentReference(null)
    setSelectedBankAccount(null)
    amountReset(defaultAmountValues)
  }

  // Check if user can proceed based on wallet balance
  const canProceedToPayment = (): boolean => {
    // If walletSummary is not yet loaded, allow interaction (user can still input amount)
    if (!walletSummary || walletSummary.wallet.balance === undefined) return true

    // If wallet balance is positive (>0) block progression
    return walletSummary.wallet.balance <= 0
  }

  // Get suggested amount based on wallet balance
  const getSuggestedAmount = (): number => {
    // If wallet not loaded, return 0 (no suggestion yet)
    if (!walletSummary) return 0

    const balance = walletSummary.wallet.balance

    if (balance === undefined) return 0

    if (balance < 0) return Math.abs(balance)

    if (balance === 0) {
      const lastPayment = walletSummary.balanceChanges
        ?.slice()
        .reverse()
        .find(change => change.changeType === 'PAYMENT_CONFIRMED' && change.amount && change.amount > 0)
      return lastPayment?.amount || 100
    }

    return 0
  }

  // Auto-populate amount when wallet data is loaded via CrmLastTransaction
  useEffect(() => {
    if (walletSummary && activeStep === 0) {
      const suggestedAmount = getSuggestedAmount()
      if (suggestedAmount > 0) {
        setAmountValue('amount', suggestedAmount)
      }
    }
  }, [walletSummary, setAmountValue, activeStep])

  // Animate between steps: fade out current content, then update displayedStep and fade in
  useEffect(() => {
    // if same, nothing to do
    if (displayedStep === activeStep) return

    // start fade-out
    setContentVisible(false)

    const t = setTimeout(() => {
      setDisplayedStep(activeStep)
      // bump stripe trigger so CSS animation can re-run
      setStripeTrigger(n => n + 1)
      setContentVisible(true)
    }, 180) // small delay for cross-fade

    return () => clearTimeout(t)
  }, [activeStep, displayedStep])

  // progress stripe trigger handled via `stripeTrigger` (used to re-run CSS animation)

  const onAmountSubmit = async (data: AmountFormData): Promise<void> => {
    if (!canProceedToPayment()) {
      toast.error('Nu puteți efectua plați dacă aveți un sold pozitiv în cont!')
      return
    }

    setLoading(true)
    try {
      const request: GenerateReferenceRequest = {
        professorId: PROFESSOR_ID,
        amount: data.amount,
        currency: CURRENCY
      }

      const response = await profileServiceClient.payment.generateReference({
        generateReferenceRequest: request
      })

      setPaymentReference(response.data)

      // Auto-select first bank account if only one available
      if (response.data.availableBankAccounts && response.data.availableBankAccounts.length === 1) {
        setSelectedBankAccount(response.data.availableBankAccounts[0])
      }

      setActiveStep(1)
      toast.success('Cod de referință generat cu succes!')
    } catch (error) {
      console.error('Error generating payment reference:', error)
      toast.error('Eroare la generarea codului de referință')
    } finally {
      setLoading(false)
    }
  }

  const handleBankAccountSelect = (account: BankAccountDTO): void => {
    setSelectedBankAccount(account)
  }

  const getStepContent = (step: number): JSX.Element | null => {
    switch (step) {
      case 0:
        return (
          <Fragment>
            {/* Display wallet using existing component */}

            <form onSubmit={handleAmountSubmit(onAmountSubmit)}>
              <Grid container spacing={5}>
                <Grid item xs={12}>
                  <Typography variant='body2' sx={{ fontWeight: 600, color: 'text.primary' }}>
                    {steps[0].title}
                  </Typography>
                  <Typography variant='caption' component='p'>
                    {steps[0].subtitle}
                  </Typography>
                </Grid>

                {!canProceedToPayment() && (
                  <Grid item xs={12}>
                    <Box
                      sx={{
                        p: 3,
                        borderRadius: 1,
                        bgcolor: 'warning.light',
                        border: '1px solid',
                        borderColor: 'warning.main'
                      }}
                    >
                      <Typography variant='body2' color='warning.dark'>
                        ⚠️ Nu puteți efectua plăți deoarece aveți un sold pozitiv în cont (
                        {walletSummary?.wallet?.balance} {walletSummary?.wallet?.currency}).
                      </Typography>
                    </Box>
                  </Grid>
                )}

                <Grid item xs={12} sm={6}>
                  <Controller
                    name='amount'
                    control={amountControl}
                    rules={{ required: true }}
                    render={({ field: { value, onChange } }) => (
                      <CustomTextField
                        fullWidth
                        type='number'
                        value={value}
                        label='Suma (RON)'
                        onChange={onChange}
                        error={Boolean(amountErrors.amount)}
                        placeholder='100'
                        disabled={!canProceedToPayment()}
                        {...(amountErrors.amount && { helperText: amountErrors.amount.message })}
                        InputProps={{
                          inputProps: { min: 1, step: 0.01 }
                        }}
                      />
                    )}
                  />
                  <Typography variant='caption' color='text.secondary' sx={{ mt: 1, display: 'block' }}>
                    {walletSummary?.wallet?.balance && walletSummary.wallet.balance < 0
                      ? `Suma recomandată: ${Math.abs(walletSummary.wallet.balance)} RON (datorie curentă)`
                      : 'Introduceți suma dorită pentru transfer bancar'}
                  </Typography>
                </Grid>

                <Box sx={{ mb: 4 }}>
                  {/* Use a page-specific variant that hides the CTA and Card wrapper since the page has its own flow */}
                  <CrmLastTransaction
                    showPaymentButton={false}
                    disableCardWrapper
                    onWalletLoaded={ws => setWalletSummary(ws)}
                  />
                </Box>

                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Button variant={'tonal' as any} color='secondary' disabled>
                    Înapoi
                  </Button>
                  <Button type='submit' variant='contained' disabled={!canProceedToPayment() || loading}>
                    {loading ? 'Se generează...' : 'Următorul'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Fragment>
        )

      case 1:
        return (
          <Grid container spacing={6}>
            <Grid item xs={12}>
              <Typography variant='h6' sx={{ fontWeight: 700 }}>
                {steps[1].title}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                {steps[1].subtitle}
              </Typography>
            </Grid>

            {paymentReference && (
              <>
                <Grid item xs={12} md={7}>
                  <Paper variant='outlined' sx={{ p: 4, borderRadius: 2 }}>
                    <Stack direction='row' alignItems='center' spacing={3} sx={{ mb: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', color: 'white' }}>📝</Avatar>
                      <div style={{ flex: 1 }}>
                        <Typography variant='subtitle2' sx={{ fontWeight: 700 }}>
                          Cod de referință
                        </Typography>
                        <Typography variant='h5' sx={{ fontFamily: 'monospace', letterSpacing: 2 }}>
                          {paymentReference.referenceCode}
                        </Typography>
                      </div>
                      <Chip
                        label={`${paymentReference.amount} ${paymentReference.currency}`}
                        color='primary'
                        sx={{
                          '& .MuiChip-label': {
                            fontWeight: 700,
                            fontSize: '1.05rem',
                            paddingLeft: 1.5,
                            paddingRight: 1.5
                          },
                          height: 36
                        }}
                      />
                    </Stack>

                    <Divider sx={{ mb: 3 }} />

                    {/* Simple illustrative SVG to make instructions more suggestive */}
                    <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 1 }}>
                          Instrucțiuni rapide
                        </Typography>
                        <List dense>
                          <ListItem>
                            <ListItemText
                              primary='1. Deschide aplicația băncii tale'
                              secondary='Alege opțiunea Transfer / Plată către alt cont'
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText
                              primary='2. Introdu codul de referință în câmpul detalii plată/transfer/mențiune'
                              secondary={
                                <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>
                                  {paymentReference.referenceCode}
                                </span>
                              }
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText
                              primary='3. Introdu suma exactă'
                              secondary={
                                <span
                                  style={{ fontWeight: 700 }}
                                >{`${paymentReference.amount} ${paymentReference.currency}`}</span>
                              }
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText
                              primary='4. Confirmă plata și păstrează dovada transferului'
                              secondary='Dacă nu introduci codul, plata nu va fi identificată automat.'
                            />
                          </ListItem>
                        </List>
                      </Box>

                      {/* Minimal SVG illustration */}
                      <Box
                        sx={{
                          width: 140,
                          height: 120,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <svg
                          width='120'
                          height='100'
                          viewBox='0 0 120 100'
                          fill='none'
                          xmlns='http://www.w3.org/2000/svg'
                        >
                          <rect x='10' y='12' width='100' height='76' rx='10' fill='#F5FAFF' />
                          <path d='M22 32H98' stroke='#1976D2' strokeWidth='2' strokeLinecap='round' />
                          {/* middle shorter line - slightly bolder for emphasis */}
                          <path d='M22 50H74' stroke='#1976D2' strokeWidth='3' strokeLinecap='round' />
                          <path d='M22 68H98' stroke='#1976D2' strokeWidth='2' strokeLinecap='round' />
                          <circle cx='91' cy='50' r='10' fill='#4DB6AC' />
                          {/* check mark nudged a bit to the right */}
                          <path
                            d='M85 50 L 89 54 L 97 46'
                            stroke='#FFFFFF'
                            strokeWidth='2.2'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            fill='none'
                          />
                        </svg>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={5}>
                  <Paper variant='outlined' sx={{ p: 3, borderRadius: 2 }}>
                    <Typography variant='subtitle2' sx={{ fontWeight: 700, mb: 2 }}>
                      Conturi bancare
                    </Typography>

                    {paymentReference.availableBankAccounts && paymentReference.availableBankAccounts.length > 0 ? (
                      <RadioGroup
                        value={selectedBankAccount?.id || ''}
                        onChange={e => {
                          const account = paymentReference.availableBankAccounts?.find(a => a.id === e.target.value)
                          if (account) handleBankAccountSelect(account)
                        }}
                      >
                        {paymentReference.availableBankAccounts.map((account, index) => (
                          <Paper
                            key={account.id || index}
                            onClick={() => handleBankAccountSelect(account)}
                            elevation={selectedBankAccount?.id === account.id ? 3 : 0}
                            sx={{
                              p: 2,
                              mb: 2,
                              cursor: 'pointer',
                              borderColor: selectedBankAccount?.id === account.id ? 'primary.main' : 'divider',
                              borderWidth: 1,
                              borderStyle: 'solid',
                              borderRadius: 2,
                              transition: 'transform 200ms ease, box-shadow 200ms ease, opacity 200ms ease',
                              transform: contentVisible ? 'translateY(0)' : 'translateY(6px)',
                              opacity: contentVisible ? 1 : 0.7,
                              '&:hover': { transform: 'translateY(-3px)', boxShadow: 3 }
                            }}
                          >
                            <FormControlLabel
                              value={account.id}
                              control={<Radio />}
                              label={
                                <>
                                  <Typography variant='body1' sx={{ fontWeight: 700 }}>
                                    {account.bankName}
                                  </Typography>
                                  <Typography variant='body2' sx={{ fontFamily: 'monospace' }}>
                                    {account.iban}
                                  </Typography>
                                  <Typography variant='caption' color='text.secondary'>
                                    {account.accountHolderName}
                                  </Typography>
                                </>
                              }
                            />
                          </Paper>
                        ))}
                      </RadioGroup>
                    ) : (
                      <Typography variant='body2' color='text.secondary'>
                        Nu există conturi disponibile.
                      </Typography>
                    )}

                    <Divider sx={{ my: 2 }} />

                    <Typography variant='subtitle2' sx={{ fontWeight: 700, mt: 3, mb: 2 }}>
                      Detalii cont selectat
                    </Typography>
                    {selectedBankAccount ? (
                      <Paper variant='outlined' sx={{ p: 2, mt: 1, borderRadius: 2, display: 'flex', gap: 2 }}>
                        <Avatar
                          sx={{
                            bgcolor: 'rgba(76,175,80,0.12)',
                            color: '#4CAF50',
                            width: 56,
                            height: 56,
                            fontSize: 24
                          }}
                        >
                          🏦
                        </Avatar>
                        <Box>
                          <Typography variant='h6' sx={{ fontWeight: 700 }}>
                            {selectedBankAccount.bankName}
                          </Typography>
                          <Typography variant='body2' sx={{ fontFamily: 'monospace', mt: 0.5 }}>
                            {selectedBankAccount.iban}
                          </Typography>
                          <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
                            {selectedBankAccount.accountHolderName}
                          </Typography>
                          {selectedBankAccount.swiftCode && (
                            <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mt: 1 }}>
                              SWIFT: {selectedBankAccount.swiftCode}
                            </Typography>
                          )}
                          <Typography
                            sx={{
                              mt: 7,
                              fontStyle: 'italic',
                              fontSize: '0.625rem',
                              lineHeight: 1.05,
                              color: 'text.secondary',
                              opacity: 0.85
                            }}
                          >
                            Trimiteți suma exactă și codul de referință în detaliile transferului. Plata va fi
                            identificată automat.
                          </Typography>
                        </Box>
                      </Paper>
                    ) : (
                      <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
                        Alege un cont pentru a continua
                      </Typography>
                    )}
                  </Paper>
                </Grid>

                {/* Action buttons moved outside the card to the end of the step */}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Button variant={'tonal' as any} color='secondary' onClick={handleBack}>
                      Înapoi
                    </Button>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button variant='outlined' disabled={!selectedBankAccount}>
                        Am nevoie de ajutor
                      </Button>
                      <Button variant='contained' onClick={() => setActiveStep(2)} disabled={!selectedBankAccount}>
                        Am făcut transferul
                      </Button>
                    </Box>
                  </Box>
                </Grid>
              </>
            )}
          </Grid>
        )

      case 2:
        return (
          <Grid container spacing={6}>
            <Grid item xs={12}>
              <Typography variant='h6' sx={{ fontWeight: 700 }}>
                {steps[2].title}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                {steps[2].subtitle}
              </Typography>
            </Grid>

            {/* Left column - Payment Summary with professional styling */}
            <Grid item xs={12} md={7}>
              <Paper variant='outlined' sx={{ p: 4, borderRadius: 2 }}>
                <Stack direction='row' alignItems='center' spacing={3} sx={{ mb: 3 }}>
                  <Avatar sx={{ bgcolor: 'success.main', color: 'white', width: 56, height: 56 }}>
                    <CheckCircleIcon sx={{ fontSize: 28 }} />
                  </Avatar>
                  <div style={{ flex: 1 }}>
                    <Typography variant='subtitle1' sx={{ fontWeight: 700, mb: 0.5 }}>
                      Rezumat plată
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Verificați detaliile de mai jos înainte de a trimite cererea către verificare.
                    </Typography>
                  </div>
                  <Chip
                    label={`${paymentReference?.amount} ${paymentReference?.currency}`}
                    color='primary'
                    sx={{
                      '& .MuiChip-label': {
                        fontWeight: 700,
                        fontSize: '1.05rem',
                        paddingLeft: 1.5,
                        paddingRight: 1.5
                      },
                      height: 36
                    }}
                  />
                </Stack>

                <Divider sx={{ mb: 3 }} />

                {/* Professional summary cards */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* Reference Code Card */}
                  <Paper
                    variant='outlined'
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      bgcolor: 'rgba(25, 118, 210, 0.04)',
                      borderColor: 'rgba(25, 118, 210, 0.2)'
                    }}
                  >
                    <Stack direction='row' alignItems='center' spacing={2}>
                      <Avatar sx={{ bgcolor: 'primary.main', color: 'white', width: 40, height: 40 }}>
                        <ReceiptIcon sx={{ fontSize: 20 }} />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant='subtitle2' sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
                          Cod de referință
                        </Typography>
                        <Typography variant='h6' sx={{ fontFamily: 'monospace', letterSpacing: 1.5, fontWeight: 700 }}>
                          {paymentReference?.referenceCode}
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>

                  {/* Bank Account Card */}
                  <Paper
                    variant='outlined'
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      bgcolor: 'rgba(76, 175, 80, 0.04)',
                      borderColor: 'rgba(76, 175, 80, 0.2)'
                    }}
                  >
                    <Stack direction='row' alignItems='center' spacing={2}>
                      <Avatar
                        sx={{
                          bgcolor: 'rgba(76,175,80,0.15)',
                          color: '#4CAF50',
                          width: 40,
                          height: 40,
                          fontSize: 18
                        }}
                      >
                        <AccountBalanceWalletIcon sx={{ fontSize: 20, color: '#4CAF50' }} />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant='subtitle2' sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
                          {selectedBankAccount?.bankName}
                        </Typography>
                        <Typography variant='body2' sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                          {selectedBankAccount?.iban}
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                          {selectedBankAccount?.accountHolderName}
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </Box>

                <Box sx={{ mt: 3, p: 2, borderRadius: 1, bgcolor: 'rgba(255, 193, 7, 0.08)' }}>
                  <Typography variant='caption' color='text.secondary' sx={{ fontStyle: 'italic' }}>
                    💡 Asigurați-vă că ați efectuat transferul bancar cu codul de referință inclus în detaliile plății
                    înainte de a continua.
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            {/* Right column - Next Steps Timeline */}
            <Grid item xs={12} md={5}>
              <Paper variant='outlined' sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant='subtitle1' sx={{ fontWeight: 700, mb: 3 }}>
                  Ce urmează?
                </Typography>

                {/* Timeline of next steps with connected dots */}
                <Box sx={{ position: 'relative' }}>
                  {/* Timeline connector line */}
                  <Box
                    sx={{
                      position: 'absolute',
                      left: 16,
                      top: 36,
                      bottom: 36,
                      width: 2,
                      bgcolor: 'divider',
                      zIndex: 0
                    }}
                  />

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, position: 'relative', zIndex: 1 }}>
                    {/* Step 1 - Current step (active) */}
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          bgcolor: 'primary.main',
                          color: 'white',
                          position: 'relative',
                          zIndex: 2,
                          transition: 'transform 220ms ease, opacity 220ms ease',
                          transform:
                            contentVisible && displayedStep >= 1
                              ? 'scale(1.06)'
                              : contentVisible
                              ? 'scale(1)'
                              : 'scale(0.96)',
                          opacity: contentVisible ? 1 : 0.8
                        }}
                      >
                        <CheckCircleIcon sx={{ fontSize: 18 }} />
                      </Box>
                      <Box sx={{ flex: 1, pt: 0.5 }}>
                        <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 0.5, color: 'primary.main' }}>
                          Transfer bancar efectuat ✓
                        </Typography>
                        <Typography variant='body2' color='text.secondary' sx={{ lineHeight: 1.4 }}>
                          Ați completat cu succes transferul bancar cu codul de referință inclus în detalii.
                        </Typography>
                      </Box>
                    </Box>

                    {/* Step 2 - Next step */}
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          bgcolor: 'warning.main',
                          color: 'white',
                          position: 'relative',
                          zIndex: 2,
                          transition: 'transform 220ms ease, opacity 220ms ease',
                          transform: contentVisible && displayedStep === 2 ? 'scale(1.06)' : 'scale(1)',
                          opacity: contentVisible ? 1 : 0.85
                        }}
                      >
                        <SchoolIcon sx={{ fontSize: 18 }} />
                      </Box>
                      <Box sx={{ flex: 1, pt: 0.5 }}>
                        <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 0.5 }}>
                          Verificare de către profesor
                        </Typography>
                        <Typography variant='body2' color='text.secondary' sx={{ lineHeight: 1.4 }}>
                          Profesorul va confirma plata atunci când fondurile ajung în cont și va emite factura
                          corespunzătoare.
                        </Typography>
                      </Box>
                    </Box>

                    {/* Step 3 - Future step */}
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          bgcolor: 'info.main',
                          color: 'white',
                          position: 'relative',
                          zIndex: 2,
                          transition: 'transform 220ms ease, opacity 220ms ease',
                          transform: contentVisible ? 'scale(1)' : 'scale(0.98)',
                          opacity: contentVisible ? 1 : 0.85
                        }}
                      >
                        <ReceiptIcon sx={{ fontSize: 18 }} />
                      </Box>
                      <Box sx={{ flex: 1, pt: 0.5 }}>
                        <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 0.5 }}>
                          Emitere factură
                        </Typography>
                        <Typography variant='body2' color='text.secondary' sx={{ lineHeight: 1.4 }}>
                          Veți primi factura pe email și o veți putea descărca din secțiunea de plăți din contul
                          dumneavoastră.
                        </Typography>
                      </Box>
                    </Box>

                    {/* Removed Step 4 - Future step per request */}
                  </Box>
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* Confirmation section */}
                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    bgcolor: 'rgba(156, 39, 176, 0.04)',
                    border: '1px solid rgba(156, 39, 176, 0.2)',
                    mb: 3
                  }}
                >
                  <Typography variant='body2' sx={{ fontWeight: 600, mb: 1 }}>
                    ✋ Confirmare necesară
                  </Typography>
                  <Typography variant='body2' color='text.secondary' sx={{ lineHeight: 1.4 }}>
                    Confirm că datele de mai sus sunt corecte și am efectuat plata bancară cu codul de referință inclus.
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            {/* Action buttons moved to full width at bottom */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Button variant={'tonal' as any} color='secondary' onClick={handleBack} sx={{ minWidth: 120 }}>
                  Înapoi
                </Button>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button variant='outlined' disabled={loading}>
                    Am nevoie de ajutor
                  </Button>
                  <Button
                    variant='contained'
                    disabled={loading}
                    onClick={async () => {
                      // Make real API call to create payment
                      setLoading(true)
                      try {
                        const createPaymentRequest = {
                          professorId: PROFESSOR_ID,
                          amount: currentAmount,
                          currency: CURRENCY,
                          selectedBankAccountId: selectedBankAccount?.id,
                          referenceCode: paymentReference?.referenceCode
                        }

                        await profileServiceClient.payment.createPayment({
                          createPaymentRequest
                        })

                        toast.success('Cererea a fost trimisă către verificare')

                        // Redirect home after successful payment creation
                        setTimeout(() => {
                          router.push('/dashboards/analytics/')
                        }, 1000)
                      } catch (err) {
                        console.error(err)
                        toast.error('Eroare la trimiterea pentru verificare')
                      } finally {
                        setLoading(false)
                      }
                    }}
                    sx={{ minWidth: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    aria-label={loading ? 'Se trimite' : 'Trimite către verificare'}
                  >
                    {loading ? <CircularProgress size={20} color='inherit' /> : 'Trimite către verificare'}
                  </Button>
                </Box>
              </Box>
            </Grid>
          </Grid>
        )

      default:
        return null
    }
  }

  const renderContent = (): JSX.Element => {
    if (displayedStep === steps.length) {
      // Final step intentionally left empty — no reset screen shown
      return null
    }

    return getStepContent(displayedStep) as JSX.Element
  }

  return (
    <Card sx={{ position: 'relative', overflow: 'visible' }}>
      <CardContent>
        {/* attach stripe trigger via data attribute so CSS can animate connector overlays */}
        <StepperWrapper data-stripe={stripeTrigger}>
          <Stepper activeStep={activeStep}>
            {steps.map((step, index) => {
              const labelProps: { error?: boolean } = {}
              if (index === activeStep) {
                labelProps.error = false
                if (amountErrors.amount && activeStep === 0) {
                  labelProps.error = true
                } else {
                  labelProps.error = false
                }
              }

              return (
                <Step key={index}>
                  <StepLabel {...labelProps} StepIconComponent={StepperCustomDot}>
                    <div className='step-label'>
                      <Typography className='step-number'>{`0${index + 1}`}</Typography>
                      <div>
                        <Typography className='step-title'>{step.title}</Typography>
                        <Typography className='step-subtitle'>{step.subtitle}</Typography>
                      </div>
                    </div>
                  </StepLabel>
                </Step>
              )
            })}
          </Stepper>
          {/* stripe animation is applied to existing Stepper connectors via CSS below */}
          <Box
            component='style'
            dangerouslySetInnerHTML={{
              __html: `
              /* stripe animation moving across the connector line */
              @keyframes connectorStripe { from { transform: translateX(-160%) skewX(-18deg); opacity: 1 } to { transform: translateX(160%) skewX(-18deg); opacity: 0 } }
              /* create a pseudo overlay on the connector line only for active/completed connectors */
              [data-stripe] .MuiStepConnector-root.Mui-active .MuiStepConnector-line,
              [data-stripe] .MuiStepConnector-root.Mui-completed .MuiStepConnector-line {
                position: relative;
                overflow: visible;
              }

              /* using an extra element injected visually via linear-gradient background to simulate the stripe */
              [data-stripe] .MuiStepConnector-root.Mui-active .MuiStepConnector-line::after,
              [data-stripe] .MuiStepConnector-root.Mui-completed .MuiStepConnector-line::after {
                content: '';
                position: absolute;
                left: 0;
                /* place overlay vertically centered on the connector line */
                top: -6px;
                height: 18px;
                width: 100%;
                pointer-events: none;
                transform: translateX(-160%) skewX(-18deg);
                background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.85) 45%, rgba(255,255,255,0) 100%);
                filter: blur(6px);
                box-shadow: 0 2px 14px rgba(255,255,255,0.12);
                animation: connectorStripe 820ms cubic-bezier(.16,.84,.32,1);
              }
            `
            }}
          />
        </StepperWrapper>
      </CardContent>

      <Divider sx={{ m: '0 !important' }} />

      <CardContent sx={{ minHeight: 620, display: 'flex', alignItems: 'flex-start', position: 'relative' }}>
        <Fade in={contentVisible} timeout={220} unmountOnExit>
          <Box sx={{ minHeight: 700, width: '100%', transition: 'opacity 220ms ease' }}>{renderContent()}</Box>
        </Fade>
      </CardContent>
    </Card>
  )
}

PaymentProcess.acl = {
  action: 'read',
  subject: 'student-pages'
}

export default PaymentProcess
