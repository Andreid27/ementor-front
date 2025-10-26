// ** React Imports
import React from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Types
import { QuizGridRow, QuizActionsProps } from '../types'

const QuizActions: React.FC<QuizActionsProps> = ({ quiz, onStartQuiz, onViewResults, onPreview }) => {
  const handleStartQuiz = (event: React.MouseEvent) => {
    event.stopPropagation()
    onStartQuiz(quiz.id)
  }

  const handleViewResults = (event: React.MouseEvent) => {
    event.stopPropagation()
    if (onViewResults) {
      onViewResults(quiz.id)
    }
  }

  const handlePreview = (event: React.MouseEvent) => {
    event.stopPropagation()
    if (onPreview) {
      onPreview(quiz.id)
    }
  }

  const canStartQuiz =
    quiz.status === 'not_started' || (quiz.status === 'in_progress' && quiz.attempts < quiz.maxAttempts)

  const hasResults = quiz.status === 'completed' || quiz.attempts > 0

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {/* Preview Action */}
      {onPreview && (
        <Tooltip title='Previzualizare test'>
          <IconButton
            size='small'
            onClick={handlePreview}
            sx={{
              color: 'text.secondary',
              '&:hover': {
                color: 'primary.main',
                backgroundColor: 'primary.light',
                transform: 'scale(1.1)'
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            <Icon icon='tabler:eye' fontSize='1.25rem' />
          </IconButton>
        </Tooltip>
      )}

      {/* Start/Continue Quiz Action */}
      {canStartQuiz && (
        <Tooltip title={quiz.status === 'not_started' ? 'Începe testul' : 'Continuă testul'}>
          <IconButton
            size='small'
            onClick={handleStartQuiz}
            sx={{
              color: 'success.main',
              '&:hover': {
                color: 'success.dark',
                backgroundColor: 'success.light',
                transform: 'scale(1.1)'
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            <Icon icon={quiz.status === 'not_started' ? 'tabler:play' : 'tabler:refresh'} fontSize='1.25rem' />
          </IconButton>
        </Tooltip>
      )}

      {/* View Results Action */}
      {hasResults && onViewResults && (
        <Tooltip title='Vezi rezultatele'>
          <IconButton
            size='small'
            onClick={handleViewResults}
            sx={{
              color: 'info.main',
              '&:hover': {
                color: 'info.dark',
                backgroundColor: 'info.light',
                transform: 'scale(1.1)'
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            <Icon icon='tabler:chart-bar' fontSize='1.25rem' />
          </IconButton>
        </Tooltip>
      )}

      {/* Overdue Indicator */}
      {quiz.status === 'overdue' && (
        <Tooltip title='Test expirat'>
          <Box
            sx={{
              color: 'error.main',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Icon icon='tabler:alert-triangle' fontSize='1.25rem' />
          </Box>
        </Tooltip>
      )}
    </Box>
  )
}

export default QuizActions
