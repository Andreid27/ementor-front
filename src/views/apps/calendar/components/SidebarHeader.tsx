// ** React Imports
import React from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Types
import { SidebarHeaderProps } from '../types'

const SidebarHeader: React.FC<SidebarHeaderProps> = ({
  isEditMode,
  selectedEvent,
  canEdit,
  onEdit,
  onDelete,
  onCancel,
  onClose
}) => {
  const isExistingEvent = selectedEvent !== null && (selectedEvent.title || selectedEvent.seriesTitle)?.length

  const getTitle = () => {
    if (isExistingEvent) {
      return isEditMode ? 'Edit Event' : 'Event Details'
    }

    return 'Add Event'
  }

  const renderActionButtons = () => {
    if (isExistingEvent && !isEditMode && canEdit) {
      // Show Edit button for professors when viewing event
      return (
        <IconButton size='small' onClick={onEdit} sx={{ color: 'text.primary', mr: 1 }}>
          <Icon icon='tabler:edit' fontSize='1.25rem' />
        </IconButton>
      )
    } else if (isExistingEvent && isEditMode) {
      // Show Delete and Cancel buttons when editing
      return (
        <>
          <IconButton size='small' onClick={onDelete} sx={{ color: 'text.primary', mr: 1 }}>
            <Icon icon='tabler:trash' fontSize='1.25rem' />
          </IconButton>
          <IconButton size='small' onClick={onCancel} sx={{ color: 'text.primary', mr: 1 }}>
            <Icon icon='tabler:x' fontSize='1.25rem' />
          </IconButton>
        </>
      )
    }

    return null
  }

  return (
    <Box
      className='sidebar-header'
      sx={{
        p: 6,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderColor: 'divider',
        backgroundColor: 'background.paper',
        position: 'relative',
        // Add a fade to gray at the bottom of the header
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
      }}
    >
      <Typography variant='h5' sx={{ fontWeight: 600, color: 'text.primary' }}>
        {getTitle()}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {renderActionButtons()}
        <IconButton
          size='small'
          onClick={onClose}
          sx={{
            p: '0.375rem',
            borderRadius: 1,
            color: 'text.primary',
            backgroundColor: 'action.selected',
            '&:hover': {
              backgroundColor: (theme: any) => `rgba(${theme.palette.customColors.main}, 0.16)`
            }
          }}
        >
          <Icon icon='tabler:x' fontSize='1.25rem' />
        </IconButton>
      </Box>
    </Box>
  )
}

export default SidebarHeader
