// ** React Imports
import React from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

interface EventMeetingLinkProps {
  meetingLink: string
}

const EventMeetingLink: React.FC<EventMeetingLinkProps> = ({ meetingLink }) => {
  if (!meetingLink) return null

  return (
    <Box
      sx={{
        mb: 3,
        p: 3,
        backgroundColor: 'background.paper',
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}
    >
      <Button
        fullWidth
        variant='contained'
        size='large'
        startIcon={<Icon icon='tabler:video' />}
        onClick={() => window.open(meetingLink, '_blank')}
        sx={{
          mb: 2,
          py: 1.5,
          fontSize: '1.1rem',
          fontWeight: 600,
          background: 'linear-gradient(45deg, #4CAF50 30%, #66BB6A 90%)',
          boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)',
          '&:hover': {
            background: 'linear-gradient(45deg, #43A047 30%, #5CBF60 90%)',
            boxShadow: '0 6px 16px rgba(76, 175, 80, 0.5)',
            transform: 'translateY(-1px)'
          },
          transition: 'all 0.3s ease'
        }}
      >
        Alătură-te Întâlnirii
      </Button>
      <Typography
        variant='caption'
        sx={{
          color: 'text.secondary',
          wordBreak: 'break-all',
          fontFamily: 'monospace',
          fontSize: '0.75rem',
          display: 'block',
          textAlign: 'center'
        }}
      >
        {meetingLink}
      </Typography>
    </Box>
  )
}

export default EventMeetingLink
