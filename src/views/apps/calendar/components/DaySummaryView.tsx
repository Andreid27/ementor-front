// ** React Imports
import React from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Chip from '@mui/material/Chip'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

interface DaySummaryViewProps {
  selectedDate: Date
  eventsForDay: any[]
  onEventClick: (event: any) => void
  onAddNewEvent: () => void
  onClose: () => void
}

const DaySummaryView: React.FC<DaySummaryViewProps> = ({
  selectedDate,
  eventsForDay,
  onEventClick,
  onAddNewEvent,
  onClose
}) => {
  const formatEventTime = (event: any) => {
    if (event.allDay) {
      return 'All Day'
    }

    const startTime = new Date(event.effectiveStartTime || event.start).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })

    const endTime = new Date(event.effectiveEndTime || event.end).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })

    return `${startTime} - ${endTime}`
  }

  const getEventIcon = (event: any) => {
    if (event.extendedProps?.virtual) {
      return 'tabler:video'
    }
    if (event.extendedProps?.recurringSeriesId) {
      return 'tabler:repeat'
    }

    return 'tabler:calendar-event'
  }

  const getEventStatusColor = (event: any) => {
    if (event.extendedProps?.completed) return 'success'
    if (event.extendedProps?.cancelled) return 'error'
    if (event.extendedProps?.upcoming) return 'info'
    if (event.extendedProps?.missed) return 'warning'

    return 'default'
  }

  const getEventStatusText = (event: any) => {
    if (event.extendedProps?.completed) return 'Completed'
    if (event.extendedProps?.cancelled) return 'Cancelled'
    if (event.extendedProps?.upcoming) return 'Upcoming'
    if (event.extendedProps?.missed) return 'Missed'

    return null
  }

  return (
    <Box sx={{ height: '100%', overflow: 'auto' }}>
      {/* Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 4,
          p: 4,
          mb: 3,
          color: 'white',
          textAlign: 'center'
        }}
      >
        <Icon icon='tabler:calendar-stats' fontSize='3rem' sx={{ mb: 2 }} />
        <Typography variant='h4' sx={{ fontWeight: 700, mb: 1 }}>
          {selectedDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </Typography>
        <Typography variant='body1' sx={{ opacity: 0.9 }}>
          {eventsForDay.length} {eventsForDay.length === 1 ? 'event' : 'events'} scheduled
        </Typography>
      </Box>

      {/* Add New Event Button */}
      <Box sx={{ mb: 3 }}>
        <Button
          fullWidth
          variant='contained'
          color='primary'
          startIcon={<Icon icon='tabler:plus' />}
          onClick={onAddNewEvent}
          sx={{
            py: 1.5,
            fontSize: '1rem',
            fontWeight: 600,
            '&:hover': {
              transform: 'translateY(-1px)'
            },
            transition: 'all 0.3s ease'
          }}
        >
          Add New Event for This Day
        </Button>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Events List */}
      <Box sx={{ space: 2 }}>
        {eventsForDay.map((event, index) => (
          <Card
            key={index}
            sx={{
              mb: 2,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                transform: 'translateY(-2px)'
              }
            }}
            onClick={() => onEventClick(event)}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      mr: 2,
                      color: 'white'
                    }}
                  >
                    <Icon icon={getEventIcon(event)} fontSize='1.25rem' />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant='h6' sx={{ fontWeight: 600, mb: 0.5 }}>
                      {event.seriesTitle || event.title || 'Untitled Event'}
                    </Typography>
                    <Typography variant='body2' sx={{ color: 'text.secondary', mb: 1 }}>
                      {formatEventTime(event)}
                    </Typography>
                    {event.extendedProps?.professorName && (
                      <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                        <Icon icon='tabler:user' fontSize='1rem' sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                        {event.extendedProps.professorName}
                      </Typography>
                    )}
                  </Box>
                </Box>

                {/* Status and badges */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                  {getEventStatusText(event) && (
                    <Chip
                      label={getEventStatusText(event)}
                      color={getEventStatusColor(event)}
                      size='small'
                      sx={{ fontWeight: 500 }}
                    />
                  )}

                  {event.extendedProps?.price !== undefined && (
                    <Chip
                      label={event.extendedProps.price === 0 ? 'Free' : `$${event.extendedProps.price}`}
                      color={event.extendedProps.price === 0 ? 'success' : 'warning'}
                      size='small'
                      sx={{ fontWeight: 500 }}
                    />
                  )}
                </Box>
              </Box>

              {event.seriesDescription || event.description ? (
                <Typography variant='body2' sx={{ color: 'text.secondary', mt: 1 }}>
                  {event.seriesDescription || event.description}
                </Typography>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Footer */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          mt: 4,
          pt: 3,
          borderTop: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Button
          variant='outlined'
          color='secondary'
          onClick={onClose}
          sx={{
            py: 1.5,
            px: 4,
            fontSize: '1rem',
            fontWeight: 500,
            '&:hover': {
              transform: 'translateY(-1px)'
            },
            transition: 'all 0.3s ease'
          }}
        >
          Close
        </Button>
      </Box>
    </Box>
  )
}

export default DaySummaryView
