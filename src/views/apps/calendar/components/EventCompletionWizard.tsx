// ** React Imports
import React, { useState, useMemo, useEffect } from 'react'
import { Controller } from 'react-hook-form'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import StepContent from '@mui/material/StepContent'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import Divider from '@mui/material/Divider'
import Alert from '@mui/material/Alert'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Paper from '@mui/material/Paper'
import Grid from '@mui/material/Grid'
import { useTheme } from '@mui/material/styles'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Components
import AttendeeManager from './AttendeeManager'

// ** Types
import { EventAttendeeDTO } from 'src/generated/profile-service'
import { StudentData } from './AttendeeManager'

// ** Utils
import { format, addMinutes, isValid } from 'date-fns'
import dayjs from 'dayjs'

// Utility function to parse ISO 8601 duration (e.g., "PT1H30M") to minutes
const parseDurationToMinutes = (duration: string): number => {
  if (!duration || typeof duration !== 'string') return 60 // Default to 1 hour

  // Handle already converted minutes (number or string number)
  if (!duration.startsWith('PT')) {
    const minutes = parseInt(duration.toString(), 10)
    return isNaN(minutes) ? 60 : minutes
  }

  // Parse ISO 8601 duration format PT1H30M
  const regex = /^PT(?:(\d+)H)?(?:(\d+)M)?$/
  const matches = duration.match(regex)

  if (!matches) return 60 // Default fallback

  const hours = parseInt(matches[1] || '0', 10)
  const minutes = parseInt(matches[2] || '0', 10)

  return hours * 60 + minutes
}

// Utility function to format duration minutes to human readable
const formatDurationMinutes = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (remainingMinutes === 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`
  }

  return `${hours}h ${remainingMinutes}min`
}

interface EventCompletionWizardProps {
  selectedEvent: any
  students: StudentData[]
  onComplete: (completionData: EventCompletionData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

interface EventCompletionData {
  actualStartTime: string
  actualEndTime: string
  description?: string
  adjustPricesWithDuration: boolean
  eventAttendees: EventAttendeeDTO[]
}

const EventCompletionWizard: React.FC<EventCompletionWizardProps> = ({
  selectedEvent,
  students,
  onComplete,
  onCancel,
  isLoading = false
}) => {
  const theme = useTheme()
  const [activeStep, setActiveStep] = useState(0)

  // Form state
  const [actualStartTime, setActualStartTime] = useState<dayjs.Dayjs | null>(null)
  const [actualEndTime, setActualEndTime] = useState<dayjs.Dayjs | null>(null)
  const [description, setDescription] = useState('')
  const [adjustPricesWithDuration, setAdjustPricesWithDuration] = useState(false)
  const [eventAttendees, setEventAttendees] = useState<EventAttendeeDTO[]>([])

  // Initialize form data from selected event
  useEffect(() => {
    if (selectedEvent) {
      // Debug: Log the selected event to see what duration formats we're getting
      console.log('EventCompletionWizard - selectedEvent:', {
        seriesDuration: selectedEvent.seriesDuration,
        duration: selectedEvent.duration,
        effectiveStartTime: selectedEvent.effectiveStartTime,
        start: selectedEvent.start,
        seriesPrice: selectedEvent.seriesPrice,
        price: selectedEvent.price
      })

      // Set initial start time to the event's scheduled start time
      const eventStart = dayjs(selectedEvent.effectiveStartTime || selectedEvent.start)
      setActualStartTime(eventStart)

      // Parse duration from various possible formats
      const rawDuration = selectedEvent.seriesDuration || selectedEvent.duration
      const durationMinutes = parseDurationToMinutes(rawDuration)

      console.log('EventCompletionWizard - Duration parsing:', {
        rawDuration,
        parsedMinutes: durationMinutes,
        formatted: formatDurationMinutes(durationMinutes)
      })

      const calculatedEndTime = eventStart.add(durationMinutes, 'minutes')
      setActualEndTime(calculatedEndTime)

      // Get default price from series or event
      const defaultPrice = selectedEvent.seriesPrice || selectedEvent.price || 0

      // Initialize attendees from the event
      const existingAttendees = selectedEvent.eventAttendees || []
      const initialAttendees = existingAttendees.map((attendee: any) => ({
        id: attendee.id,
        attendeeId: attendee.attendeeId,
        hasCustomPricing: attendee.hasCustomPricing || false,
        customPrice: attendee.customPrice || defaultPrice,
        originalPrice: attendee.customPrice || defaultPrice, // Store original price for duration adjustments
        expected: true, // All attendees are expected by default
        attended: true // All expected attendees are attended by default
      }))
      setEventAttendees(initialAttendees)
    }
  }, [selectedEvent])

  // Get default price for the event
  const defaultPrice = useMemo(() => {
    return selectedEvent?.seriesPrice || selectedEvent?.price || 0
  }, [selectedEvent])

  // Get planned duration for the event (in minutes)
  const plannedDuration = useMemo(() => {
    const rawDuration = selectedEvent?.seriesDuration || selectedEvent?.duration
    return parseDurationToMinutes(rawDuration)
  }, [selectedEvent])

  // Get human readable planned duration
  const plannedDurationText = useMemo(() => {
    return formatDurationMinutes(plannedDuration)
  }, [plannedDuration])

  // Calculate duration difference for price adjustment
  const durationInfo = useMemo(() => {
    if (!actualStartTime || !actualEndTime) {
      return null
    }

    const actualDurationMinutes = Math.max(0, actualEndTime.diff(actualStartTime, 'minutes'))
    const durationDifference = actualDurationMinutes - plannedDuration
    const durationPercentage = plannedDuration > 0 ? (actualDurationMinutes / plannedDuration) * 100 : 100

    return {
      actualDurationMinutes,
      plannedDurationMinutes: plannedDuration,
      durationDifference,
      durationPercentage,
      isLonger: durationDifference > 0,
      isShorter: durationDifference < 0
    }
  }, [actualStartTime, actualEndTime, plannedDuration])

  // Calculate adjusted prices for attendees
  const adjustedAttendees = useMemo(() => {
    if (!adjustPricesWithDuration || !durationInfo) {
      return eventAttendees
    }

    return eventAttendees.map(attendee => {
      // Use original price for adjustment calculation, not the current customPrice
      // This prevents compounding adjustments when toggling attended status
      const originalPrice =
        (attendee as any).originalPrice || (attendee.hasCustomPricing ? attendee.customPrice || 0 : defaultPrice)
      const adjustedPrice = originalPrice * (durationInfo.durationPercentage / 100)

      return {
        ...attendee,
        customPrice: Math.round(adjustedPrice * 100) / 100, // Round to 2 decimal places
        hasCustomPricing: adjustPricesWithDuration || attendee.hasCustomPricing
      }
    })
  }, [eventAttendees, adjustPricesWithDuration, durationInfo, defaultPrice]) // Validation
  const canProceedToStep = (step: number) => {
    switch (step) {
      case 0: // Time & Duration
        return actualStartTime && actualEndTime && actualEndTime.isAfter(actualStartTime)
      case 1: // Description (optional, always can proceed)
        return true
      case 2: // Price Adjustment (always can proceed)
        return true
      case 3: // Attendees
        return adjustedAttendees.length > 0
      default:
        return false
    }
  }

  // Event handlers
  const handleNext = () => {
    if (canProceedToStep(activeStep)) {
      setActiveStep(prevStep => prevStep + 1)
    }
  }

  const handleBack = () => {
    setActiveStep(prevStep => prevStep - 1)
  }

  const handleStepClick = (step: number) => {
    // Allow navigation to any previous step, or next step if current is valid
    if (step <= activeStep || canProceedToStep(activeStep)) {
      setActiveStep(step)
    }
  }

  const handleComplete = async () => {
    if (!actualStartTime || !actualEndTime) return

    const completionData: EventCompletionData = {
      actualStartTime: actualStartTime.toISOString(),
      actualEndTime: actualEndTime.toISOString(),
      description: description.trim() || undefined,
      adjustPricesWithDuration,
      eventAttendees: adjustedAttendees
    }

    try {
      await onComplete(completionData)
    } catch (error) {
      console.error('EventCompletionWizard - Error in onComplete:', error)
    }
  }

  // Custom handler to preserve original prices when attendees change
  const handleAttendeesChange = (updatedAttendees: EventAttendeeDTO[]) => {
    const attendeesWithPreservedPrices = updatedAttendees.map(updatedAttendee => {
      const existingAttendee = eventAttendees.find(existing => existing.attendeeId === updatedAttendee.attendeeId)

      if (existingAttendee && (existingAttendee as any).originalPrice !== undefined) {
        // If only attendance status changed, preserve original price to prevent compounding
        const onlyAttendanceChanged =
          existingAttendee.customPrice === updatedAttendee.customPrice &&
          existingAttendee.attended !== updatedAttendee.attended

        if (onlyAttendanceChanged) {
          return {
            ...updatedAttendee,
            originalPrice: (existingAttendee as any).originalPrice
          }
        }

        // If price was manually changed, update original price to the new value
        if (existingAttendee.customPrice !== updatedAttendee.customPrice) {
          return {
            ...updatedAttendee,
            originalPrice: updatedAttendee.customPrice
          }
        }

        // Default: preserve original price
        return {
          ...updatedAttendee,
          originalPrice: (existingAttendee as any).originalPrice
        }
      }

      return updatedAttendee
    })

    setEventAttendees(attendeesWithPreservedPrices)
  } // Steps configuration
  const steps = [
    {
      label: 'Actual Times & Duration',
      icon: 'tabler:clock',
      description: 'Set the actual start and end times for this event'
    },
    {
      label: 'Event Description',
      icon: 'tabler:notes',
      description: 'Add an optional description or notes about the event'
    },
    {
      label: 'Price Adjustment',
      icon: 'tabler:currency-dollar',
      description: 'Choose whether to adjust prices based on actual duration'
    },
    {
      label: 'Manage Attendees',
      icon: 'tabler:users',
      description: 'Confirm attendance and customize pricing for each attendee'
    }
  ]

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card variant='outlined' sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant='h6' gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Icon icon='tabler:info-circle' />
                    Event Information
                  </Typography>
                  <Typography variant='body2' color='textSecondary' gutterBottom>
                    {selectedEvent?.seriesTitle || selectedEvent?.title || 'Event'}
                  </Typography>
                  <Typography variant='caption' color='textSecondary' display='block' gutterBottom>
                    Scheduled: {actualStartTime && actualStartTime.format('MMM DD, YYYY [at] HH:mm')} →{' '}
                    {actualStartTime && actualStartTime.add(plannedDuration, 'minutes').format('HH:mm')}
                  </Typography>
                  <Stack direction='row' spacing={1} sx={{ mt: 1 }} flexWrap='wrap' useFlexGap>
                    <Chip label={`Planned Duration: ${plannedDurationText}`} variant='outlined' size='small' />
                    <Chip
                      label={`Base Price: $${selectedEvent?.seriesPrice || selectedEvent?.price || 0}`}
                      variant='outlined'
                      size='small'
                    />
                    <Chip
                      label={`Attendees: ${selectedEvent?.eventAttendees?.length || 0}`}
                      variant='outlined'
                      size='small'
                    />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateTimePicker
                  label='Actual Start Time'
                  value={actualStartTime}
                  onChange={newValue => setActualStartTime(newValue)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      helperText: 'When did the event actually start?'
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateTimePicker
                  label='Actual End Time'
                  value={actualEndTime}
                  onChange={newValue => setActualEndTime(newValue)}
                  minDateTime={actualStartTime}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      helperText: 'When did the event actually end?'
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>

            {durationInfo && (
              <Grid item xs={12}>
                <Alert
                  severity={durationInfo.isLonger ? 'info' : durationInfo.isShorter ? 'warning' : 'success'}
                  sx={{ mt: 2 }}
                >
                  <Typography variant='body2'>
                    <strong>Duration Analysis:</strong> The actual event duration is{' '}
                    {formatDurationMinutes(Math.round(durationInfo.actualDurationMinutes))}
                    {durationInfo.durationDifference !== 0 && (
                      <>
                        {' '}
                        ({durationInfo.isLonger ? '+' : ''}
                        {formatDurationMinutes(Math.abs(Math.round(durationInfo.durationDifference)))}{' '}
                        {durationInfo.isLonger ? 'longer' : 'shorter'} than planned)
                      </>
                    )}
                  </Typography>
                  {durationInfo.durationDifference !== 0 && (
                    <Typography variant='caption' display='block' sx={{ mt: 0.5 }}>
                      This represents {Math.round(durationInfo.durationPercentage)}% of the planned duration.
                    </Typography>
                  )}
                </Alert>
              </Grid>
            )}
          </Grid>
        )

      case 1:
        return (
          <Box>
            <TextField
              fullWidth
              multiline
              rows={4}
              label='Event Description'
              placeholder='Add any notes about how the event went, key topics covered, or other relevant information...'
              value={description}
              onChange={e => setDescription(e.target.value)}
              helperText='This description is optional but can be helpful for future reference'
              sx={{ mb: 2 }}
            />
            <Alert severity='info' sx={{ mt: 2 }}>
              <Typography variant='body2'>
                💡 <strong>Tip:</strong> Consider adding information about:
              </Typography>
              <Typography variant='body2' component='div' sx={{ mt: 1, ml: 2 }}>
                • Key topics covered
                <br />
                • Student engagement level
                <br />
                • Any technical issues
                <br />
                • Homework assigned
                <br />• Next session preparation notes
              </Typography>
            </Alert>
          </Box>
        )

      case 2:
        return (
          <Box>
            <FormControlLabel
              control={
                <Checkbox
                  checked={adjustPricesWithDuration}
                  onChange={e => setAdjustPricesWithDuration(e.target.checked)}
                  color='primary'
                />
              }
              label='Adjust prices proportionally based on actual duration'
              sx={{ mb: 3 }}
            />

            {durationInfo && (
              <Card variant='outlined' sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant='h6' gutterBottom>
                    Price Adjustment Preview
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <Typography variant='body2' color='textSecondary'>
                        Planned Duration
                      </Typography>
                      <Typography variant='h6'>{formatDurationMinutes(durationInfo.plannedDurationMinutes)}</Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant='body2' color='textSecondary'>
                        Actual Duration
                      </Typography>
                      <Typography variant='h6'>
                        {formatDurationMinutes(Math.round(durationInfo.actualDurationMinutes))}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant='body2' color='textSecondary'>
                        Duration Factor
                      </Typography>
                      <Typography variant='h6'>{Math.round(durationInfo.durationPercentage)}%</Typography>
                    </Grid>
                  </Grid>

                  {adjustPricesWithDuration && (
                    <Alert severity='info' sx={{ mt: 2 }}>
                      <Typography variant='body2'>
                        Prices will be adjusted to {Math.round(durationInfo.durationPercentage)}% of the original price
                        for all attendees (unless they already have custom pricing).
                      </Typography>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}

            <Alert severity={adjustPricesWithDuration ? 'warning' : 'info'}>
              <Typography variant='body2'>
                {adjustPricesWithDuration ? (
                  <>
                    <strong>Price adjustment enabled:</strong> All attendee prices will be adjusted based on the actual
                    event duration. You can still customize individual prices in the next step.
                  </>
                ) : (
                  <>
                    <strong>No price adjustment:</strong> Attendee prices will remain as originally set. You can still
                    customize individual prices in the next step.
                  </>
                )}
              </Typography>
            </Alert>
          </Box>
        )

      case 3:
        return (
          <Box>
            <Typography variant='h6' gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Icon icon='tabler:users' />
              Manage Event Attendees
            </Typography>

            <Typography variant='body2' color='textSecondary' paragraph>
              Review and confirm the attendees for this event. You can mark who actually attended and customize pricing
              for individual students if needed.
            </Typography>

            <AttendeeManager
              students={students}
              attendees={adjustedAttendees}
              onAttendeesChange={handleAttendeesChange}
              defaultPrice={defaultPrice}
              eventType='occurrence'
              showPricing={true}
              showAttendanceTracking={true}
              showStatistics={false}
              maxHeight={400}
              isReadOnly={false}
              isLoading={false}
              isNewEvent={false}
            />

            {adjustedAttendees.length === 0 && (
              <Alert severity='warning' sx={{ mt: 2 }}>
                <Typography variant='body2'>
                  <strong>No attendees selected:</strong> You need to have at least one attendee to complete the event.
                </Typography>
              </Alert>
            )}
          </Box>
        )

      default:
        return null
    }
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant='h5' gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <Icon icon='tabler:flag-check' />
        Complete Event: {selectedEvent?.seriesTitle || 'Untitled Event'}
      </Typography>

      <Stepper activeStep={activeStep} orientation='vertical'>
        {steps.map((step, index) => (
          <Step key={step.label}>
            <StepLabel
              optional={index === 1 ? <Typography variant='caption'>Optional</Typography> : null}
              onClick={() => handleStepClick(index)}
              sx={{
                cursor: 'pointer',
                '&:hover .MuiStepLabel-label': {
                  color: 'primary.main'
                }
              }}
              StepIconComponent={() => (
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: index <= activeStep ? 'primary.main' : 'grey.300',
                    color: index <= activeStep ? 'primary.contrastText' : 'grey.600',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      bgcolor: index <= activeStep ? 'primary.dark' : 'grey.400'
                    }
                  }}
                  onClick={e => {
                    e.stopPropagation()
                    handleStepClick(index)
                  }}
                >
                  <Icon icon={step.icon} fontSize='1.25rem' />
                </Box>
              )}
            >
              <Typography variant='h6'>{step.label}</Typography>
              <Typography variant='body2' color='textSecondary'>
                {step.description}
              </Typography>
            </StepLabel>
            <StepContent>
              <Box sx={{ mt: 2, mb: 3 }}>{renderStepContent(index)}</Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                {index > 0 && (
                  <Button onClick={handleBack} variant='outlined'>
                    Back
                  </Button>
                )}
                {index < steps.length - 1 ? (
                  <Button
                    variant='contained'
                    onClick={handleNext}
                    disabled={!canProceedToStep(index)}
                    startIcon={<Icon icon='tabler:arrow-right' />}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    variant='contained'
                    color='success'
                    onClick={handleComplete}
                    disabled={!canProceedToStep(index) || isLoading}
                    startIcon={<Icon icon='tabler:check' />}
                  >
                    {isLoading ? 'Completing...' : 'Complete Event'}
                  </Button>
                )}
              </Box>
            </StepContent>
          </Step>
        ))}
      </Stepper>

      {activeStep === steps.length && (
        <Paper square elevation={0} sx={{ p: 3, mt: 3 }}>
          <Typography variant='h6' gutterBottom>
            Event completion in progress...
          </Typography>
          <Typography variant='body2'>Please wait while we process the event completion.</Typography>
        </Paper>
      )}

      <Box sx={{ mt: 4, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button
          variant='outlined'
          color='secondary'
          onClick={onCancel}
          disabled={isLoading}
          startIcon={<Icon icon='tabler:x' />}
        >
          Cancel
        </Button>
      </Box>
    </Box>
  )
}

export default EventCompletionWizard
