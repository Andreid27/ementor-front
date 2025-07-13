// ** React Imports
import React from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Alert from '@mui/material/Alert'
import Chip from '@mui/material/Chip'

interface EventTypeSelectorProps {
  selectedType: 'singular' | 'recurring'
  onTypeChange: (type: 'singular' | 'recurring') => void
  disabled?: boolean
}

const EventTypeSelector: React.FC<EventTypeSelectorProps> = ({ selectedType, onTypeChange, disabled = false }) => {
  const handleTypeChange = (event: React.MouseEvent<HTMLElement>, newType: 'singular' | 'recurring' | null) => {
    if (newType !== null) {
      onTypeChange(newType)
    }
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant='subtitle2' sx={{ mb: 1, fontWeight: 600 }}>
        Event Type
      </Typography>

      <ToggleButtonGroup
        value={selectedType}
        exclusive
        onChange={handleTypeChange}
        disabled={disabled}
        size='small'
        fullWidth
        sx={{ mb: 2 }}
      >
        <ToggleButton
          value='singular'
          sx={{
            flex: 1,
            '&.Mui-selected': {
              backgroundColor: 'primary.main',
              color: 'primary.contrastText',
              '&:hover': {
                backgroundColor: 'primary.dark'
              }
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <span>📅</span>
            <span>Single Event</span>
          </Box>
        </ToggleButton>

        <ToggleButton
          value='recurring'
          sx={{
            flex: 1,
            '&.Mui-selected': {
              backgroundColor: 'secondary.main',
              color: 'secondary.contrastText',
              '&:hover': {
                backgroundColor: 'secondary.dark'
              }
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <span>🔄</span>
            <span>Recurring Series</span>
          </Box>
        </ToggleButton>
      </ToggleButtonGroup>

      {/* Info Message */}
      <Alert
        severity='info'
        sx={{
          mb: 1,
          '& .MuiAlert-message': {
            fontSize: '0.875rem'
          }
        }}
      >
        {selectedType === 'singular'
          ? 'Create a one-time event that occurs only once on the selected date and time.'
          : "Create a recurring event series that repeats according to a specified pattern. You'll configure the recurrence pattern in the next step."}
      </Alert>

      {/* Type Details */}
      <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Chip
          size='small'
          label={selectedType === 'singular' ? 'One-time Event' : 'Repeating Series'}
          color={selectedType === 'singular' ? 'primary' : 'secondary'}
          variant='outlined'
        />
        <Typography variant='caption' color='text.secondary'>
          {selectedType === 'singular'
            ? 'Event will occur only once'
            : 'Multiple events will be created based on recurrence pattern'}
        </Typography>
      </Box>
    </Box>
  )
}

export default React.memo(EventTypeSelector)
