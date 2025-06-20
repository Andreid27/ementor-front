// ** React Imports
import React from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Types
import { EventFormValues } from '../types'

interface EventDetailsCardsProps {
  selectedEvent: any
  values: EventFormValues
}

const EventDetailsCards: React.FC<EventDetailsCardsProps> = ({ selectedEvent, values }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
      {/* Schedule Card */}
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

        {selectedEvent.allDay ? (
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              px: 2,
              py: 1,
              backgroundColor: 'success.main',
              borderRadius: 2,
              color: 'white'
            }}
          >
            <Icon icon='tabler:clock' fontSize='1rem' />
            <Typography variant='body2' sx={{ fontWeight: 600 }}>
              All Day Event
            </Typography>
          </Box>
        ) : (
          <>
            {selectedEvent.start && (
              <Box sx={{ mb: 1.5 }}>
                <Typography variant='body2' sx={{ color: 'text.secondary', mb: 0.5 }}>
                  Start Time
                </Typography>
                <Typography variant='body1' sx={{ fontWeight: 500 }}>
                  {new Date(selectedEvent.start).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Typography>
                <Typography variant='body1' sx={{ fontWeight: 500, color: 'primary.main' }}>
                  {new Date(selectedEvent.start).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Typography>
              </Box>
            )}

            {selectedEvent.end && (
              <Box sx={{ mb: 1.5 }}>
                <Typography variant='body2' sx={{ color: 'text.secondary', mb: 0.5 }}>
                  End Time
                </Typography>
                <Typography variant='body1' sx={{ fontWeight: 500, color: 'primary.main' }}>
                  {new Date(selectedEvent.end).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Typography>
              </Box>
            )}
          </>
        )}
      </Box>

      {/* Instructor Card */}
      {selectedEvent.extendedProps?.professorName && (
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
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
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
            <Box>
              <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                Instructor
              </Typography>
              <Typography variant='h6' sx={{ fontWeight: 600 }}>
                {selectedEvent.extendedProps.professorName}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      {/* Description Card */}
      {(selectedEvent.extendedProps?.description || values.description) && (
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
            {selectedEvent.extendedProps?.description || values.description}
          </Typography>
        </Box>
      )}

      {/* Event Status */}
      {(selectedEvent.extendedProps?.cancelled || selectedEvent.extendedProps?.completed) && (
        <Box
          sx={{
            p: 3,
            backgroundColor: 'background.paper',
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
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
                background: selectedEvent.extendedProps?.cancelled
                  ? 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)'
                  : 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                mr: 2
              }}
            >
              <Icon
                icon={selectedEvent.extendedProps?.cancelled ? 'tabler:x-circle' : 'tabler:check-circle'}
                fontSize='1.25rem'
                sx={{ color: 'text.primary' }}
              />
            </Box>
            <Typography variant='h6' sx={{ fontWeight: 600, color: 'text.primary' }}>
              Status
            </Typography>
          </Box>

          {selectedEvent.extendedProps?.cancelled && (
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                px: 3,
                py: 1.5,
                backgroundColor: 'error.main',
                color: 'white',
                borderRadius: 3,
                fontWeight: 600
              }}
            >
              <Icon icon='tabler:x-circle' fontSize='1rem' />
              Event Cancelled
            </Box>
          )}

          {selectedEvent.extendedProps?.completed && (
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                px: 3,
                py: 1.5,
                backgroundColor: 'success.main',
                color: 'white',
                borderRadius: 3,
                fontWeight: 600
              }}
            >
              <Icon icon='tabler:check-circle' fontSize='1rem' />
              Event Completed
            </Box>
          )}
        </Box>
      )}
    </Box>
  )
}

export default EventDetailsCards
