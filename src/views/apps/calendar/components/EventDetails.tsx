// ** React Imports
import React from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Avatar from '@mui/material/Avatar'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'

// ** Icons
import EventIcon from '@mui/icons-material/Event'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import PersonIcon from '@mui/icons-material/Person'
import LinkIcon from '@mui/icons-material/Link'
import DescriptionIcon from '@mui/icons-material/Description'
import GroupIcon from '@mui/icons-material/Group'
import RepeatIcon from '@mui/icons-material/Repeat'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import ScheduleIcon from '@mui/icons-material/Schedule'
import UpdateIcon from '@mui/icons-material/Update'
import CreateIcon from '@mui/icons-material/Create'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'

// ** Types
import { EventOccurrenceDTO, SingularEventDTO } from 'src/generated/profile-service'

interface EventDetailsProps {
  event: EventOccurrenceDTO | SingularEventDTO | any
}

interface DetailItemProps {
  icon: React.ReactElement
  label: string
  value: string | React.ReactElement
  color?: 'primary' | 'secondary' | 'default'
}

const DetailItem: React.FC<DetailItemProps> = ({ icon, label, value, color = 'default' }) => (
  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, py: 1 }}>
    <Box sx={{ color: `${color}.main`, display: 'flex', alignItems: 'center', mt: 0.5 }}>
      {icon}
    </Box>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mb: 0.5 }}>
        {label}
      </Typography>
      <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
        {value}
      </Typography>
    </Box>
  </Box>
)

const EventDetails: React.FC<EventDetailsProps> = ({ event }) => {
  if (!event) return null

  // Helper function to format date/time
  const formatDateTime = (dateString: string | undefined) => {
    if (!dateString) return 'Not specified'
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  // Helper function to format duration
  const formatDuration = (duration: any) => {
    if (!duration || !duration.units) return 'Not specified'
    
    const parts: string[] = []
    duration.units.forEach((unit: any) => {
      if (unit.duration && unit.duration.amount > 0) {
        const amount = unit.duration.amount
        const unitType = unit.duration.unit?.toLowerCase() || 'units'
        parts.push(`${amount} ${unitType}${amount !== 1 ? 's' : ''}`)
      }
    })
    
    return parts.length > 0 ? parts.join(', ') : 'Not specified'
  }

  // Helper function to format attendee status
  const formatAttendeeStatus = (attendees: any[]) => {
    if (!attendees || attendees.length === 0) return { total: 0, expected: 0, attended: 0 }
    
    const total = attendees.length
    const expected = attendees.filter(a => a.expected).length
    const attended = attendees.filter(a => a.attended).length
    
    return { total, expected, attended }
  }

  const attendeeStats = formatAttendeeStatus(event.eventAttendees || [])
  const isRecurringEvent = !!(event.recurringSeriesId || event.seriesTitle)

  return (
    <Paper elevation={1} sx={{ p: 3 }}>
      <Stack spacing={3}>
        {/* Header Section */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <EventIcon />
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                {event.title || event.seriesTitle || 'Untitled Event'}
              </Typography>
              {isRecurringEvent && (
                <Chip
                  icon={<RepeatIcon />}
                  label="Recurring Event"
                  color="secondary"
                  variant="outlined"
                  size="small"
                  sx={{ mb: 1 }}
                />
              )}
            </Box>
          </Box>

          {/* Description */}
          {(event.description || event.seriesDescription) && (
            <DetailItem
              icon={<DescriptionIcon />}
              label="Description"
              value={event.description || event.seriesDescription}
              color="primary"
            />
          )}
        </Box>

        <Divider />

        {/* Time & Schedule Information */}
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
            Schedule Information
          </Typography>
          <Stack spacing={2}>
            {/* Start Time */}
            {(event.startTime || event.actualStartTime || event.originalStartTime) && (
              <DetailItem
                icon={<AccessTimeIcon />}
                label="Start Time"
                value={formatDateTime(event.startTime || event.actualStartTime || event.originalStartTime)}
              />
            )}

            {/* End Time (for occurrences) */}
            {event.actualEndTime && (
              <DetailItem
                icon={<ScheduleIcon />}
                label="End Time"
                value={formatDateTime(event.actualEndTime)}
              />
            )}

            {/* Duration */}
            {event.duration && (
              <DetailItem
                icon={<ScheduleIcon />}
                label="Duration"
                value={formatDuration(event.duration)}
              />
            )}

            {/* Original Start Time (for modified occurrences) */}
            {event.originalStartTime && event.actualStartTime && event.originalStartTime !== event.actualStartTime && (
              <DetailItem
                icon={<UpdateIcon />}
                label="Original Start Time"
                value={formatDateTime(event.originalStartTime)}
                color="secondary"
              />
            )}
          </Stack>
        </Box>

        <Divider />

        {/* Professor & Meeting Information */}
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
            Meeting Information
          </Typography>
          <Stack spacing={2}>
            {/* Professor */}
            {event.professorName && (
              <DetailItem
                icon={<PersonIcon />}
                label="Professor"
                value={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                      {event.professorName.charAt(0).toUpperCase()}
                    </Avatar>
                    <span>{event.professorName}</span>
                  </Box>
                }
              />
            )}

            {/* Meeting Link */}
            {event.meetingLink && (
              <DetailItem
                icon={<LinkIcon />}
                label="Meeting Link"
                value={
                  <Box
                    component="a"
                    href={event.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      color: 'primary.main',
                      textDecoration: 'none',
                      '&:hover': { textDecoration: 'underline' },
                      wordBreak: 'break-all'
                    }}
                  >
                    {event.meetingLink}
                  </Box>
                }
                color="primary"
              />
            )}
          </Stack>
        </Box>

        <Divider />

        {/* Attendee Information (without pricing) */}
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
            Attendee Information
          </Typography>
          <Stack spacing={2}>
            <DetailItem
              icon={<GroupIcon />}
              label="Total Attendees"
              value={attendeeStats.total.toString()}
            />
            
            {attendeeStats.expected > 0 && (
              <DetailItem
                icon={<CheckCircleIcon />}
                label="Expected Attendees"
                value={attendeeStats.expected.toString()}
                color="primary"
              />
            )}
            
            {attendeeStats.attended > 0 && (
              <DetailItem
                icon={<CheckCircleIcon />}
                label="Attended"
                value={attendeeStats.attended.toString()}
                color="secondary"
              />
            )}

            {event.attendanceCount !== undefined && (
              <DetailItem
                icon={<GroupIcon />}
                label="Attendance Count"
                value={event.attendanceCount.toString()}
              />
            )}
          </Stack>
        </Box>

        {/* Recurring Series Information */}
        {isRecurringEvent && (
          <>
            <Divider />
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: 'secondary.main' }}>
                Recurring Series Information
              </Typography>
              <Stack spacing={2}>
                {event.recurringSeriesId && (
                  <DetailItem
                    icon={<RepeatIcon />}
                    label="Series ID"
                    value={event.recurringSeriesId}
                    color="secondary"
                  />
                )}
                
                {event.seriesTitle && event.seriesTitle !== event.title && (
                  <DetailItem
                    icon={<EventIcon />}
                    label="Series Title"
                    value={event.seriesTitle}
                    color="secondary"
                  />
                )}
              </Stack>
            </Box>
          </>
        )}

        <Divider />

        {/* Metadata */}
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: 'text.secondary' }}>
            Metadata
          </Typography>
          <Stack spacing={2}>
            {event.id && (
              <DetailItem
                icon={<HelpOutlineIcon />}
                label="Event ID"
                value={event.id}
              />
            )}
            
            {event.creation && (
              <DetailItem
                icon={<CreateIcon />}
                label="Created"
                value={formatDateTime(event.creation)}
              />
            )}
            
            {event.modified && (
              <DetailItem
                icon={<UpdateIcon />}
                label="Last Modified"
                value={formatDateTime(event.modified)}
              />
            )}
          </Stack>
        </Box>
      </Stack>
    </Paper>
  )
}

export default EventDetails
