import React, { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'
import { useSelector } from 'react-redux'
import { profileServiceClient, EventOccurrenceDTO } from 'src/services'
import { selectUser } from 'src/store/apps/user'
import Icon from 'src/@core/components/icon'
import EmptyStateCard from 'src/views/student-ui/EmptyStateCard'
import InsightCard from 'src/views/student-ui/InsightCard'
import StatusPill, { StatusTone } from 'src/views/student-ui/StatusPill'
import { accentButtonSx, accentFill, accentInk } from 'src/views/student-ui/readableAccent'

// A card, not a calendar: the next few sessions and the last couple.
const UPCOMING_SHOWN = 3
const RECENT_SHOWN = 2

const startOf = (evt: EventOccurrenceDTO) => new Date(evt.effectiveStartTime || evt.actualStartTime || '')

const endOf = (evt: EventOccurrenceDTO) => {
  const end = evt.effectiveEndTime || evt.actualEndTime

  return end ? new Date(end) : null
}

/** A session that has started and not ended yet: the one the student can join right now. */
const isLive = (evt: EventOccurrenceDTO, now: Date) => {
  const end = endOf(evt)

  return !evt.cancelled && startOf(evt) <= now && end !== null && now <= end
}

const formatTime = (date: Date) => date.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })

/** "Azi", "Mâine", "În 3 zile", counted in calendar days, not hours. */
const relativeDay = (date: Date, now: Date) => {
  const day = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const days = Math.round((day(date) - day(now)) / 864e5)

  if (days <= 0) return 'Azi'
  if (days === 1) return 'Mâine'

  return `În ${days} zile`
}

/**
 * A group session lists every student in the group, so only the viewer's own
 * row says whether they were there. Attendance is known once the session has
 * actually started; before that it simply ended.
 */
const pastStatus = (evt: EventOccurrenceDTO, userId?: string): { tone: StatusTone; icon: string; label: string } => {
  if (evt.cancelled) return { tone: 'neutral', icon: 'tabler:ban', label: 'Anulată' }

  const mine = evt.eventAttendees?.find(attendee => attendee.attendeeId === userId)
  if (mine?.attended) return { tone: 'neutral', icon: 'tabler:circle-check', label: 'Ai participat' }
  if (mine && evt.actualStartTime) return { tone: 'warning', icon: 'tabler:user-x', label: 'Ai lipsit' }

  return { tone: 'neutral', icon: 'tabler:clock-check', label: 'Încheiată' }
}

interface EventsOverviewProps {
  /** What the empty card tells the student, e.g. that sessions need a professor first. */
  emptyDescription?: string
}

const EventsOverview: React.FC<EventsOverviewProps> = ({
  emptyDescription = 'Când profesorul programează o ședință, o vezi aici, cu linkul de intrare.'
}) => {
  const theme = useTheme()
  const user = useSelector(selectUser)
  const [events, setEvents] = useState<EventOccurrenceDTO[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    let mounted = true

    const fetchEvents = async () => {
      setLoading(true)
      try {
        const now = new Date()

        // From 6 days back to 7 days ahead
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
            setEvents(Array.isArray(data) ? data : [])
          }
        }
      } catch (err) {
        console.error('Failed to fetch events:', err)
        if (mounted) setEvents([])
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchEvents()

    return () => {
      mounted = false
    }
  }, [])

  const now = new Date()

  const upcoming = events
    .filter(evt => isLive(evt, now) || (startOf(evt) > now && !evt.cancelled))
    .sort((a, b) => startOf(a).getTime() - startOf(b).getTime())
    .slice(0, UPCOMING_SHOWN)

  const recent = events
    .filter(evt => startOf(evt) <= now && !isLive(evt, now))
    .sort((a, b) => startOf(b).getTime() - startOf(a).getTime())
    .slice(0, RECENT_SHOWN)

  if (loading) {
    return (
      <InsightCard title='Ședințe'>
        {[0, 1, 2].map(index => (
          <Box key={index} aria-hidden sx={{ display: 'flex', gap: 3.5, py: 3 }}>
            <Skeleton variant='rounded' width={48} height={52} sx={{ borderRadius: '12px', flexShrink: 0 }} />
            <Box sx={{ flex: 1 }}>
              <Skeleton width='70%' height={22} />
              <Skeleton width='45%' height={18} />
            </Box>
          </Box>
        ))}
      </InsightCard>
    )
  }

  if (upcoming.length === 0 && recent.length === 0) {
    return (
      <EmptyStateCard
        heading='Ședințe'
        icon='tabler:calendar-event'
        title='Nicio ședință programată'
        description={emptyDescription}
      />
    )
  }

  const renderRow = (evt: EventOccurrenceDTO, index: number) => {
    const start = startOf(evt)
    const live = isLive(evt, now)
    const isUpcoming = live || start > now

    const status = live
      ? { tone: 'accent' as StatusTone, icon: 'tabler:broadcast', label: 'Acum' }
      : isUpcoming
      ? { tone: 'info' as StatusTone, icon: 'tabler:calendar', label: relativeDay(start, now) }
      : pastStatus(evt, user?.id)

    return (
      <Box
        component='li'
        key={evt.id || `${evt.recurringSeriesId}-${index}`}
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 3.5,
          py: 3.5,
          borderTop: index === 0 ? 'none' : `1px solid ${theme.palette.divider}`
        }}
      >
        <Box
          aria-hidden
          sx={{
            width: 48,
            flexShrink: 0,
            py: 1.5,
            borderRadius: '12px',
            textAlign: 'center',
            ...(live
              ? { bgcolor: accentFill(theme), color: 'common.white' }
              : {
                  bgcolor: alpha(theme.palette.text.primary, isUpcoming ? 0.06 : 0.04),
                  color: isUpcoming ? 'text.primary' : 'text.secondary'
                })
          }}
        >
          <Typography
            component='span'
            sx={{
              display: 'block',
              fontSize: '0.6875rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'inherit'
            }}
          >
            {start.toLocaleDateString('ro-RO', { month: 'short' }).replace('.', '')}
          </Typography>
          <Typography
            component='span'
            sx={{ display: 'block', fontSize: '1.125rem', fontWeight: 700, lineHeight: 1.2, color: 'inherit' }}
          >
            {start.getDate()}
          </Typography>
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: '0.9375rem',
                lineHeight: 1.35,
                color: isUpcoming ? 'text.primary' : 'text.secondary'
              }}
            >
              {evt.seriesTitle || 'Ședință'}
            </Typography>
            <StatusPill tone={status.tone} icon={status.icon}>
              {status.label}
            </StatusPill>
          </Box>
          <Typography variant='body2' sx={{ mt: 0.5, color: 'text.secondary' }}>
            {formatTime(start)}
            {evt.professorName && ` · ${evt.professorName}`}
          </Typography>
          {live && evt.meetingLink && (
            <Button
              variant='contained'
              href={evt.meetingLink}
              target='_blank'
              rel='noopener noreferrer'
              endIcon={<Icon icon='tabler:external-link' fontSize='1rem' />}
              sx={{ ...accentButtonSx, mt: 3 }}
            >
              Intră în ședință
            </Button>
          )}
        </Box>
      </Box>
    )
  }

  const sectionLabel = (text: string) => (
    <Typography
      component='h3'
      sx={{
        fontSize: '0.75rem',
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: 'text.secondary'
      }}
    >
      {text}
    </Typography>
  )

  return (
    <InsightCard title='Ședințe' subtitle='Cu profesorul, în următoarele 7 zile'>
      {upcoming.length > 0 ? (
        <>
          {sectionLabel('Urmează')}
          <Box component='ul' sx={{ listStyle: 'none', m: 0, p: 0 }}>
            {upcoming.map(renderRow)}
          </Box>
        </>
      ) : (
        <Typography variant='body2' sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Icon icon='tabler:calendar-off' fontSize='1.125rem' color={accentInk(theme)} aria-hidden />
          Nicio ședință în următoarele 7 zile.
        </Typography>
      )}

      {recent.length > 0 && (
        <Box sx={{ mt: 5 }}>
          {sectionLabel('Recente')}
          <Box component='ul' sx={{ listStyle: 'none', m: 0, p: 0 }}>
            {recent.map(renderRow)}
          </Box>
        </Box>
      )}
    </InsightCard>
  )
}

export default EventsOverview
