// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Fade,
  Grid,
  Paper,
  Skeleton,
  Typography,
  Avatar,
  Grow,
  Slide,
  Zoom,
  Modal,
  Backdrop
} from '@mui/material'

// Third-party Imports
import { Icon } from '@iconify/react'
import { format } from 'date-fns'
import { ro } from 'date-fns/locale'

// Type Imports
import type { PaymentConfirmationResultDTO } from 'src/generated/profile-service/api'
import type { BankTransferPaymentDTO } from 'src/generated/profile-service'

// API Imports
import { profileServiceClient } from 'src/services'

interface EnhancedPaymentData extends BankTransferPaymentDTO {
  avatar?: string | null
  payerName?: string
}

interface PaymentDetailCardProps {
  payment: EnhancedPaymentData
  onClose: () => void
  getUserName: (userId: string) => string
  getUserAvatar: (userId: string) => string | null
}

const PaymentDetailCard = ({ payment, onClose, getUserName, getUserAvatar }: PaymentDetailCardProps) => {
  // States
  const [basicDetailsLoading, setBasicDetailsLoading] = useState(
    !payment.creation || !payment.confirmedAt || !payment.status || !payment.referenceCode
  )
  const [confirmationResultLoading, setConfirmationResultLoading] = useState(true)
  const [confirmationResult, setConfirmationResult] = useState<PaymentConfirmationResultDTO | null>(null)
  const [downloadingInvoice, setDownloadingInvoice] = useState(false)
  const [open, setOpen] = useState(false)

  // Enhanced payment data with API fallback
  const [enhancedPayment, setEnhancedPayment] = useState({
    creation: payment.creation,
    confirmedAt: payment.confirmedAt,
    status: payment.status,
    referenceCode: payment.referenceCode
  })

  useEffect(() => {
    // Trigger opening animation
    setOpen(true)
    fetchConfirmationDetails()
  }, [])

  // Handle close with exit animation
  const handleClose = () => {
    setOpen(false)
    // Wait for exit animation to complete before calling onClose
    setTimeout(() => {
      onClose()
    }, 400) // Match the exit animation duration
  }

  // Format helpers
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy', { locale: ro })
    } catch {
      return dateString
    }
  }

  const formatTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'HH:mm', { locale: ro })
    } catch {
      return ''
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    return `${amount.toFixed(2)} ${currency}`
  }

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      CONFIRMED: 'Confirmat',
      PENDING: 'În așteptare',
      FAILED: 'Eșuat',
      CANCELLED: 'Anulat'
    }
    return statusMap[status] || status
  }

  const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'default' => {
    const colorMap: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
      CONFIRMED: 'success',
      PENDING: 'warning',
      FAILED: 'error',
      CANCELLED: 'default'
    }
    return colorMap[status] || 'default'
  }

  // Fetch confirmation details
  const fetchConfirmationDetails = async () => {
    if (!payment.id) return

    // Only set loading if we're missing basic payment details
    const needsBasicData = !payment.creation || !payment.confirmedAt || !payment.status || !payment.referenceCode
    if (needsBasicData) {
      setBasicDetailsLoading(true)
    }

    // Always loading confirmation result (wallet balance, allocations)
    setConfirmationResultLoading(true)

    try {
      const response = await profileServiceClient.payment.getConfirmationResult({ paymentId: payment.id })
      setConfirmationResult(response.data)

      // Update enhanced payment data with API response if missing from props
      setEnhancedPayment(prev => ({
        creation: prev.creation || payment.creation || response.data.creation,
        confirmedAt: prev.confirmedAt || response.data.confirmedAt,
        status: prev.status || 'CONFIRMED', // If confirmed, status is confirmed
        referenceCode: prev.referenceCode || response.data.referenceCode || payment.id
      }))
    } catch (error) {
      console.error('Error fetching confirmation details:', error)
      // Even on error, update what we can from payment prop
      setEnhancedPayment(prev => ({
        creation: prev.creation || payment.creation,
        confirmedAt: prev.confirmedAt || payment.confirmedAt,
        status: prev.status || payment.status || 'PENDING',
        referenceCode: prev.referenceCode || payment.referenceCode || payment.id
      }))
    } finally {
      setBasicDetailsLoading(false)
      setConfirmationResultLoading(false)
    }
  } // Download invoice
  const handleDownloadInvoice = async (invoiceId: string) => {
    setDownloadingInvoice(true)
    try {
      const response = await profileServiceClient.invoice.downloadInvoiceById(
        { id: invoiceId },
        { responseType: 'blob' }
      )

      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Factura_${invoiceId}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading invoice:', error)
    } finally {
      setDownloadingInvoice(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          timeout: 500,
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(8px)'
          }
        }
      }}
    >
      <Fade in={open} timeout={500}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '95%', sm: 500 },
            maxHeight: '90vh',
            overflow: 'hidden',
            outline: 'none'
          }}
        >
          <Slide direction='up' in={open} timeout={600}>
            <Paper
              elevation={24}
              sx={{
                bgcolor: 'background.paper',
                borderRadius: 3,
                overflow: 'hidden',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0 24px 64px rgba(0, 0, 0, 0.24), 0 0 0 1px rgba(0, 0, 0, 0.04)'
              }}
            >
              {/* Animated Header with gradient */}
              <Box
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  p: 2,
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background:
                      'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.15) 0%, transparent 50%)',
                    pointerEvents: 'none'
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, position: 'relative', zIndex: 1 }}>
                  <Zoom in={open} timeout={700}>
                    <Avatar
                      src={payment.payerId ? getUserAvatar(payment.payerId) || undefined : undefined}
                      alt={payment.payerId ? getUserName(payment.payerId) : ''}
                      sx={{
                        width: 48,
                        height: 48,
                        fontSize: '1.125rem',
                        fontWeight: 600,
                        bgcolor: 'rgba(255,255,255,0.25)',
                        color: 'white',
                        border: '2px solid rgba(255,255,255,0.4)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                      }}
                    />
                  </Zoom>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant='h6'
                      sx={{
                        fontWeight: 700,
                        fontSize: '1rem',
                        color: 'white',
                        textShadow: '0 2px 4px rgba(0,0,0,0.15)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {payment.payerId ? getUserName(payment.payerId) : 'Unknown'}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                      <Icon icon='tabler:id' fontSize='0.75rem' style={{ color: 'rgba(255,255,255,0.85)' }} />
                      <Typography
                        variant='caption'
                        sx={{
                          fontSize: '0.688rem',
                          color: 'rgba(255,255,255,0.9)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {payment.payerId || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                  <Box
                    onClick={handleClose}
                    sx={{
                      cursor: 'pointer',
                      color: 'rgba(255,255,255,0.9)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        transform: 'rotate(90deg) scale(1.1)'
                      }
                    }}
                  >
                    <Icon icon='tabler:x' fontSize='1.25rem' />
                  </Box>
                </Box>
              </Box>

              {/* Scrollable Content */}
              <Box
                sx={{
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  flex: 1,
                  '&::-webkit-scrollbar': {
                    width: '6px'
                  },
                  '&::-webkit-scrollbar-track': {
                    backgroundColor: 'transparent'
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: 'action.selected',
                    borderRadius: '3px',
                    '&:hover': {
                      backgroundColor: 'action.focus'
                    }
                  }
                }}
              >
                <Box sx={{ p: 2 }}>
                  <Grid container spacing={1.5}>
                    {/* Amount - Compact with animation */}
                    <Grid item xs={12}>
                      <Slide direction='up' in={open} timeout={700}>
                        <Box
                          sx={{
                            textAlign: 'center',
                            py: 2,
                            background:
                              'linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%)',
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: 'divider',
                            position: 'relative',
                            overflow: 'hidden'
                          }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 0.5,
                              mb: 0.5
                            }}
                          >
                            <Icon icon='tabler:coin' fontSize='0.875rem' style={{ opacity: 0.6 }} />
                            <Typography
                              variant='caption'
                              color='text.secondary'
                              sx={{ fontSize: '0.75rem', fontWeight: 500 }}
                            >
                              Sumă Plătită
                            </Typography>
                          </Box>
                          <Typography
                            variant='h3'
                            sx={{
                              fontWeight: 800,
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              backgroundClip: 'text',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                              fontSize: '2rem',
                              letterSpacing: '-0.02em'
                            }}
                          >
                            {formatCurrency(payment.amount || 0, payment.currency || 'RON')}
                          </Typography>
                        </Box>
                      </Slide>
                    </Grid>

                    {/* Status & Details - Compact Row */}
                    <Grid item xs={12}>
                      {basicDetailsLoading && (!payment.status || !payment.referenceCode) ? (
                        <Skeleton variant='rectangular' width='100%' height={66} sx={{ borderRadius: 1.5 }} />
                      ) : (
                        <Fade in={open} timeout={800}>
                          <Box
                            sx={{
                              display: 'flex',
                              gap: 1,
                              p: 1.25,
                              borderRadius: 1.5,
                              bgcolor: 'action.hover',
                              border: '1px solid',
                              borderColor: 'divider'
                            }}
                          >
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.25 }}>
                                <Icon icon='tabler:circle-check' fontSize='0.875rem' style={{ opacity: 0.6 }} />
                                <Typography variant='caption' color='text.secondary' sx={{ fontSize: '0.688rem' }}>
                                  Status
                                </Typography>
                              </Box>
                              <Chip
                                label={getStatusText(enhancedPayment.status || '')}
                                color={getStatusColor(enhancedPayment.status || '')}
                                size='small'
                                sx={{
                                  height: 22,
                                  fontWeight: 600,
                                  fontSize: '0.75rem'
                                }}
                              />
                            </Box>
                            <Divider orientation='vertical' flexItem />
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.25 }}>
                                <Icon icon='tabler:hash' fontSize='0.875rem' style={{ opacity: 0.6 }} />
                                <Typography variant='caption' color='text.secondary' sx={{ fontSize: '0.688rem' }}>
                                  Referință
                                </Typography>
                              </Box>
                              <Typography
                                variant='body2'
                                sx={{
                                  fontFamily: 'monospace',
                                  fontWeight: 600,
                                  fontSize: '0.75rem',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {enhancedPayment.referenceCode || '-'}
                              </Typography>
                            </Box>
                          </Box>
                        </Fade>
                      )}
                    </Grid>

                    {/* Dates - Compact Grid */}
                    <Grid item xs={6}>
                      {basicDetailsLoading && !payment.creation ? (
                        <Skeleton variant='rectangular' width='100%' height={78} sx={{ borderRadius: 1.5 }} />
                      ) : (
                        <Zoom in={open} timeout={900}>
                          <Box
                            sx={{
                              p: 1.25,
                              borderRadius: 1.5,
                              bgcolor: 'action.hover',
                              height: '100%',
                              transition: 'all 0.2s ease-in-out',
                              '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.08)'
                              }
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                              <Icon icon='tabler:clock' fontSize='0.875rem' style={{ opacity: 0.6 }} />
                              <Typography variant='caption' color='text.secondary' sx={{ fontSize: '0.688rem' }}>
                                Creare
                              </Typography>
                            </Box>
                            <Typography variant='body2' sx={{ fontWeight: 600, fontSize: '0.813rem' }}>
                              {enhancedPayment.creation ? formatDate(enhancedPayment.creation) : 'N/A'}
                            </Typography>
                            {enhancedPayment.creation && (
                              <Typography variant='caption' color='text.secondary' sx={{ fontSize: '0.625rem' }}>
                                {formatTime(enhancedPayment.creation)}
                              </Typography>
                            )}
                          </Box>
                        </Zoom>
                      )}
                    </Grid>

                    <Grid item xs={6}>
                      {basicDetailsLoading && !payment.confirmedAt ? (
                        <Skeleton variant='rectangular' width='100%' height={78} sx={{ borderRadius: 1.5 }} />
                      ) : (
                        <Zoom in={open} timeout={1000}>
                          <Box
                            sx={{
                              p: 1.25,
                              borderRadius: 1.5,
                              background:
                                'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(56, 142, 60, 0.1) 100%)',
                              border: '1px solid',
                              borderColor: 'success.light',
                              height: '100%',
                              transition: 'all 0.2s ease-in-out',
                              '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 12px rgba(76, 175, 80, 0.15)'
                              }
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                              <Icon icon='tabler:circle-check' fontSize='0.875rem' style={{ color: '#4caf50' }} />
                              <Typography variant='caption' sx={{ fontSize: '0.688rem', color: 'success.main' }}>
                                Confirmare
                              </Typography>
                            </Box>
                            <Typography
                              variant='body2'
                              sx={{ fontWeight: 600, color: 'success.main', fontSize: '0.813rem' }}
                            >
                              {enhancedPayment.confirmedAt ? formatDate(enhancedPayment.confirmedAt) : 'N/A'}
                            </Typography>
                            {enhancedPayment.confirmedAt && (
                              <Typography
                                variant='caption'
                                sx={{ color: 'success.main', fontSize: '0.625rem', opacity: 0.8 }}
                              >
                                {formatTime(enhancedPayment.confirmedAt)}
                              </Typography>
                            )}
                          </Box>
                        </Zoom>
                      )}
                    </Grid>

                    <Grid item xs={12}>
                      <Divider sx={{ my: 0.5 }} />
                    </Grid>

                    {/* Confirmation Details */}
                    {confirmationResultLoading ? (
                      <>
                        {/* Wallet Balance Skeleton */}
                        <Grid item xs={12}>
                          <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                              <Skeleton variant='circular' width={16} height={16} />
                              <Skeleton variant='text' width={100} height={20} />
                            </Box>
                            <Box
                              sx={{
                                display: 'flex',
                                gap: 1,
                                p: 1.5,
                                background:
                                  'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                                borderRadius: 1.5,
                                border: '1px solid',
                                borderColor: 'divider'
                              }}
                            >
                              <Box
                                sx={{
                                  flex: 1,
                                  textAlign: 'center',
                                  p: 1,
                                  borderRadius: 1,
                                  bgcolor: 'background.paper'
                                }}
                              >
                                <Skeleton variant='text' width={60} height={16} sx={{ mx: 'auto', mb: 0.5 }} />
                                <Skeleton variant='text' width={80} height={28} sx={{ mx: 'auto' }} />
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Skeleton variant='circular' width={20} height={20} />
                              </Box>
                              <Box
                                sx={{
                                  flex: 1,
                                  textAlign: 'center',
                                  p: 1,
                                  borderRadius: 1,
                                  bgcolor: 'success.lighter',
                                  border: '1px solid',
                                  borderColor: 'success.light'
                                }}
                              >
                                <Skeleton variant='text' width={60} height={16} sx={{ mx: 'auto', mb: 0.5 }} />
                                <Skeleton variant='text' width={80} height={28} sx={{ mx: 'auto' }} />
                              </Box>
                            </Box>
                          </Box>
                        </Grid>

                        {/* Allocations Skeleton */}
                        <Grid item xs={12}>
                          <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                              <Skeleton variant='circular' width={16} height={16} />
                              <Skeleton variant='text' width={80} height={20} />
                              <Skeleton variant='rounded' width={24} height={18} sx={{ borderRadius: 2 }} />
                            </Box>
                            <Box
                              sx={{
                                borderRadius: 1.5,
                                border: '1px solid',
                                borderColor: 'divider',
                                overflow: 'hidden'
                              }}
                            >
                              {[1, 2, 3].map((item, index) => (
                                <Box
                                  key={item}
                                  sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    p: 1.25,
                                    bgcolor: index % 2 === 0 ? 'background.paper' : 'action.hover',
                                    borderBottom: index < 2 ? '1px solid' : 'none',
                                    borderColor: 'divider'
                                  }}
                                >
                                  <Box sx={{ flex: 1, minWidth: 0, mr: 1 }}>
                                    <Skeleton variant='text' width='70%' height={20} sx={{ mb: 0.5 }} />
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                      <Skeleton variant='circular' width={12} height={12} />
                                      <Skeleton variant='text' width={100} height={16} />
                                    </Box>
                                  </Box>
                                  <Skeleton variant='text' width={60} height={20} />
                                </Box>
                              ))}
                            </Box>
                          </Box>
                        </Grid>
                      </>
                    ) : (
                      confirmationResult && (
                        <>
                          {/* Wallet Balance - Compact */}
                          {(confirmationResult.walletBalanceBefore !== undefined ||
                            confirmationResult.walletBalanceAfter !== undefined) && (
                            <Grid item xs={12}>
                              <Slide direction='up' in timeout={800}>
                                <Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                                    <Icon icon='tabler:wallet' fontSize='1rem' style={{ opacity: 0.6 }} />
                                    <Typography variant='body2' sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                                      Sold Portofel
                                    </Typography>
                                  </Box>
                                  <Box
                                    sx={{
                                      display: 'flex',
                                      gap: 1,
                                      p: 1.5,
                                      background:
                                        'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                                      borderRadius: 1.5,
                                      border: '1px solid',
                                      borderColor: 'divider'
                                    }}
                                  >
                                    <Box
                                      sx={{
                                        flex: 1,
                                        textAlign: 'center',
                                        p: 1,
                                        borderRadius: 1,
                                        bgcolor: 'background.paper'
                                      }}
                                    >
                                      <Typography
                                        variant='caption'
                                        color='text.secondary'
                                        sx={{ fontSize: '0.688rem' }}
                                      >
                                        Înainte
                                      </Typography>
                                      <Typography variant='h6' sx={{ fontWeight: 700, fontSize: '1rem' }}>
                                        {confirmationResult.walletBalanceBefore?.toFixed(2) || '0.00'}
                                      </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                      <Icon icon='tabler:arrow-right' fontSize='1.25rem' style={{ opacity: 0.4 }} />
                                    </Box>
                                    <Box
                                      sx={{
                                        flex: 1,
                                        textAlign: 'center',
                                        p: 1,
                                        borderRadius: 1,
                                        bgcolor: 'success.lighter',
                                        border: '1px solid',
                                        borderColor: 'success.light'
                                      }}
                                    >
                                      <Typography
                                        variant='caption'
                                        sx={{ fontSize: '0.688rem', color: 'success.main' }}
                                      >
                                        După
                                      </Typography>
                                      <Typography
                                        variant='h6'
                                        sx={{ fontWeight: 700, color: 'success.main', fontSize: '1rem' }}
                                      >
                                        {confirmationResult.walletBalanceAfter?.toFixed(2) || '0.00'}
                                      </Typography>
                                    </Box>
                                  </Box>
                                </Box>
                              </Slide>
                            </Grid>
                          )}

                          {/* Allocations - Slim List */}
                          {confirmationResult.allocations && confirmationResult.allocations.length > 0 && (
                            <Grid item xs={12}>
                              <Slide direction='up' in timeout={900}>
                                <Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                                    <Icon icon='tabler:receipt' fontSize='1rem' style={{ opacity: 0.6 }} />
                                    <Typography variant='body2' sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                                      Alocări
                                    </Typography>
                                    <Chip
                                      label={confirmationResult.allocations.length}
                                      size='small'
                                      sx={{
                                        height: 18,
                                        fontSize: '0.688rem',
                                        fontWeight: 600,
                                        bgcolor: 'primary.main',
                                        color: 'white',
                                        '& .MuiChip-label': { px: 0.75 }
                                      }}
                                    />
                                  </Box>
                                  <Box
                                    sx={{
                                      borderRadius: 1.5,
                                      border: '1px solid',
                                      borderColor: 'divider',
                                      overflow: 'hidden'
                                    }}
                                  >
                                    {confirmationResult.allocations.map((allocation, index) => (
                                      <Zoom
                                        key={index}
                                        in
                                        timeout={1000 + index * 80}
                                        style={{ transitionDelay: `${index * 40}ms` }}
                                      >
                                        <Box
                                          sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            p: 1.25,
                                            bgcolor: index % 2 === 0 ? 'background.paper' : 'action.hover',
                                            borderBottom:
                                              index < confirmationResult.allocations!.length - 1 ? '1px solid' : 'none',
                                            borderColor: 'divider',
                                            transition: 'all 0.2s ease-in-out',
                                            '&:hover': {
                                              bgcolor: 'action.selected',
                                              transform: 'translateX(4px)'
                                            }
                                          }}
                                        >
                                          <Box sx={{ flex: 1, minWidth: 0, mr: 1 }}>
                                            <Typography
                                              variant='body2'
                                              sx={{
                                                fontWeight: 600,
                                                fontSize: '0.813rem',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                mb: 0.25
                                              }}
                                            >
                                              {allocation.eventTitle || 'Event'}
                                            </Typography>
                                            {allocation.eventDate && (
                                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <Icon
                                                  icon='tabler:calendar-event'
                                                  fontSize='0.75rem'
                                                  style={{ opacity: 0.6 }}
                                                />
                                                <Typography
                                                  variant='caption'
                                                  color='text.secondary'
                                                  sx={{ fontSize: '0.688rem' }}
                                                >
                                                  {formatDate(allocation.eventDate)}
                                                </Typography>
                                              </Box>
                                            )}
                                          </Box>
                                          <Typography
                                            variant='body2'
                                            sx={{
                                              fontWeight: 700,
                                              color: 'primary.main',
                                              fontSize: '0.875rem',
                                              flexShrink: 0
                                            }}
                                          >
                                            {allocation.allocatedAmount?.toFixed(2)}{' '}
                                            {confirmationResult.currency || 'RON'}
                                          </Typography>
                                        </Box>
                                      </Zoom>
                                    ))}

                                    {/* Total - Highlighted Footer */}
                                    {confirmationResult.totalAllocated !== undefined && (
                                      <Box
                                        sx={{
                                          display: 'flex',
                                          justifyContent: 'space-between',
                                          alignItems: 'center',
                                          p: 1.5,
                                          bgcolor: 'action.selected',
                                          borderTop: '2px solid',
                                          borderColor: 'primary.main'
                                        }}
                                      >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                          <Icon icon='tabler:sum' fontSize='1rem' />
                                          <Typography variant='body2' sx={{ fontWeight: 700, fontSize: '0.875rem' }}>
                                            Total Alocat
                                          </Typography>
                                        </Box>
                                        <Typography
                                          variant='h6'
                                          sx={{
                                            fontWeight: 800,
                                            color: 'primary.main',
                                            fontSize: '1rem'
                                          }}
                                        >
                                          {confirmationResult.totalAllocated.toFixed(2)}{' '}
                                          {confirmationResult.currency || 'RON'}
                                        </Typography>
                                      </Box>
                                    )}
                                  </Box>
                                </Box>
                              </Slide>
                            </Grid>
                          )}

                          {/* Invoice - Compact */}
                          {confirmationResult.invoice && (
                            <Grid item xs={12}>
                              <Fade in timeout={1000}>
                                <Box>
                                  <Divider sx={{ my: 1 }} />
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                                    <Icon icon='tabler:file-invoice' fontSize='1rem' style={{ opacity: 0.6 }} />
                                    <Typography variant='body2' sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                                      Factură
                                    </Typography>
                                  </Box>
                                  <Box
                                    sx={{
                                      p: 1.5,
                                      bgcolor: 'action.hover',
                                      borderRadius: 1.5,
                                      border: '1px solid',
                                      borderColor: 'divider'
                                    }}
                                  >
                                    <Box
                                      sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        mb: 1
                                      }}
                                    >
                                      <Typography variant='body2' sx={{ fontWeight: 600, fontSize: '0.813rem' }}>
                                        {confirmationResult.invoice.number || `#${confirmationResult.invoice.id}`}
                                      </Typography>
                                      <Chip
                                        label={confirmationResult.invoice.status || 'Emis'}
                                        size='small'
                                        color='success'
                                        sx={{ height: 20, fontSize: '0.688rem' }}
                                      />
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                                      {confirmationResult.invoice.issueDate && (
                                        <Typography
                                          variant='caption'
                                          color='text.secondary'
                                          sx={{ fontSize: '0.688rem' }}
                                        >
                                          {formatDate(confirmationResult.invoice.issueDate)}
                                        </Typography>
                                      )}
                                      {confirmationResult.invoice.totalAmount !== undefined && (
                                        <Typography variant='body2' sx={{ fontWeight: 600, fontSize: '0.813rem' }}>
                                          {confirmationResult.invoice.totalAmount.toFixed(2)}{' '}
                                          {confirmationResult.invoice.currencyCode || 'RON'}
                                        </Typography>
                                      )}
                                    </Box>
                                    {confirmationResult.invoice.id && (
                                      <Button
                                        fullWidth
                                        variant='contained'
                                        size='small'
                                        startIcon={
                                          downloadingInvoice ? (
                                            <CircularProgress size={14} color='inherit' />
                                          ) : (
                                            <Icon icon='tabler:download' fontSize='1rem' />
                                          )
                                        }
                                        onClick={() => handleDownloadInvoice(confirmationResult.invoice!.id!)}
                                        disabled={downloadingInvoice}
                                        sx={{
                                          py: 0.75,
                                          fontSize: '0.813rem',
                                          fontWeight: 600,
                                          transition: 'all 0.2s ease-in-out',
                                          '&:hover': {
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                                          }
                                        }}
                                      >
                                        {downloadingInvoice ? 'Se descarcă...' : 'Descarcă Factură'}
                                      </Button>
                                    )}
                                  </Box>
                                </Box>
                              </Fade>
                            </Grid>
                          )}
                        </>
                      )
                    )}
                  </Grid>
                </Box>
              </Box>
            </Paper>
          </Slide>
        </Box>
      </Fade>
    </Modal>
  )
}

export default PaymentDetailCard
