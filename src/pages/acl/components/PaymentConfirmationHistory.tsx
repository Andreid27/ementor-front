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
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Grid,
  Tooltip,
  IconButton
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
    const [loading, setLoading] = useState<boolean>(false)
    const [paymentsData, setPaymentsData] = useState<EnhancedPaymentData[]>([])
    const [startDate, setStartDate] = useState<string>(defaultDates.start)
    const [endDate, setEndDate] = useState<string>(defaultDates.end)

    // Expose refresh method to parent components
    useImperativeHandle(ref, () => ({
      refresh: () => {
        fetchConfirmationHistory()
      }
    }))

    // Fetch data on mount
    useEffect(() => {
      fetchConfirmationHistory()
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

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

          {/* Scrollable Table Container */}
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
            {/* Table */}
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : paymentsData.length === 0 ? (
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
                      <TableCell>Plătitor</TableCell>
                      <TableCell>Sumă</TableCell>
                      <TableCell>Cod Referință</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Data Creare</TableCell>
                      <TableCell>Data Confirmare</TableCell>
                      <TableCell align='center'>Acțiuni</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paymentsData.map((payment, index) => (
                      <TableRow key={payment.id || index} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar src={getUserAvatar(payment.payerId)} sx={{ width: 32, height: 32 }} />
                            <Box>
                              <Typography variant='body2' sx={{ fontWeight: 500 }}>
                                {getUserName(payment.payerId)}
                              </Typography>
                              <Typography variant='caption' color='text.secondary'>
                                ID: {payment.payerId?.slice(0, 8)}...
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant='body2' sx={{ fontWeight: 600 }}>
                            {formatCurrency(payment.amount, payment.currency)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant='body2' sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                            {payment.referenceCode || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusText(payment.status)}
                            color={getStatusColor(payment.status)}
                            size='small'
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant='body2'>{formatDateTime(payment.creation)}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant='body2' sx={{ color: 'success.main', fontWeight: 500 }}>
                            {formatDateTime(payment.confirmedAt)}
                          </Typography>
                        </TableCell>
                        <TableCell align='center'>
                          <Tooltip title='Detalii'>
                            <IconButton size='small' color='primary'>
                              <Icon icon='tabler:eye' fontSize='1.25rem' />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title='Download factură'>
                            <IconButton size='small' color='secondary'>
                              <Icon icon='tabler:download' fontSize='1.25rem' />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>

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
