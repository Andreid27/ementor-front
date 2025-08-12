// ** React Imports
import React, { useMemo } from 'react'
import { useSelector } from 'react-redux'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Avatar from '@mui/material/Avatar'
import { useTheme } from '@mui/material/styles'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Components
import EventHeroSection from './EventHeroSection'
import EventMeetingLink from './EventMeetingLink'
import SidebarFooter from './SidebarFooter'

// ** Redux Selectors
import { selectSelectedEvent } from 'src/store/apps/calendar/index'

// ** Utils
import { format } from 'date-fns'
import { enrichAttendeesWithStudentData } from '../utils/eventAttendeeUtils'

interface EventDetailItem {
  icon: string
  label: string
  value: string | React.ReactNode
  color?: string
}

interface StudentData {
  id?: string
  userId?: string
  firstName?: string
  lastName?: string
  email?: string
  profilePicture?: string
  picture?: string
  [key: string]: any
}

interface EventViewImprovedProps {
  selectedEvent?: any
  values?: any
  students?: any[]
  onClose: () => void
}

const EventViewImproved: React.FC<EventViewImprovedProps> = ({
  selectedEvent: propSelectedEvent,
  values,
  students = [],
  onClose
}) => {
  const theme = useTheme()
  const selectedEventFromStore = useSelector(selectSelectedEvent)
  // Use prop selectedEvent if available, otherwise fall back to store
  const selectedEvent = propSelectedEvent || selectedEventFromStore
  const meetingLink = selectedEvent?.meetingLink

  // Helper functions similar to AttendeeManager
  const getStudentDisplayName = (student: StudentData) => {
    return student.firstName && student.lastName
      ? `${student.firstName} ${student.lastName}`
      : student.firstName || student.lastName || student.email || 'Unknown'
  }

  const getStudentInitials = (student: StudentData) => {
    if (student.firstName && student.lastName) {
      return `${student.firstName.charAt(0)}${student.lastName.charAt(0)}`.toUpperCase()
    }
    if (student.firstName) return student.firstName.charAt(0).toUpperCase()
    if (student.email) return student.email.charAt(0).toUpperCase()
    return '?'
  }

  // Enrich attendees with student data
  const enrichedAttendees = useMemo(() => {
    if (!selectedEvent?.eventAttendees || !students) return []
    return enrichAttendeesWithStudentData(selectedEvent.eventAttendees, students)
  }, [selectedEvent?.eventAttendees, students])

  // Helper functions for date formatting
  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMMM d, yyyy h:mm a')
    } catch {
      return dateString
    }
  }

  const formatTimeOnly = (dateString: string) => {
    try {
      return format(new Date(dateString), 'h:mm a')
    } catch {
      return dateString
    }
  }

  const eventDetails = useMemo((): EventDetailItem[] => {
    const details: EventDetailItem[] = []

    // Date and Time - using effective times as primary
    if (selectedEvent?.effectiveStartTime) {
      const startTime = formatDateTime(selectedEvent.effectiveStartTime)
      const endTime = selectedEvent.effectiveEndTime ? formatTimeOnly(selectedEvent.effectiveEndTime) : null

      details.push({
        icon: 'tabler:calendar',
        label: 'Date & Time',
        value: endTime ? `${startTime} - ${endTime}` : startTime,
        color: theme.palette.primary.main
      })
    }

    // Professor Information
    if (selectedEvent?.professorName) {
      details.push({
        icon: 'tabler:user',
        label: 'Professor',
        value: selectedEvent.professorName,
        color: theme.palette.info.main
      })
    }

    // Virtual/Location
    if (selectedEvent?.virtual !== undefined) {
      details.push({
        icon: selectedEvent.virtual ? 'tabler:video' : 'tabler:map-pin',
        label: 'Type',
        value: selectedEvent.virtual ? 'Virtual Meeting' : 'In-Person',
        color: selectedEvent.virtual ? theme.palette.secondary.main : theme.palette.warning.main
      })
    }

    // Duration
    if (selectedEvent?.duration?.seconds) {
      const totalMinutes = Math.floor(selectedEvent.duration.seconds / 60)
      const hours = Math.floor(totalMinutes / 60)
      const minutes = totalMinutes % 60

      const duration = []
      if (hours > 0) duration.push(`${hours}h`)
      if (minutes > 0) duration.push(`${minutes}m`)

      if (duration.length > 0) {
        details.push({
          icon: 'tabler:clock',
          label: 'Duration',
          value: duration.join(' '),
          color: theme.palette.success.main
        })
      }
    }

    // Attendance Count
    if (selectedEvent?.attendanceCount !== undefined) {
      if (selectedEvent?.completed && enrichedAttendees?.length > 0) {
        // For completed events, show attended vs total count
        const attendedCount = enrichedAttendees.filter((attendee: any) => attendee.attended === true).length
        const totalCount = enrichedAttendees.length
        details.push({
          icon: 'tabler:users',
          label: 'Attendance',
          value: `${attendedCount}/${totalCount} attended`,
          color: attendedCount === totalCount ? theme.palette.success.main : theme.palette.warning.main
        })
      } else {
        // For non-completed events, show registered count
        details.push({
          icon: 'tabler:users',
          label: 'Attendees',
          value: `${selectedEvent.attendanceCount} registered`,
          color: theme.palette.info.main
        })
      }
    }

    return details
  }, [selectedEvent, theme])

  const eventStatus = useMemo(() => {
    const statuses = []

    if (selectedEvent?.completed) statuses.push({ label: 'Completed', color: 'success', icon: 'tabler:check-circle' })
    if (selectedEvent?.cancelled) statuses.push({ label: 'Cancelled', color: 'error', icon: 'tabler:x-circle' })
    if (selectedEvent?.missed) statuses.push({ label: 'Missed', color: 'warning', icon: 'tabler:clock-x' })
    if (selectedEvent?.rescheduled) statuses.push({ label: 'Rescheduled', color: 'info', icon: 'tabler:calendar-time' })
    if (selectedEvent?.upcoming) statuses.push({ label: 'Upcoming', color: 'primary', icon: 'tabler:clock' })

    return statuses
  }, [selectedEvent])

  return (
    <Box sx={{ height: '100%', overflow: 'auto' }}>
      {/* Hero Section */}
      <EventHeroSection />

      {/* Event Information Card */}
      {(selectedEvent?.seriesTitle || selectedEvent?.id) && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  bgcolor: `${theme.palette.primary.main}20`,
                  color: theme.palette.primary.main
                }}
              >
                <Icon icon='tabler:info-circle' fontSize='1.25rem' />
              </Box>
              <Typography variant='h6' sx={{ fontWeight: 600 }}>
                Event Information
              </Typography>
            </Box>

            {selectedEvent.seriesTitle && (
              <Typography variant='subtitle1' sx={{ fontWeight: 600, mb: 1 }}>
                {selectedEvent.seriesTitle}
              </Typography>
            )}

            <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap>
              {selectedEvent.id && (
                <Chip
                  label={`ID: ${selectedEvent.id}`}
                  size='small'
                  variant='outlined'
                  sx={{ fontFamily: 'monospace' }}
                />
              )}
              {selectedEvent.recurringSeriesId && (
                <Chip
                  label={`Series: ${selectedEvent.recurringSeriesId}`}
                  size='small'
                  variant='outlined'
                  color='primary'
                  sx={{ fontFamily: 'monospace' }}
                />
              )}
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Status Chips */}
      {eventStatus.length > 0 && (
        <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {eventStatus.map((status, index) => (
            <Chip
              key={index}
              icon={<Icon icon={status.icon} />}
              label={status.label}
              color={status.color as any}
              size='small'
              sx={{ fontWeight: 600 }}
            />
          ))}
        </Box>
      )}

      {/* Meeting Link - Priority Section */}
      <EventMeetingLink meetingLink={meetingLink} />

      {/* Event Details Cards */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
        {eventDetails.map((detail, index) => (
          <Card
            key={index}
            sx={{
              borderLeft: `4px solid ${detail.color}`,
              boxShadow: theme.shadows[1],
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                boxShadow: theme.shadows[4],
                transform: 'translateY(-1px)'
              }
            }}
          >
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    bgcolor: `${detail.color}20`,
                    color: detail.color
                  }}
                >
                  <Icon icon={detail.icon} fontSize='1.25rem' />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 600 }}>
                    {detail.label}
                  </Typography>
                  <Typography variant='body2' sx={{ fontWeight: 500, mt: 0.5 }}>
                    {detail.value}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Original vs Actual Times */}
      {selectedEvent?.originalStartTime && selectedEvent.originalStartTime !== selectedEvent.effectiveStartTime && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Icon icon='tabler:calendar-time' fontSize='1.25rem' color='warning.main' />
              <Typography variant='subtitle2' sx={{ fontWeight: 600 }}>
                Schedule Changes
              </Typography>
            </Box>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
              Originally scheduled: {formatDateTime(selectedEvent.originalStartTime)}
            </Typography>
            {selectedEvent.actualStartTime && selectedEvent.actualStartTime !== selectedEvent.effectiveStartTime && (
              <Typography variant='body2' color='success.main'>
                Actually occurred: {formatDateTime(selectedEvent.actualStartTime)}
                {selectedEvent.actualEndTime && ` - ${formatTimeOnly(selectedEvent.actualEndTime)}`}
              </Typography>
            )}
          </CardContent>
        </Card>
      )}

      {/* Attendees Details */}
      {enrichedAttendees?.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Icon icon='tabler:users' fontSize='1.25rem' color='info.main' />
              <Typography variant='subtitle2' sx={{ fontWeight: 600 }}>
                {selectedEvent?.completed
                  ? `Attendees (${enrichedAttendees.length})`
                  : `Registered Attendees (${enrichedAttendees.length})`}
              </Typography>
            </Box>
            <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap>
              {enrichedAttendees.slice(0, 8).map((enrichedAttendee: any, index: number) => {
                const student = enrichedAttendee.student
                const displayName = student
                  ? getStudentDisplayName(student)
                  : enrichedAttendee.displayName || `Attendee ${index + 1}`
                const initials = student ? getStudentInitials(student) : (displayName[0] || 'A').toUpperCase()
                const profilePicture = student?.profilePicture || student?.picture
                const isAttended = enrichedAttendee.attended === true
                const isCompleted = selectedEvent?.completed

                return (
                  <Chip
                    key={enrichedAttendee.attendeeId || index}
                    label={displayName}
                    size='small'
                    variant={isCompleted ? (isAttended ? 'filled' : 'outlined') : 'outlined'}
                    color={isCompleted ? (isAttended ? 'success' : 'default') : 'default'}
                    avatar={
                      <Avatar sx={{ width: 24, height: 24 }} src={profilePicture}>
                        {initials}
                      </Avatar>
                    }
                    icon={isCompleted && isAttended ? <Icon icon='tabler:check' fontSize='0.875rem' /> : undefined}
                    sx={{
                      '& .MuiChip-avatar': {
                        width: 24,
                        height: 24,
                        fontSize: '0.75rem'
                      },
                      '& .MuiChip-icon': {
                        fontSize: '0.875rem',
                        marginLeft: '4px'
                      },
                      opacity: isCompleted && !isAttended ? 0.6 : 1
                    }}
                  />
                )
              })}
              {enrichedAttendees.length > 8 && (
                <Chip label={`+${enrichedAttendees.length - 8} more`} size='small' variant='outlined' color='primary' />
              )}
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Description */}
      {selectedEvent?.seriesDescription && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Icon icon='tabler:file-text' fontSize='1.25rem' color='text.secondary' />
              <Typography variant='subtitle2' sx={{ fontWeight: 600 }}>
                Description
              </Typography>
            </Box>
            <Typography variant='body2' color='text.secondary' sx={{ lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {selectedEvent.seriesDescription}
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Professor Details */}
      {selectedEvent?.professorId && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)'
                }}
              >
                <Icon icon='tabler:user' fontSize='1.25rem' />
              </Avatar>
              <Box>
                <Typography variant='subtitle2' sx={{ fontWeight: 600 }}>
                  {selectedEvent.professorName || 'Professor'}
                </Typography>
                <Typography variant='caption' color='text.secondary' sx={{ fontFamily: 'monospace' }}>
                  ID: {selectedEvent.professorId}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Metadata */}
      {(selectedEvent?.creation || selectedEvent?.modified) && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Icon icon='tabler:history' fontSize='1.25rem' color='text.secondary' />
              <Typography variant='subtitle2' sx={{ fontWeight: 600 }}>
                Record Information
              </Typography>
            </Box>
            {selectedEvent.creation && (
              <Typography variant='body2' color='text.secondary' sx={{ mb: 0.5 }}>
                Created: {formatDateTime(selectedEvent.creation)}
              </Typography>
            )}
            {selectedEvent.modified && (
              <Typography variant='body2' color='text.secondary'>
                Modified: {formatDateTime(selectedEvent.modified)}
              </Typography>
            )}
          </CardContent>
        </Card>
      )}

      <Divider sx={{ my: 3 }} />

      {/* Footer */}
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <SidebarFooter isEditMode={false} onClose={onClose} onCancel={() => {}} onReset={() => {}} />
      </Box>
    </Box>
  )
}

export default React.memo(EventViewImproved)
