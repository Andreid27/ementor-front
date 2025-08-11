// ** React Imports
// ** React Imports
import React, { useMemo } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import { useTheme } from '@mui/material/styles'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Types
import { SidebarHeaderProps } from '../types'

// ** Constants
import { EVENT_DISPLAY_MODES } from '../constants'

// ** Components
import EventTypeIndicator from './EventTypeIndicator'

interface ActionButton {
  icon: string
  onClick: () => void
  color?: string
  variant?: 'icon' | 'button' // New: button variant for wider buttons
  text?: string // New: text for button variant
}

const SidebarHeader: React.FC<SidebarHeaderProps & { isCompletionMode?: boolean }> = ({
  isEditMode,
  selectedEvent,
  canEdit,
  onEdit,
  onDelete,
  onCancel,
  onClose,
  onCancelEvent,
  onCompleteEvent,
  isDaySummary = false,
  eventTypeInfo,
  isCompletionMode = false // New prop for completion wizard mode
}) => {
  const theme = useTheme()

  const displayMode = useMemo(() => {
    if (isDaySummary) return EVENT_DISPLAY_MODES.DAY_SUMMARY
    if (isEditMode) return EVENT_DISPLAY_MODES.EDIT

    return EVENT_DISPLAY_MODES.VIEW
  }, [isDaySummary, isEditMode])

  const isExistingEvent = selectedEvent !== null && (selectedEvent.title || selectedEvent.seriesTitle)?.length

  const title = useMemo(() => {
    switch (displayMode) {
      case EVENT_DISPLAY_MODES.DAY_SUMMARY:
        return 'Day Overview'
      case EVENT_DISPLAY_MODES.EDIT:
        return isExistingEvent ? 'Edit Event' : 'Add Event'
      case EVENT_DISPLAY_MODES.VIEW:
      default:
        return 'Event Details'
    }
  }, [displayMode, isExistingEvent])

  const actionButtons = useMemo((): ActionButton[] => {
    if (isDaySummary) return []

    const buttons: ActionButton[] = []

    if (isExistingEvent && !isEditMode) {
      // Debug logging
      console.log('SidebarHeader - Event State Debug:', {
        selectedEvent,
        isCompleted: selectedEvent?.completed,
        isCancelled: selectedEvent?.cancelled,
        effectiveStartTime: selectedEvent?.effectiveStartTime,
        hasOnCompleteEvent: !!onCompleteEvent,
        hasOnCancelEvent: !!onCancelEvent
      })

      // Edit button
      if (canEdit) {
        buttons.push({
          icon: 'tabler:edit',
          onClick: onEdit,
          color: theme.palette.primary.main // Blue
        })
      }

      // Cancel and Complete buttons for existing events
      const isCompleted = selectedEvent?.completed
      const isCancelled = selectedEvent?.cancelled
      const isPastEvent = selectedEvent?.effectiveStartTime && new Date(selectedEvent.effectiveStartTime) < new Date()
      const isFutureEvent = selectedEvent?.effectiveStartTime && new Date(selectedEvent.effectiveStartTime) > new Date()

      // Complete button - larger for current/past events, smaller for future events
      if (!isCompleted && !isCancelled && onCompleteEvent && !isCompletionMode) {
        console.log('Adding Complete button')
        buttons.push({
          icon: 'tabler:check-circle',
          onClick: onCompleteEvent,
          color: '#28C76F' // Explicit green for success
        })
      }

      // Cancel button - larger for future events, smaller for current/past events
      if (!isCompleted && !isCancelled && onCancelEvent) {
        console.log('Adding Cancel button')
        buttons.push({
          icon: 'tabler:ban',
          onClick: onCancelEvent,
          color: '#FF9F43' // Explicit orange for warning
        })
      }
    }

    if (isExistingEvent && isEditMode) {
      buttons.push({
        icon: 'tabler:trash',
        onClick: onDelete,
        color: theme.palette.error.main
      })
    }

    console.log('Final action buttons:', buttons)
    return buttons
  }, [
    isDaySummary,
    isExistingEvent,
    isEditMode,
    canEdit,
    onEdit,
    onDelete,
    onCancel,
    onCancelEvent,
    onCompleteEvent,
    selectedEvent,
    theme,
    isCompletionMode
  ])

  const headerStyles = {
    p: 6,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderColor: 'divider',
    backgroundColor: 'background.paper',
    position: 'relative' as const,
    '&::after': {
      content: '""',
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      height: 24,
      pointerEvents: 'none',
      background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.16), rgba(128, 128, 128, 0.03) 100%)'
    }
  }

  const closeButtonStyles = {
    color: 'text.secondary',
    '&:hover': {
      backgroundColor: 'action.hover',
      color: 'text.primary'
    }
  }

  return (
    <>
      <Box className='sidebar-header' sx={headerStyles}>
        <Typography variant='h5' sx={{ fontWeight: 600, color: 'text.primary' }}>
          {title}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {actionButtons.map((button, index) => {
            const isCompleteButton = button.icon === 'tabler:check-circle'
            const isCancelButton = button.icon === 'tabler:ban'
            const isEditButton = button.icon === 'tabler:edit'

            // Render Complete button as a full Button for better visibility
            if (isCompleteButton) {
              return (
                <Button
                  key={index}
                  variant='contained'
                  startIcon={<Icon icon={button.icon} />}
                  onClick={button.onClick}
                  size='small'
                  sx={{
                    backgroundColor: button.color,
                    color: 'white',
                    mr: 1,
                    minWidth: '100px',
                    '&:hover': {
                      backgroundColor: button.color,
                      opacity: 0.8,
                      transform: 'scale(1.02)'
                    }
                  }}
                >
                  Complete
                </Button>
              )
            }

            // Render other buttons as IconButtons
            return (
              <IconButton
                key={index}
                size='small'
                onClick={button.onClick}
                sx={{
                  color: button.color || 'text.primary',
                  mr: 1,
                  '&:hover': {
                    backgroundColor: `${button.color}20`,
                    transform: 'scale(1.1)'
                  }
                }}
                title={isCancelButton ? 'Cancel Event' : isEditButton ? 'Edit Event' : ''}
              >
                <Icon icon={button.icon} fontSize='1.25rem' />
              </IconButton>
            )
          })}

          <IconButton size='small' onClick={onClose} sx={closeButtonStyles}>
            <Icon icon='tabler:x' fontSize='1.25rem' />
          </IconButton>
        </Box>
      </Box>

      {/* Event Type Indicator - show when we have an existing event */}
      {selectedEvent && eventTypeInfo && !isDaySummary && (
        <Box sx={{ px: 6, pt: 2 }}>
          <EventTypeIndicator eventTypeInfo={eventTypeInfo} event={selectedEvent} isEditMode={isEditMode} />
        </Box>
      )}
    </>
  )
}

export default React.memo(SidebarHeader)
