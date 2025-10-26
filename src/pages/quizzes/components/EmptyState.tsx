// ** React Imports
import React from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

interface EmptyStateProps {
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  icon?: string
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Nu ai niciun test asignat',
  description = 'Contactează-ți profesorul pentru a începe testele.',
  actionLabel,
  onAction,
  icon = 'tabler:clipboard-list'
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        py: 8,
        px: 4,
        minHeight: 300
      }}
    >
      <Box
        sx={{
          mb: 4,
          p: 3,
          borderRadius: '50%',
          backgroundColor: 'action.hover',
          color: 'text.secondary'
        }}
      >
        <Icon icon={icon} fontSize='3rem' />
      </Box>

      <Typography
        variant='h6'
        sx={{
          mb: 2,
          color: 'text.primary',
          fontWeight: 600
        }}
      >
        {title}
      </Typography>

      <Typography
        variant='body2'
        sx={{
          mb: 4,
          color: 'text.secondary',
          maxWidth: 400,
          lineHeight: 1.6
        }}
      >
        {description}
      </Typography>

      {actionLabel && onAction && (
        <Button
          variant='contained'
          onClick={onAction}
          startIcon={<Icon icon='tabler:refresh' />}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 500,
            px: 4,
            py: 1.5
          }}
        >
          {actionLabel}
        </Button>
      )}
    </Box>
  )
}

export default EmptyState
