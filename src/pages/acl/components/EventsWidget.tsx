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
  Divider,
  IconButton,
  Tooltip
} from '@mui/material'
import Icon from 'src/@core/components/icon'
import { EventOccurrenceDTO } from 'src/generated/profile-service'
import { profileServiceClient } from 'src/services'
import { useDispatch } from 'react-redux'
import { handleSelectEvent } from 'src/store/apps/calendar'
import { format, parseISO } from 'date-fns'
import profilePictureDownloader from 'src/@core/axios/profile-picture-downloader'
import extractProfilePicture from 'src/@core/axios/profile-picture-extractor'

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

interface EventsWidgetProps {
  onCompleteEvent?: (event: EventOccurrenceDTO) => void
  users?: any[] // Array of users with avatars
}

interface EnhancedEventData extends EventOccurrenceDTO {
  attendeeAvatars?: (string | null)[]
  attendeeNames?: string[]
}

export interface EventsWidgetRef {
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

const EventsWidget = forwardRef<EventsWidgetRef, EventsWidgetProps>(({ onCompleteEvent, users = [] }, ref) => {
  const defaultDates = getDefaultDateRange()
  const [loading, setLoading] = useState<boolean>(true)
  const [eventsData, setEventsData] = useState<EnhancedEventData[]>([])
  const [startDate, setStartDate] = useState<string>(defaultDates.start)
  const [endDate, setEndDate] = useState<string>(defaultDates.end)
  const dispatch = useDispatch()

  // Expose refresh method to parent components
  useImperativeHandle(ref, () => ({
    refresh: () => {
      fetchEvents()
    }
  }))

  // Fetch data on mount
  useEffect(() => {
    fetchEvents()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Re-fetch when users change (e.g., when avatars are loaded)
  useEffect(() => {
    if (users.length > 0 && eventsData.length > 0) {
      // Only re-process event data with new user info, don't re-fetch from API
      const reprocessEvents = async () => {
        const processedEvents = await processEventData(eventsData, users)
        setEventsData(processedEvents)
      }
      reprocessEvents()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users])

  const fetchEvents = async () => {
    if (!startDate || !endDate) return

    setLoading(true)
    try {
      // Convert datetime-local to ISO string
      const startISO = new Date(startDate).toISOString()
      const endISO = new Date(endDate).toISOString()

      const response = await profileServiceClient.events.getConsolidatedEvents({
        startDate: startISO,
        endDate: endISO
      })

      const eventsData = response.data || []

      // Sort events by effectiveStartTime in descending order (most recent first)
      const sortedEvents = [...eventsData].sort((a, b) => {
        const dateA = new Date(a.effectiveStartTime || 0).getTime()
        const dateB = new Date(b.effectiveStartTime || 0).getTime()
        return dateB - dateA // Descending order
      })

      // Process events data with user information (same pattern as PaymentConfirmationHistory)
      const processedEvents = await processEventData(sortedEvents, users)
      setEventsData(processedEvents)
    } catch (error) {
      console.error('Failed to fetch events:', error)
      setEventsData([])
    } finally {
      setLoading(false)
    }
  }

  const processEventData = async (events: EventOccurrenceDTO[], users: any[]) => {
    // Collect all unique attendee IDs
    const allAttendeeIds = new Set<string>()
    events.forEach(event => {
      event.eventAttendees?.forEach(attendee => {
        if (attendee.attendeeId) {
          allAttendeeIds.add(attendee.attendeeId)
        }
      })
    })

    const uniqueUserIds = Array.from(allAttendeeIds)
    const processedUsersList = []

    // Extract profile pictures for all users
    for (const userId of uniqueUserIds) {
      const user = users.find((u: any) => u.id === userId)
      if (user) {
        const processedUser = extractProfilePicture(user)
        processedUsersList.push(processedUser)
      }
    }

    // Download avatars
    const usersWithAvatars = await Promise.all(
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

    // Map events with attendee avatars and names
    return events.map(event => {
      const eventAttendees = event.eventAttendees || []
      const attendeeAvatars: (string | null)[] = []
      const attendeeNames: string[] = []

      eventAttendees.forEach(attendee => {
        const userWithAvatar = usersWithAvatars.find(u => u.userId === attendee.attendeeId)
        const user = users.find((u: any) => u.id === attendee.attendeeId)

        if (user) {
          attendeeAvatars.push(userWithAvatar?.avatar || null)
          attendeeNames.push(`${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown')
        }
      })

      return {
        ...event,
        attendeeAvatars,
        attendeeNames
      } as EnhancedEventData
    })
  }

  const handleApplyDateRange = () => {
    fetchEvents()
  }

  const handleQuickRange = async (days: number) => {
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

    const formattedStart = formatDateForInput(start)
    const formattedEnd = formatDateForInput(end)

    setStartDate(formattedStart)
    setEndDate(formattedEnd)

    // Fetch immediately with the new dates instead of waiting for state update
    setLoading(true)
    try {
      const startISO = new Date(formattedStart).toISOString()
      const endISO = new Date(formattedEnd).toISOString()

      const response = await profileServiceClient.events.getConsolidatedEvents({
        startDate: startISO,
        endDate: endISO
      })

      const eventsData = response.data || []

      const sortedEvents = [...eventsData].sort((a, b) => {
        const dateA = new Date(a.effectiveStartTime || 0).getTime()
        const dateB = new Date(b.effectiveStartTime || 0).getTime()
        return dateB - dateA
      })

      const processedEvents = await processEventData(sortedEvents, users)
      setEventsData(processedEvents)
    } catch (error) {
      console.error('Failed to fetch events:', error)
      setEventsData([])
    } finally {
      setLoading(false)
    }
  }

  const getEventStatus = (event: EnhancedEventData) => {
    if (event.completed) return { label: 'Finished', color: 'success' as const }
    if (event.cancelled) return { label: 'Cancelled', color: 'error' as const }
    if (event.rescheduled) return { label: 'Rescheduled', color: 'warning' as const }
    if (event.missed) return { label: 'Missed', color: 'error' as const }
    if (event.upcoming) return { label: 'Upcoming', color: 'info' as const }
    return { label: 'Scheduled', color: 'info' as const }
  }

  const handleCompleteEvent = (event: EnhancedEventData) => {
    // Set the selected event in Redux store
    dispatch(handleSelectEvent(event))

    // Call the callback to open the sidebar
    if (onCompleteEvent) {
      onCompleteEvent(event)
    }
  }

  const formatEventTime = (dateString: string | undefined) => {
    if (!dateString) return 'N/A'
    try {
      const date = parseISO(dateString)
      const now = new Date()
      const isToday = date.toDateString() === now.toDateString()
      const yesterday = new Date(now)
      yesterday.setDate(yesterday.getDate() - 1)
      const isYesterday = date.toDateString() === yesterday.toDateString()

      if (isToday) {
        return `Today ${format(date, 'HH:mm')}`
      } else if (isYesterday) {
        return `Yesterday ${format(date, 'HH:mm')}`
      }
      return format(date, 'MMM dd, HH:mm')
    } catch (error) {
      return 'Invalid Date'
    }
  }

  const formatEventDuration = (event: EnhancedEventData) => {
    const durationString = event.duration as any

    // First try to parse the duration field if it exists
    if (durationString && typeof durationString === 'string') {
      const match = durationString.match(/PT(?:(\d+)H)?(?:(\d+)M)?/)
      if (match) {
        const hours = parseInt(match[1] || '0')
        const minutes = parseInt(match[2] || '0')

        if (hours > 0 && minutes > 0) {
          return `${hours}h ${minutes}m`
        } else if (hours > 0) {
          return `${hours}h`
        } else if (minutes > 0) {
          return `${minutes}m`
        }
      }
    }

    // If duration field is not available or invalid, calculate from actualStartTime and actualEndTime
    if (event.actualStartTime && event.actualEndTime) {
      try {
        const startTime = new Date(event.actualStartTime).getTime()
        const endTime = new Date(event.actualEndTime).getTime()
        const durationMs = endTime - startTime

        if (durationMs > 0) {
          const hours = Math.floor(durationMs / (1000 * 60 * 60))
          const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))

          if (hours > 0 && minutes > 0) {
            return `${hours}h ${minutes}m`
          } else if (hours > 0) {
            return `${hours}h`
          } else if (minutes > 0) {
            return `${minutes}m`
          }
        }
      } catch (error) {
        console.error('Error calculating duration from actual times:', error)
      }
    }

    return 'N/A'
  }

  const getTitle = (event: EnhancedEventData) => {
    // SingularEvents don't have seriesTitle, so check seriesTitle first (recurring), then fallback
    return event.seriesTitle || 'Event'
  }

  return (
    <Card>
      <CardHeader
        title='Evenimente recente'
        action={
          <IconButton size='small' onClick={() => fetchEvents()}>
            <Icon icon='tabler:refresh' />
          </IconButton>
        }
      />
      <CardContent>
        {/* Date Range Filters */}
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={2} alignItems='center'>
            <Grid item xs={12} sm={5}>
              <TextField
                fullWidth
                label='Start Date'
                type='datetime-local'
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                size='small'
              />
            </Grid>
            <Grid item xs={12} sm={5}>
              <TextField
                fullWidth
                label='End Date'
                type='datetime-local'
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                size='small'
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button fullWidth variant='contained' onClick={handleApplyDateRange} size='small' sx={{ height: 40 }}>
                <Icon icon='tabler:filter' />
              </Button>
            </Grid>
          </Grid>

          {/* Quick Range Buttons */}
          <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button size='small' variant='outlined' onClick={() => handleQuickRange(7)}>
              7d
            </Button>
            <Button size='small' variant='outlined' onClick={() => handleQuickRange(14)}>
              14d
            </Button>
            <Button size='small' variant='outlined' onClick={() => handleQuickRange(30)}>
              30d
            </Button>
          </Box>
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* Events Table */}
        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} variant='rectangular' height={60} />
            ))}
          </Box>
        ) : eventsData.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Icon icon='tabler:calendar-off' fontSize={64} color='text.secondary' />
            <Typography variant='h6' sx={{ mt: 2, color: 'text.secondary' }}>
              No Events Found
            </Typography>
            <Typography variant='body2' sx={{ color: 'text.disabled' }}>
              Try adjusting your date range
            </Typography>
          </Box>
        ) : (
          <Fade in={!loading}>
            <TableContainer component={Paper} variant='outlined'>
              <Table size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell>Eveniment</TableCell>
                    <TableCell>Dată</TableCell>
                    <TableCell align='center' sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                      Participanți
                    </TableCell>
                    <TableCell align='right'>Acțiuni</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {eventsData.map((event, eventIdx) => (
                    <TableRow key={event.id || `event-${eventIdx}`} hover>
                      <TableCell sx={{ py: 2 }}>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Typography
                              variant='body2'
                              sx={{
                                fontWeight: 600,
                                fontSize: '0.875rem',
                                color: 'text.primary',
                                lineHeight: 1.4
                              }}
                            >
                              {getTitle(event)}
                            </Typography>
                            {event.recurringSeriesId && (
                              <Icon icon='tabler:repeat' fontSize={16} style={{ color: 'rgba(0, 0, 0, 0.54)' }} />
                            )}
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            {(() => {
                              const status = getEventStatus(event)
                              return (
                                <Chip
                                  label={status.label}
                                  color={status.color}
                                  size='small'
                                  sx={{ height: 22, fontSize: '0.75rem', fontWeight: 500 }}
                                />
                              )
                            })()}
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                px: 1,
                                py: 0.25,
                                bgcolor: 'action.hover',
                                borderRadius: 1
                              }}
                            >
                              <Icon icon='tabler:clock' fontSize={14} style={{ opacity: 0.7 }} />
                              <Typography variant='caption' color='text.secondary' sx={{ fontSize: '0.75rem' }}>
                                {formatEventDuration(event)}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ minWidth: 120, py: 2 }}>
                        <Box>
                          <Typography
                            variant='body2'
                            sx={{
                              fontSize: '0.875rem',
                              fontWeight: 600,
                              color: 'text.primary',
                              lineHeight: 1.4,
                              mb: 0.5
                            }}
                          >
                            {(() => {
                              const dateStr = event.effectiveStartTime
                              if (!dateStr) return 'N/A'
                              try {
                                const date = parseISO(dateStr)
                                const now = new Date()
                                const isToday = date.toDateString() === now.toDateString()
                                const yesterday = new Date(now)
                                yesterday.setDate(yesterday.getDate() - 1)
                                const isYesterday = date.toDateString() === yesterday.toDateString()

                                if (isToday) return 'Today'
                                if (isYesterday) return 'Yesterday'
                                return format(date, 'MMM dd, yyyy')
                              } catch (error) {
                                return 'Invalid'
                              }
                            })()}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Icon icon='tabler:clock' fontSize={14} style={{ opacity: 0.5 }} />
                            <Typography variant='caption' color='text.secondary' sx={{ fontSize: '0.75rem' }}>
                              {(() => {
                                const dateStr = event.effectiveStartTime
                                if (!dateStr) return 'N/A'
                                try {
                                  const date = parseISO(dateStr)
                                  return format(date, 'HH:mm')
                                } catch (error) {
                                  return 'N/A'
                                }
                              })()}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell align='center' sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                          {event.attendeeAvatars && event.attendeeAvatars.length > 0 ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', ml: -0.5 }}>
                                {event.attendeeAvatars.slice(0, 3).map((avatar, idx) => {
                                  const hasValidAvatar = avatar && avatar.trim() !== ''
                                  const attendeeName = event.attendeeNames?.[idx] || 'Attendee'
                                  const initials = attendeeName
                                    .split(' ')
                                    .map(n => n.charAt(0))
                                    .join('')
                                    .toUpperCase()
                                    .slice(0, 2)

                                  return (
                                    <Tooltip key={idx} title={attendeeName}>
                                      <Avatar
                                        src={hasValidAvatar ? avatar : undefined}
                                        alt={attendeeName}
                                        sx={{
                                          width: 24,
                                          height: 24,
                                          fontSize: '0.625rem',
                                          fontWeight: 600,
                                          border: '2px solid',
                                          borderColor: 'background.paper',
                                          ml: idx > 0 ? -1 : 0
                                        }}
                                      >
                                        {!hasValidAvatar ? initials : null}
                                      </Avatar>
                                    </Tooltip>
                                  )
                                })}
                              </Box>
                              {event.attendeeAvatars.length > 3 && (
                                <Tooltip
                                  title={
                                    <Box sx={{ py: 0.5 }}>
                                      {event.attendeeNames?.slice(3).map((name, idx) => {
                                        const avatarIdx = idx + 3
                                        const avatar = event.attendeeAvatars?.[avatarIdx]
                                        const hasValidAvatar = avatar && avatar.trim() !== ''
                                        const initials = name
                                          .split(' ')
                                          .map(n => n.charAt(0))
                                          .join('')
                                          .toUpperCase()
                                          .slice(0, 2)

                                        return (
                                          <Box
                                            key={idx}
                                            sx={{
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: 1.5,
                                              py: 0.5
                                            }}
                                          >
                                            <Avatar
                                              src={hasValidAvatar ? avatar : undefined}
                                              alt={name}
                                              sx={{
                                                width: 28,
                                                height: 28,
                                                fontSize: '0.688rem',
                                                fontWeight: 600
                                              }}
                                            >
                                              {!hasValidAvatar ? initials : null}
                                            </Avatar>
                                            <Typography
                                              variant='body2'
                                              sx={{
                                                fontSize: '0.875rem',
                                                lineHeight: 1.4,
                                                color: 'text.primary',
                                                fontWeight: 500
                                              }}
                                            >
                                              {name}
                                            </Typography>
                                          </Box>
                                        )
                                      })}
                                    </Box>
                                  }
                                  arrow
                                  placement='top'
                                  componentsProps={{
                                    tooltip: {
                                      sx: {
                                        bgcolor: 'background.paper',
                                        color: 'text.primary',
                                        boxShadow: 3,
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        '& .MuiTooltip-arrow': {
                                          color: 'background.paper',
                                          '&::before': {
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            bgcolor: 'background.paper'
                                          }
                                        }
                                      }
                                    }
                                  }}
                                >
                                  <Box
                                    sx={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      width: 24,
                                      height: 24,
                                      borderRadius: '50%',
                                      bgcolor: 'action.hover',
                                      border: '2px solid',
                                      borderColor: 'background.paper',
                                      ml: -1,
                                      cursor: 'help',
                                      transition: 'all 0.2s',
                                      '&:hover': {
                                        bgcolor: 'action.selected',
                                        transform: 'scale(1.1)'
                                      }
                                    }}
                                  >
                                    <Typography
                                      variant='caption'
                                      sx={{
                                        fontSize: '0.625rem',
                                        fontWeight: 600,
                                        color: 'text.secondary'
                                      }}
                                    >
                                      +{event.attendeeAvatars.length - 3}
                                    </Typography>
                                  </Box>
                                </Tooltip>
                              )}
                            </Box>
                          ) : (
                            <Typography variant='body2' color='text.secondary' sx={{ fontSize: '0.8125rem' }}>
                              -
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align='right'>
                        {!event.completed && !event.cancelled && (
                          <Tooltip title='Complete Event'>
                            <IconButton size='small' color='primary' onClick={() => handleCompleteEvent(event)}>
                              <Icon icon='tabler:check' fontSize={18} />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Fade>
        )}

        {/* Summary */}
        {!loading && eventsData.length > 0 && (
          <Box sx={{ mt: 3, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={4}>
                <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 0.5 }}>
                  Total Events
                </Typography>
                <Typography variant='h6' sx={{ fontSize: '1.25rem' }}>
                  {eventsData.length}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 0.5 }}>
                  Finished
                </Typography>
                <Typography variant='h6' color='success.main' sx={{ fontSize: '1.25rem' }}>
                  {eventsData.filter(e => e.completed).length}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 0.5 }}>
                  Estimated Revenue
                </Typography>
                <Typography variant='h6' color='primary.main' sx={{ fontSize: '1.25rem', fontWeight: 600 }}>
                  {(() => {
                    const revenue = eventsData.reduce((total, event) => {
                      if (!event.eventAttendees) return total

                      // Calculate revenue for this event based on attended participants
                      const eventRevenue = event.eventAttendees.reduce((eventTotal, attendee) => {
                        // Only count if attendee actually attended
                        if (attendee.attended) {
                          // Use custom price if available, otherwise use event's base price
                          const price = attendee.customPrice ? attendee.customPrice || 0 : event.price || 0
                          return eventTotal + price
                        }
                        return eventTotal
                      }, 0)

                      return total + eventRevenue
                    }, 0)

                    return `${revenue} RON`
                  })()}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 0.5 }}>
                  Upcoming
                </Typography>
                <Typography variant='h6' color='info.main' sx={{ fontSize: '1.25rem' }}>
                  {eventsData.filter(e => e.upcoming && !e.completed && !e.cancelled).length}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 0.5 }}>
                  Cancelled
                </Typography>
                <Typography variant='h6' color='error.main' sx={{ fontSize: '1.25rem' }}>
                  {eventsData.filter(e => e.cancelled).length}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 0.5 }}>
                  Total Attendees
                </Typography>
                <Typography variant='h6' sx={{ fontSize: '1.25rem' }}>
                  {eventsData.reduce((total, event) => {
                    return total + (event.eventAttendees?.filter(a => a.attended).length || 0)
                  }, 0)}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        )}
      </CardContent>
    </Card>
  )
})

EventsWidget.displayName = 'EventsWidget'

export default EventsWidget
