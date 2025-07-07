import React, { useState, useMemo, useCallback } from 'react'
import {
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  Paper,
  Divider,
  Alert,
  CircularProgress,
  InputAdornment,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  AttachMoney as MoneyIcon,
  Person as PersonIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Edit as EditIcon,
  Cancel as CancelIcon
} from '@mui/icons-material'
import { useDispatch } from 'react-redux'
import {
  setEventOccurrenceAttendeePrice,
  setRecurringSeriesAttendeePrice,
  setSingularEventAttendeePrice,
  getAttendees
} from 'src/store/apps/calendar/index'
import {
  AttendeeWithPhoto,
  AttendeeWithPricing,
  getAttendeesFromStudentIds,
  mergeAttendeesWithPricing,
  getAttendeeDisplayName,
  getAttendeeInitials,
  getAttendeeAvatar,
  getAttendeeId,
  calculateAttendeeStats,
  validateAttendeePricing
} from '../utils/attendeeUtils'
import { formatPrice, validatePrice } from '../utils/pricingUtils'

interface AttendeePricingManagerProps {
  // Event data
  eventId?: string
  seriesId?: string
  occurrenceId?: string
  eventType: 'singular' | 'recurring' | 'occurrence'

  // Attendee data
  attendeeIds: string[]
  students: any[]
  attendeePrices?: { [key: string]: number }
  defaultPrice?: number

  // State
  isReadOnly?: boolean

  // Callbacks
  onPricingUpdated?: () => void
}

const AttendeePricingManager: React.FC<AttendeePricingManagerProps> = ({
  eventId,
  seriesId,
  occurrenceId,
  eventType,
  attendeeIds,
  students,
  attendeePrices = {},
  defaultPrice = 0,
  isReadOnly = false,
  onPricingUpdated
}) => {
  const dispatch = useDispatch()
  const [isLoading, setIsLoading] = useState(false)
  const [localPrices, setLocalPrices] = useState<{ [key: string]: number }>({})
  const [editingPrices, setEditingPrices] = useState<{ [key: string]: boolean }>({})
  const [tempPrices, setTempPrices] = useState<{ [key: string]: string }>({})
  const [saveStatus, setSaveStatus] = useState<{ [key: string]: 'saving' | 'success' | 'error' }>({})
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    attendeeId: string
    attendeeName: string
    newPrice: number
  }>({ open: false, attendeeId: '', attendeeName: '', newPrice: 0 })

  // Get attendees with pricing information
  const attendees = useMemo(() => {
    const attendeesWithPhotos = getAttendeesFromStudentIds(attendeeIds, students)
    const mergedPrices = { ...attendeePrices, ...localPrices }
    return mergeAttendeesWithPricing(attendeesWithPhotos, mergedPrices, defaultPrice)
  }, [attendeeIds, students, attendeePrices, localPrices, defaultPrice])

  // Calculate statistics
  const stats = useMemo(() => {
    return calculateAttendeeStats(attendees)
  }, [attendees])

  // Validate pricing
  const validation = useMemo(() => {
    return validateAttendeePricing(attendees)
  }, [attendees])

  const handleStartEdit = (attendeeId: string, currentPrice: number) => {
    setEditingPrices(prev => ({ ...prev, [attendeeId]: true }))
    setTempPrices(prev => ({ ...prev, [attendeeId]: currentPrice.toString() }))
  }

  const handleCancelEdit = (attendeeId: string) => {
    setEditingPrices(prev => ({ ...prev, [attendeeId]: false }))
    setTempPrices(prev => {
      const newPrices = { ...prev }
      delete newPrices[attendeeId]
      return newPrices
    })
  }

  const handleConfirmPriceChange = useCallback(async () => {
    const { attendeeId, newPrice } = confirmDialog

    setIsLoading(true)
    setSaveStatus(prev => ({ ...prev, [attendeeId]: 'saving' }))

    try {
      const priceValidation = validatePrice(newPrice)
      if (!priceValidation.isValid) {
        throw new Error(priceValidation.message)
      }

      // Call the appropriate API based on event type
      if (eventType === 'singular' && eventId) {
        await (dispatch as any)(
          setSingularEventAttendeePrice({
            eventId,
            attendeeId,
            price: newPrice
          })
        )
      } else if (eventType === 'recurring' && seriesId) {
        await (dispatch as any)(
          setRecurringSeriesAttendeePrice({
            seriesId,
            attendeeId,
            price: newPrice
          })
        )
      } else if (eventType === 'occurrence' && occurrenceId) {
        await (dispatch as any)(
          setEventOccurrenceAttendeePrice({
            occurrenceId,
            attendeeId,
            price: newPrice
          })
        )
      } else {
        throw new Error('Invalid event configuration')
      }

      // Update local state
      setLocalPrices(prev => ({ ...prev, [attendeeId]: newPrice }))
      setEditingPrices(prev => ({ ...prev, [attendeeId]: false }))
      setTempPrices(prev => {
        const newPrices = { ...prev }
        delete newPrices[attendeeId]
        return newPrices
      })
      setSaveStatus(prev => ({ ...prev, [attendeeId]: 'success' }))

      // Clear success status after 2 seconds
      setTimeout(() => {
        setSaveStatus(prev => ({ ...prev, [attendeeId]: undefined }))
      }, 2000)

      onPricingUpdated?.()
    } catch (error) {
      console.error('Failed to update attendee price:', error)
      setSaveStatus(prev => ({ ...prev, [attendeeId]: 'error' }))

      // Clear error status after 3 seconds
      setTimeout(() => {
        setSaveStatus(prev => ({ ...prev, [attendeeId]: undefined }))
      }, 3000)
    } finally {
      setIsLoading(false)
      setConfirmDialog({ open: false, attendeeId: '', attendeeName: '', newPrice: 0 })
    }
  }, [confirmDialog, dispatch, eventType, eventId, seriesId, occurrenceId, onPricingUpdated])

  const handleSavePrice = (attendeeId: string) => {
    const priceStr = tempPrices[attendeeId]
    const newPrice = parseFloat(priceStr)

    if (isNaN(newPrice) || newPrice < 0) {
      alert('Please enter a valid price (0 or positive number)')
      return
    }

    const attendee = attendees.find(a => getAttendeeId(a) === attendeeId)
    const attendeeName = attendee ? getAttendeeDisplayName(attendee) : 'Unknown'

    setConfirmDialog({
      open: true,
      attendeeId,
      attendeeName,
      newPrice
    })
  }

  const handleRefreshAttendees = useCallback(async () => {
    setIsLoading(true)
    try {
      if (seriesId) {
        await (dispatch as any)(getAttendees({ seriesId }))
      } else if (occurrenceId) {
        await (dispatch as any)(getAttendees({ occurrenceId }))
      }
    } catch (error) {
      console.error('Failed to refresh attendees:', error)
    } finally {
      setIsLoading(false)
    }
  }, [dispatch, seriesId, occurrenceId])

  const renderAttendeeItem = (attendee: AttendeeWithPricing, index: number) => {
    const attendeeId = getAttendeeId(attendee)
    const displayName = getAttendeeDisplayName(attendee)
    const avatar = getAttendeeAvatar(attendee)
    const initials = getAttendeeInitials(attendee)
    const isEditing = editingPrices[attendeeId]
    const status = saveStatus[attendeeId]

    return (
      <ListItem key={attendeeId || index} divider>
        <ListItemAvatar>
          <Avatar src={avatar || undefined} sx={{ width: 40, height: 40 }}>
            {avatar ? null : initials}
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant='body1'>{displayName}</Typography>
              {attendee.hasCustomPrice && <Chip label='Custom Price' size='small' color='primary' variant='outlined' />}
              {status === 'success' && <CheckCircleIcon color='success' fontSize='small' />}
              {status === 'error' && <WarningIcon color='error' fontSize='small' />}
            </Box>
          }
          secondary={
            <Box>
              <Typography variant='body2' color='text.secondary'>
                {attendee.email || attendee.studentData?.email || 'No email'}
              </Typography>
              <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant='body2' color='text.secondary'>
                  Price: {formatPrice(attendee.price || 0)}
                </Typography>
                {attendee.priceStatus === 'not-set' && (
                  <Chip label='Not Set' size='small' color='warning' variant='outlined' />
                )}
              </Box>
            </Box>
          }
        />
        {!isReadOnly && (
          <ListItemSecondaryAction>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {isEditing ? (
                <>
                  <TextField
                    size='small'
                    type='number'
                    value={tempPrices[attendeeId] || ''}
                    onChange={e =>
                      setTempPrices(prev => ({
                        ...prev,
                        [attendeeId]: e.target.value
                      }))
                    }
                    placeholder={defaultPrice.toString()}
                    sx={{ width: 100 }}
                    InputProps={{
                      startAdornment: <InputAdornment position='start'>RON</InputAdornment>
                    }}
                    disabled={status === 'saving'}
                  />
                  <IconButton
                    size='small'
                    onClick={() => handleSavePrice(attendeeId)}
                    color='primary'
                    disabled={status === 'saving'}
                  >
                    {status === 'saving' ? <CircularProgress size={16} /> : <SaveIcon />}
                  </IconButton>
                  <IconButton size='small' onClick={() => handleCancelEdit(attendeeId)} disabled={status === 'saving'}>
                    <CancelIcon />
                  </IconButton>
                </>
              ) : (
                <Tooltip title='Edit price'>
                  <IconButton
                    size='small'
                    onClick={() => handleStartEdit(attendeeId, attendee.price || 0)}
                    disabled={isLoading}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </ListItemSecondaryAction>
        )}
      </ListItem>
    )
  }

  if (attendees.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <PersonIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
        <Typography variant='h6' color='text.secondary'>
          No attendees found
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          Add attendees to manage their pricing
        </Typography>
      </Paper>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Statistics */}
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant='h6' sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <MoneyIcon />
            Pricing Overview
          </Typography>
          <Tooltip title='Refresh attendee data'>
            <IconButton onClick={handleRefreshAttendees} disabled={isLoading}>
              {isLoading ? <CircularProgress size={20} /> : <RefreshIcon />}
            </IconButton>
          </Tooltip>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          <Chip label={`${stats.totalAttendees} Attendees`} icon={<PersonIcon />} />
          <Chip label={`${stats.attendeesWithCustomPrice} Custom Prices`} color='primary' variant='outlined' />
          <Chip label={`Total Revenue: ${formatPrice(stats.totalRevenue)}`} color='success' variant='outlined' />
          <Chip label={`Avg: ${formatPrice(stats.averagePrice)}`} color='info' variant='outlined' />
        </Box>

        {!validation.isValid && (
          <Alert severity='warning'>
            <Typography variant='body2' sx={{ fontWeight: 'bold' }}>
              Pricing Issues:
            </Typography>
            <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
              {validation.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </Alert>
        )}
      </Paper>

      {/* Attendees List */}
      <Paper>
        <Box sx={{ p: 2 }}>
          <Typography variant='h6'>Attendee Pricing ({attendees.length})</Typography>
        </Box>
        <Divider />
        <List sx={{ maxHeight: 400, overflowY: 'auto' }}>{attendees.map(renderAttendeeItem)}</List>
      </Paper>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}>
        <DialogTitle>Confirm Price Change</DialogTitle>
        <DialogContent>
          <Typography>
            Set price for <strong>{confirmDialog.attendeeName}</strong> to{' '}
            <strong>{formatPrice(confirmDialog.newPrice)}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}>Cancel</Button>
          <Button onClick={handleConfirmPriceChange} variant='contained' disabled={isLoading}>
            {isLoading ? <CircularProgress size={20} /> : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default AttendeePricingManager
