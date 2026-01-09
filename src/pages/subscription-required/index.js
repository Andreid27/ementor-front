// ** React Imports
import { useState } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import { styled, useTheme } from '@mui/material/styles'

// ** Redux Imports
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchSubscriptionStatus,
  selectHasActiveSubscription,
  selectSubscriptionLoading,
  selectSubscription
} from 'src/store/apps/user'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout'

// ** Hooks
import { useAuth } from 'src/hooks/useAuth'

// ** Config
// Stripe Payment Link - This should be configured in environment variables
const STRIPE_PAYMENT_LINK =
  process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK || 'https://buy.stripe.com/test_YOUR_PAYMENT_LINK'

// Styled components
const BoxWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  minHeight: '100vh',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(5),
  background: `linear-gradient(135deg, ${theme.palette.primary.main}10 0%, ${theme.palette.background.paper} 100%)`
}))

const StyledCard = styled(Card)(({ theme }) => ({
  maxWidth: 500,
  textAlign: 'center',
  boxShadow: theme.shadows[10],
  borderRadius: theme.shape.borderRadius * 2,
  '& .MuiCardContent-root': {
    padding: theme.spacing(6, 8)
  }
}))

const IconWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  marginBottom: theme.spacing(4),
  '& svg': {
    fontSize: '5rem',
    color: theme.palette.warning.main
  }
}))

const SubscriptionRequiredPage = () => {
  const router = useRouter()
  const dispatch = useDispatch()
  const theme = useTheme()
  const auth = useAuth()

  // Redux selectors
  const hasActiveSubscription = useSelector(selectHasActiveSubscription)
  const subscriptionLoading = useSelector(selectSubscriptionLoading)
  const subscription = useSelector(selectSubscription)

  // Local state
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)

  // Redirect to home if user already has active subscription
  if (hasActiveSubscription && !subscriptionLoading) {
    router.replace('/acl')
    return null
  }

  // Handle Pay button click - redirect to Stripe payment link
  const handlePayClick = () => {
    // Add professor ID or email as metadata to the Stripe payment link
    // This helps the backend callback identify the user
    const paymentUrl = new URL(STRIPE_PAYMENT_LINK)

    // Add prefill parameters if supported by your Stripe payment link
    if (auth.user?.email) {
      paymentUrl.searchParams.set('prefilled_email', auth.user.email)
      paymentUrl.searchParams.set('client_reference_id', auth.user.id)
    }

    // Open Stripe payment link in the same tab so redirect back works correctly
    window.location.href = paymentUrl.toString()
  }

  // Handle Refresh button click - refetch subscription status
  const handleRefreshClick = async () => {
    setRefreshing(true)
    setError(null)

    try {
      // Force a fresh fetch by clearing the cache first in the thunk
      const result = await dispatch(fetchSubscriptionStatus()).unwrap()

      // Check if subscription is now active
      if (result.subscription?.active) {
        // Redirect to professor dashboard
        router.replace('/acl')
      } else {
        setError(
          'Nu s-a găsit un abonament activ. Dacă tocmai ați plătit, așteptați câteva momente și încercați din nou.'
        )
      }
    } catch (err) {
      setError('Nu s-a putut verifica abonamentul. Vă rugăm încercați din nou.')
    } finally {
      setRefreshing(false)
    }
  }

  // Handle logout
  const handleLogout = () => {
    auth.logout()
  }

  return (
    <BoxWrapper>
      <StyledCard>
        <CardContent>
          <IconWrapper>
            <Icon icon='mdi:credit-card-lock-outline' />
          </IconWrapper>

          <Typography variant='h4' sx={{ mb: 2, fontWeight: 600 }}>
            Abonament Necesar
          </Typography>

          <Typography variant='body1' color='text.secondary' sx={{ mb: 4 }}>
            Pentru a accesa platforma ca profesor, aveți nevoie de un abonament activ. Achiziționați un abonament pentru
            a continua.
          </Typography>

          {error && (
            <Alert severity='info' sx={{ mb: 4, textAlign: 'left' }}>
              {error}
            </Alert>
          )}

          {/* Pay for Subscription Button */}
          <Button
            fullWidth
            variant='contained'
            size='large'
            startIcon={<Icon icon='mdi:credit-card-outline' />}
            onClick={handlePayClick}
            sx={{
              mb: 3,
              py: 1.5,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              '&:hover': {
                background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`
              }
            }}
          >
            Plătește Abonamentul
          </Button>

          {/* Refresh Button */}
          <Button
            fullWidth
            variant='outlined'
            size='large'
            startIcon={refreshing ? <CircularProgress size={20} color='inherit' /> : <Icon icon='mdi:refresh' />}
            onClick={handleRefreshClick}
            disabled={refreshing || subscriptionLoading}
            sx={{ mb: 3 }}
          >
            {refreshing ? 'Se verifică...' : 'Verifică Abonamentul'}
          </Button>

          <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
            Dacă ați plătit deja, apăsați butonul de verificare pentru a actualiza starea abonamentului.
          </Typography>

          {/* Logout Button */}
          <Button variant='text' color='secondary' startIcon={<Icon icon='mdi:logout' />} onClick={handleLogout}>
            Deconectare
          </Button>
        </CardContent>
      </StyledCard>
    </BoxWrapper>
  )
}

SubscriptionRequiredPage.getLayout = page => <BlankLayout>{page}</BlankLayout>

// This page should be accessible without subscription check
SubscriptionRequiredPage.guestGuard = false
SubscriptionRequiredPage.authGuard = true

// ACL - Allow professors to access this page
SubscriptionRequiredPage.acl = {
  action: 'read',
  subject: 'professor-pages'
}

export default SubscriptionRequiredPage
