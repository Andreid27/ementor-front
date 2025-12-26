// ** React Imports
import React, { useEffect, useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import TableBody from '@mui/material/TableBody'
import TableHead from '@mui/material/TableHead'
import TableCell from '@mui/material/TableCell'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import TableContainer from '@mui/material/TableContainer'
import { keyframes } from '@mui/system'

// ** Custom Components Imports

import CustomChip from 'src/@core/components/mui/chip'
import OptionsMenu from 'src/@core/components/option-menu'
import { Button, CardContent, Grid, Menu, MenuItem } from '@mui/material'
import { styled, useTheme } from '@mui/material/styles'

// ** Icons Imports
import Icon from 'src/@core/components/icon'
import { useSettings } from 'src/@core/hooks/useSettings'
import ReactApexcharts from 'src/@core/components/react-apexcharts'
import { hexToRGBA } from 'src/@core/utils/hex-to-rgba'

import { profileServiceClient } from 'src/services'
import { useRouter } from 'next/router'
import { set } from 'date-fns'
import { WalletBalanceChangeDTO, WalletSummaryDTO, BankTransferPaymentDTO } from 'src/generated/profile-service'
import PaymentDetailCard from 'src/pages/acl/components/PaymentDetailCard'

const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(255, 152, 0, 0.7);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(255, 152, 0, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 152, 0, 0);
  }
`

const StyledGrid = styled(Grid)(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    borderBottom: `1px solid ${theme.palette.divider}`
  },
  [theme.breakpoints.up('sm')]: {
    borderRight: `1px solid ${theme.palette.divider}`
  }
}))

interface CrmLastTransactionProps {
  /**
   * When false: hide the primary "Mergi către plată" action button.
   * Default: true (preserves existing behavior in other pages)
   */
  showPaymentButton?: boolean
  /**
   * When true the component will NOT render its outer Card wrapper. Use this when
   * the parent page already provides a Card and you want the content embedded
   * directly. Default: false (preserves existing behaviour).
   */
  disableCardWrapper?: boolean
  /** Optional callback invoked when the component finishes loading wallet summary */
  onWalletLoaded?: (walletSummary: WalletSummaryDTO) => void
  /**
   * User role for permission-based features
   * Default: 'student' (preserves existing behavior)
   */
  userRole?: 'student' | 'professor'
  /**
   * Optional userId to fetch balance history for a specific user (admin/professor view)
   * When provided, uses /wallet/history/user/{userId} instead of /wallet/history
   * Default: undefined (uses current user's history)
   */
  userId?: string
  /**
   * Optional user display name for PaymentDetailCard
   * Used when viewing another user's transactions
   */
  userName?: string
  /**
   * Optional user avatar URL for PaymentDetailCard
   * Used when viewing another user's transactions
   */
  userAvatarUrl?: string
}

const CrmLastTransaction: React.FC<CrmLastTransactionProps> = ({
  showPaymentButton = true,
  disableCardWrapper = false,
  onWalletLoaded,
  userRole = 'student',
  userId,
  userName,
  userAvatarUrl
}) => {
  const router = useRouter()
  const [anchorEl, setAnchorEl] = useState(null)

  const [walletSummary, setWalletSummary] = useState<WalletSummaryDTO | null>(null)
  const [selectedPayment, setSelectedPayment] = useState<BankTransferPaymentDTO | null>(null)
  const [showPaymentDetail, setShowPaymentDetail] = useState(false)

  const theme = useTheme()
  const { settings } = useSettings()
  const { direction } = settings

  const handleClick = event => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  // Function to get dynamic color based on balance value
  const getBalanceColor = (balance: number | undefined): string => {
    if (balance === undefined) return theme.palette.text.secondary

    if (balance >= 0) {
      // Green zone: 0 and above
      // Lighter green for smaller amounts, darker for larger amounts
      const intensity = Math.min(balance / 1000, 1) // Max intensity at 1000 RON
      const greenValue = Math.floor(76 + 46 * intensity) // From #4CAF50 to darker green
      return `rgb(76, ${greenValue + 139}, 80)`
    } else if (balance > -400) {
      // Yellow/Orange zone: between 0 and -400
      // Calculate how deep we are in the negative zone (0 to 1)
      const depth = Math.abs(balance) / 400 // 0 at balance=0, 1 at balance=-400
      const red = Math.floor(255 * (0.8 + 0.2 * depth)) // Orange to red transition
      const green = Math.floor(193 * (1 - depth * 0.3)) // Reduce green as we go deeper
      return `rgb(${red}, ${green}, 7)`
    } else {
      // Red zone: below -400
      // Darker red for larger debts
      const depth = Math.min(Math.abs(balance + 400) / 600, 1) // Max depth at -1000 RON
      const redValue = Math.floor(244 - 50 * depth) // From #F44336 to darker red
      return `rgb(${redValue}, 67, 54)`
    }
  }

  useEffect(() => {
    if (userId) {
      // For admin/professor view: fetch user's balance history (returns Array<WalletBalanceChangeDTO>)
      profileServiceClient.wallet
        .getUserBalanceHistory({ userId })
        .then(response => {
          const balanceChanges = response.data

          // Transform to WalletSummaryDTO structure
          const transformedData: WalletSummaryDTO = {
            wallet: balanceChanges.length > 0 && balanceChanges[0].balanceAfter !== undefined
              ? {
                  balance: balanceChanges[0].balanceAfter,
                  currency: 'RON'
                }
              : { balance: 0, currency: 'RON' },
            balanceChanges: balanceChanges,
            pendingBankTransferPayments: [] // Admin view doesn't show pending payments
          }

          setWalletSummary(transformedData)
          if (typeof onWalletLoaded === 'function') onWalletLoaded(transformedData)
        })
        .catch(error => {
          console.error('Error fetching balance history:', error)
        })
    } else {
      // For self view: use getMyBalanceHistory (returns WalletSummaryDTO)
      profileServiceClient.wallet
        .getMyBalanceHistory()
        .then(response => {
          setWalletSummary(response.data)
          if (typeof onWalletLoaded === 'function') onWalletLoaded(response.data)
        })
        .catch(error => {
          console.error('Error fetching balance history:', error)
        })
    }
  }, [userId])

  // Handle click on bank transfer transaction to show payment details
  const handleTransactionClick = (transaction: WalletBalanceChangeDTO) => {
    // Only handle bank transfer transactions
    if (transaction.referenceType !== 'BANK_TRANSFER' || !transaction.referenceId) {
      return
    }

    // Create a minimal payment object - PaymentDetailCard will fetch full details
    const payment: BankTransferPaymentDTO = {
      id: transaction.referenceId,
      amount: transaction.amount,
      confirmedAt: transaction.creation,
      // Include payerId so PaymentDetailCard can display the correct user name/avatar
      payerId: userId || undefined
    }

    setSelectedPayment(payment)
    setShowPaymentDetail(true)
  }

  const handleClosePaymentDetail = () => {
    setShowPaymentDetail(false)
    setSelectedPayment(null)
  }

  // Helper function to get user name
  const getUserName = (userIdParam: string | undefined): string => {
    if (!userIdParam) return 'Utilizator necunoscut'
    // If userName prop is provided (from parent component) and we're viewing a specific user, use it
    // The userIdParam should match the userId we're viewing (the student in the drawer)
    if (userName && userId && userIdParam === userId) {
      return userName
    }
    return 'Student'
  }

  // Helper function to get user avatar
  const getUserAvatar = (userIdParam: string | undefined): string | undefined => {
    if (!userIdParam) return undefined
    // If userAvatarUrl prop is provided (from parent component) and we're viewing a specific user, use it
    // The userIdParam should match the userId we're viewing (the student in the drawer)
    if (userAvatarUrl && userId && userIdParam === userId) {
      return userAvatarUrl
    }
    return undefined
  }

  const getChartOptions = (balance: number | undefined) => ({
    chart: {
      parentHeightOffset: 0,
      toolbar: { show: false },
      sparkline: { enabled: true },
      offsetX: 0,
      offsetY: 0
    },
    stroke: {
      width: 2,
      curve: 'smooth' as const,
      lineCap: 'round' as const
    },
    colors: [getBalanceColor(balance)],
    grid: {
      show: false,
      padding: {
        top: 10,
        bottom: 10,
        left: 10,
        right: 10
      }
    },
    xaxis: {
      labels: { show: false },
      axisTicks: { show: false },
      axisBorder: { show: false },
      crosshairs: { show: false }
    },
    yaxis: {
      labels: { show: false },
      min: undefined,
      max: undefined
    },
    tooltip: {
      enabled: true,
      theme: theme.palette.mode,
      y: {
        formatter: (value: number) => `${value} RON`
      }
    },
    markers: {
      size: 0
    }
  })

  const InnerContent = (
    <Grid container>
      <StyledGrid
        item
        sm={8}
        xs={12}
        sx={{
          '& .apexcharts-series[rel="1"]': { transform: 'translateY(-6px)' },
          '& .apexcharts-series[rel="2"]': { transform: 'translateY(-9px)' }
        }}
      >
        <CardHeader title='Istoric Tranzactii' />
        <CardContent>
          <TableContainer sx={{ maxHeight: 'calc(10 * 73px + 48px)', overflow: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow
                  sx={{ '& .MuiTableCell-root': { py: 2, borderTop: theme => `1px solid ${theme.palette.divider}` } }}
                >
                  <TableCell>Tip</TableCell>
                  <TableCell>Detalii</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Suma</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {/* Pending Bank Transfer Payments */}
                {walletSummary?.pendingBankTransferPayments &&
                  walletSummary.pendingBankTransferPayments.length > 0 &&
                  walletSummary.pendingBankTransferPayments.map((payment: BankTransferPaymentDTO) => (
                    <TableRow
                      key={`pending-${payment.id}`}
                      onClick={() => {
                        const pendingPayment: BankTransferPaymentDTO = {
                          id: payment.id,
                          amount: payment.amount,
                          confirmedAt: payment.confirmedAt
                        }
                        setSelectedPayment(pendingPayment)
                        setShowPaymentDetail(true)
                      }}
                      sx={{
                        '&:last-child .MuiTableCell-root': { pb: theme => `${theme.spacing(6)} !important` },
                        '& .MuiTableCell-root': { border: 0, py: theme => `${theme.spacing(2.25)} !important` },
                        '&:first-of-type .MuiTableCell-root': { pt: theme => `${theme.spacing(4.5)} !important` },
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: 'action.hover'
                        },
                        transition: 'background-color 0.2s ease',
                        animation: `${pulse} 2s infinite`,
                        backgroundColor: 'rgba(255, 152, 0, 0.05)'
                      }}
                    >
                      <TableCell sx={{ width: '140px' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor: 'warning.main'
                            }}
                          >
                            <Icon icon='mdi:clock-outline' color='white' fontSize={20} />
                          </Box>
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography noWrap sx={{ fontWeight: 500, color: 'text.secondary', fontSize: '0.875rem' }}>
                              Transfer bancar
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                          <Typography noWrap sx={{ fontWeight: 500, color: 'warning.main' }}>
                            În așteptare
                          </Typography>
                          <Typography noWrap variant='body2' sx={{ color: 'text.disabled' }}>
                            {payment.creation ? new Date(payment.creation).toLocaleDateString('ro-RO') : ''}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <CustomChip rounded size='small' skin='light' label='În așteptare' color='warning' />
                      </TableCell>
                      <TableCell>
                        <Typography noWrap sx={{ fontWeight: 500, color: 'warning.main' }}>
                          {payment.amount ? `+${payment.amount} RON` : ''}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                {/* Regular Balance Changes */}
                {walletSummary?.balanceChanges?.length ? (
                  walletSummary.balanceChanges.map((row: WalletBalanceChangeDTO) => (
                    <TableRow
                      key={row.id}
                      onClick={() => handleTransactionClick(row)}
                      sx={{
                        '&:last-child .MuiTableCell-root': { pb: theme => `${theme.spacing(6)} !important` },
                        '& .MuiTableCell-root': { border: 0, py: theme => `${theme.spacing(2.25)} !important` },
                        '&:first-of-type .MuiTableCell-root': { pt: theme => `${theme.spacing(4.5)} !important` },
                        cursor: row.referenceType === 'BANK_TRANSFER' ? 'pointer' : 'default',
                        '&:hover': {
                          backgroundColor: row.referenceType === 'BANK_TRANSFER' ? 'action.hover' : 'transparent'
                        },
                        transition: 'background-color 0.2s ease'
                      }}
                    >
                      <TableCell sx={{ width: '140px' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor:
                                row.referenceType === 'BANK_TRANSFER'
                                  ? 'success.main'
                                  : row.referenceType === 'EVENT_ATTENDEE'
                                  ? 'error.main'
                                  : 'grey.300'
                            }}
                          >
                            <Icon
                              icon={
                                row.referenceType === 'BANK_TRANSFER'
                                  ? 'mdi:arrow-up'
                                  : row.referenceType === 'EVENT_ATTENDEE'
                                  ? 'mdi:arrow-down'
                                  : 'mdi:minus'
                              }
                              color='white'
                              fontSize={20}
                            />
                          </Box>
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography noWrap sx={{ fontWeight: 500, color: 'text.secondary', fontSize: '0.875rem' }}>
                              {row.referenceType === 'BANK_TRANSFER'
                                ? 'Transfer bancar'
                                : row.referenceType === 'EVENT_ATTENDEE'
                                ? 'Ședință efecutată'
                                : row.referenceType}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                          <Typography noWrap sx={{ fontWeight: 500, color: 'text.secondary' }}>
                            {row.changeType === 'PAYMENT_CONFIRMED'
                              ? 'Plata confirmata'
                              : row.changeType === 'EVENT_CHARGE'
                              ? 'Taxa sedinta'
                              : row.changeType === 'ADMIN_ADJUSTMENT'
                              ? 'Ajustare admin'
                              : row.changeType}
                          </Typography>
                          <Typography noWrap variant='body2' sx={{ color: 'text.disabled' }}>
                            {row.creation ? new Date(row.creation).toLocaleDateString('ro-RO') : ''}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <CustomChip
                          rounded
                          size='small'
                          skin='light'
                          label={
                            row.changeType === 'PAYMENT_CONFIRMED'
                              ? 'Confirmat'
                              : row.changeType === 'EVENT_CHARGE'
                              ? 'Taxat'
                              : row.changeType === 'ADMIN_ADJUSTMENT'
                              ? 'Ajustat'
                              : 'Procesat'
                          }
                          color={
                            row.changeType === 'PAYMENT_CONFIRMED'
                              ? 'success'
                              : row.changeType === 'EVENT_CHARGE'
                              ? 'error'
                              : row.changeType === 'ADMIN_ADJUSTMENT'
                              ? 'warning'
                              : 'secondary'
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Typography
                          noWrap
                          sx={{ fontWeight: 500, color: row.amount && row.amount > 0 ? 'success.main' : 'error.main' }}
                        >
                          {row.amount ? `${row.amount > 0 ? '+' : ''}${row.amount} RON` : ''}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align='center' sx={{ py: 4 }}>
                      <Typography variant='body2' color='text.disabled'>
                        Nu exista tranzactii disponibile
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </StyledGrid>
      <Grid item xs={12} sm={4}>
        <CardContent
          sx={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'column',
            justifyContent: 'center'
          }}
        >
          <Typography
            variant='h3'
            sx={{
              color: getBalanceColor(walletSummary?.wallet?.balance),
              fontWeight: 600,
              transition: 'color 0.3s ease'
            }}
          >
            {walletSummary?.wallet?.balance !== undefined
              ? `${walletSummary.wallet.balance} ${walletSummary.wallet.currency || 'RON'}`
              : '0 RON'}
          </Typography>
          <Box
            sx={{ mb: 4, gap: 1, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}
          >
            <Typography variant='h6'>Sold Curent</Typography>
          </Box>
          <Box
            sx={{ mb: 6, gap: 1, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}
          >
            <Typography variant='body2' sx={{ color: 'text.secondary' }}>
              {walletSummary?.balanceChanges?.length || 0} tranzactii totale
            </Typography>
          </Box>
          {walletSummary?.balanceChanges && walletSummary.balanceChanges.length > 0 ? (
            <ReactApexcharts
              type='line'
              height={80}
              series={[
                {
                  name: 'Evolutie Balanta',
                  data: walletSummary.balanceChanges
                    .slice(-10) // Last 10 transactions
                    .map(change => change.balanceAfter || 0)
                }
              ]}
              options={getChartOptions(walletSummary?.wallet?.balance)}
            />
          ) : (
            <Box sx={{ height: 80, display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant='body2' color='text.disabled'>
                Nu exista date pentru grafic
              </Typography>
            </Box>
          )}
          {walletSummary?.wallet?.balance !== undefined && walletSummary.wallet.balance <= 0 ? (
            // Only render the primary CTA when allowed (keeps existing component behaviour by default)
            showPaymentButton ? (
              <Button
                onClick={() => router.push('/payment-process')}
                disabled={
                  walletSummary?.pendingBankTransferPayments && walletSummary.pendingBankTransferPayments.length > 0
                }
                sx={{
                  mt: 6,
                  px: 4,
                  py: 1.5,
                  fontSize: '0.875rem',
                  fontWeight: 600
                }}
                variant='contained'
                size='medium'
                color='primary'
              >
                {walletSummary?.pendingBankTransferPayments && walletSummary.pendingBankTransferPayments.length > 0
                  ? 'Plată în așteptare'
                  : 'Mergi către plată'}
              </Button>
            ) : null
          ) : (
            <Button
              sx={{
                mt: 4,
                cursor: 'not-allowed',
                '&.Mui-disabled': {
                  backgroundColor: 'action.disabledBackground',
                  color: 'action.disabled'
                }
              }}
              variant='outlined'
              size='small'
              disabled
            >
              Detalii Wallet
            </Button>
          )}
        </CardContent>
      </Grid>
    </Grid>
  )

  // If the parent wants to disable the card wrapper, return only the inner content.
  if (disableCardWrapper) {
    return (
      <>
        {InnerContent}
        {/* Payment Detail Modal */}
        {selectedPayment && (
          <PaymentDetailCard
            payment={selectedPayment}
            onClose={handleClosePaymentDetail}
            getUserName={getUserName}
            getUserAvatar={getUserAvatar}
            userRole={userRole}
          />
        )}
      </>
    )
  }

  return (
    <>
      <Card>{InnerContent}</Card>
      {/* Payment Detail Modal */}
      {selectedPayment && (
        <PaymentDetailCard
          payment={selectedPayment}
          onClose={handleClosePaymentDetail}
          getUserName={getUserName}
          getUserAvatar={getUserAvatar}
          userRole={userRole}
        />
      )}
    </>
  )
}

export default CrmLastTransaction
