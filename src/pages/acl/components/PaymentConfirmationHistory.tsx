import { useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Avatar from '@mui/material/Avatar'
import { Button } from '@mui/material'
import Chip from '@mui/material/Chip'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import MuiCardHeader from '@mui/material/CardHeader'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Grid,
  Skeleton,
  Paper,
  Fade,
  Divider
} from '@mui/material'
import Icon from 'src/@core/components/icon'
import OptionsMenu from 'src/@core/components/option-menu'
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

interface PaymentConfirmationHistoryProps {
  users: User[]
}

interface EnhancedPaymentData extends BankTransferPaymentDTO {
  avatar?: string | null
  payerName?: string
}

export interface PaymentConfirmationHistoryRef {
  refresh: () => void
}

// Helper function to get default date range (last 7 days, end date is tomorrow to include today)
const getDefaultDateRange = () => {
  const end = new Date()
  end.setDate(end.getDate() + 1) // Set to tomorrow to include today
  const start = new Date()
  start.setDate(start.getDate() - 7)

  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}T00:00`
  }

  return {
    start: formatDateForInput(start),
    end: formatDateForInput(end)
  }
}

const PaymentConfirmationHistory = forwardRef<PaymentConfirmationHistoryRef, PaymentConfirmationHistoryProps>(
  ({ users }, ref) => {
    const defaultDates = getDefaultDateRange()
    const [loading, setLoading] = useState<boolean>(true) // Start with true for initial load
    const [paymentsData, setPaymentsData] = useState<EnhancedPaymentData[]>([])
    const [startDate, setStartDate] = useState<string>(defaultDates.start)
    const [endDate, setEndDate] = useState<string>(defaultDates.end)
    const [selectedPayment, setSelectedPayment] = useState<EnhancedPaymentData | null>(null)
    const [detailCardAnchor, setDetailCardAnchor] = useState<{ top: number; left: number } | null>(null)

    // Expose refresh method to parent components
    useImperativeHandle(ref, () => ({
      refresh: () => {
        fetchConfirmationHistory()
      }
    }))

    // Fetch data on mount
    useEffect(() => {
      // Wait for users to be available before fetching
      if (users.length > 0) {
        fetchConfirmationHistory()
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [users.length])

    const fetchConfirmationHistory = async () => {
      if (!startDate || !endDate) return

      setLoading(true)
      try {
        // Convert datetime-local to ISO string
        const startISO = new Date(startDate).toISOString()
        const endISO = new Date(endDate).toISOString()

        const response = await profileServiceClient.payment.getConfirmationHistory({
          startDate: startISO,
          endDate: endISO
        })

        const paymentsData = response.data || []

        // Process payments data with user information
        const processedData = await processPaymentData(paymentsData, users)
        setPaymentsData(processedData)
      } catch (error) {
        console.error('Failed to fetch confirmation history:', error)
        setPaymentsData([])
      } finally {
        setLoading(false)
      }
    }

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

    const handleApplyDateRange = () => {
      fetchConfirmationHistory()
    }

    const handleQuickRange = (days: number) => {
      const end = new Date()
      end.setDate(end.getDate() + 1) // Set to tomorrow to include today
      const start = new Date()
      start.setDate(start.getDate() - days)

      const formatDateForInput = (date: Date) => {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}T00:00`
      }

      setStartDate(formatDateForInput(start))
      setEndDate(formatDateForInput(end))

      // Auto-fetch after setting dates
      setTimeout(() => {
        fetchConfirmationHistory()
      }, 100)
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
      const payment = paymentsData.find(p => p.payerId === userId)
      return payment?.avatar || undefined
    }

    const formatCurrency = (amount: number | undefined, currency: string | undefined = 'RON'): string => {
      if (amount === undefined) return '0 RON'
      return `${amount.toFixed(2)} ${currency}`
    }

    const formatDateTime = (iso?: string) => {
      if (!iso) return '-'
      try {
        const date = new Date(iso)
        return date.toLocaleString('ro-RO', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      } catch (e) {
        return iso
      }
    }

    const handleRowClick = (payment: EnhancedPaymentData, event: React.MouseEvent<HTMLTableRowElement>) => {
      const rect = event.currentTarget.getBoundingClientRect()
      const cardWidth = 400
      const cardMaxHeight = window.innerHeight * 0.8 // 80vh
      const padding = 20
      const isMobile = window.innerWidth < 600 // sm breakpoint

      // On mobile, use fullscreen modal style
      if (isMobile) {
        setDetailCardAnchor({
          top: padding,
          left: padding
        })
        setSelectedPayment(payment)
        return
      }

      // Calculate horizontal position (viewport coordinates for fixed positioning)
      let left = rect.right + padding

      // If card would overflow right edge, position it to the left of the row
      if (left + cardWidth > window.innerWidth - padding) {
        left = rect.left - cardWidth - padding
      }

      // If still overflows (very narrow screen), center it
      if (left < padding) {
        left = Math.max(padding, (window.innerWidth - cardWidth) / 2)
      }

      // Calculate vertical position (viewport coordinates for fixed positioning)
      let top = rect.top

      // If card would overflow bottom, adjust upward
      if (top + cardMaxHeight > window.innerHeight - padding) {
        top = Math.max(padding, window.innerHeight - cardMaxHeight - padding)
      }

      // Ensure card doesn't go above viewport
      if (top < padding) {
        top = padding
      }

      setDetailCardAnchor({
        top,
        left
      })
      setSelectedPayment(payment)
    }

    const handleCloseDetail = () => {
      setSelectedPayment(null)
      setDetailCardAnchor(null)
    }

    const formatDate = (iso?: string) => {
      if (!iso) return '-'
      try {
        const date = new Date(iso)
        return date.toLocaleDateString('ro-RO', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })
      } catch (e) {
        return iso
      }
    }

    const formatTime = (iso?: string) => {
      if (!iso) return '-'
      try {
        const date = new Date(iso)
        return date.toLocaleTimeString('ro-RO', {
          hour: '2-digit',
          minute: '2-digit'
        })
      } catch (e) {
        return iso
      }
    }

    // Skeleton loader component
    const TableSkeleton = () => (
      <>
        {[1, 2, 3, 4, 5].map(row => (
          <TableRow key={row}>
            <TableCell>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Skeleton variant='circular' width={32} height={32} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant='text' width='60%' />
                  <Skeleton variant='text' width='40%' />
                </Box>
              </Box>
            </TableCell>
            <TableCell>
              <Skeleton variant='text' width='80%' />
            </TableCell>
            <TableCell>
              <Skeleton variant='rectangular' width={80} height={24} sx={{ borderRadius: 1 }} />
            </TableCell>
            <TableCell>
              <Skeleton variant='text' width='90%' />
            </TableCell>
          </TableRow>
        ))}
      </>
    )

    return (
      <Card sx={{ mt: 4 }}>
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', '& svg': { mr: 3 } }}>
              <Icon fontSize='1.25rem' icon='tabler:history' />
              <Typography>Istoric Confirmări Plăți</Typography>
            </Box>
          }
          action={
            <OptionsMenu
              options={['Export CSV', 'Setări']}
              iconButtonProps={{ size: 'small', sx: { color: 'text.disabled' } }}
            />
          }
        />
        <CardContent>
          {/* Date Range Selector */}
          <Box sx={{ mb: 2, pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Grid container spacing={2} alignItems='center'>
              <Grid item xs={12} sm={3.5}>
                <TextField
                  fullWidth
                  label='De la'
                  type='datetime-local'
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  InputLabelProps={{
                    shrink: true
                  }}
                  size='small'
                />
              </Grid>
              <Grid item xs={12} sm={3.5}>
                <TextField
                  fullWidth
                  label='Până la'
                  type='datetime-local'
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  InputLabelProps={{
                    shrink: true
                  }}
                  size='small'
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <Button
                  fullWidth
                  variant='contained'
                  color='primary'
                  onClick={handleApplyDateRange}
                  startIcon={<Icon icon='tabler:search' />}
                  disabled={loading}
                  size='small'
                ></Button>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  <Chip label='7 zile' size='small' onClick={() => handleQuickRange(7)} clickable variant='outlined' />
                  <Chip
                    label='30 zile'
                    size='small'
                    onClick={() => handleQuickRange(30)}
                    clickable
                    variant='outlined'
                  />
                  <Chip
                    label='90 zile'
                    size='small'
                    onClick={() => handleQuickRange(90)}
                    clickable
                    variant='outlined'
                  />
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Compact Table Container */}
          <Box
            sx={{
              maxHeight: '500px',
              overflowY: 'auto',
              mb: 2,
              '&::-webkit-scrollbar': {
                width: '8px'
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: 'action.hover',
                borderRadius: '4px'
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'action.selected',
                borderRadius: '4px',
                '&:hover': {
                  backgroundColor: 'action.focus'
                }
              }
            }}
          >
            {paymentsData.length === 0 && !loading ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Icon icon='tabler:database-off' fontSize='3rem' style={{ opacity: 0.3 }} />
                <Typography variant='body2' color='text.secondary' sx={{ mt: 2 }}>
                  Nu există plăți confirmate în perioada selectată
                </Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ width: { xs: '40%', sm: '35%', md: '30%' } }}>Plătitor</TableCell>
                      <TableCell sx={{ width: { xs: '60%', sm: '30%', md: '25%' } }}>Sumă</TableCell>
                      <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' }, width: { sm: '20%', md: '20%' } }}>
                        Status
                      </TableCell>
                      <TableCell sx={{ display: { xs: 'none', md: 'table-cell' }, width: '25%' }}>
                        Data Confirmare
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableSkeleton />
                    ) : (
                      paymentsData.map((payment, index) => (
                        <TableRow
                          key={payment.id || index}
                          hover
                          onClick={e => handleRowClick(payment, e)}
                          sx={{
                            cursor: 'pointer',
                            '&:hover': {
                              backgroundColor: 'action.hover'
                            },
                            backgroundColor: selectedPayment?.id === payment.id ? 'action.selected' : 'transparent'
                          }}
                        >
                          <TableCell sx={{ width: { xs: '40%', sm: '35%', md: '30%' } }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
                              <Avatar
                                src={getUserAvatar(payment.payerId)}
                                sx={{
                                  width: { xs: 28, sm: 32 },
                                  height: { xs: 28, sm: 32 },
                                  flexShrink: 0
                                }}
                              />
                              <Box sx={{ minWidth: 0, flex: 1 }}>
                                <Typography
                                  variant='body2'
                                  sx={{
                                    fontWeight: 500,
                                    fontSize: { xs: '0.813rem', sm: '0.875rem' },
                                    lineHeight: 1.3,
                                    wordBreak: 'break-word',
                                    overflowWrap: 'break-word',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden'
                                  }}
                                >
                                  {getUserName(payment.payerId)}
                                </Typography>
                                {/* Show status chip on mobile under name */}
                                <Box sx={{ display: { xs: 'block', sm: 'none' }, mt: 0.5 }}>
                                  <Chip
                                    label={getStatusText(payment.status)}
                                    color={getStatusColor(payment.status)}
                                    size='small'
                                    sx={{ height: 20, fontSize: '0.688rem' }}
                                  />
                                </Box>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ width: { xs: '60%', sm: '30%', md: '25%' } }}>
                            <Box>
                              <Typography
                                variant='body2'
                                sx={{
                                  fontWeight: 600,
                                  fontSize: { xs: '0.813rem', sm: '0.875rem' }
                                }}
                              >
                                {formatCurrency(payment.amount, payment.currency)}
                              </Typography>
                              {/* Show date on mobile under amount */}
                              <Typography
                                variant='caption'
                                color='text.secondary'
                                sx={{
                                  display: { xs: 'block', md: 'none' },
                                  fontSize: '0.688rem'
                                }}
                              >
                                {formatDate(payment.confirmedAt)}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell
                            sx={{ display: { xs: 'none', sm: 'table-cell' }, width: { sm: '20%', md: '20%' } }}
                          >
                            <Chip
                              label={getStatusText(payment.status)}
                              color={getStatusColor(payment.status)}
                              size='small'
                            />
                          </TableCell>
                          <TableCell sx={{ display: { xs: 'none', md: 'table-cell' }, width: '25%' }}>
                            <Box>
                              <Typography variant='body2' sx={{ fontWeight: 500 }}>
                                {formatDate(payment.confirmedAt)}
                              </Typography>
                              <Typography variant='caption' color='text.secondary'>
                                {formatTime(payment.confirmedAt)}
                              </Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>

          {/* Floating Detail Card */}
          {selectedPayment && detailCardAnchor && (
            <>
              {/* Backdrop to close detail card */}
              <Box
                sx={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: { xs: 'rgba(0, 0, 0, 0.5)', sm: 'transparent' },
                  zIndex: 1200
                }}
                onClick={handleCloseDetail}
              />

              {/* Detail Card */}
              <Fade in={!!selectedPayment}>
                <Paper
                  elevation={8}
                  sx={{
                    position: 'fixed',
                    top: { xs: '50%', sm: detailCardAnchor.top },
                    left: { xs: '50%', sm: detailCardAnchor.left },
                    transform: { xs: 'translate(-50%, -50%)', sm: 'none' },
                    width: { xs: 'calc(100vw - 32px)', sm: 400 },
                    maxWidth: { xs: 500, sm: 400 },
                    maxHeight: { xs: 'calc(100vh - 32px)', sm: '80vh' },
                    overflowY: 'auto',
                    zIndex: 1300,
                    p: { xs: 2.5, sm: 3 },
                    borderRadius: { xs: 3, sm: 1 },
                    '&::-webkit-scrollbar': {
                      width: '6px'
                    },
                    '&::-webkit-scrollbar-track': {
                      backgroundColor: 'action.hover',
                      borderRadius: '4px'
                    },
                    '&::-webkit-scrollbar-thumb': {
                      backgroundColor: 'action.selected',
                      borderRadius: '4px'
                    }
                  }}
                >
                  {/* Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 }, flex: 1, minWidth: 0 }}>
                      <Avatar
                        src={getUserAvatar(selectedPayment.payerId)}
                        sx={{
                          width: { xs: 44, sm: 48 },
                          height: { xs: 44, sm: 48 },
                          flexShrink: 0
                        }}
                      />
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography
                          variant='h6'
                          sx={{
                            fontWeight: 600,
                            fontSize: { xs: '1.063rem', sm: '1.25rem' },
                            lineHeight: 1.3,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {getUserName(selectedPayment.payerId)}
                        </Typography>
                        <Typography
                          variant='caption'
                          color='text.secondary'
                          sx={{
                            fontSize: { xs: '0.688rem', sm: '0.75rem' },
                            display: 'block',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          ID: {selectedPayment.payerId}
                        </Typography>
                      </Box>
                    </Box>
                    <Box
                      onClick={handleCloseDetail}
                      sx={{
                        cursor: 'pointer',
                        color: 'text.secondary',
                        ml: 1,
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 32,
                        height: 32,
                        borderRadius: 1,
                        '&:hover': {
                          backgroundColor: 'action.hover',
                          color: 'text.primary'
                        }
                      }}
                    >
                      <Icon icon='tabler:x' fontSize='1.25rem' />
                    </Box>
                  </Box>

                  <Divider sx={{ mb: 2.5 }} />

                  {/* Payment Details */}
                  <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                    {/* Amount */}
                    <Grid item xs={12}>
                      <Box
                        sx={{
                          textAlign: 'center',
                          py: { xs: 2.5, sm: 2 },
                          backgroundColor: 'action.hover',
                          borderRadius: 2
                        }}
                      >
                        <Typography
                          variant='caption'
                          color='text.secondary'
                          sx={{ fontSize: { xs: '0.75rem', sm: '0.813rem' } }}
                        >
                          Sumă Plătită
                        </Typography>
                        <Typography
                          variant='h4'
                          sx={{
                            fontWeight: 700,
                            color: 'success.main',
                            fontSize: { xs: '1.75rem', sm: '2.125rem' },
                            mt: 0.5
                          }}
                        >
                          {formatCurrency(selectedPayment.amount, selectedPayment.currency)}
                        </Typography>
                      </Box>
                    </Grid>

                    {/* Status */}
                    <Grid item xs={12}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          py: { xs: 1, sm: 0.5 }
                        }}
                      >
                        <Typography
                          variant='body2'
                          color='text.secondary'
                          sx={{ fontSize: { xs: '0.875rem', sm: '0.875rem' } }}
                        >
                          Status
                        </Typography>
                        <Chip
                          label={getStatusText(selectedPayment.status)}
                          color={getStatusColor(selectedPayment.status)}
                          size='small'
                          sx={{ fontSize: { xs: '0.75rem', sm: '0.813rem' } }}
                        />
                      </Box>
                    </Grid>

                    <Grid item xs={12}>
                      <Divider />
                    </Grid>

                    {/* Reference Code */}
                    <Grid item xs={12}>
                      <Typography
                        variant='caption'
                        color='text.secondary'
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.75rem' } }}
                      >
                        Cod Referință
                      </Typography>
                      <Typography
                        variant='body2'
                        sx={{
                          fontFamily: 'monospace',
                          fontWeight: 500,
                          fontSize: { xs: '0.875rem', sm: '0.95rem' },
                          mt: 0.5,
                          wordBreak: 'break-all'
                        }}
                      >
                        {selectedPayment.referenceCode || '-'}
                      </Typography>
                    </Grid>

                    {/* Creation Date */}
                    <Grid item xs={6}>
                      <Typography
                        variant='caption'
                        color='text.secondary'
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.75rem' } }}
                      >
                        Data Creare
                      </Typography>
                      <Typography
                        variant='body2'
                        sx={{ fontWeight: 500, fontSize: { xs: '0.875rem', sm: '0.875rem' }, mt: 0.5 }}
                      >
                        {formatDate(selectedPayment.creation)}
                      </Typography>
                      <Typography
                        variant='caption'
                        color='text.secondary'
                        sx={{ fontSize: { xs: '0.688rem', sm: '0.75rem' } }}
                      >
                        {formatTime(selectedPayment.creation)}
                      </Typography>
                    </Grid>

                    {/* Confirmation Date */}
                    <Grid item xs={6}>
                      <Typography
                        variant='caption'
                        color='text.secondary'
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.75rem' } }}
                      >
                        Data Confirmare
                      </Typography>
                      <Typography
                        variant='body2'
                        sx={{
                          fontWeight: 500,
                          color: 'success.main',
                          fontSize: { xs: '0.875rem', sm: '0.875rem' },
                          mt: 0.5
                        }}
                      >
                        {formatDate(selectedPayment.confirmedAt)}
                      </Typography>
                      <Typography
                        variant='caption'
                        sx={{ color: 'success.main', fontSize: { xs: '0.688rem', sm: '0.75rem' } }}
                      >
                        {formatTime(selectedPayment.confirmedAt)}
                      </Typography>
                    </Grid>

                    {/* Payment ID */}
                    <Grid item xs={12}>
                      <Typography
                        variant='caption'
                        color='text.secondary'
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.75rem' } }}
                      >
                        Payment ID
                      </Typography>
                      <Typography
                        variant='body2'
                        sx={{
                          fontFamily: 'monospace',
                          fontSize: { xs: '0.75rem', sm: '0.85rem' },
                          mt: 0.5,
                          wordBreak: 'break-all'
                        }}
                      >
                        {selectedPayment.id}
                      </Typography>
                    </Grid>

                    <Grid item xs={12}>
                      <Divider />
                    </Grid>

                    {/* Actions */}
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', gap: { xs: 1, sm: 1 }, flexDirection: { xs: 'column', sm: 'row' } }}>
                        <Button
                          fullWidth
                          variant='outlined'
                          size='small'
                          startIcon={<Icon icon='tabler:receipt' />}
                          sx={{ py: { xs: 1.25, sm: 0.75 } }}
                        >
                          Factură
                        </Button>
                        <Button
                          fullWidth
                          variant='outlined'
                          size='small'
                          startIcon={<Icon icon='tabler:download' />}
                          sx={{ py: { xs: 1.25, sm: 0.75 } }}
                        >
                          Export
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              </Fade>
            </>
          )}

          {/* Summary */}
          {!loading && paymentsData.length > 0 && (
            <Box sx={{ mt: 3, p: 2, backgroundColor: 'action.hover', borderRadius: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant='caption' color='text.secondary'>
                      Total Plăți
                    </Typography>
                    <Typography variant='h6' sx={{ fontWeight: 600 }}>
                      {paymentsData.length}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant='caption' color='text.secondary'>
                      Suma Totală
                    </Typography>
                    <Typography variant='h6' sx={{ fontWeight: 600 }}>
                      {formatCurrency(
                        paymentsData.reduce((sum, p) => sum + (p.amount || 0), 0),
                        paymentsData[0]?.currency
                      )}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant='caption' color='text.secondary'>
                      Confirmate
                    </Typography>
                    <Typography variant='h6' sx={{ fontWeight: 600, color: 'success.main' }}>
                      {paymentsData.filter(p => p.status === BankTransferPaymentDTOStatusEnum.Confirmed).length}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </CardContent>
      </Card>
    )
  }
)

PaymentConfirmationHistory.displayName = 'PaymentConfirmationHistory'

export default PaymentConfirmationHistory
