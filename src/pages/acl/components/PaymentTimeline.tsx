import { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Avatar from '@mui/material/Avatar'
import { Button } from '@mui/material'
import Chip from '@mui/material/Chip'
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import { styled, keyframes, alpha } from '@mui/material/styles'
import TimelineDot from '@mui/lab/TimelineDot'
import TimelineItem from '@mui/lab/TimelineItem'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import TimelineContent from '@mui/lab/TimelineContent'
import TimelineSeparator from '@mui/lab/TimelineSeparator'
import TimelineConnector from '@mui/lab/TimelineConnector'
import MuiTimeline from '@mui/lab/Timeline'
import MuiCardHeader from '@mui/material/CardHeader'
import Skeleton from '@mui/material/Skeleton'
import Icon from 'src/@core/components/icon'
import OptionsMenu from 'src/@core/components/option-menu'
import timeAgo from 'src/@core/utils/time-ago'
import UserViewDrawer from 'src/pages/student-profile/components/UserViewDrawer'
import PaymentConfirmationDialog from './PaymentConfirmationDialog'
import PaymentRejectionDialog from './PaymentRejectionDialog'
import { BankTransferPaymentDTO, BankTransferPaymentDTOStatusEnum } from 'src/generated/profile-service'
import { profileServiceClient } from 'src/services'
import profilePictureDownloader from 'src/@core/axios/profile-picture-downloader'
import extractProfilePicture from 'src/@core/axios/profile-picture-extractor'
import EmentorAvatar, { UserType } from 'src/@core/components/ementor-avatar'

// Define a user interface that matches the actual user data structure
interface User {
  id: string
  firstName: string
  lastName: string
  email?: string
  avatar?: string
}

const Timeline = styled(MuiTimeline)({
  '& .MuiTimelineItem-root': {
    width: '100%',
    '&:before': {
      display: 'none'
    }
  }
})

const CardHeader = styled(MuiCardHeader)(({ theme }) => ({
  '& .MuiTypography-root': {
    lineHeight: 1.6,
    fontWeight: 500,
    fontSize: '1.125rem',
    letterSpacing: '0.15px',
    [theme.breakpoints.up('sm')]: {
      fontSize: '1.25rem'
    }
  }
}))

// Aggressive "ticking bomb" pulse - dot throbs and sends out radar-like rings
const dotThrob = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.3);
  }
`

const ringPulse = keyframes`
  0% {
    transform: translate(-50%, -50%) scale(0.5);
    opacity: 0.9;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    transform: translate(-50%, -50%) scale(2.8);
    opacity: 0;
  }
`

const ringPulseSecondary = keyframes`
  0% {
    transform: translate(-50%, -50%) scale(0.5);
    opacity: 0.9;
  }
  50% {
    opacity: 0.4;
  }
  100% {
    transform: translate(-50%, -50%) scale(3.5);
    opacity: 0;
  }
`

// Pulsing timeline dot with aggressive attention-grabbing "ticking bomb" effect
const PulsingTimelineDot = styled(TimelineDot, {
  shouldForwardProp: prop => prop !== 'dotcolor'
})<{ dotcolor?: string }>(({ theme, dotcolor }) => {
  const bg = dotcolor || theme.palette.info.main
  const glowColor = alpha(bg as string, 0.5)
  const ringColor = alpha(bg as string, 0.7)

  return {
    position: 'relative',
    width: 18,
    height: 18,
    minWidth: 18,
    border: `3px solid ${theme.palette.background.paper}`,
    backgroundColor: bg,
    boxShadow: `0 0 20px ${alpha(bg as string, 0.6)}`,
    animation: `${dotThrob} 1.2s ease-in-out infinite`,
    zIndex: 1,
    '&::before, &::after': {
      content: '""',
      position: 'absolute',
      left: '50%',
      top: '50%',
      borderRadius: '50%',
      border: `3px solid ${ringColor}`,
      pointerEvents: 'none'
    },
    // First ring wave - faster, smaller
    '&::before': {
      width: 18,
      height: 18,
      animation: `${ringPulse} 1.2s cubic-bezier(0, 0.2, 0.8, 1) infinite`,
      boxShadow: `0 0 12px ${glowColor}`
    },
    // Second ring wave - slightly delayed, larger
    '&::after': {
      width: 18,
      height: 18,
      animation: `${ringPulseSecondary} 1.2s cubic-bezier(0, 0.2, 0.8, 1) infinite`,
      animationDelay: '0.4s',
      boxShadow: `0 0 16px ${glowColor}`
    },
    // accessibility: respect reduced motion preference
    '@media (prefers-reduced-motion: reduce)': {
      animation: 'none',
      '&::before, &::after': {
        animation: 'none',
        opacity: 0.4
      }
    }
  }
})

// Tick/check animation for empty state
const tickPulse = keyframes`
  0% { transform: scale(0.98); }
  50% { transform: scale(1.06); }
  100% { transform: scale(0.98); }
`

const tickDraw = keyframes`
  0% { stroke-dashoffset: 100; opacity: 0; }
  30% { opacity: 1; }
  100% { stroke-dashoffset: 0; opacity: 1; }
`

const CheckSvg = styled('svg')(({ theme }) => ({
  width: 72,
  height: 72,
  display: 'block',
  '& path': {
    stroke: theme.palette.success.main,
    strokeWidth: 6,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    fill: 'none',
    strokeDasharray: 100,
    strokeDashoffset: 100,
    animation: `${tickDraw} 0.9s cubic-bezier(.2,.9,.2,1) forwards`
  }
}))

const EmptyTickContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(6, 2),
  color: theme.palette.text.secondary,
  '& .circle': {
    width: 88,
    height: 88,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: alpha(theme.palette.success.main, 0.12),
    boxShadow: theme.shadows[1],
    // run the gentle pulse once on mount, then stop (no infinite looping)
    animation: `${tickPulse} 1.6s ease-in-out 1 forwards`
  }
}))

interface PaymentTimelineProps {
  users: User[]
  loading: boolean
  onPaymentConfirmed?: () => void
}

interface EnhancedPaymentData extends BankTransferPaymentDTO {
  avatar?: string | null
  payerName?: string
}

const PaymentTimeline: React.FC<PaymentTimelineProps> = ({ users, loading, onPaymentConfirmed }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState<boolean>(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState<boolean>(false)
  const [selectedPayment, setSelectedPayment] = useState<BankTransferPaymentDTO | null>(null)
  const [paymentsData, setPaymentsData] = useState<EnhancedPaymentData[]>([])

  const handleAvatarClick = (userId: string) => {
    setSelectedUserId(userId)
  }

  useEffect(() => {
    const fetchAndProcessPayments = async () => {
      try {
        const response = await profileServiceClient.payment.getPendingPayments()
        const paymentsData = response.data || []

        // Process payments data with user information
        const processedData = await processPaymentData(paymentsData, users)
        setPaymentsData(processedData)
      } catch (error) {
        console.error('Failed to fetch payments:', error)
      }
    }

    // Only fetch when parent has finished loading and users are available
    if (!loading && users.length > 0) {
      fetchAndProcessPayments()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading])

  const processPaymentData = async (data: BankTransferPaymentDTO[], users: User[]) => {
    const usersOnPage = data.map(row => row.payerId)
    let uniqueUsers = Array.from(new Set(usersOnPage)).filter(Boolean) as string[]
    let processedUsersList = []

    for (const userId of uniqueUsers) {
      const user = users.find(user => user.id === userId)
      if (user) {
        const processedUser = extractProfilePicture(user)
        processedUsersList.push(processedUser)
      }
    }

    const result = await Promise.all(
      processedUsersList.map(async profilePicture => {
        if (profilePicture.type === 'API') {
          const avatar = await profilePictureDownloader(profilePicture.url, profilePicture.userId)

          return { ...profilePicture, avatar: avatar || null }
        } else if (profilePicture.type === 'EXTERNAL') {
          return { ...profilePicture, avatar: profilePicture.url }
        } else {
          return { ...profilePicture, avatar: null }
        }
      })
    )

    return data.map(row => {
      const user = result.find(user => user.userId === row.payerId)

      return { ...row, avatar: user?.avatar }
    }) as EnhancedPaymentData[]
  }

  useEffect(() => {
    if (selectedUserId) {
      setIsDrawerOpen(true)
    }
  }, [selectedUserId])

  const handleDrawerClose = () => {
    setIsDrawerOpen(false)
    setSelectedUserId(null)
  }

  const handleConfirmPayment = (payment: BankTransferPaymentDTO) => {
    setSelectedPayment(payment)
    setConfirmDialogOpen(true)
  }

  const handleConfirmDialogClose = () => {
    setConfirmDialogOpen(false)
    setSelectedPayment(null)
  }

  const handleRejectPayment = (payment: BankTransferPaymentDTO) => {
    setSelectedPayment(payment)
    setRejectDialogOpen(true)
  }

  const handleRejectDialogClose = () => {
    setRejectDialogOpen(false)
    setSelectedPayment(null)
  }

  const handlePaymentConfirmed = async () => {
    // Refresh the payments data after successful confirmation
    try {
      const response = await profileServiceClient.payment.getPendingPayments()
      const paymentsData = response.data || []
      const processedData = await processPaymentData(paymentsData, users)
      setPaymentsData(processedData)

      // Notify parent component if callback is provided
      onPaymentConfirmed?.()
    } catch (error) {
      console.error('Failed to refresh payments:', error)
    }
  }

  const getStatusColor = (
    status: BankTransferPaymentDTOStatusEnum | string | undefined
  ): 'error' | 'warning' | 'success' | 'info' => {
    switch (status) {
      case BankTransferPaymentDTOStatusEnum.Pending:
        return 'warning'
      case BankTransferPaymentDTOStatusEnum.Confirmed:
        return 'success'
      case BankTransferPaymentDTOStatusEnum.Rejected:
        return 'error'
      case BankTransferPaymentDTOStatusEnum.Expired:
        return 'error'
      default:
        return 'info'
    }
  }

  // map status to a hex color used by the pulsing dot/halo
  const getStatusHex = (status: BankTransferPaymentDTOStatusEnum | string | undefined): string => {
    switch (status) {
      case BankTransferPaymentDTOStatusEnum.Pending:
        return '#FB8C00'
      case BankTransferPaymentDTOStatusEnum.Confirmed:
        return '#2E7D32'
      case BankTransferPaymentDTOStatusEnum.Rejected:
      case BankTransferPaymentDTOStatusEnum.Expired:
        return '#D32F2F'
      default:
        return '#0288D1'
    }
  }

  const getStatusText = (status: BankTransferPaymentDTOStatusEnum | string | undefined): string => {
    switch (status) {
      case BankTransferPaymentDTOStatusEnum.Pending:
        return 'În așteptare'
      case BankTransferPaymentDTOStatusEnum.Confirmed:
        return 'Confirmat'
      case BankTransferPaymentDTOStatusEnum.Rejected:
        return 'Respins'
      case BankTransferPaymentDTOStatusEnum.Expired:
        return 'Expirat'
      default:
        return 'Necunoscut'
    }
  }

  const getUserName = (userId: string | undefined): string => {
    if (!userId) return 'Utilizator necunoscut'
    const user = users.find(u => u.id === userId)
    return user ? `${user.firstName} ${user.lastName}` : 'Utilizator necunoscut'
  }

  const formatCurrency = (amount: number | undefined, currency: string | undefined = 'RON'): string => {
    if (amount === undefined) return '0 RON'
    return `${amount.toFixed(2)} ${currency}`
  }

  return (
    <>
      <Card sx={{ borderRadius: 2, boxShadow: theme => theme.shadows[8], border: '1px solid rgba(0,0,0,0.04)' }}>
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', '& svg': { mr: 3 } }}>
              <Icon fontSize='1.25rem' icon='tabler:credit-card' />
              <Typography>Plăți în așteptare</Typography>
            </Box>
          }
          action={
            <OptionsMenu
              options={['Refresh List', 'Setări']}
              iconButtonProps={{ size: 'small', sx: { color: 'text.disabled' } }}
            />
          }
        />
        <CardContent
          sx={{
            maxHeight: '460px',
            overflowY: 'auto',
            paddingRight: 2,
            '&::-webkit-scrollbar': { display: 'none' },
            msOverflowStyle: 'none',
            scrollbarWidth: 'none'
          }}
        >
          {loading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, py: 2 }}>
              {Array.from({ length: 3 }).map((_, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Skeleton variant='circular' width={38} height={38} />
                    <Box>
                      <Skeleton variant='text' width={180} height={22} />
                      <Skeleton variant='text' width={120} height={16} />
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Skeleton variant='circular' width={32} height={32} />
                    <Skeleton variant='rectangular' width={100} height={36} sx={{ borderRadius: 1 }} />
                  </Box>
                </Box>
              ))}
            </Box>
          ) : paymentsData.length === 0 ? (
            <EmptyTickContainer>
              <div className='circle'>
                <CheckSvg viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg' aria-hidden>
                  <path d='M20 42 L34 56 L60 26' />
                </CheckSvg>
              </div>

              <Typography variant='h6' sx={{ mt: 2, fontWeight: 600 }}>
                Toate plățile au fost confirmate
              </Typography>
              <Typography variant='body2' sx={{ mt: 1, color: 'text.secondary' }}>
                Nu există acțiuni în așteptare.
              </Typography>
            </EmptyTickContainer>
          ) : (
            <Timeline sx={{ mt: 3 }}>
              {paymentsData.map((payment, index) => (
                <TimelineItem key={payment.id || index}>
                  <TimelineSeparator>
                    <PulsingTimelineDot dotcolor={getStatusHex(payment.status)} sx={{ mt: 1.5 }} />
                    <TimelineConnector />
                  </TimelineSeparator>
                  <TimelineContent sx={{ pt: 0, mt: 0, mb: theme => `${theme.spacing(2)} !important` }}>
                    <Box
                      sx={{
                        mb: 0.5,
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <Typography variant='h6' sx={{ mr: 2 }}>
                        Plată {formatCurrency(payment.amount, payment.currency)}
                      </Typography>
                      <Typography variant='caption' sx={{ color: 'text.disabled' }}>
                        {payment.creation ? timeAgo(payment.creation) : 'Data necunoscută'}
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={getStatusText(payment.status)}
                        variant='outlined'
                        color={getStatusColor(payment.status)}
                        size='small'
                        sx={{ textTransform: 'none', fontWeight: 500 }}
                      />
                      {payment.referenceCode && (
                        <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                          Ref: {payment.referenceCode}
                        </Typography>
                      )}
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <EmentorAvatar
                          userType={UserType.STUDENT}
                          avatarSrc={payment.avatar || undefined}
                          sx={{
                            mr: 3,
                            width: 40,
                            height: 40,
                            cursor: 'pointer',
                            boxShadow: theme => theme.shadows[3],
                            border: '2px solid rgba(255,255,255,0.6)'
                          }}
                          onClick={() => payment.payerId && handleAvatarClick(payment.payerId)}
                        />
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                          <Typography variant='body2' sx={{ fontWeight: 500, color: 'text.primary' }}>
                            {getUserName(payment.payerId)}
                          </Typography>
                          {payment.confirmedAt && (
                            <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                              <Icon fontSize='.65rem' icon='tabler:check' />
                              Confirmat la {new Date(payment.confirmedAt).toLocaleDateString('ro-RO')}
                            </Typography>
                          )}
                        </Box>
                      </Box>

                      {payment.status === BankTransferPaymentDTOStatusEnum.Pending && (
                        <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'center' }}>
                          <Tooltip title='Respinge plata' placement='top' arrow>
                            <IconButton
                              size='small'
                              color='error'
                              onClick={() => handleRejectPayment(payment)}
                              sx={{
                                width: 26,
                                height: 26,
                                mb: 0.5,
                                border: '1.5px solid',
                                borderColor: 'error.main',
                                backgroundColor: alpha => alpha.palette.error.main + '08',
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': {
                                  backgroundColor: 'error.main',
                                  borderColor: 'error.dark',
                                  transform: 'scale(1.08)',
                                  '& svg': {
                                    color: 'white'
                                  }
                                }
                              }}
                            >
                              <Icon icon='tabler:x' fontSize='1rem' />
                            </IconButton>
                          </Tooltip>
                          <Button
                            size='small'
                            variant='contained'
                            color='success'
                            onClick={() => handleConfirmPayment(payment)}
                            startIcon={<Icon icon='tabler:check' />}
                            sx={{
                              transition: 'all 0.2s ease-in-out',
                              '&:hover': {
                                transform: 'translateY(-1px)',
                                boxShadow: theme => theme.shadows[4]
                              }
                            }}
                          >
                            Confirmă
                          </Button>
                        </Box>
                      )}
                    </Box>
                  </TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>
          )}
        </CardContent>
      </Card>

      <UserViewDrawer open={isDrawerOpen} onClose={handleDrawerClose} userId={selectedUserId} tab='account' />

      <PaymentConfirmationDialog
        open={confirmDialogOpen}
        payment={selectedPayment}
        onClose={handleConfirmDialogClose}
        onSuccess={handlePaymentConfirmed}
        getUserName={getUserName}
        formatCurrency={formatCurrency}
      />

      <PaymentRejectionDialog
        open={rejectDialogOpen}
        payment={selectedPayment}
        onClose={handleRejectDialogClose}
        onSuccess={handlePaymentConfirmed}
        getUserName={getUserName}
        formatCurrency={formatCurrency}
      />
    </>
  )
}

export default PaymentTimeline
