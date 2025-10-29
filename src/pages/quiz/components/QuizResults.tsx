/**
 * QuizResults Component - Apple-Style Refactored
 *
 * Shows quiz results summary with option to review answers in the main quiz interface
 */

// ** React Imports
import React, { useState, useEffect } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { Button } from '@mui/material'
import LinearProgress from '@mui/material/LinearProgress'
import Fade from '@mui/material/Fade'
import { useTheme } from '@mui/material/styles'

// ** Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import VisibilityIcon from '@mui/icons-material/Visibility'

// ** Types
import { PerformanceLevel } from '../types'
import { QuestionDTO } from '../../../generated/quiz-service/api'

// ** Apple Design System
import { APPLE_SPACING, APPLE_BORDER_RADIUS, APPLE_ELEVATION } from '../../../@core/theme/apple-design-system'

import {
  APPLE_ANIMATION_DURATIONS,
  APPLE_EASING_FUNCTIONS,
  APPLE_REDUCED_MOTION
} from '../../../@core/theme/apple-design-system/animations'

// ** Utils
import { calculatePerformanceLevel } from '../../quizzes/utils/transformers'

// ** Types
interface QuizResultsProps {
  score: number
  totalQuestions: number
  answers: Record<string, number>
  correctAnswers: Record<string, number>
  questions: QuestionDTO[]
  timeSpent: number
  onReturnToQuizzes: () => void
  onReviewAnswers: () => void
}

// ============================================================================
// MAIN QUIZ RESULTS COMPONENT
// ============================================================================

const QuizResults: React.FC<QuizResultsProps> = ({
  score,
  totalQuestions,
  answers,
  correctAnswers,
  questions,
  timeSpent,
  onReturnToQuizzes,
  onReviewAnswers
}) => {
  const theme = useTheme()
  const [progressAnimated, setProgressAnimated] = useState(false)
  const prefersReducedMotion = APPLE_REDUCED_MOTION.DETECT_REDUCED_MOTION()

  // Trigger progress animation
  useEffect(() => {
    const timer = setTimeout(() => setProgressAnimated(true), prefersReducedMotion ? 0 : 300)
    return () => clearTimeout(timer)
  }, [prefersReducedMotion])

  // ** Calculate performance metrics
  const percentage = Math.round((score / totalQuestions) * 100)
  const performanceLevel: PerformanceLevel = calculatePerformanceLevel(score, totalQuestions)

  // ** Get performance color
  const getPerformanceColor = () => {
    switch (performanceLevel) {
      case 'high':
        return theme.palette.success.main
      case 'medium':
        return theme.palette.info.main
      case 'low':
        return theme.palette.warning.main
    }
  }

  // ** Get personalized message
  const getPersonalizedMessage = () => {
    switch (performanceLevel) {
      case 'high':
        return {
          title: 'Rezultat excelent!',
          message: 'Felicitări! Ai demonstrat o înțelegere foarte bună a materiei.'
        }
      case 'medium':
        return {
          title: 'Rezultat bun!',
          message: 'Bună treabă! Cu puțină practică în plus, vei putea obține rezultate și mai bune.'
        }
      case 'low':
        return {
          title: 'Continuă să exersezi!',
          message: 'Fiecare test este o oportunitate de învățare. Revizuiește materialul și încearcă din nou.'
        }
    }
  }

  const personalizedMessage = getPersonalizedMessage()
  const performanceColor = getPerformanceColor()

  // ** Format time
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: { xs: '100%', sm: '100%', md: 900 },
        mx: 'auto'
      }}
    >
      {/* Header Section - Compact */}
      <Fade in timeout={prefersReducedMotion ? 0 : APPLE_ANIMATION_DURATIONS.STANDARD}>
        <Card
          sx={{
            mb: APPLE_SPACING.SM,
            borderTop: `3px solid ${performanceColor}`,
            boxShadow: theme.shadows[APPLE_ELEVATION.RAISED]
          }}
        >
          <CardContent sx={{ p: { xs: APPLE_SPACING.MD, sm: APPLE_SPACING.LG } }}>
            {/* Title and Message */}
            <Typography
              variant='h5'
              sx={{
                fontWeight: 700,
                color: performanceColor,
                mb: APPLE_SPACING.XS,
                fontSize: { xs: '1.25rem', sm: '1.5rem' }
              }}
            >
              {personalizedMessage.title}
            </Typography>

            <Typography
              variant='body2'
              sx={{
                color: 'text.secondary',
                mb: APPLE_SPACING.LG,
                lineHeight: 1.5
              }}
            >
              {personalizedMessage.message}
            </Typography>

            {/* Score Display - Compact Grid */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
                gap: APPLE_SPACING.MD,
                mb: APPLE_SPACING.MD
              }}
            >
              <Box sx={{ textAlign: { xs: 'left', sm: 'center' } }}>
                <Typography variant='h4' sx={{ fontWeight: 700, color: performanceColor, lineHeight: 1 }}>
                  {score}/{totalQuestions}
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  Răspunsuri corecte
                </Typography>
              </Box>

              <Box sx={{ textAlign: { xs: 'left', sm: 'center' } }}>
                <Typography variant='h4' sx={{ fontWeight: 700, color: performanceColor, lineHeight: 1 }}>
                  {percentage}%
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  Scor obținut
                </Typography>
              </Box>

              <Box sx={{ textAlign: { xs: 'left', sm: 'center' } }}>
                <Typography variant='h4' sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1 }}>
                  {formatTime(timeSpent)}
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  Timp utilizat
                </Typography>
              </Box>
            </Box>

            {/* Progress Bar - Compact */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: APPLE_SPACING.XS }}>
                <Typography variant='caption' color='text.secondary'>
                  Progres
                </Typography>
                <Typography variant='caption' fontWeight={600}>
                  {percentage}%
                </Typography>
              </Box>
              <Box sx={{ position: 'relative' }}>
                <LinearProgress
                  variant='determinate'
                  value={100}
                  sx={{
                    height: 6,
                    borderRadius: APPLE_BORDER_RADIUS.SMALL,
                    backgroundColor: theme.palette.grey[200]
                  }}
                />
                <LinearProgress
                  variant='determinate'
                  value={progressAnimated ? percentage : 0}
                  sx={{
                    height: 6,
                    borderRadius: APPLE_BORDER_RADIUS.SMALL,
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    transition: prefersReducedMotion
                      ? 'none'
                      : `all ${APPLE_ANIMATION_DURATIONS.CELEBRATION}ms ${APPLE_EASING_FUNCTIONS.STANDARD}`,
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: performanceColor
                    }
                  }}
                />
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Fade>

      {/* Action Buttons - Compact and Appropriately Sized */}
      <Fade in timeout={prefersReducedMotion ? 0 : APPLE_ANIMATION_DURATIONS.STANDARD}>
        <Box
          sx={{
            display: 'flex',
            gap: APPLE_SPACING.SM,
            mb: APPLE_SPACING.XS,
            flexWrap: 'wrap'
          }}
        >
          <Button
            variant='outlined'
            size='medium'
            startIcon={<ArrowBackIcon />}
            onClick={onReturnToQuizzes}
            sx={{
              borderRadius: APPLE_BORDER_RADIUS.MEDIUM,
              textTransform: 'none',
              px: APPLE_SPACING.MD,
              flex: { xs: '1 1 100%', sm: '0 1 auto' },
              transition: prefersReducedMotion
                ? 'none'
                : `all ${APPLE_ANIMATION_DURATIONS.MICRO}ms ${APPLE_EASING_FUNCTIONS.STANDARD}`,
              '&:hover': {
                transform: prefersReducedMotion ? 'none' : 'translateY(-1px)',
                boxShadow: theme.shadows[APPLE_ELEVATION.SUBTLE]
              }
            }}
          >
            Înapoi la teste
          </Button>

          <Button
            variant='contained'
            size='medium'
            startIcon={<VisibilityIcon />}
            onClick={onReviewAnswers}
            sx={{
              borderRadius: APPLE_BORDER_RADIUS.MEDIUM,
              textTransform: 'none',
              px: APPLE_SPACING.MD,
              flex: { xs: '1 1 100%', sm: '0 1 auto' },
              transition: prefersReducedMotion
                ? 'none'
                : `all ${APPLE_ANIMATION_DURATIONS.MICRO}ms ${APPLE_EASING_FUNCTIONS.STANDARD}`,
              '&:hover': {
                transform: prefersReducedMotion ? 'none' : 'translateY(-1px)',
                boxShadow: theme.shadows[APPLE_ELEVATION.SUBTLE]
              }
            }}
          >
            Vezi răspunsurile
          </Button>
        </Box>
      </Fade>
    </Box>
  )
}

export default QuizResults
