// ** React Imports
import React, { useMemo } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import { useTheme } from '@mui/material/styles'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Types
import { SidebarHeaderProps } from '../types'

// ** Constants
import { EVENT_DISPLAY_MODES } from '../constants'

interface ActionButton {
  icon: string
  onClick: () => void
  color?: string
}

const SidebarHeader: React.FC<SidebarHeaderProps> = ({
  isEditMode,
  selectedEvent,
  canEdit,
  onEdit,
  onDelete,
  onCancel,
  onClose,
  isDaySummary = false
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

    if (isExistingEvent && !isEditMode && canEdit) {
      return [
        {
          icon: 'tabler:edit',
          onClick: onEdit,
          color: theme.palette.primary.main
        }
      ]
    }

    if (isExistingEvent && isEditMode) {
      return [
        {
          icon: 'tabler:trash',
          onClick: onDelete,
          color: theme.palette.error.main
        },
        {
          icon: 'tabler:x',
          onClick: onCancel,
          color: theme.palette.text.primary
        }
      ]
    }

    return []
  }, [isDaySummary, isExistingEvent, isEditMode, canEdit, onEdit, onDelete, onCancel, theme])

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
    <Box className='sidebar-header' sx={headerStyles}>
      <Typography variant='h5' sx={{ fontWeight: 600, color: 'text.primary' }}>
        {title}
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {actionButtons.map((button, index) => (
          <IconButton
            key={index}
            size='small'
            onClick={button.onClick}
            sx={{
              color: button.color || 'text.primary',
              mr: 1,
              '&:hover': {
                backgroundColor: 'action.hover'
              }
            }}
          >
            <Icon icon={button.icon} fontSize='1.25rem' />
          </IconButton>
        ))}

        <IconButton size='small' onClick={onClose} sx={closeButtonStyles}>
          <Icon icon='tabler:x' fontSize='1.25rem' />
        </IconButton>
      </Box>
    </Box>
  )
}

export default React.memo(SidebarHeader)
