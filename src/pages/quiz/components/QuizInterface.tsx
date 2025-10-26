// ** React Imports
import React, { useState, useEffect, useCallback, useMemo } from 'react'

// ** Next Imports
import { useRouter } from 'next/router'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import LinearProgress from '@mui/material/LinearProgress'
import Alert from '@mui/material/Alert'
import Fade from '@mui/material/Fade'
import { useTheme } from '@mui/material/styles'

// ** Custom Components
import ProgressTracker from './ProgressTracker'
import CountdownTimer from './CountdownTimer'
import RadioComponent from './RadioComponent'
import QuizResults from './QuizResults'
import CelebrationAnimation from './CelebrationAnimation'

// ** Hooks
import { useResponsive, useResponsiveQuizInterface } from '../../quizzes/hooks/useResponsive'

// ** Types
import { QuizState, QuizProgress } from '../types'
import { QuestionDTO, QuizDTO } from '../../../generated/quiz-service/api'

// ** Services
import { quizUIService } from '../../quizzes/services/quizUIService'

// ** Utils
import { calculatePerformanceLevel } from '../../quizzes/utils/transformers'

// ** Constants
import { ANIMATION_DURATIONS, EASING_FUNCTIONS } from '../../quizzes/constants/animations'
import { SPACING } from '../../quizzes/constants/theme'

interface QuizInterfaceProps {
  quizId: string
}

const QuizInterface: React.FC<QuizInterfaceProps> = ({ quizId }) => {
  const router = useRouter()
  const theme = useTheme()

  // ** Responsive hooks
  const { isMobile, isTablet, isTouchDevice, shouldReduceMotion, getSpacing, orientation } = useResponsive()

  const {
    cardSpacing,
    questionSpacing,
    touchTargetSize,
    enableHoverEffects,
    enableAnimations,
    stackLayout,
    compactHeader
  } = useResponsiveQuizInterface()

  // ** State
  const [quizState, setQuizState] = useState<QuizState>({
    quiz: null,
    progress: {
      quizId,
      answers: {},
      timeSpent: 0,
      currentQuestion: 0,
      startTime: new Date(),
      lastSaved: new Date()
    },
    timeRemaining: 0,
    isSubmitting: false,
    hasSubmitted: false
  })

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [results, setResults] = useState<any>(null)

  // ** Computed values
  const answeredQuestions = useMemo(() => {
    return Object.keys(quizState.progress.answers).length
  }, [quizState.progress.answers])

  const totalQuestions = quizState.quiz?.questions?.length || 0
  const isQuizComplete = answeredQuestions === totalQuestions

  // ** Load quiz data
  useEffect(() => {
    const loadQuiz = async () => {
      try {
        setLoading(true)
        setError(null)

        // Start the quiz attempt
        const quizData = await quizUIService.startQuiz(quizId)

        setQuizState(prev => ({
          ...prev,
          quiz: quizData,
          timeRemaining: (quizData.maxTime || 60) * 60, // Convert minutes to seconds
          progress: {
            ...prev.progress,
            startTime: new Date(),
            lastSaved: new Date()
          }
        }))
      } catch (err) {
        console.error('Error loading quiz:', err)
        setError(err instanceof Error ? err.message : 'Nu am putut încărca testul')
      } finally {
        setLoading(false)
      }
    }

    if (quizId) {
      loadQuiz()
    }
  }, [quizId])

  // ** Timer countdown
  useEffect(() => {
    if (!quizState.quiz || quizState.hasSubmitted || loading) return

    const timer = setInterval(() => {
      setQuizState(prev => {
        const newTimeRemaining = Math.max(0, prev.timeRemaining - 1)
        const newTimeSpent = prev.progress.timeSpent + 1

        // Auto-submit when time runs out
        if (newTimeRemaining === 0 && !prev.isSubmitting) {
          handleSubmitQuiz(true) // Auto-submit
        }

        return {
          ...prev,
          timeRemaining: newTimeRemaining,
          progress: {
            ...prev.progress,
            timeSpent: newTimeSpent
          }
        }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [quizState.quiz, quizState.hasSubmitted, loading])

  // ** Auto-save progress
  useEffect(() => {
    if (!quizState.quiz || quizState.hasSubmitted) return

    const autoSaveTimer = setInterval(() => {
      setQuizState(prev => ({
        ...prev,
        progress: {
          ...prev.progress,
          lastSaved: new Date()
        }
      }))

      // Here you could implement actual auto-save to server
      console.log('Auto-saving progress...', quizState.progress)
    }, 30000) // Auto-save every 30 seconds

    return () => clearInterval(autoSaveTimer)
  }, [quizState.quiz, quizState.hasSubmitted, quizState.progress])

  // ** Handle answer selection
  const handleAnswerSelect = useCallback((questionId: string, answerIndex: number) => {
    setQuizState(prev => ({
      ...prev,
      progress: {
        ...prev.progress,
        answers: {
          ...prev.progress.answers,
          [questionId]: answerIndex
        }
      }
    }))
  }, [])

  // ** Handle quiz submission
  const handleSubmitQuiz = useCallback(
    async (isAutoSubmit = false) => {
      if (quizState.isSubmitting || quizState.hasSubmitted) return

      // Check if all questions are answered (unless auto-submit)
      if (!isAutoSubmit && !isQuizComplete) {
        setError('Te rugăm să răspunzi la toate întrebările înainte de a trimite testul.')
        return
      }

      try {
        setQuizState(prev => ({ ...prev, isSubmitting: true }))
        setError(null)

        // Submit quiz answers
        const submitResults = await quizUIService.submitQuiz(quizId, quizState.progress.answers)

        setResults(submitResults)
        setQuizState(prev => ({
          ...prev,
          isSubmitting: false,
          hasSubmitted: true
        }))

        // Show celebration animation first
        setShowCelebration(true)
      } catch (err) {
        console.error('Error submitting quiz:', err)
        setError(err instanceof Error ? err.message : 'Nu am putut trimite testul')
        setQuizState(prev => ({ ...prev, isSubmitting: false }))
      }
    },
    [quizId, quizState.progress.answers, quizState.isSubmitting, quizState.hasSubmitted, isQuizComplete]
  )

  // ** Handle celebration completion
  const handleCelebrationComplete = useCallback(() => {
    setShowCelebration(false)
    setShowResults(true)
  }, [])

  // ** Handle return to quizzes
  const handleReturnToQuizzes = useCallback(() => {
    router.push('/quizzes')
  }, [router])

  // ** Handle review answers
  const handleReviewAnswers = useCallback(() => {
    setShowResults(false)
    // Scroll to top to review answers
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // ** Handle scroll to question
  const handleScrollToQuestion = useCallback((questionIndex: number) => {
    const questionElement = document.getElementById(`question-${questionIndex}`)
    if (questionElement) {
      questionElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      })
    }
  }, [])

  // ** Loading state
  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress />
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Typography variant='body1' color='text.secondary'>
            Se încarcă testul...
          </Typography>
        </Box>
      </Box>
    )
  }

  // ** Error state
  if (error && !quizState.quiz) {
    return (
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Alert severity='error' sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Typography variant='body1' color='text.secondary'>
              Nu am putut încărca testul. Te rugăm să încerci din nou.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    )
  }

  // ** Show celebration animation
  if (showCelebration && results) {
    const score = results.correctAnswers || 0
    const performanceLevel = calculatePerformanceLevel(score, totalQuestions)

    return (
      <CelebrationAnimation
        score={score}
        totalQuestions={totalQuestions}
        performanceLevel={performanceLevel}
        onAnimationComplete={handleCelebrationComplete}
      />
    )
  }

  // ** Show results
  if (showResults && results) {
    return (
      <QuizResults
        score={results.correctAnswers || 0}
        totalQuestions={totalQuestions}
        answers={quizState.progress.answers}
        correctAnswers={results.correctAnswersMap || {}}
        questions={quizState.quiz?.questions || []}
        timeSpent={quizState.progress.timeSpent}
        onReturnToQuizzes={handleReturnToQuizzes}
        onReviewAnswers={handleReviewAnswers}
      />
    )
  }

  // ** Main quiz interface
  return (
    <Box sx={{
      width: '100%',
      maxWidth: isMobile ? '100%' : isTablet ? '100%' : 1200,
      mx: 'auto',
      p: isMobile ? 1 : isTablet ? 2 : SPACING.MD
    }}>
      {/* Header with Progress and Timer */}
      <Card sx={{
        mb: cardSpacing,
        overflow: 'visible',
        borderRadius: isMobile ? 1 : 2,
        boxShadow: isMobile ? 1 : 2
      }}>
        <CardContent sx={{
          p: isMobile ? 2 : isTablet ? 3 : 4,
          '&:last-child': { pb: isMobile ? 2 : isTablet ? 3 : 4 }
        }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: stackLayout ? 'column' : 'row',
              justifyContent: 'space-between',
              alignItems: stackLayout ? 'stretch' : 'flex-start',
              gap: isMobile ? 2 : SPACING.MD
            }}
          >
            {/* Quiz Title and Description */}
            <Box sx={{
              flex: 1,
              minWidth: stackLayout ? 'auto' : 300,
              mb: stackLayout ? 2 : 0
            }}>
              <Typography
                variant={isMobile ? 'h5' : isTablet ? 'h4' : 'h4'}
                sx={{
                  fontWeight: 700,
                  color: 'text.primary',
                  mb: 1,
                  fontSize: isMobile ? '1.25rem' : isTablet ? '1.5rem' : '2rem',
                  lineHeight: isMobile ? 1.3 : 1.4
                }}
              >
                {quizState.quiz?.title}
              </Typography>
              {quizState.quiz?.description && (
                <Typography
                  variant='body1'
                  sx={{
                    color: 'text.secondary',
                    lineHeight: 1.6,
                    fontSize: isMobile ? '0.9rem' : '1rem',
                    display: compactHeader ? '-webkit-box',
                    WebkitLineClamp: compactHeader ? 2 : 'none',
                    WebkitBoxOrient: 'vertical',
                    overflow: compactHeader ? 'hidden' : 'visible'
                  }}
                >
                  {quizState.quiz.description}
                </Typography>
              )}
            </Box>

            {/* Timer and Progress Summary */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: stackLayout ? 'row' : 'column',
                alignItems: stackLayout ? 'center' : 'flex-end',
                justifyContent: stackLayout ? 'space-between' : 'flex-start',
                gap: isMobile ? 1 : SPACING.SM,
                minWidth: stackLayout ? '100%' : 'auto'
              }}
            >
              <CountdownTimer
                timeRemaining={quizState.timeRemaining}
                totalTime={(quizState.quiz?.maxTime || 60) * 60}
                onTimeUp={() => handleSubmitQuiz(true)}
                showWarnings={!isMobile}
                compact={isMobile}
              />
              <Typography
                variant='body2'
                sx={{
                  color: 'text.secondary',
                  textAlign: stackLayout ? 'left' : 'right',
                  fontSize: isMobile ? '0.8rem' : '0.875rem',
                  whiteSpace: 'nowrap'
                }}
              >
                {answeredQuestions} din {totalQuestions} întrebări
              </Typography>
            </Box>
          </Box>

          {/* Progress Tracker */}
          {!compactHeader && (
            <Box sx={{ mt: isMobile ? 2 : SPACING.LG }}>
              <ProgressTracker
                totalQuestions={totalQuestions}
                answeredQuestions={answeredQuestions}
                currentQuestion={0}
                timeRemaining={quizState.timeRemaining}
                onScrollToQuestion={handleScrollToQuestion}
                compact={isMobile}
                orientation={orientation}
              />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Fade in={!!error}>
          <Alert severity='error' sx={{ mb: SPACING.LG }} onClose={() => setError(null)}>
            {error}
          </Alert>
        </Fade>
      )}

      {/* Questions */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: questionSpacing
        }}
      >
        {quizState.quiz?.questions?.map((question: QuestionDTO, index: number) => (
          <Box
            key={question.id}
            id={`question-${index}`}
            sx={{
              transition: enableAnimations ? `all ${ANIMATION_DURATIONS.MEDIUM}ms ${EASING_FUNCTIONS.STANDARD}` : 'none',
              '&:target': enableHoverEffects ? {
                transform: 'scale(1.02)',
                boxShadow: theme.shadows[8]
              } : {}
            }}
          >
            <RadioComponent
              question={question}
              selectedAnswer={quizState.progress.answers[question.id || '']}
              onAnswerSelect={answerIndex => handleAnswerSelect(question.id || '', answerIndex)}
              disabled={quizState.hasSubmitted || quizState.isSubmitting}
              showResults={false}
              compact={isMobile}
              touchOptimized={isTouchDevice}
            />
          </Box>
        ))}
      </Box>

      {/* Submit Section */}
      <Card sx={{
        mt: cardSpacing,
        mb: cardSpacing,
        borderRadius: isMobile ? 1 : 2,
        boxShadow: isMobile ? 1 : 2
      }}>
        <CardContent sx={{
          p: isMobile ? 2 : isTablet ? 3 : 4,
          '&:last-child': { pb: isMobile ? 2 : isTablet ? 3 : 4 }
        }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: isMobile ? 2 : SPACING.MD
            }}
          >
            <Typography
              variant={isMobile ? 'subtitle1' : 'h6'}
              sx={{
                textAlign: 'center',
                color: 'text.primary',
                fontWeight: 600,
                fontSize: isMobile ? '1.1rem' : '1.25rem'
              }}
            >
              Ești gata să trimiți testul?
            </Typography>

            <Typography
              variant='body2'
              sx={{
                textAlign: 'center',
                color: 'text.secondary',
                maxWidth: isMobile ? '100%' : 500,
                fontSize: isMobile ? '0.85rem' : '0.875rem',
                lineHeight: 1.5
              }}
            >
              Ai răspuns la {answeredQuestions} din {totalQuestions} întrebări.
              {!isQuizComplete && ' Te rugăm să completezi toate întrebările înainte de a trimite.'}
            </Typography>

            <Box
              sx={{
                display: 'flex',
                gap: isMobile ? 1 : SPACING.MD,
                mt: isMobile ? 1 : SPACING.MD,
                width: isMobile ? '100%' : 'auto'
              }}
            >
              <button
                onClick={() => handleSubmitQuiz(false)}
                disabled={quizState.isSubmitting}
                style={{
                  padding: isMobile ? `${touchTargetSize/3}px ${touchTargetSize/2}px` : `${SPACING.MD}px ${SPACING.XL}px`,
                  borderRadius: isMobile ? 6 : 8,
                  border: 'none',
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  fontSize: isMobile ? '0.95rem' : '1rem',
                  fontWeight: 600,
                  cursor: quizState.isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: quizState.isSubmitting ? 0.6 : 1,
                  transition: enableAnimations ? `all ${ANIMATION_DURATIONS.SHORT}ms ${EASING_FUNCTIONS.STANDARD}` : 'none',
                  transform: 'translateY(0)',
                  minHeight: touchTargetSize,
                  minWidth: isMobile ? '100%' : 'auto',
                  flex: isMobile ? 1 : 'none'
                }}
                onMouseEnter={e => {
                  if (!quizState.isSubmitting && enableHoverEffects) {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = theme.shadows[4]
                  }
                }}
                onMouseLeave={e => {
                  if (enableHoverEffects) {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }
                }}
                onTouchStart={e => {
                  if (isTouchDevice && !quizState.isSubmitting) {
                    e.currentTarget.style.transform = 'scale(0.98)'
                  }
                }}
                onTouchEnd={e => {
                  if (isTouchDevice) {
                    e.currentTarget.style.transform = 'scale(1)'
                  }
                }}
              >
                {quizState.isSubmitting ? 'Se trimite...' : 'Trimite testul'}
              </button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}

export default QuizInterface
