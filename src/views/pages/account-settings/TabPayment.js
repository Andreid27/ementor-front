// ** React Imports
import { useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Grid from '@mui/material/Grid'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import { styled, useTheme, alpha } from '@mui/material/styles'

// ** Third Party Imports
import { motion } from 'framer-motion'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Redux Imports
import { useSelector } from 'react-redux'
import { selectSubscription, selectSubscriptionLoading } from 'src/store/apps/user'

// ** Hooks
import { useAuth } from 'src/hooks/useAuth'

// ** API Config
import { profileServiceClient } from 'src/services'

// Styled components
const StyledCard = styled(motion(Card))(({ theme }) => ({
  height: '100%',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s ease-in-out',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: `0 12px 30px -10px ${alpha(theme.palette.primary.main, 0.3)}`,
    border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`
  }
}))

const GradientBackground = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  right: 0,
  width: '150px',
  height: '150px',
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(
    theme.palette.primary.main,
    0.05
  )} 100%)`,
  borderRadius: '0 0 0 100%',
  zIndex: 0
}))

const IconWrapper = styled(Box)(({ theme, color }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '72px',
  height: '72px',
  borderRadius: '50%',
  marginBottom: theme.spacing(4),
  background: alpha(color || theme.palette.primary.main, 0.1),
  color: color || theme.palette.primary.main,
  boxShadow: `0 4px 12px ${alpha(color || theme.palette.primary.main, 0.2)}`
}))

const TabPayment = () => {
  const theme = useTheme()
  const auth = useAuth()

  // Redux selectors
  const subscription = useSelector(selectSubscription)
  const subscriptionLoading = useSelector(selectSubscriptionLoading)

  // Local state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Handle redirect to Stripe billing portal
  const handleManageBilling = async () => {
    setLoading(true)
    setError(null)

    try {
      const returnUrl = window.location.href
      const response = await profileServiceClient.professorPayment.createPortalSession({ returnUrl })

      if (response.data && response.data.url) {
        window.location.href = response.data.url
      } else {
        throw new Error('Nu s-a primit URL-ul portalului.')
      }
    } catch (err) {
      console.error('Failed to create portal session:', err)
      setError('Nu s-a putut accesa portalul de facturare. Vă rugăm să încercați din nou.')
      setLoading(false)
    }
  }

  // Format date for display
  const formatDate = dateString => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)

    return date.toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100
      }
    }
  }

  return (
    <motion.div variants={containerVariants} initial='hidden' animate='visible'>
      <Grid container spacing={6}>
        {/* Subscription Status Card */}
        <Grid item xs={12} md={6}>
          <StyledCard variants={itemVariants}>
            <GradientBackground />
            <CardContent sx={{ p: theme => `${theme.spacing(8)} !important`, position: 'relative', zIndex: 1 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <IconWrapper color={subscription?.active ? theme.palette.success.main : theme.palette.error.main}>
                  <Icon
                    icon={subscription?.active ? 'mdi:check-decagram' : 'mdi:alert-circle-outline'}
                    fontSize='2.5rem'
                  />
                </IconWrapper>

                <Typography variant='h5' sx={{ mb: 2, fontWeight: 700, letterSpacing: '0.5px' }}>
                  Status Abonament
                </Typography>

                <Typography variant='body2' color='text.secondary' sx={{ mb: 6, maxWidth: '80%' }}>
                  Informații despre planul curent și valabilitatea acestuia.
                </Typography>

                {subscriptionLoading ? (
                  <Box sx={{ py: 4 }}>
                    <CircularProgress size={40} thickness={4} />
                  </Box>
                ) : subscription ? (
                  <Box sx={{ width: '100%', px: 2 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 4,
                        p: 3,
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.background.default, 0.5),
                        border: `1px solid ${alpha(theme.palette.divider, 0.5)}`
                      }}
                    >
                      <Typography variant='subtitle1' color='text.primary' fontWeight={600}>
                        Stare
                      </Typography>
                      <Chip
                        label={subscription.active ? 'Activ' : 'Inactiv'}
                        color={subscription.active ? 'success' : 'error'}
                        variant='tonal'
                        size='small'
                        icon={<Icon icon={subscription.active ? 'mdi:check' : 'mdi:close'} fontSize={16} />}
                        sx={{ fontWeight: 600, px: 2 }}
                      />
                    </Box>

                    {subscription.tier && (
                      <>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                          <Typography variant='body2' color='text.secondary'>
                            Tip abonament
                          </Typography>
                          <Typography variant='subtitle2' fontWeight={700}>
                            {subscription.tier}
                          </Typography>
                        </Box>
                        <Divider sx={{ my: 2, opacity: 0.5 }} />
                      </>
                    )}

                    {subscription.currentPeriodEnd && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant='body2' color='text.secondary'>
                          Data expirării
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Icon icon='mdi:calendar-clock' fontSize={16} style={{ marginRight: 6, opacity: 0.7 }} />
                          <Typography variant='subtitle2' fontWeight={700}>
                            {formatDate(subscription.currentPeriodEnd)}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  </Box>
                ) : (
                  <Alert severity='info' sx={{ width: '100%' }}>
                    Nu există informații despre abonament.
                  </Alert>
                )}
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>

        {/* Manage Billing Card */}
        <Grid item xs={12} md={6}>
          <StyledCard variants={itemVariants}>
            <GradientBackground />
            <CardContent sx={{ p: theme => `${theme.spacing(8)} !important`, position: 'relative', zIndex: 1 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <IconWrapper color={theme.palette.primary.main}>
                  <Icon icon='mdi:credit-card-settings-outline' fontSize='2.5rem' />
                </IconWrapper>

                <Typography variant='h5' sx={{ mb: 2, fontWeight: 700, letterSpacing: '0.5px' }}>
                  Gestionează Abonamentul
                </Typography>

                <Typography variant='body1' color='text.secondary' sx={{ mb: 6, maxWidth: '90%' }}>
                  Aici puteți vizualiza și descărca toate facturile, gestiona metoda de plată, actualiza informațiile de
                  facturare sau schimba planul de abonament.
                </Typography>

                {error && (
                  <Alert severity='error' sx={{ mb: 4, width: '100%', textAlign: 'left' }}>
                    {error}
                  </Alert>
                )}

                <Button
                  fullWidth
                  variant='contained'
                  size='large'
                  startIcon={loading ? <CircularProgress size={20} color='inherit' /> : <Icon icon='mdi:open-in-new' />}
                  onClick={handleManageBilling}
                  disabled={loading}
                  sx={{
                    py: 3,
                    borderRadius: 2,
                    fontSize: '1rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    boxShadow: `0 8px 20px -6px ${alpha(theme.palette.primary.main, 0.5)}`,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    transition: 'all 0.3s',
                    '&:hover': {
                      background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                      transform: 'translateY(-2px)',
                      boxShadow: `0 12px 25px -8px ${alpha(theme.palette.primary.main, 0.6)}`
                    }
                  }}
                >
                  {loading ? 'Se încarcă...' : 'Gestionează Abonamentul'}
                </Button>

                <Typography variant='caption' color='text.disabled' sx={{ mt: 4 }}>
                  Securizat prin Stripe Billing Portal
                </Typography>
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>
    </motion.div>
  )
}

export default TabPayment
