import React from 'react'
import {
  Card,
  CardContent,
  Box,
  Typography,
  Rating,
  IconButton,
  Chip,
  Divider,
  alpha,
  useTheme
} from '@mui/material'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import BookIcon from '@mui/icons-material/Book'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import QuizIcon from '@mui/icons-material/Quiz'
import { QuizGridRow } from '../types'
import { getDifficultyColor } from '../utils/transformers'

interface QuizMobileCardProps {
  quiz: QuizGridRow
  onSelect: (id: string) => void
}

const QuizMobileCard: React.FC<QuizMobileCardProps> = ({ quiz, onSelect }) => {
  const theme = useTheme()

  const getStatusConfig = () => {
    if (quiz.status === 'completed' && typeof quiz.score === 'number') {
      if (quiz.score >= 80) {
        return {
          label: `Finalizat: ${quiz.score}%`,
          color: theme.palette.success.main,
          bgColor: alpha(theme.palette.success.main, 0.12),
          icon: '✓',
          actionLabel: 'Vezi rezultate'
        }
      } else if (quiz.score >= 60) {
        return {
          label: `Finalizat: ${quiz.score}%`,
          color: theme.palette.warning.main,
          bgColor: alpha(theme.palette.warning.main, 0.12),
          icon: '⚠',
          actionLabel: 'Vezi rezultate'
        }
      } else {
        return {
          label: `Finalizat: ${quiz.score}%`,
          color: theme.palette.error.main,
          bgColor: alpha(theme.palette.error.main, 0.12),
          icon: '✗',
          actionLabel: 'Vezi rezultate'
        }
      }
    }

    switch (quiz.status) {
      case 'in_progress':
        return {
          label: 'În curs',
          color: theme.palette.info.main,
          bgColor: alpha(theme.palette.info.main, 0.12),
          icon: '●',
          actionLabel: 'Continuă'
        }
      case 'overdue':
        return {
          label: 'Expirat',
          color: theme.palette.error.main,
          bgColor: alpha(theme.palette.error.main, 0.12),
          icon: '!',
          actionLabel: 'Vezi detalii'
        }
      default:
        return {
          label: 'Disponibil',
          color: theme.palette.primary.main,
          bgColor: alpha(theme.palette.primary.main, 0.12),
          icon: '○',
          actionLabel: 'Începe test'
        }
    }
  }

  const statusConfig = getStatusConfig()

  const getBorderColor = () => {
    if (quiz.status === 'completed' && typeof quiz.score === 'number') {
      if (quiz.score >= 80) return theme.palette.success.main
      if (quiz.score >= 60) return theme.palette.warning.main
      return theme.palette.error.main
    }

    switch (quiz.status) {
      case 'overdue':
        return theme.palette.error.main
      case 'in_progress':
        return theme.palette.info.main
      default:
        return 'transparent'
    }
  }

  return (
    <Card
      onClick={() => onSelect(quiz.id)}
      sx={{
        mb: 2,
        backgroundColor: alpha(theme.palette.background.paper, 0.6),
        backdropFilter: 'blur(20px)',
        border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
        borderLeft: `4px solid ${getBorderColor()}`,
        borderRadius: 3,
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.12)}`,
          backgroundColor: alpha(theme.palette.background.paper, 0.8)
        },
        '&:active': {
          transform: 'translateY(0)',
          boxShadow: `0 4px 16px ${alpha(theme.palette.common.black, 0.08)}`
        }
      }}
    >
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        {/* Header with Title and Status */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1, mr: 2 }}>
            <Typography
              variant='h6'
              sx={{
                fontWeight: 600,
                color: 'text.primary',
                fontSize: '1rem',
                lineHeight: 1.3,
                mb: 0.5
              }}
            >
              {quiz.title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <BookIcon
                fontSize='small'
                sx={{
                  color: alpha(theme.palette.text.secondary, 0.6),
                  fontSize: '0.95rem'
                }}
              />
              <Typography
                variant='caption'
                sx={{
                  color: alpha(theme.palette.text.secondary, 0.8),
                  fontSize: '0.8rem',
                  fontWeight: 500
                }}
              >
                {quiz.chapter}
              </Typography>
            </Box>
          </Box>

          <Chip
            label={statusConfig.label}
            sx={{
              backgroundColor: statusConfig.bgColor,
              color: statusConfig.color,
              border: `1px solid ${alpha(statusConfig.color, 0.2)}`,
              fontWeight: 600,
              fontSize: '0.7rem',
              height: 'auto',
              py: 0.5,
              px: 0.5,
              '& .MuiChip-label': {
                px: 1.5,
                py: 0.25
              }
            }}
          />
        </Box>

        <Divider sx={{ my: 2, opacity: 0.6 }} />

        {/* Quiz Details Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 2,
            mb: 2.5
          }}
        >
          {/* Duration */}
          <Box sx={{ textAlign: 'center' }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 0.5
              }}
            >
              <AccessTimeIcon
                sx={{
                  fontSize: '1.1rem',
                  color: alpha(theme.palette.text.secondary, 0.6)
                }}
              />
            </Box>
            <Typography
              variant='body2'
              sx={{
                fontWeight: 600,
                color: 'text.primary',
                fontSize: '0.875rem',
                mb: 0.25
              }}
            >
              {quiz.duration}
            </Typography>
            <Typography
              variant='caption'
              sx={{
                color: alpha(theme.palette.text.secondary, 0.7),
                fontSize: '0.7rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              Minute
            </Typography>
          </Box>

          {/* Questions Count */}
          <Box sx={{ textAlign: 'center' }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 0.5
              }}
            >
              <QuizIcon
                sx={{
                  fontSize: '1.1rem',
                  color: alpha(theme.palette.text.secondary, 0.6)
                }}
              />
            </Box>
            <Typography
              variant='body2'
              sx={{
                fontWeight: 600,
                color: 'text.primary',
                fontSize: '0.875rem',
                mb: 0.25
              }}
            >
              {quiz.questionsCount}
            </Typography>
            <Typography
              variant='caption'
              sx={{
                color: alpha(theme.palette.text.secondary, 0.7),
                fontSize: '0.7rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              Întrebări
            </Typography>
          </Box>

          {/* Difficulty */}
          <Box sx={{ textAlign: 'center' }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 0.5,
                height: '1.1rem'
              }}
            >
              <Rating
                value={quiz.difficulty}
                max={5}
                precision={1}
                readOnly
                size='small'
                sx={{
                  '& .MuiRating-iconFilled': {
                    color: getDifficultyColor(quiz.difficulty)
                  },
                  '& .MuiRating-icon': {
                    fontSize: '0.9rem'
                  }
                }}
              />
            </Box>
            <Typography
              variant='caption'
              sx={{
                color: alpha(theme.palette.text.secondary, 0.7),
                fontSize: '0.7rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                display: 'block',
                mt: 0.75
              }}
            >
              Dificultate
            </Typography>
          </Box>
        </Box>

        {/* Action Button */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            pt: 1
          }}
        >
          <Box
            onClick={e => {
              e.stopPropagation()
              onSelect(quiz.id)
            }}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              px: 3,
              py: 1.25,
              borderRadius: 2.5,
              backgroundColor: alpha(statusConfig.color, 0.12),
              border: `1px solid ${alpha(statusConfig.color, 0.2)}`,
              color: statusConfig.color,
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                backgroundColor: alpha(statusConfig.color, 0.18),
                borderColor: alpha(statusConfig.color, 0.3),
                transform: 'translateY(-1px)',
                boxShadow: `0 4px 12px ${alpha(statusConfig.color, 0.25)}`
              },
              '&:active': {
                transform: 'translateY(0)',
                boxShadow: `0 2px 8px ${alpha(statusConfig.color, 0.2)}`
              }
            }}
          >
            <PlayArrowIcon sx={{ fontSize: '1.2rem' }} />
            <Typography
              variant='button'
              sx={{
                fontWeight: 600,
                fontSize: '0.875rem',
                letterSpacing: '0.025em'
              }}
            >
              {statusConfig.actionLabel}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

export default QuizMobileCard
