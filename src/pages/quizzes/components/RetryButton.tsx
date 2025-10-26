// ** React Imports
import React from 'react'

// ** MUI Imports
import Button from '@mui/material/Button'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

interface RetryButtonProps {
  onRetry: () => void
  loading?: boolean
  label?: string
}

const RetryButton: React.FC<RetryButtonProps> = ({ onRetry, loading = false, label = 'Încearcă din nou' }) => {
  return (
    <Button
      variant='outlined'
      onClick={onRetry}
      disabled={loading}
      startIcon={<Icon icon='tabler:refresh' />}
      sx={{
        borderRadius: 2,
        textTransform: 'none',
        fontWeight: 500,
        px: 3,
        py: 1.5
      }}
    >
      {loading ? 'Se încarcă...' : label}
    </Button>
  )
}

export default RetryButton
