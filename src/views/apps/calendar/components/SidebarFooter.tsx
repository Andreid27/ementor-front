// ** React Imports
import React, { Fragment } from 'react'

// ** MUI Imports
import Button from '@mui/material/Button'

// ** Types
import { SidebarFooterProps } from '../types'

const SidebarFooter: React.FC<SidebarFooterProps> = ({ isEditMode, selectedEvent, onClose, onCancel, onReset }) => {
  const isExistingEvent = selectedEvent !== null && (selectedEvent.title || selectedEvent.seriesTitle)?.length

  if (!isExistingEvent) {
    // New event - show Add button
    return (
      <Fragment>
        <Button
          type='submit'
          variant='contained'
          color='primary'
          size='large'
          sx={{
            mr: 3,
            py: 1.5,
            px: 4,
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
          size='large'
          color='secondary'
          onClick={onReset}
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
          Reset
        </Button>
      </Fragment>
    )
  } else if (isEditMode) {
    // Editing existing event - show Update button
    return (
      <Fragment>
        <Button
          type='submit'
          variant='contained'
          color='warning'
          size='large'
          sx={{
            mr: 3,
            py: 1.5,
            px: 4,
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
          size='large'
          color='secondary'
          onClick={onCancel}
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
          Cancel
        </Button>
      </Fragment>
    )
  } else {
    // Viewing existing event - show Close button
    return (
      <Fragment>
        <Button
          variant='contained'
          color='inherit'
          size='large'
          onClick={onClose}
          sx={{
            py: 1.5,
            px: 4,
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
      </Fragment>
    )
  }
}

export default SidebarFooter
