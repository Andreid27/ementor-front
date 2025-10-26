// ** React Imports
import React from 'react'

// ** MUI Imports
import Chip from '@mui/material/Chip'
import { useTheme } from '@mui/material/styles'

type QuizStatus = 'completed' | 'in_progress' | 'overdue' | 'not_started'

interface QuizStatusChipProps {
  status: QuizStatus
  score?: number
  variant?: 'filled' | 'outlined'
  size?: 'small' | 'medium'
}

const QuizStatusChip: React.FC<QuizStatusChipProps> = ({ status, score, variant = 'filled', size = 'small' }) => {
  const theme = useTheme()

  const getStatusLabel = (status: QuizStatus, score?: number): string => {
    switch (status) {
      case 'completed':
        return score !== undefined ? `Finalizat (${score}%)` : 'Finalizat'
      case 'in_progress':
        return 'În progres'
      case 'overdue':
        return 'Expirat'
      case 'not_started':
      default:
        return 'Neînceput'
    }
  }

  const getStatusColor = (status: QuizStatus) => {
    switch (status) {
      case 'completed':
        return theme.palette.success.main
      case 'in_progress':
        return theme.palette.warning.main
      case 'overdue':
        return theme.palette.error.main
      case 'not_started':
      default:
        return theme.palette.info.main
    }
  }

  const label = getStatusLabel(status, score)
  const customColor = getStatusColor(status)

  return (
    <Chip
      size={size}
      variant={variant}
      label={label}
      sx={{
        borderRadius: 2,
        fontWeight: 500,
        textTransform: 'none',
        fontSize: '0.75rem',
        height: size === 'small' ? 24 : 32,
        transition: 'all 0.2s ease-in-out',

        ...(variant === 'filled' && {
          color: theme.palette.getContrastText(customColor),
          backgroundColor: customColor,

          '&:hover': {
            backgroundColor: customColor,
            filter: 'brightness(0.9)',
            transform: 'scale(1.05)'
          }
        }),

        ...(variant === 'outlined' && {
          color: customColor,
          borderColor: customColor,
          backgroundColor: `${customColor}08`,

          '&:hover': {
            backgroundColor: `${customColor}12`,
            borderColor: customColor,
            transform: 'scale(1.05)'
          }
        })
      }}
    />
  )
}

export default QuizStatusChip
