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
import { roRO } from '@mui/x-date-pickers/locales'
import 'dayjs/locale/ro'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Components
import AttendeeManager from './AttendeeManager'

// ** Types
import { EventAttendeeDTO } from 'src/generated/profile-service'

// ** Error Handling
import { resolveCalendarError } from '../utils/calendarErrors'
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

  // Completion result state
  const [completionStatus, setCompletionStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [completionError, setCompletionError] = useState<string | null>(null)

  // Form state
  const [actualStartTime, setActualStartTime] = useState<dayjs.Dayjs | null>(null)
  const [actualEndTime, setActualEndTime] = useState<dayjs.Dayjs | null>(null)
  const [description, setDescription] = useState('')
  const [adjustPricesWithDuration, setAdjustPricesWithDuration] = useState(false)
  const [eventAttendees, setEventAttendees] = useState<EventAttendeeDTO[]>([])

  // Initialize form data from selected event
  useEffect(() => {
    if (selectedEvent) {
      // Set initial start time to the event's scheduled start time
      const eventStart = dayjs(selectedEvent.effectiveStartTime || selectedEvent.start)
      setActualStartTime(eventStart)

      // Parse duration from various possible formats
      const rawDuration = selectedEvent.seriesDuration || selectedEvent.duration
      const durationMinutes = parseDurationToMinutes(rawDuration)

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
      // If user has manually set a custom price (indicated by userSetCustomPrice), respect it
      if ((attendee as any).userSetCustomPrice) {
        return {
          ...attendee,
          hasCustomPricing: true
        }
      }

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
      setCompletionStatus('loading')
      setCompletionError(null)
      const result = await onComplete(completionData)
      console.log('EventCompletionWizard - onComplete result:', result)
      setCompletionStatus('success')
    } catch (error) {
      // Reading `error.message` straight off an axios failure yields
      // "Request failed with status code 500" - the reason the backend gave sits
      // in the response body, which is what the resolver digs out.
      const resolved = resolveCalendarError(error)
      console.error('EventCompletionWizard - Error in onComplete:', resolved.backendMessage || error, error)
      setCompletionStatus('error')
      setCompletionError(resolved.message)
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
            originalPrice: (existingAttendee as any).originalPrice,
            userSetCustomPrice: (existingAttendee as any).userSetCustomPrice
          }
        }

        // If price was manually changed, mark it as user-set and update original price
        if (existingAttendee.customPrice !== updatedAttendee.customPrice) {
          return {
            ...updatedAttendee,
            originalPrice: updatedAttendee.customPrice,
            userSetCustomPrice: true // Mark as manually set by user
          }
        }

        // Default: preserve original price and user-set flag
        return {
          ...updatedAttendee,
          originalPrice: (existingAttendee as any).originalPrice,
          userSetCustomPrice: (existingAttendee as any).userSetCustomPrice
        }
      }

      return updatedAttendee
    })

    setEventAttendees(attendeesWithPreservedPrices)
  } // Steps configuration
  const steps = [
    {
      label: 'Ore Reale & Durata',
      icon: 'tabler:clock',
      description: 'Setează orele reale de început și sfârșit pentru acest eveniment'
    },
    {
      label: 'Descrierea Evenimentului',
      icon: 'tabler:notes',
      description: 'Adaugă o descriere opțională sau notițe despre eveniment'
    },
    {
      label: 'Ajustarea Prețurilor',
      icon: 'tabler:currency-dollar',
      description: 'Alege dacă să ajustezi prețurile în funcție de durata reală'
    },
    {
      label: 'Gestionează Participanții',
      icon: 'tabler:users',
      description: 'Confirmă prezența și personalizează prețurile pentru fiecare participant'
    }
  ]

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card variant='outlined' elevation={0} sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant='h6' gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Icon icon='tabler:info-circle' />
                    Informații Eveniment
                  </Typography>
                  <Typography variant='body2' color='textSecondary' gutterBottom>
                    {selectedEvent?.seriesTitle || selectedEvent?.title || 'Eveniment'}
                  </Typography>
                  <Typography variant='caption' color='textSecondary' display='block' gutterBottom>
                    Programat: {actualStartTime && actualStartTime.format('DD MMM, YYYY [la] HH:mm')} →{' '}
                    {actualStartTime && actualStartTime.add(plannedDuration, 'minutes').format('HH:mm')}
                  </Typography>
                  <Stack direction='row' spacing={1} sx={{ mt: 1 }} flexWrap='wrap' useFlexGap>
                    <Chip label={`Durată Planificată: ${plannedDurationText}`} variant='outlined' size='small' />
                    <Chip
                      label={`Preț de Bază: ${selectedEvent?.seriesPrice || selectedEvent?.price || 0} LEI`}
                      variant='outlined'
                      size='small'
                    />
                    <Chip
                      label={`Participanți: ${selectedEvent?.eventAttendees?.length || 0}`}
                      variant='outlined'
                      size='small'
                    />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <LocalizationProvider
                dateAdapter={AdapterDayjs}
                adapterLocale='ro'
                localeText={roRO.components.MuiLocalizationProvider.defaultProps.localeText}
              >
                <DateTimePicker
                  label='Ora Reală de Început'
                  value={actualStartTime}
                  onChange={newValue => setActualStartTime(newValue)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      helperText: 'Când a început efectiv evenimentul?'
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} md={6}>
              <LocalizationProvider
                dateAdapter={AdapterDayjs}
                adapterLocale='ro'
                localeText={roRO.components.MuiLocalizationProvider.defaultProps.localeText}
              >
                <DateTimePicker
                  label='Ora Reală de Sfârșit'
                  value={actualEndTime}
                  onChange={newValue => setActualEndTime(newValue)}
                  minDateTime={actualStartTime}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      helperText: 'Când s-a terminat efectiv evenimentul?'
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
                    <strong>Analiza Duratei:</strong> Durata reală a evenimentului este{' '}
                    {formatDurationMinutes(Math.round(durationInfo.actualDurationMinutes))}
                    {durationInfo.durationDifference !== 0 && (
                      <>
                        {' '}
                        ({durationInfo.isLonger ? '+' : ''}
                        {formatDurationMinutes(Math.abs(Math.round(durationInfo.durationDifference)))}{' '}
                        {durationInfo.isLonger ? 'mai lung' : 'mai scurt'} decât planificat)
                      </>
                    )}
                  </Typography>
                  {durationInfo.durationDifference !== 0 && (
                    <Typography variant='caption' display='block' sx={{ mt: 0.5 }}>
                      Aceasta reprezintă {Math.round(durationInfo.durationPercentage)}% din durata planificată.
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
              label='Descrierea Evenimentului'
              placeholder='Adaugă notițe despre cum a decurs evenimentul, subiectele cheie abordate sau alte informații relevante...'
              value={description}
              onChange={e => setDescription(e.target.value)}
              helperText='Această descriere este opțională, dar poate fi utilă pentru referințe viitoare'
              sx={{ mb: 2 }}
            />
            <Alert severity='info' sx={{ mt: 2 }}>
              <Typography variant='body2'>
                💡 <strong>Sugestie:</strong> Consideră să adaugi informații despre:
              </Typography>
              <Typography variant='body2' component='div' sx={{ mt: 1, ml: 2 }}>
                • Subiectele cheie acoperite
                <br />
                • Nivelul de implicare al elevilor
                <br />
                • Probleme tehnice întâlnite
                <br />
                • Temele pentru acasă date
                <br />• Notițe pentru pregătirea următoarei sesiuni
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
              label='Ajustează prețurile proporțional în funcție de durata reală'
              sx={{ mb: 3 }}
            />

            {durationInfo && (
              <Card variant='outlined' elevation={0} sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant='h6' gutterBottom>
                    Previzualizarea Ajustării Prețurilor
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <Typography variant='body2' color='textSecondary'>
                        Durata Planificată
                      </Typography>
                      <Typography variant='h6'>{formatDurationMinutes(durationInfo.plannedDurationMinutes)}</Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant='body2' color='textSecondary'>
                        Durata Reală
                      </Typography>
                      <Typography variant='h6'>
                        {formatDurationMinutes(Math.round(durationInfo.actualDurationMinutes))}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant='body2' color='textSecondary'>
                        Factor de Durată
                      </Typography>
                      <Typography variant='h6'>{Math.round(durationInfo.durationPercentage)}%</Typography>
                    </Grid>
                  </Grid>

                  {adjustPricesWithDuration && (
                    <Alert severity='info' sx={{ mt: 2 }}>
                      <Typography variant='body2'>
                        Prețurile vor fi ajustate la {Math.round(durationInfo.durationPercentage)}% din prețul original
                        pentru toți participanții (cu excepția celor care au deja prețuri personalizate).
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
                    <strong>Ajustarea prețurilor activată:</strong> Toate prețurile participanților vor fi ajustate în
                    funcție de durata reală a evenimentului. Încă poți personaliza prețurile individuale în pasul
                    următor.
                  </>
                ) : (
                  <>
                    <strong>Fără ajustarea prețurilor:</strong> Prețurile participanților vor rămâne ca au fost
                    stabilite inițial. Încă poți personaliza prețurile individuale în pasul următor.
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
              Gestionează Participanții la Eveniment
            </Typography>

            <Typography variant='body2' color='textSecondary' paragraph>
              Verifică și confirmă participanții la acest eveniment. Poți marca cine a fost efectiv prezent și
              personaliza prețurile pentru individual studenții dacă este necesar.
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
                  <strong>Niciun participant selectat:</strong> Trebuie să ai cel puțin un participant pentru a finaliza
                  evenimentul.
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
        Finalizează Eveniment: {selectedEvent?.seriesTitle || 'Eveniment Fără Titlu'}
      </Typography>

      {/* Show result screen if completion succeeded or failed */}
      {(completionStatus === 'success' || completionStatus === 'error') && (
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center', mb: 3 }}>
          {completionStatus === 'success' ? (
            <>
              {/* Success Screen */}
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  bgcolor: 'success.main',
                  color: 'success.contrastText',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  mb: 3
                }}
              >
                <Icon icon='tabler:check' fontSize='3rem' />
              </Box>
              <Typography variant='h5' gutterBottom color='success.main' sx={{ fontWeight: 600 }}>
                Eveniment Finalizat cu Succes!
              </Typography>
              <Typography variant='body1' color='textSecondary' paragraph>
                Evenimentul <strong>{selectedEvent?.seriesTitle || 'Eveniment'}</strong> a fost marcat ca finalizat.
              </Typography>
              <Typography variant='body2' color='textSecondary' paragraph>
                Toate informațiile despre participanți, prezență și prețuri au fost salvate.
              </Typography>
              <Box sx={{ mt: 4 }}>
                <Button
                  variant='contained'
                  color='success'
                  size='large'
                  onClick={onCancel}
                  startIcon={<Icon icon='tabler:check' />}
                >
                  Închide
                </Button>
              </Box>
            </>
          ) : (
            <>
              {/* Error Screen */}
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  bgcolor: 'error.main',
                  color: 'error.contrastText',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  mb: 3
                }}
              >
                <Icon icon='tabler:x' fontSize='3rem' />
              </Box>
              <Typography variant='h5' gutterBottom color='error.main' sx={{ fontWeight: 600 }}>
                Eroare la Finalizarea Evenimentului
              </Typography>
              <Typography variant='body1' color='textSecondary' paragraph>
                Ne pare rău, dar a apărut o problemă la finalizarea evenimentului.
              </Typography>
              {completionError && (
                <Alert severity='error' sx={{ mt: 2, mb: 3, textAlign: 'left' }}>
                  <Typography variant='body2'>
                    <strong>Detalii eroare:</strong>
                  </Typography>
                  <Typography variant='body2' sx={{ mt: 1 }}>
                    {completionError}
                  </Typography>
                </Alert>
              )}
              <Stack direction='row' spacing={2} justifyContent='center' sx={{ mt: 4 }}>
                <Button
                  variant='outlined'
                  color='primary'
                  size='large'
                  onClick={() => {
                    setCompletionStatus('idle')
                    setCompletionError(null)
                  }}
                  startIcon={<Icon icon='tabler:arrow-left' />}
                >
                  Încearcă Din Nou
                </Button>
                <Button
                  variant='outlined'
                  color='secondary'
                  size='large'
                  onClick={onCancel}
                  startIcon={<Icon icon='tabler:x' />}
                >
                  Anulează
                </Button>
              </Stack>
            </>
          )}
        </Paper>
      )}

      {/* Show stepper only if not in result state */}
      {completionStatus !== 'success' && completionStatus !== 'error' && (
        <>
          <Stepper activeStep={activeStep} orientation='vertical'>
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel
                  optional={index === 1 ? <Typography variant='caption'>Opțional</Typography> : null}
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
                        Înapoi
                      </Button>
                    )}
                    {index < steps.length - 1 ? (
                      <Button
                        variant='contained'
                        onClick={handleNext}
                        disabled={!canProceedToStep(index)}
                        startIcon={<Icon icon='tabler:arrow-right' />}
                      >
                        Următorul
                      </Button>
                    ) : (
                      <Button
                        variant='contained'
                        color='success'
                        onClick={handleComplete}
                        disabled={!canProceedToStep(index) || completionStatus === 'loading'}
                        startIcon={<Icon icon='tabler:check' />}
                      >
                        {completionStatus === 'loading' ? 'Se Finalizează...' : 'Finalizează Eveniment'}
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
                Finalizarea evenimentului în curs...
              </Typography>
              <Typography variant='body2'>Te rog să aștepți în timp ce procesăm finalizarea evenimentului.</Typography>
            </Paper>
          )}
        </>
      )}

      {/* Cancel button - show only if not in success state */}
      {completionStatus !== 'success' && (
        <Box sx={{ mt: 4, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button
            variant='outlined'
            color='secondary'
            onClick={onCancel}
            disabled={isLoading || completionStatus === 'loading'}
            startIcon={<Icon icon='tabler:x' />}
          >
            Anulează
          </Button>
        </Box>
      )}
    </Box>
  )
}

export default EventCompletionWizard
