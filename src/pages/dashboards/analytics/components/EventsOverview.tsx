import React, { useEffect, useState } from 'react'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import Skeleton from '@mui/material/Skeleton'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import { profileServiceClient, EventOccurrenceDTO } from 'src/services'
import EmentorAvatar, { UserType } from 'src/@core/components/ementor-avatar'

const formatDateTime = (iso?: string) => {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('ro-RO', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (e) {
    return iso
  }
}

const formatTime = (iso?: string) => {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    return d.toLocaleTimeString('ro-RO', {
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (e) {
    return ''
  }
}

const getTimeUntilEvent = (startTime?: string) => {
  if (!startTime) return ''
  try {
    const now = new Date()
    const eventStart = new Date(startTime)
    const diffMs = eventStart.getTime() - now.getTime()

    if (diffMs < 0) return ''

    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 0) {
      return `în ${diffDays} zi${diffDays > 1 ? 'le' : ''}`
    } else if (diffHours > 0) {
      return diffHours === 1 ? `în 1 oră` : `în ${diffHours} ore`
    } else if (diffMins > 0) {
      return diffMins === 1 ? `în 1 minut` : `în ${diffMins} minute`
    } else {
      return 'în curând'
    }
  } catch (e) {
    return ''
  }
}

const isEventLive = (startTime?: string, endTime?: string) => {
  if (!startTime || !endTime) return false
  try {
    const now = new Date()
    const start = new Date(startTime)
    const end = new Date(endTime)
    return now >= start && now <= end
  } catch (e) {
    return false
  }
}

const EventsOverview: React.FC = () => {
  const [pastEvents, setPastEvents] = useState<EventOccurrenceDTO[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<EventOccurrenceDTO[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    let mounted = true

    const fetchEvents = async () => {
      setLoading(true)
      try {
        const now = new Date()

        // Fetch events from last 6 days to next 7 days
        const startDate = new Date(now)
        startDate.setDate(startDate.getDate() - 6)
        const endDate = new Date(now)
        endDate.setDate(endDate.getDate() + 7)

        if (profileServiceClient?.events?.getConsolidatedEvents) {
          const res = await profileServiceClient.events.getConsolidatedEvents({
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
          })

          if (mounted) {
            const data = res?.data ?? res
            const allEvents = Array.isArray(data) ? data : []

            // Filter and sort past events
            const past = allEvents
              .filter((evt: EventOccurrenceDTO) => {
                const eventTime = new Date(evt.effectiveStartTime || evt.actualStartTime || '')
                return eventTime < now
              })
              .sort((a: EventOccurrenceDTO, b: EventOccurrenceDTO) => {
                const timeA = new Date(a.effectiveStartTime || a.actualStartTime || '').getTime()
                const timeB = new Date(b.effectiveStartTime || b.actualStartTime || '').getTime()
                return timeB - timeA // Most recent first
              })
              .slice(0, 6)

            // Filter and sort upcoming events
            const upcoming = allEvents
              .filter((evt: EventOccurrenceDTO) => {
                const eventTime = new Date(evt.effectiveStartTime || evt.actualStartTime || '')
                return eventTime >= now && !evt.cancelled
              })
              .sort((a: EventOccurrenceDTO, b: EventOccurrenceDTO) => {
                const timeA = new Date(a.effectiveStartTime || a.actualStartTime || '').getTime()
                const timeB = new Date(b.effectiveStartTime || b.actualStartTime || '').getTime()
                return timeA - timeB // Soonest first
              })
              .slice(0, 7)

            setPastEvents(past)
            setUpcomingEvents(upcoming)
          }
        }
      } catch (err) {
        console.error('Failed to fetch events:', err)
        if (mounted) {
          setPastEvents([])
          setUpcomingEvents([])
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchEvents()

    return () => {
      mounted = false
    }
  }, [])

  const renderEventItem = (evt: EventOccurrenceDTO, isUpcoming: boolean, isClosest: boolean = false) => {
    const eventTime = evt.effectiveStartTime || evt.actualStartTime || ''
    const eventEndTime = evt.actualEndTime || ''
    const attended = evt.eventAttendees?.some(attendee => attendee.attended) || false
    const isLive = isUpcoming && isEventLive(eventTime, eventEndTime)
    const timeUntil = isUpcoming && !isLive ? getTimeUntilEvent(eventTime) : ''

    const handleJoinMeeting = () => {
      if (evt.meetingLink) {
        window.open(evt.meetingLink, '_blank')
      }
    }

    return (
      <ListItem
        key={evt.id || evt.recurringSeriesId}
        sx={{
          py: 2,
          px: 3,
          backgroundColor: isClosest ? 'action.hover' : 'transparent',
          borderLeft: isClosest ? 4 : 0,
          borderColor: isClosest ? 'primary.main' : 'transparent',
          transition: 'all 0.2s',
          '&:hover': {
            backgroundColor: 'action.selected'
          },
          cursor: isLive && evt.meetingLink ? 'pointer' : 'default'
        }}
        onClick={isLive && evt.meetingLink ? handleJoinMeeting : undefined}
      >
        <Box sx={{ width: '100%' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
            <Typography variant='body2' fontWeight={isClosest ? 600 : 500} sx={{ flex: 1 }}>
              {evt.seriesTitle || 'Event'}
            </Typography>
            {!isUpcoming && (
              <Chip
                label={attended ? 'Participat' : 'Pierdut'}
                size='small'
                color={attended ? 'success' : 'default'}
                sx={{ ml: 1 }}
              />
            )}
          </Box>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              mb: isUpcoming ? -4.5 : undefined
            }}
          >
            <Typography variant='caption' color='text.secondary'>
              {formatDateTime(eventTime)}
            </Typography>

            {evt.professorName && (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                {isUpcoming && evt.professorId && (
                  <EmentorAvatar
                    userId={evt.professorId}
                    userType={UserType.PROFESSOR}
                    alt={evt.professorName || 'Professor'}
                    sx={{
                      width: 20,
                      height: 20,
                      fontSize: '0.7rem'
                    }}
                  />
                )}
                <Typography variant='caption' color='text.secondary'>
                  {evt.professorName}
                </Typography>
              </Box>
            )}
          </Box>
          {isUpcoming && (
            <>
              {isLive && evt.meetingLink ? (
                <Typography variant='caption' color='success.main' fontWeight={600} sx={{ mt: 0.5, display: 'block' }}>
                  🟢 Gata de alăturare - Click pentru a deschide întâlnirea
                </Typography>
              ) : timeUntil ? (
                <Typography variant='caption' color='info.main' sx={{ mt: 0.5, display: 'block' }}>
                  ⏱️ {timeUntil}
                </Typography>
              ) : null}
            </>
          )}
        </Box>
      </ListItem>
    )
  }

  return (
    <Card>
      <CardHeader title='Evenimente' subheader='Sesiuni recente și viitoare' />
      <CardContent sx={{ p: 0 }}>
        {loading ? (
          <>
            {/* Skeleton for Upcoming Events */}
            <Box sx={{ px: 3, pt: 2, pb: 1 }}>
              <Skeleton variant='text' width={120} height={24} />
            </Box>
            <List dense disablePadding>
              <ListItem sx={{ py: 2, px: 3 }}>
                <Box sx={{ width: '100%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Skeleton variant='text' width='60%' height={20} />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Skeleton variant='text' width='40%' height={16} />
                    <Skeleton variant='text' width='30%' height={16} />
                  </Box>
                </Box>
              </ListItem>
            </List>

            <Divider sx={{ my: 1 }} />

            {/* Skeleton for Past Events */}
            <Box sx={{ px: 3, pt: 2, pb: 1 }}>
              <Skeleton variant='text' width={100} height={24} />
            </Box>
            <List dense disablePadding>
              <ListItem sx={{ py: 2, px: 3 }}>
                <Box sx={{ width: '100%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Skeleton variant='text' width='50%' height={20} />
                    <Skeleton variant='rounded' width={60} height={24} />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Skeleton variant='text' width='35%' height={16} />
                    <Skeleton variant='text' width='30%' height={16} />
                  </Box>
                </Box>
              </ListItem>
            </List>
          </>
        ) : (
          <>
            {/* Upcoming Events */}
            {upcomingEvents.length > 0 && (
              <>
                <Box sx={{ px: 3, pt: 2, pb: 1 }}>
                  <Typography variant='subtitle2' color='primary' fontWeight={600}>
                    Evenimente viitoare
                  </Typography>
                </Box>
                <List dense disablePadding>
                  {upcomingEvents.map((evt, idx) => renderEventItem(evt, true, idx === 0))}
                </List>
              </>
            )}

            {/* Divider between sections */}
            {upcomingEvents.length > 0 && pastEvents.length > 0 && <Divider sx={{ my: 1 }} />}

            {/* Past Events */}
            {pastEvents.length > 0 && (
              <>
                <Box sx={{ px: 3, pt: 2, pb: 1 }}>
                  <Typography variant='subtitle2' color='text.secondary' fontWeight={600}>
                    Evenimente recente
                  </Typography>
                </Box>
                <List dense disablePadding>
                  {pastEvents.map(evt => renderEventItem(evt, false))}
                </List>
              </>
            )}

            {/* No events message */}
            {upcomingEvents.length === 0 && pastEvents.length === 0 && (
              <Box sx={{ p: 3 }}>
                <Typography variant='body2' color='text.secondary' textAlign='center'>
                  Nu s-au găsit evenimente
                </Typography>
              </Box>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default EventsOverview
