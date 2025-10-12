import { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Avatar from '@mui/material/Avatar'
import { Button } from '@mui/material'
import Chip from '@mui/material/Chip'
import { styled } from '@mui/material/styles'
import TimelineDot from '@mui/lab/TimelineDot'
import TimelineItem from '@mui/lab/TimelineItem'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import TimelineContent from '@mui/lab/TimelineContent'
import TimelineSeparator from '@mui/lab/TimelineSeparator'
import TimelineConnector from '@mui/lab/TimelineConnector'
import MuiTimeline from '@mui/lab/Timeline'
import MuiCardHeader from '@mui/material/CardHeader'
import { CircularProgress } from '@mui/material'
import Icon from 'src/@core/components/icon'
import OptionsMenu from 'src/@core/components/option-menu'
import timeAgo from 'src/@core/utils/time-ago'
import UserViewDrawer from 'src/pages/student-profile/components/UserViewDrawer'
import PaymentConfirmationDialog from './PaymentConfirmationDialog'
import { BankTransferPaymentDTO, BankTransferPaymentDTOStatusEnum } from 'src/generated/profile-service'
import { profileServiceClient } from 'src/services'
import profilePictureDownloader from 'src/@core/axios/profile-picture-downloader'
import extractProfilePicture from 'src/@core/axios/profile-picture-extractor'

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

  const getUserAvatar = (userId: string | undefined): string | undefined => {
    if (!userId) return undefined
    const user = users.find(u => u.id === userId) as any
    return user?.avatar || undefined
  }

  const formatCurrency = (amount: number | undefined, currency: string | undefined = 'RON'): string => {
    if (amount === undefined) return '0 RON'
    return `${amount.toFixed(2)} ${currency}`
  }

  return (
    <>
      <Card>
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
            <CircularProgress />
          ) : paymentsData.length === 0 ? (
            <Typography variant='body2' color='text.secondary' sx={{ textAlign: 'center', py: 4 }}>
              Nu există plăți în așteptare
            </Typography>
          ) : (
            <Timeline>
              {paymentsData.map((payment, index) => (
                <TimelineItem key={payment.id || index}>
                  <TimelineSeparator>
                    <TimelineDot color={getStatusColor(payment.status)} sx={{ mt: 1.5 }} />
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
                      <Chip label={getStatusText(payment.status)} color={getStatusColor(payment.status)} size='small' />
                      {payment.referenceCode && (
                        <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                          Ref: {payment.referenceCode}
                        </Typography>
                      )}
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar
                          src={getUserAvatar(payment.payerId)}
                          sx={{ mr: 3, width: 38, height: 38, cursor: 'pointer' }}
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
                        <Button
                          size='small'
                          variant='contained'
                          color='success'
                          onClick={() => handleConfirmPayment(payment)}
                          startIcon={<Icon icon='tabler:check' />}
                        >
                          Confirmă
                        </Button>
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
    </>
  )
}

export default PaymentTimeline
