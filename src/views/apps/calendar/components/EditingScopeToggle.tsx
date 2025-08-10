import React from 'react'
import { Box, ToggleButton, ToggleButtonGroup, Typography, Alert, Chip } from '@mui/material'
import { EventTypeInfo, EditingScope, getScopeWarningMessage, getScopeButtonText } from '../utils/eventTypeUtils'

interface EditingScopeToggleProps {
  eventTypeInfo: EventTypeInfo
  selectedScope: EditingScope
  onScopeChange: (scope: EditingScope) => void
  disabled?: boolean
}

const EditingScopeToggle: React.FC<EditingScopeToggleProps> = ({
  eventTypeInfo,
  selectedScope,
  onScopeChange,
  disabled = false
}) => {
  const handleScopeChange = (event: React.MouseEvent<HTMLElement>, newScope: EditingScope | null) => {
    if (newScope !== null) {
      onScopeChange(newScope)
    }
  }

  // For event occurrences, allow both occurrence and series scope
  const isEventOccurrence = eventTypeInfo.type === 'EVENT_OCCURRENCE'
  const seriesDisabled = disabled // Remove the isEventOccurrence condition

  const warningMessage = getScopeWarningMessage(selectedScope, eventTypeInfo)

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant='subtitle2' sx={{ mb: 1, fontWeight: 600 }}>
        Editing Scope
      </Typography>

      <ToggleButtonGroup
        value={selectedScope}
        exclusive
        onChange={handleScopeChange}
        disabled={disabled}
        size='small'
        fullWidth
        sx={{ mb: 2 }}
      >
        <ToggleButton
          value='occurrence'
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
            <span>This Occurrence</span>
          </Box>
        </ToggleButton>

        <ToggleButton
          value='series'
          disabled={seriesDisabled}
          sx={{
            flex: 1,
            '&.Mui-selected': {
              backgroundColor: 'warning.main',
              color: 'warning.contrastText',
              '&:hover': {
                backgroundColor: 'warning.dark'
              }
            },
            '&.Mui-disabled': {
              opacity: 0.5,
              backgroundColor: 'grey.100',
              color: 'text.disabled'
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <span>🔄</span>
            <span>Entire Series</span>
          </Box>
        </ToggleButton>
      </ToggleButtonGroup>

      {/* Warning Message */}
      {warningMessage && (
        <Alert
          severity={selectedScope === 'series' ? 'warning' : 'info'}
          sx={{
            '& .MuiAlert-message': {
              fontSize: '0.875rem'
            }
          }}
        >
          {warningMessage}
        </Alert>
      )}

      {/* Scope Details */}
      <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Chip
          size='small'
          label={selectedScope === 'occurrence' ? 'Single Event' : 'All Future Events'}
          color={selectedScope === 'occurrence' ? 'primary' : 'warning'}
          variant='outlined'
        />
        <Typography variant='caption' color='text.secondary'>
          {selectedScope === 'occurrence'
            ? 'Changes will not affect other events in the series'
            : 'Changes will affect all future recurring events'}
        </Typography>
      </Box>
    </Box>
  )
}

export default React.memo(EditingScopeToggle)
