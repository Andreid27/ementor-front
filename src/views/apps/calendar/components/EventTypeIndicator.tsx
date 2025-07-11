import React from 'react'
import { Box, Chip, Typography, Alert, Tooltip } from '@mui/material'
import { EventTypeInfo, getEditWarningMessage, formatEventTitle } from '../utils/eventTypeUtils'

interface EventTypeIndicatorProps {
  eventTypeInfo: EventTypeInfo | null
  event: any
  isEditMode: boolean
}

const EventTypeIndicator: React.FC<EventTypeIndicatorProps> = ({ eventTypeInfo, event, isEditMode }) => {
  if (!eventTypeInfo) return null

  const warningMessage = getEditWarningMessage(eventTypeInfo)
  const formattedTitle = formatEventTitle(event, eventTypeInfo)

  const getChipColor = () => {
    switch (eventTypeInfo.type) {
      case 'SINGULAR_EVENT':
        return 'primary'
      case 'RECURRING_SERIES':
        return 'secondary'
      case 'EVENT_OCCURRENCE':
        return 'info'
      default:
        return 'default'
    }
  }

  const getChipIcon = () => {
    switch (eventTypeInfo.type) {
      case 'SINGULAR_EVENT':
        return '📅'
      case 'RECURRING_SERIES':
        return '🔄'
      case 'EVENT_OCCURRENCE':
        return '📆'
      default:
        return '📅'
    }
  }

  return (
    <Box sx={{ mb: 2 }}>
      {/* Event Type Chip */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Tooltip title={eventTypeInfo.description}>
          <Chip
            size='small'
            color={getChipColor() as any}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <span>{getChipIcon()}</span>
                <span>{eventTypeInfo.displayName}</span>
              </Box>
            }
            variant='outlined'
          />
        </Tooltip>

        {eventTypeInfo.recurringSeriesId && (
          <Typography variant='caption' color='text.secondary'>
            Series ID: {eventTypeInfo.recurringSeriesId.slice(0, 8)}...
          </Typography>
        )}
      </Box>

      {/* Warning Message for Edit Mode */}
      {isEditMode && warningMessage && (
        <Alert
          severity={eventTypeInfo.type === 'RECURRING_SERIES' ? 'warning' : 'info'}
          sx={{
            mt: 1,
            '& .MuiAlert-message': {
              fontSize: '0.875rem'
            }
          }}
        >
          {warningMessage}
        </Alert>
      )}

      {/* Event Type Description */}
      {!isEditMode && (
        <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
          {eventTypeInfo.description}
        </Typography>
      )}
    </Box>
  )
}

export default React.memo(EventTypeIndicator)
