// ** React Imports
import React from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'

// ** Components
import EventHeroSection from './EventHeroSection'
import EventMeetingLink from './EventMeetingLink'
import EventDetailsCards from './EventDetailsCards'
import SidebarFooter from './SidebarFooter'

// ** Types
import { EventViewProps } from '../types'

const EventView: React.FC<EventViewProps> = ({ selectedEvent, values, onClose }) => {
  const meetingLink = selectedEvent?.extendedProps?.meetingLink || selectedEvent?.url

  return (
    <Box sx={{ height: '100%', overflow: 'auto' }}>
      {/* Hero Section with Title */}
      <EventHeroSection selectedEvent={selectedEvent} />

      {/* Meeting Link - Priority Section */}
      <EventMeetingLink meetingLink={meetingLink} />

      {/* Information Cards Grid */}
      <EventDetailsCards selectedEvent={selectedEvent} values={values} />

      {/* Footer for view mode */}
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

export default EventView
