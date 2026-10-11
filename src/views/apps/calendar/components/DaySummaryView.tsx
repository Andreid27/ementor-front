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
import EventStatusChip from './EventStatusChip'
import { formatEventPrice, getEventStatus } from '../utils/eventStatus'

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
  // The day's events are raw occurrences from the store, so every field is read from the event itself
  const formatEventTime = (event: any) => {
    if (event.allDay) {
      return 'Toată ziua'
    }

    const timeOptions: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' }
    const startTime = new Date(event.effectiveStartTime || event.start).toLocaleTimeString('ro-RO', timeOptions)
    const endTime = new Date(event.effectiveEndTime || event.end).toLocaleTimeString('ro-RO', timeOptions)

    return `${startTime} – ${endTime}`
  }

  const getEventIcon = (event: any) => {
    if (event.virtual) {
      return 'tabler:video'
    }
    if (event.recurringSeriesId) {
      return 'tabler:repeat'
    }

    return 'tabler:calendar-event'
  }

  // Romanian counts take "de" from 20 on: 1 eveniment, 3 evenimente, 20 de evenimente
  const countLabel = (count: number) =>
    count === 1 ? '1 eveniment programat' : `${count} ${count >= 20 ? 'de ' : ''}evenimente programate`

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
          {selectedDate.toLocaleDateString('ro-RO', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </Typography>
        <Typography variant='body1' sx={{ opacity: 0.9 }}>
          {countLabel(eventsForDay.length)}
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
          Adaugă Eveniment
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
                      {event.seriesTitle || event.title || 'Eveniment fără titlu'}
                    </Typography>
                    <Typography variant='body2' sx={{ color: 'text.secondary', mb: 1 }}>
                      {formatEventTime(event)}
                    </Typography>
                    {event.professorName && (
                      <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                        <Icon icon='tabler:user' fontSize='1rem' sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                        {event.professorName}
                      </Typography>
                    )}
                  </Box>
                </Box>

                {/* Status and badges */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                  {(() => {
                    const status = getEventStatus(event)

                    return status.icon ? (
                      <EventStatusChip label={status.label} icon={status.icon} color={status.color} />
                    ) : null
                  })()}

                  {/* Price is information, not a status, so it gets a neutral chip */}
                  {formatEventPrice(event) && (
                    <Chip label={formatEventPrice(event)} size='small' variant='outlined' sx={{ fontWeight: 500 }} />
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
          Închide
        </Button>
      </Box>
    </Box>
  )
}

export default DaySummaryView
