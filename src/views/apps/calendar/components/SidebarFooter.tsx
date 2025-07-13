// ** React Imports
import React, { Fragment } from 'react'

// ** MUI Imports
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'

// ** Redux Imports
import { useSelector } from 'react-redux'
import { selectSelectedEvent } from 'src/store/apps/calendar/index'

// ** Types
import { EventOccurrenceDTO } from 'src/generated/profile-service'

interface SidebarFooterProps {
  isEditMode: boolean
  onClose: () => void
  onCancel: () => void
  onReset: () => void
}

const SidebarFooter: React.FC<SidebarFooterProps> = ({ isEditMode, onClose, onCancel, onReset }) => {
  const selectedEvent = useSelector(selectSelectedEvent) as EventOccurrenceDTO | null
  const isExistingEvent = selectedEvent !== null && selectedEvent.seriesTitle?.length

  if (!isExistingEvent) {
    // New event - show Add button
    return (
      <Box sx={{ display: 'flex', gap: 2, width: '100%', justifyContent: 'center' }}>
        <Button
          type='submit'
          variant='contained'
          color='primary'
          sx={{
            flex: 1,
            maxWidth: 200,
            py: 1.5,
            fontSize: '1rem',
            fontWeight: 600,
            '&:hover': {
              transform: 'translateY(-1px)'
            },
            transition: 'all 0.3s ease'
          }}
        >
          Add Event
        </Button>
        <Button
          variant='outlined'
          color='secondary'
          onClick={onReset}
          sx={{
            flex: 1,
            maxWidth: 200,
            py: 1.5,
            fontSize: '1rem',
            fontWeight: 500,
            '&:hover': {
              transform: 'translateY(-1px)'
            },
            transition: 'all 0.3s ease'
          }}
        >
          Reset
        </Button>
      </Box>
    )
  } else if (isEditMode) {
    // Editing existing event - show Update button
    return (
      <Box sx={{ display: 'flex', gap: 2, width: '100%', justifyContent: 'center' }}>
        <Button
          type='submit'
          variant='contained'
          color='warning'
          sx={{
            flex: 1,
            maxWidth: 200,
            py: 1.5,
            fontSize: '1rem',
            fontWeight: 600,
            '&:hover': {
              transform: 'translateY(-1px)'
            },
            transition: 'all 0.3s ease'
          }}
        >
          Update Event
        </Button>
        <Button
          variant='outlined'
          color='secondary'
          onClick={onCancel}
          sx={{
            flex: 1,
            maxWidth: 200,
            py: 1.5,
            fontSize: '1rem',
            fontWeight: 500,
            '&:hover': {
              transform: 'translateY(-1px)'
            },
            transition: 'all 0.3s ease'
          }}
        >
          Cancel
        </Button>
      </Box>
    )
  } else {
    // Viewing existing event - show Close button
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <Button
          variant='contained'
          color='inherit'
          onClick={onClose}
          sx={{
            flex: 1,
            maxWidth: 200,
            py: 1.5,
            fontSize: '1rem',
            fontWeight: 600,
            '&:hover': {
              transform: 'translateY(-1px)'
            },
            transition: 'all 0.3s ease'
          }}
        >
          Close
        </Button>
      </Box>
    )
  }
}

export default SidebarFooter
