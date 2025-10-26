// ** React Imports
import React, { useMemo } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import LinearProgress from '@mui/material/LinearProgress'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Tooltip from '@mui/material/Tooltip'
import { useTheme } from '@mui/material/styles'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Hooks
import { useResponsive } from '../../quizzes/hooks/useResponsive'

// ** Types
import { ProgressTrackerProps } from '../types'

// ** Constants
import { ANIMATION_DURATIONS, EASING_FUNCTIONS } from '../../quizzes/constants/animations'
import { SPACING } from '../../quizzes/constants/theme'

const ProgressTracker: React.FC<
  ProgressTrackerProps & {
    compact?: boolean
    orientation?: 'portrait' | 'landscape'
  }
> = ({
  totalQuestions,
  answeredQuestions,
  currentQuestion,
  timeRemaining,
  onScrollToQuestion,
  compact = false,
  orientation = 'portrait'
}) => {
  const theme = useTheme()
  const { isMobile, isTablet, shouldReduceMotion } = useResponsive()

  // ** Computed values
  const progressPercentage = useMemo(() => {
    return totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0
  }, [answeredQuestions, totalQuestions])

  const unansweredCount = totalQuestions - answeredQuestions

  const getProgressColor = useMemo(() => {
    if (progressPercentage >= 80) return theme.palette.success.main
    if (progressPercentage >= 60) return theme.palette.info.main
    if (progressPercentage >= 40) return theme.palette.warning.main
    return theme.palette.error.main
  }, [progressPercentage, theme])

  const getTimeColor = useMemo(() => {
    const timePercentage = (timeRemaining / (totalQuestions * 60)) * 100 // Assuming 1 min per question
    if (timePercentage > 50) return theme.palette.success.main
    if (timePercentage > 25) return theme.palette.warning.main
    return theme.palette.error.main
  }, [timeRemaining, totalQuestions, theme])

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Progress Bar */}
      <Box sx={{ mb: compact ? 2 : SPACING.MD }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: isMobile && orientation === 'portrait' ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile && orientation === 'portrait' ? 'flex-start' : 'center',
            mb: 1,
            gap: isMobile ? 1 : 0
          }}
        >
          <Typography
            variant={compact ? 'caption' : 'body2'}
            sx={{
              fontWeight: 600,
              color: 'text.primary',
              fontSize: compact ? '0.75rem' : isMobile ? '0.8rem' : '0.875rem'
            }}
          >
            Progres: {Math.round(progressPercentage)}%
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Icon icon='tabler:clock' fontSize={compact ? '0.875rem' : '1rem'} style={{ color: getTimeColor }} />
            <Typography
              variant={compact ? 'caption' : 'body2'}
              sx={{
                fontWeight: 600,
                color: getTimeColor,
                fontFamily: 'monospace',
                fontSize: compact ? '0.75rem' : isMobile ? '0.8rem' : '0.875rem'
              }}
            >
              {formatTime(timeRemaining)}
            </Typography>
          </Box>
        </Box>

        <LinearProgress
          variant='determinate'
          value={progressPercentage}
          sx={{
            height: compact ? 6 : isMobile ? 6 : 8,
            borderRadius: compact ? 3 : 4,
            backgroundColor: theme.palette.action.hover,
            transition: shouldReduceMotion()
              ? 'none'
              : `all ${ANIMATION_DURATIONS.MEDIUM}ms ${EASING_FUNCTIONS.STANDARD}`,

            '& .MuiLinearProgress-bar': {
              borderRadius: compact ? 3 : 4,
              backgroundColor: getProgressColor,
              transition: shouldReduceMotion()
                ? 'none'
                : `all ${ANIMATION_DURATIONS.MEDIUM}ms ${EASING_FUNCTIONS.STANDARD}`
            }
          }}
        />
      </Box>

      {/* Progress Summary */}
      {!compact && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            flexWrap: 'wrap',
            gap: isMobile ? 1 : SPACING.SM,
            alignItems: isMobile ? 'flex-start' : 'center',
            justifyContent: 'space-between'
          }}
        >
          {/* Question counts */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              size={isMobile ? 'small' : 'small'}
              icon={<Icon icon='tabler:check' fontSize={isMobile ? '0.75rem' : '0.875rem'} />}
              label={`${answeredQuestions} completate`}
              sx={{
                backgroundColor: `${theme.palette.success.main}20`,
                color: theme.palette.success.main,
                fontWeight: 500,
                fontSize: isMobile ? '0.7rem' : '0.75rem',
                height: isMobile ? 24 : 28,
                '& .MuiChip-icon': {
                  color: theme.palette.success.main
                }
              }}
            />

            {unansweredCount > 0 && (
              <Chip
                size={isMobile ? 'small' : 'small'}
                icon={<Icon icon='tabler:circle' fontSize={isMobile ? '0.75rem' : '0.875rem'} />}
                label={`${unansweredCount} rămase`}
                sx={{
                  backgroundColor: `${theme.palette.warning.main}20`,
                  color: theme.palette.warning.main,
                  fontWeight: 500,
                  fontSize: isMobile ? '0.7rem' : '0.75rem',
                  height: isMobile ? 24 : 28,
                  '& .MuiChip-icon': {
                    color: theme.palette.warning.main
                  }
                }}
              />
            )}
          </Box>

          {/* Navigation hint - only show on desktop */}
          {onScrollToQuestion && !isMobile && !isTablet && (
            <Typography
              variant='caption'
              sx={{
                color: 'text.secondary',
                fontStyle: 'italic',
                fontSize: '0.75rem'
              }}
            >
              Derulează pentru a naviga prin întrebări
            </Typography>
          )}
        </Box>
      )}

      {/* Completion indicator */}
      {progressPercentage === 100 && (
        <Box
          sx={{
            mt: SPACING.MD,
            p: SPACING.SM,
            borderRadius: 2,
            backgroundColor: `${QUIZ_COLORS.PERFORMANCE.HIGH}10`,
            border: `1px solid ${QUIZ_COLORS.PERFORMANCE.HIGH}30`,
            display: 'flex',
            alignItems: 'center',
            gap: SPACING.SM,
            animation: `pulse ${ANIMATION_DURATIONS.CELEBRATION}ms ${EASING_FUNCTIONS.BOUNCE} infinite`
          }}
        >
          <Icon icon='tabler:circle-check' fontSize='1.25rem' style={{ color: QUIZ_COLORS.PERFORMANCE.HIGH }} />
          <Typography
            variant='body2'
            sx={{
              color: QUIZ_COLORS.PERFORMANCE.HIGH,
              fontWeight: 600
            }}
          >
            Toate întrebările au fost completate! Poți trimite testul.
          </Typography>
        </Box>
      )}

      {/* Warning for low time */}
      {timeRemaining < 300 &&
        timeRemaining > 0 && ( // Less than 5 minutes
          <Box
            sx={{
              mt: SPACING.MD,
              p: SPACING.SM,
              borderRadius: 2,
              backgroundColor: `${theme.palette.warning.main}10`,
              border: `1px solid ${theme.palette.warning.main}30`,
              display: 'flex',
              alignItems: 'center',
              gap: SPACING.SM,
              animation: `pulse ${ANIMATION_DURATIONS.CELEBRATION}ms ${EASING_FUNCTIONS.STANDARD} infinite`
            }}
          >
            <Icon icon='tabler:alert-triangle' fontSize='1.25rem' style={{ color: theme.palette.warning.main }} />
            <Typography
              variant='body2'
              sx={{
                color: theme.palette.warning.main,
                fontWeight: 600
              }}
            >
              Atenție! Mai ai puțin timp rămas.
            </Typography>
          </Box>
        )}
    </Box>
  )
}

export default ProgressTracker
