// ** React Imports
import React from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Types
import { EventFormValues } from '../types'

// ** Utils
import { format } from 'date-fns'

interface EventDetailsCardsProps {
  selectedEvent: any
  values: EventFormValues
}

const EventDetailsCards: React.FC<EventDetailsCardsProps> = ({ selectedEvent, values }) => {
  // Helper function to format dates
  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMMM d, yyyy h:mm a')
    } catch {
      return dateString
    }
  }

  const formatDateOnly = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMMM d, yyyy')
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

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 3 }}>
      {/* Event Title & Series Information */}
      <Box
        sx={{
          p: 3,
          backgroundColor: 'background.paper',
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            transform: 'translateY(-2px)'
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              mr: 2
            }}
          >
            <Icon icon='tabler:info-circle' fontSize='1.25rem' sx={{ color: 'white' }} />
          </Box>
          <Typography variant='h6' sx={{ fontWeight: 600, color: 'text.primary' }}>
            Event Information
          </Typography>
        </Box>

        {/* Series Title */}
        {selectedEvent.seriesTitle && (
          <Box sx={{ mb: 2 }}>
            <Typography variant='body2' sx={{ color: 'text.secondary', mb: 0.5 }}>
              Series Title
            </Typography>
            <Typography variant='h6' sx={{ fontWeight: 600 }}>
              {selectedEvent.seriesTitle}
            </Typography>
          </Box>
        )}

        {/* Event ID & Series ID */}
        <Stack direction='row' spacing={2} sx={{ mb: 1 }}>
          {selectedEvent.id && (
            <Box>
              <Typography variant='body2' sx={{ color: 'text.secondary', mb: 0.5 }}>
                Event ID
              </Typography>
              <Chip label={selectedEvent.id} size='small' variant='outlined' sx={{ fontFamily: 'monospace' }} />
            </Box>
          )}

          {selectedEvent.recurringSeriesId && (
            <Box>
              <Typography variant='body2' sx={{ color: 'text.secondary', mb: 0.5 }}>
                Series ID
              </Typography>
              <Chip
                label={selectedEvent.recurringSeriesId}
                size='small'
                variant='outlined'
                color='primary'
                sx={{ fontFamily: 'monospace' }}
              />
            </Box>
          )}
        </Stack>
      </Box>

      {/* Schedule & Timing Information */}
      <Box
        sx={{
          p: 3,
          backgroundColor: 'background.paper',
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            transform: 'translateY(-2px)'
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              mr: 2
            }}
          >
            <Icon icon='tabler:calendar' fontSize='1.25rem' sx={{ color: 'white' }} />
          </Box>
          <Typography variant='h6' sx={{ fontWeight: 600, color: 'text.primary' }}>
            Schedule
          </Typography>
        </Box>

        {/* Effective Times (Primary Display) */}
        {selectedEvent.effectiveStartTime && (
          <Box sx={{ mb: 2 }}>
            <Typography variant='body2' sx={{ color: 'text.secondary', mb: 0.5 }}>
              Event Time
            </Typography>
            <Typography variant='body1' sx={{ fontWeight: 500, mb: 1 }}>
              {formatDateTime(selectedEvent.effectiveStartTime)}
              {selectedEvent.effectiveEndTime && ` - ${formatTimeOnly(selectedEvent.effectiveEndTime)}`}
            </Typography>
          </Box>
        )}

        {/* Original Start Time */}
        {selectedEvent.originalStartTime && selectedEvent.originalStartTime !== selectedEvent.effectiveStartTime && (
          <Box sx={{ mb: 2 }}>
            <Typography variant='body2' sx={{ color: 'text.secondary', mb: 0.5 }}>
              Originally Scheduled
            </Typography>
            <Typography variant='body1' sx={{ fontWeight: 500, color: 'warning.main' }}>
              {formatDateTime(selectedEvent.originalStartTime)}
            </Typography>
          </Box>
        )}

        {/* Actual Times (if different from effective) */}
        {selectedEvent.actualStartTime && selectedEvent.actualStartTime !== selectedEvent.effectiveStartTime && (
          <Box sx={{ mb: 2 }}>
            <Typography variant='body2' sx={{ color: 'text.secondary', mb: 0.5 }}>
              Actual Time
            </Typography>
            <Typography variant='body1' sx={{ fontWeight: 500, color: 'success.main' }}>
              {formatDateTime(selectedEvent.actualStartTime)}
              {selectedEvent.actualEndTime && ` - ${formatTimeOnly(selectedEvent.actualEndTime)}`}
            </Typography>
          </Box>
        )}

        {/* Duration */}
        {selectedEvent.duration && (
          <Box sx={{ mb: 1 }}>
            <Typography variant='body2' sx={{ color: 'text.secondary', mb: 0.5 }}>
              Duration
            </Typography>
            <Typography variant='body1' sx={{ fontWeight: 500 }}>
              {selectedEvent.duration.hours ? `${selectedEvent.duration.hours}h ` : ''}
              {selectedEvent.duration.minutes ? `${selectedEvent.duration.minutes}m` : ''}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Professor & Meeting Information */}
      <Box
        sx={{
          p: 3,
          backgroundColor: 'background.paper',
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            transform: 'translateY(-2px)'
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            sx={{
              width: 40,
              height: 40,
              mr: 2,
              background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)'
            }}
          >
            <Icon icon='tabler:user' fontSize='1.25rem' />
          </Avatar>
          <Typography variant='h6' sx={{ fontWeight: 600, color: 'text.primary' }}>
            Instructor & Meeting
          </Typography>
        </Box>

        {selectedEvent.professorName && (
          <Box sx={{ mb: 2 }}>
            <Typography variant='body2' sx={{ color: 'text.secondary', mb: 0.5 }}>
              Professor
            </Typography>
            <Typography variant='h6' sx={{ fontWeight: 600 }}>
              {selectedEvent.professorName}
            </Typography>
            {selectedEvent.professorId && (
              <Typography variant='caption' sx={{ color: 'text.disabled', fontFamily: 'monospace' }}>
                ID: {selectedEvent.professorId}
              </Typography>
            )}
          </Box>
        )}

        {/* Meeting Type & Link */}
        <Stack direction='row' spacing={2} alignItems='center' sx={{ mb: 2 }}>
          <Chip
            icon={<Icon icon={selectedEvent.virtual ? 'tabler:video' : 'tabler:map-pin'} />}
            label={selectedEvent.virtual ? 'Virtual Meeting' : 'In-Person'}
            color={selectedEvent.virtual ? 'secondary' : 'warning'}
            variant='outlined'
          />
        </Stack>

        {selectedEvent.meetingLink && (
          <Box sx={{ mb: 1 }}>
            <Typography variant='body2' sx={{ color: 'text.secondary', mb: 0.5 }}>
              Meeting Link
            </Typography>
            <Typography
              variant='body2'
              sx={{
                fontFamily: 'monospace',
                color: 'primary.main',
                wordBreak: 'break-all'
              }}
            >
              {selectedEvent.meetingLink}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Attendance Information */}
      {(selectedEvent.attendanceCount !== undefined || selectedEvent.eventAttendees) && (
        <Box
          sx={{
            p: 3,
            backgroundColor: 'background.paper',
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
              transform: 'translateY(-2px)'
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                mr: 2
              }}
            >
              <Icon icon='tabler:users' fontSize='1.25rem' sx={{ color: 'text.primary' }} />
            </Box>
            <Typography variant='h6' sx={{ fontWeight: 600, color: 'text.primary' }}>
              Attendance
            </Typography>
          </Box>

          {selectedEvent.attendanceCount !== undefined && (
            <Box sx={{ mb: 1 }}>
              <Typography variant='body2' sx={{ color: 'text.secondary', mb: 0.5 }}>
                {selectedEvent?.completed ? 'Attendance' : 'Attendance Count'}
              </Typography>
              {selectedEvent?.completed && selectedEvent.eventAttendees?.length > 0 ? (
                (() => {
                  const attendedCount = selectedEvent.eventAttendees.filter(
                    (attendee: any) => attendee.attended === true
                  ).length
                  const totalCount = selectedEvent.eventAttendees.length
                  return (
                    <Chip
                      label={`${attendedCount}/${totalCount} attended`}
                      color={attendedCount === totalCount ? 'success' : 'warning'}
                      icon={<Icon icon='tabler:users' />}
                    />
                  )
                })()
              ) : (
                <Chip
                  label={`${selectedEvent.attendanceCount} attendees`}
                  color='info'
                  icon={<Icon icon='tabler:users' />}
                />
              )}
            </Box>
          )}

          {selectedEvent.eventAttendees?.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant='body2' sx={{ color: 'text.secondary', mb: 1 }}>
                {selectedEvent?.completed
                  ? `Attendees (${selectedEvent.eventAttendees.length})`
                  : `Registered Attendees (${selectedEvent.eventAttendees.length})`}
              </Typography>
              <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap>
                {selectedEvent.eventAttendees.slice(0, 5).map((attendee: any, index: number) => {
                  const isAttended = attendee.attended === true
                  const isCompleted = selectedEvent?.completed

                  return (
                    <Chip
                      key={index}
                      label={attendee.studentName || `Attendee ${index + 1}`}
                      size='small'
                      variant={isCompleted ? (isAttended ? 'filled' : 'outlined') : 'outlined'}
                      color={isCompleted ? (isAttended ? 'success' : 'default') : 'default'}
                      icon={isCompleted && isAttended ? <Icon icon='tabler:check' fontSize='0.875rem' /> : undefined}
                      sx={{
                        opacity: isCompleted && !isAttended ? 0.6 : 1,
                        '& .MuiChip-icon': {
                          fontSize: '0.875rem',
                          marginLeft: '4px'
                        }
                      }}
                    />
                  )
                })}
                {selectedEvent.eventAttendees.length > 5 && (
                  <Chip
                    label={`+${selectedEvent.eventAttendees.length - 5} more`}
                    size='small'
                    variant='outlined'
                    color='primary'
                  />
                )}
              </Stack>
            </Box>
          )}
        </Box>
      )}

      {/* Description */}
      {(selectedEvent.seriesDescription || values.description) && (
        <Box
          sx={{
            p: 3,
            backgroundColor: 'background.paper',
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
              transform: 'translateY(-2px)'
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                mr: 2
              }}
            >
              <Icon icon='tabler:file-text' fontSize='1.25rem' sx={{ color: 'text.primary' }} />
            </Box>
            <Typography variant='h6' sx={{ fontWeight: 600, color: 'text.primary' }}>
              Description
            </Typography>
          </Box>
          <Typography
            variant='body1'
            sx={{
              color: 'text.secondary',
              lineHeight: 1.7,
              whiteSpace: 'pre-wrap'
            }}
          >
            {selectedEvent.seriesDescription || values.description}
          </Typography>
        </Box>
      )}

      {/* Event Status */}
      <Box
        sx={{
          p: 3,
          backgroundColor: 'background.paper',
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            transform: 'translateY(-2px)'
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
              mr: 2
            }}
          >
            <Icon icon='tabler:flag' fontSize='1.25rem' sx={{ color: 'text.primary' }} />
          </Box>
          <Typography variant='h6' sx={{ fontWeight: 600, color: 'text.primary' }}>
            Status
          </Typography>
        </Box>

        <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap>
          {selectedEvent.upcoming && <Chip icon={<Icon icon='tabler:clock' />} label='Upcoming' color='primary' />}

          {selectedEvent.completed && (
            <Chip icon={<Icon icon='tabler:check-circle' />} label='Completed' color='success' />
          )}

          {selectedEvent.cancelled && <Chip icon={<Icon icon='tabler:x-circle' />} label='Cancelled' color='error' />}

          {selectedEvent.missed && <Chip icon={<Icon icon='tabler:clock-x' />} label='Missed' color='warning' />}

          {selectedEvent.rescheduled && (
            <Chip icon={<Icon icon='tabler:calendar-time' />} label='Rescheduled' color='info' />
          )}
        </Stack>
      </Box>

      {/* Metadata */}
      {(selectedEvent.creation || selectedEvent.modified) && (
        <Box
          sx={{
            p: 3,
            backgroundColor: 'background.paper',
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
              transform: 'translateY(-2px)'
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #e0c3fc 0%, #9bb5ff 100%)',
                mr: 2
              }}
            >
              <Icon icon='tabler:history' fontSize='1.25rem' sx={{ color: 'text.primary' }} />
            </Box>
            <Typography variant='h6' sx={{ fontWeight: 600, color: 'text.primary' }}>
              Record Information
            </Typography>
          </Box>

          {selectedEvent.creation && (
            <Box sx={{ mb: 2 }}>
              <Typography variant='body2' sx={{ color: 'text.secondary', mb: 0.5 }}>
                Created
              </Typography>
              <Typography variant='body2' sx={{ fontWeight: 500 }}>
                {formatDateTime(selectedEvent.creation)}
              </Typography>
            </Box>
          )}

          {selectedEvent.modified && (
            <Box sx={{ mb: 1 }}>
              <Typography variant='body2' sx={{ color: 'text.secondary', mb: 0.5 }}>
                Last Modified
              </Typography>
              <Typography variant='body2' sx={{ fontWeight: 500 }}>
                {formatDateTime(selectedEvent.modified)}
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  )
}

export default EventDetailsCards
