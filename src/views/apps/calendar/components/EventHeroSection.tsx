// ** React Imports
import React from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

// ** Redux Imports
import { useSelector } from 'react-redux'
import { selectSelectedEvent } from 'src/store/apps/calendar/index'

// ** Types
import { EventOccurrenceDTO } from 'src/generated/profile-service'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

const EventHeroSection: React.FC = () => {
  const selectedEvent = useSelector(selectSelectedEvent) as EventOccurrenceDTO | null
  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: 4,
        p: 5,
        mb: 3,
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
          background: 'linear-gradient(135deg, #5a6fd8 0%, #6b4190 100%)',
          '& .hero-bg-element-1': {
            transform: 'translate(10px, -10px) scale(1.1)',
            opacity: 0.15
          },
          '& .hero-bg-element-2': {
            transform: 'translate(-10px, 10px) scale(1.2)',
            opacity: 0.12
          },
          '& .hero-bg-element-3': {
            transform: 'translate(5px, -5px) scale(1.05)',
            opacity: 0.1
          }
        }
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 2 }}>
        <Typography
          variant='h4'
          sx={{
            fontWeight: 800,
            mb: 2,
            color: '#ffffff',
            textShadow: '0 3px 6px rgba(0,0,0,0.4)',
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              textShadow: '0 5px 15px rgba(0,0,0,0.5)',
              transform: 'translateY(-1px)'
            }
          }}
        >
          {selectedEvent?.seriesTitle || 'Untitled Event'}
        </Typography>

        {/* Event Type Badge */}
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.75,
              px: 3,
              py: 1,
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: 50,
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.3)',
              fontSize: '0.875rem',
              fontWeight: 600,
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.3)',
                transform: 'translateY(-1px)',
                boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
              }
            }}
          >
            <Icon icon={selectedEvent.virtual ? 'tabler:video' : 'tabler:map-pin'} fontSize='1.1rem' />
            {selectedEvent.virtual ? 'Virtual' : 'In-Person'}
          </Box>

          {selectedEvent.recurringSeriesId && (
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.75,
                px: 3,
                py: 1,
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: 50,
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.3)',
                fontSize: '0.875rem',
                fontWeight: 600,
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.3)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
                }
              }}
            >
              <Icon icon='tabler:repeat' fontSize='1.1rem' />
              Recurring
            </Box>
          )}

          {selectedEvent.price !== undefined && (
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.75,
                px: 3,
                py: 1,
                backgroundColor: selectedEvent.price === 0 ? 'rgba(76, 175, 80, 0.85)' : 'rgba(255, 193, 7, 0.85)',
                borderRadius: 50,
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.4)',
                fontSize: '0.875rem',
                fontWeight: 700,
                boxShadow: '0 3px 10px rgba(0,0,0,0.2)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: '0 5px 20px rgba(0,0,0,0.3)'
                }
              }}
            >
              {selectedEvent.price === 0 ? 'Free' : `${selectedEvent.price} RON`}
            </Box>
          )}
        </Box>
      </Box>

      {/* Enhanced Decorative Background Elements */}
      <Box
        className='hero-bg-element-1'
        sx={{
          position: 'absolute',
          top: -30,
          right: -30,
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)',
          zIndex: 1,
          transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      />
      <Box
        className='hero-bg-element-2'
        sx={{
          position: 'absolute',
          bottom: -40,
          left: -40,
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
          zIndex: 1,
          transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      />
      <Box
        className='hero-bg-element-3'
        sx={{
          position: 'absolute',
          top: '50%',
          right: '10%',
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)',
          zIndex: 1,
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      />

      {/* Subtle Pattern Overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 30% 20%, rgba(255,255,255,0.1) 0%, transparent 50%),
                      radial-gradient(circle at 70% 80%, rgba(255,255,255,0.08) 0%, transparent 50%)`,
          zIndex: 1,
          pointerEvents: 'none'
        }}
      />
    </Box>
  )
}

export default EventHeroSection
