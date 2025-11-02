/**
 * QuizResults Component - Apple-Style Refactored
 *
 * Shows quiz results summary with option to review answers in the main quiz interface
 */

// ** React Imports
import React, { useState, useEffect, useRef, useMemo } from 'react'

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
import { QuestionDTO, QuizDTO } from '../../../generated/quiz-service/api'

// ** Apple Design System
import {
  APPLE_DESIGN_SYSTEM,
  APPLE_SPACING,
  APPLE_BORDER_RADIUS,
  APPLE_ELEVATION
} from '../../../@core/theme/apple-design-system'

import {
  APPLE_ANIMATION_DURATIONS,
  APPLE_EASING_FUNCTIONS,
  APPLE_REDUCED_MOTION
} from '../../../@core/theme/apple-design-system/animations'

// ** Utils
import { calculatePerformanceLevel } from '../../quizzes/utils/transformers'
import { useResponsive } from 'src/pages/quizzes/hooks/useResponsive'
import CountdownTimer from './CountdownTimer'

// ** Types
interface QuizResultsProps {
  score: number
  totalQuestions: number
  quiz: QuizDTO
  reviewModeActions?: React.ReactNode
  setReviewModeActions?: (actions: React.ReactNode) => void
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
  quiz,
  reviewModeActions,
  setReviewModeActions,
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

  const { isMobile } = useResponsive()

  // ** State for scroll detection - start in compact mode on mobile to avoid initial flicker
  const [isScrolled, setIsScrolled] = useState(isMobile)
  const lastStateRef = useRef(isMobile)

  // ** Scroll detection with mobile-optimized thresholds
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY

      // Mobile: Ultra-low threshold (1px) to switch instantly
      // Desktop: Higher threshold (100px) for smoother experience
      if (isMobile) {
        // On mobile, switch to compact instantly (1px)
        setIsScrolled(scrollPosition > 1)
      } else {
        // On desktop, use hysteresis to prevent flickering
        if (lastStateRef.current) {
          // Currently compact - exit at 80px
          if (scrollPosition < 80) {
            setIsScrolled(false)
            lastStateRef.current = false
          }
        } else {
          // Currently full - enter at 120px
          if (scrollPosition > 120) {
            setIsScrolled(true)
            lastStateRef.current = true
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initialize on mount

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [isMobile])

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
  const performanceColor = getPerformanceColor() // ** Format time
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  // Memoize the review mode actions to prevent infinite loops
  const reviewActions = useMemo(
    () => (
      <Fade in timeout={prefersReducedMotion ? 0 : APPLE_ANIMATION_DURATIONS.STANDARD}>
        <Box
          sx={{
            display: 'flex',
            gap: APPLE_SPACING.SM,
            mb: APPLE_SPACING.XS,
            flexWrap: 'wrap',
            justifyContent: 'center'
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
    ),
    [onReturnToQuizzes, onReviewAnswers, prefersReducedMotion, theme]
  )

  // Set review mode actions only once using a ref to track if it's been set
  const actionsSetRef = useRef(false)
  useEffect(() => {
    if (setReviewModeActions && !actionsSetRef.current) {
      setReviewModeActions(reviewActions)
      actionsSetRef.current = true
    }
  }, [setReviewModeActions, reviewActions])

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
              {personalizedMessage.title} — {quiz.title}
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

            {!isMobile && (
              /* Quiz Title - Compact (desktop only) */
              <Box
                sx={{
                  flex: '0 0 auto',
                  maxWidth: '25%',
                  display: 'flex',
                  alignItems: 'center'
                }}
              ></Box>
            )}

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
                {isMobile ? (
                  <>
                    <Typography variant='h4' sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1 }}>
                      {formatTime(timeSpent)}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      Timp utilizat
                    </Typography>
                  </>
                ) : (
                  <Box sx={{ my: -4.5 }}>
                    <CountdownTimer
                      timeSpent={timeSpent}
                      timeRemaining={quiz.maxTime * 60 - timeSpent}
                      totalTime={quiz.maxTime * 60}
                      compact={false}
                    />
                  </Box>
                )}
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
    </Box>
  )
}

export default QuizResults
