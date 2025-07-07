// ** React Imports
import React, { useMemo } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import { useTheme } from '@mui/material/styles'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Components
import EventHeroSection from './EventHeroSection'
import EventMeetingLink from './EventMeetingLink'
import SidebarFooter from './SidebarFooter'

// ** Types
import { EventViewProps } from '../types'

// ** Utils
import { format } from 'date-fns'

interface EventDetailItem {
  icon: string
  label: string
  value: string | React.ReactNode
  color?: string
}

const EventViewImproved: React.FC<EventViewProps> = ({ selectedEvent, onClose }) => {
  const theme = useTheme()
  const meetingLink = selectedEvent?.extendedProps?.meetingLink || selectedEvent?.url

  const eventDetails = useMemo((): EventDetailItem[] => {
    const details: EventDetailItem[] = []

    // Date and Time
    if (selectedEvent?.start) {
      const startDate = new Date(selectedEvent.start)
      const endDate = selectedEvent.end ? new Date(selectedEvent.end) : null

      details.push({
        icon: 'tabler:calendar',
        label: 'Date & Time',
        value: selectedEvent.allDay
          ? `${format(startDate, 'MMMM d, yyyy')} (All Day)`
          : `${format(startDate, 'MMMM d, yyyy h:mm a')}${endDate ? ` - ${format(endDate, 'h:mm a')}` : ''}`,
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

    // Price
    if (selectedEvent?.price !== undefined && selectedEvent.price > 0) {
      details.push({
        icon: 'tabler:currency-dollar',
        label: 'Price',
        value: `$${selectedEvent.price}`,
        color: theme.palette.success.main
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

    // Attendance Status
    if (selectedEvent?.attendance) {
      const attendanceColor =
        selectedEvent.attendance === 'CONFIRMED'
          ? theme.palette.success.main
          : selectedEvent.attendance === 'CANCELLED'
          ? theme.palette.error.main
          : theme.palette.warning.main

      details.push({
        icon: 'tabler:check',
        label: 'Attendance',
        value: (
          <Chip
            label={selectedEvent.attendance}
            size='small'
            sx={{
              bgcolor: attendanceColor,
              color: 'white',
              fontWeight: 600
            }}
          />
        ),
        color: attendanceColor
      })
    }

    return details
  }, [selectedEvent, theme])

  const eventStatus = useMemo(() => {
    const statuses = []

    if (selectedEvent?.completed) statuses.push({ label: 'Completed', color: 'success' })
    if (selectedEvent?.cancelled) statuses.push({ label: 'Cancelled', color: 'error' })
    if (selectedEvent?.missed) statuses.push({ label: 'Missed', color: 'warning' })
    if (selectedEvent?.rescheduled) statuses.push({ label: 'Rescheduled', color: 'info' })
    if (selectedEvent?.upcoming) statuses.push({ label: 'Upcoming', color: 'primary' })

    return statuses
  }, [selectedEvent])

  return (
    <Box sx={{ height: '100%', overflow: 'auto' }}>
      {/* Hero Section */}
      <EventHeroSection selectedEvent={selectedEvent} />

      {/* Status Chips */}
      {eventStatus.length > 0 && (
        <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {eventStatus.map((status, index) => (
            <Chip key={index} label={status.label} color={status.color as any} size='small' sx={{ fontWeight: 600 }} />
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

      {/* Description */}
      {(selectedEvent?.description || selectedEvent?.seriesDescription) && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Icon icon='tabler:file-text' fontSize='1.25rem' color='text.secondary' />
              <Typography variant='subtitle2' sx={{ fontWeight: 600 }}>
                Description
              </Typography>
            </Box>
            <Typography variant='body2' color='text.secondary' sx={{ lineHeight: 1.6 }}>
              {selectedEvent?.description || selectedEvent?.seriesDescription}
            </Typography>
          </CardContent>
        </Card>
      )}

      <Divider sx={{ my: 3 }} />

      {/* Footer */}
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <SidebarFooter
          isEditMode={false}
          selectedEvent={selectedEvent}
          onClose={onClose}
          onCancel={() => {}}
          onReset={() => {}}
        />
      </Box>
    </Box>
  )
}

export default React.memo(EventViewImproved)
