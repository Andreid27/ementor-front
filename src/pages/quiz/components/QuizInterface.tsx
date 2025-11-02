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
import { Button } from '@mui/material'
import { useTheme, alpha } from '@mui/material/styles'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components
import ProgressCard from './ProgressCard'
import CountdownTimer from './CountdownTimer'
import RadioComponent from './RadioComponent'
import QuizResults from './QuizResults'
import CelebrationAnimation from './CelebrationAnimation'
import SubmitCard from './SubmitCard'
import DialogTransition from './DialogTransition'
import QuizComponentErrorBoundary from './QuizComponentErrorBoundary'
import { QuizLoadingState, QuizInterfaceSkeleton } from './LoadingStates'
import { QuizLoadError, SubmitError, ValidationError, CelebrationErrorFallback } from './ErrorMessages'

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
  quizId?: string
  attemptId?: string
}

const QuizInterface: React.FC<QuizInterfaceProps> = ({ quizId, attemptId }) => {
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
      quizId: quizId || '',
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
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [celebrationError, setCelebrationError] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [reviewMode, setReviewMode] = useState(false)
  const [reviewModeActions, setReviewModeActions] = useState<React.ReactNode>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  // ** Computed values
  const answeredQuestions = useMemo(() => {
    return Object.keys(quizState.progress.answers).length
  }, [quizState.progress.answers])

  const totalQuestions = quizState.quiz?.questions?.length || 0
  const isQuizComplete = answeredQuestions === totalQuestions

  // ** Load quiz data with enhanced error handling
  useEffect(() => {
    const loadQuiz = async () => {
      try {
        setLoading(true)
        setError(null)

        if (attemptId) {
          // Load attempt data for review
          const attemptData = await quizUIService.getQuizAttempt(attemptId)

          // Map correctAnswers to correctAnswersMap
          const correctAnswersMap = (attemptData.correctAnswers || []).reduce(
            (acc: Record<string, number>, item: any) => {
              acc[item.questionId] = item.answer
              return acc
            },
            {}
          )

          setQuizState(prev => ({
            ...prev,
            quiz: attemptData.quiz,
            timeRemaining: 0,
            hasSubmitted: true,
            progress: {
              ...prev.progress,
              quizId: attemptData.quiz.id || '',
              answers: attemptData.submitedQuestionAnswers.reduce((acc: Record<string, number>, item: any) => {
                acc[item.questionId] = item.answer
                return acc
              }, {}),
              timeSpent: Math.floor(
                (new Date(attemptData.enddedAt).getTime() - new Date(attemptData.startedAt).getTime()) / 1000
              ),
              startTime: new Date(attemptData.startedAt),
              lastSaved: new Date(attemptData.enddedAt)
            }
          }))

          // Set results to show review mode, include correctAnswersMap
          setResults({
            correctCount: attemptData.correctCount,
            correctAnswers: attemptData.correctAnswers || [],
            correctAnswersMap
          })
          setReviewMode(true)
        } else if (quizId) {
          // Start the quiz attempt
          const quizData = await quizUIService.startQuiz(quizId)

          setQuizState(prev => ({
            ...prev,
            quiz: quizData,
            timeRemaining: (quizData.maxTime || 60) * 60,
            progress: {
              ...prev.progress,
              quizId: quizData.id || '',
              startTime: new Date(),
              lastSaved: new Date()
            }
          }))
        }
      } catch (err) {
        console.error('Error loading quiz:', err)

        // Requirement 9.3: User-friendly error messages
        let errorMessage = 'Nu am putut încărca testul. Te rugăm să încerci din nou.'

        if (err instanceof Error) {
          // Check for specific error types
          if (err.message.includes('network') || err.message.includes('fetch')) {
            errorMessage = 'Probleme de conexiune. Verifică conexiunea la internet și încearcă din nou.'
          } else if (err.message.includes('404')) {
            errorMessage = 'Testul nu a fost găsit. Verifică dacă link-ul este corect.'
          } else if (err.message.includes('403') || err.message.includes('401')) {
            errorMessage = 'Nu ai permisiunea de a accesa acest test.'
          }
        }

        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    if (quizId || attemptId) {
      loadQuiz()
    }
  }, [quizId, attemptId])

  // ** Timer countdown
  useEffect(() => {
    if (!quizState.quiz || quizState.hasSubmitted || loading) return

    const timer = setInterval(() => {
      setQuizState(prev => {
        const newTimeRemaining = Math.max(0, prev.timeRemaining - 1)
        const newTimeSpent = prev.progress.timeSpent + 1

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

  // ** Scroll detection is now handled by ProgressCard component

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

  // ** Handle quiz submission with enhanced error handling
  const handleSubmitQuiz = useCallback(
    async (isAutoSubmit = false) => {
      if (quizState.isSubmitting || quizState.hasSubmitted) return

      // Check if all questions are answered (unless auto-submit)
      if (!isAutoSubmit && !isQuizComplete) {
        // Show confirmation dialog for incomplete quiz
        setShowConfirmDialog(true)
        return
      }

      // Proceed with submission
      try {
        setQuizState(prev => ({ ...prev, isSubmitting: true }))
        setSubmitError(null)
        setError(null)

        // Requirement 9.2: Clear loading state during submission
        // Submit quiz answers
        const submitResults = await quizUIService.submitQuiz(quizId, quizState.progress.answers)

        // Convert correctAnswers array to map for easier lookup
        const correctAnswersMap: Record<string, number> = {}
        if (submitResults.correctAnswers && Array.isArray(submitResults.correctAnswers)) {
          submitResults.correctAnswers.forEach((item: { questionId: string; answer: number }) => {
            correctAnswersMap[item.questionId] = item.answer
          })
        }

        setResults({
          ...submitResults,
          correctAnswersMap
        })
        setQuizState(prev => ({
          ...prev,
          isSubmitting: false,
          hasSubmitted: true
        }))

        // Show celebration animation first
        setShowCelebration(true)
      } catch (err) {
        console.error('Error submitting quiz:', err)

        // Requirement 9.3: User-friendly error messages for submission failures
        let errorMessage = 'Nu am putut trimite testul. Te rugăm să încerci din nou.'

        if (err instanceof Error) {
          if (err.message.includes('network') || err.message.includes('fetch')) {
            errorMessage = 'Probleme de conexiune. Verifică conexiunea la internet și încearcă din nou.'
          } else if (err.message.includes('timeout')) {
            errorMessage = 'Timpul de așteptare a expirat. Te rugăm să încerci din nou.'
          }
        }

        setSubmitError(errorMessage)
        setQuizState(prev => ({ ...prev, isSubmitting: false }))
      }
    },
    [quizId, quizState.progress.answers, quizState.isSubmitting, quizState.hasSubmitted, isQuizComplete]
  )

  // ** Auto-submit when time runs out
  useEffect(() => {
    if (quizState.timeRemaining === 0 && !quizState.hasSubmitted && !quizState.isSubmitting && quizState.quiz) {
      handleSubmitQuiz(true)
    }
  }, [quizState.timeRemaining, quizState.hasSubmitted, quizState.isSubmitting, quizState.quiz, handleSubmitQuiz])

  // ** Handle celebration completion
  const handleCelebrationComplete = useCallback(() => {
    setShowCelebration(false)
    setReviewMode(true)
    // Scroll to top to show results
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // ** Handle celebration error
  const handleCelebrationError = useCallback((error: Error) => {
    console.error('Celebration animation error:', error)
    // Requirement 9.4: Maintain functional state even when celebration fails
    setCelebrationError(true)
  }, [])

  // ** Handle return to quizzes
  const handleReturnToQuizzes = useCallback(() => {
    router.push('/quizzes')
  }, [router])

  // ** Handle review answers - just scroll to top since we're already showing everything
  const handleReviewAnswers = useCallback(() => {
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

  // ** Handle dialog close
  const handleDialogClose = useCallback(() => {
    setShowConfirmDialog(false)
  }, [])

  // ** Handle dialog confirm - force submit even with unanswered questions
  const handleDialogConfirm = useCallback(async () => {
    setShowConfirmDialog(false)
    // Force submit by calling with isAutoSubmit=true to bypass the check
    await handleSubmitQuiz(true)
  }, [handleSubmitQuiz])

  // ** Get unanswered questions count
  const getUnansweredQuestions = useCallback(() => {
    return totalQuestions - answeredQuestions
  }, [totalQuestions, answeredQuestions])

  // ** Requirement 9.2: Clear loading state
  if (loading) {
    return <QuizLoadingState message='Se încarcă testul...' />
  }

  // ** Requirement 9.3: User-friendly error state
  if (error && !quizState.quiz) {
    return (
      <QuizLoadError
        message={error}
        onRetry={() => window.location.reload()}
        onGoBack={() => router.push('/quizzes')}
      />
    )
  }

  // ** Show celebration animation with error boundary
  // Requirement 9.1: Handle celebration animation errors gracefully
  if (showCelebration && results) {
    const score = results.correctCount || 0
    const performanceLevel = calculatePerformanceLevel(score, totalQuestions)

    // Show fallback if celebration had an error
    if (celebrationError) {
      return (
        <CelebrationErrorFallback
          score={score}
          totalQuestions={totalQuestions}
          onContinue={handleCelebrationComplete}
        />
      )
    }

    return (
      <QuizComponentErrorBoundary
        componentName='Celebration Animation'
        onError={handleCelebrationError}
        fallback={
          <CelebrationErrorFallback
            score={score}
            totalQuestions={totalQuestions}
            onContinue={handleCelebrationComplete}
          />
        }
      >
        <CelebrationAnimation
          score={score}
          totalQuestions={totalQuestions}
          performanceLevel={performanceLevel}
          onAnimationComplete={handleCelebrationComplete}
        />
      </QuizComponentErrorBoundary>
    )
  }

  // ** Show results
  if (showResults && results) {
    // Transform correctAnswers array to map
    const correctAnswersMap = (results.correctAnswers || []).reduce((acc: Record<string, number>, item: any) => {
      acc[item.questionId] = item.answer
      return acc
    }, {})

    return (
      <QuizResults
        score={results.correctCount || 0}
        totalQuestions={totalQuestions}
        quiz={quizState.quiz}
        timeSpent={quizState.progress.timeSpent}
        onReturnToQuizzes={handleReturnToQuizzes}
        onReviewAnswers={handleReviewAnswers}
      />
    )
  }

  // ** Main quiz interface with error boundaries
  return (
    <>
      {/* Show QuizResults in place of ProgressCard when in review mode */}
      {reviewMode && results ? (
        <QuizComponentErrorBoundary componentName='Quiz Results' minimal>
          <QuizResults
            score={results.correctCount || 0}
            totalQuestions={totalQuestions}
            quiz={quizState.quiz}
            timeSpent={quizState.progress.timeSpent}
            reviewModeActions={reviewModeActions}
            setReviewModeActions={setReviewModeActions}
            onReturnToQuizzes={handleReturnToQuizzes}
            onReviewAnswers={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
          />
        </QuizComponentErrorBoundary>
      ) : (
        /* Requirement 9.5: Error boundary for Progress Card */
        <QuizComponentErrorBoundary componentName='Progress Card' minimal>
          <ProgressCard
            title={quizState.quiz?.title || 'Test'}
            timeRemaining={quizState.timeRemaining}
            totalQuestions={totalQuestions}
            answeredQuestions={answeredQuestions}
            totalTime={(quizState.quiz?.maxTime || 60) * 60}
            onTimeUp={() => handleSubmitQuiz(true)}
            currentQuestionIndex={quizState.progress.currentQuestion}
            quizDifficulty={quizState.quiz?.difficultyLevel?.toString() || 'Mediu'}
            estimatedTimePerQuestion={Math.round(((quizState.quiz?.maxTime || 60) * 60) / totalQuestions)}
            onScrollToQuestion={handleScrollToQuestion}
            showResults={reviewMode}
          />
        </QuizComponentErrorBoundary>
      )}

      <Box
        sx={{
          width: '100%',
          maxWidth: isMobile ? '100%' : isTablet ? '100%' : 1200,
          mx: 'auto',
          mt: 2
        }}
      >
        {/* Requirement 9.3: User-friendly error messages */}
        {submitError && (
          <Fade in={!!submitError}>
            <Box>
              <SubmitError
                message={submitError}
                onRetry={() => handleSubmitQuiz(false)}
                onDismiss={() => setSubmitError(null)}
              />
            </Box>
          </Fade>
        )}

        {/* General validation errors */}
        {error && !submitError && (
          <Fade in={!!error}>
            <Box>
              <ValidationError message={error} onDismiss={() => setError(null)} />
            </Box>
          </Fade>
        )}

        {/* Questions with error boundaries */}
        {/* Task 6: Requirement 2.1 - Maximum 32px spacing between questions on desktop, 24px on mobile */}
        {/* Requirement 2.5 - Eliminate excessive margins creating unnecessary visual gaps */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            // Requirement 2.1: Maximum spacing between questions
            gap: isMobile ? 3 : isTablet ? 3.5 : 4, // 24px mobile, 28px tablet, 32px desktop
            // Requirement 2.5: Remove excessive margins
            margin: 0,
            padding: 0
          }}
        >
          {quizState.quiz?.questions?.map((question: QuestionDTO, index: number) => (
            <Box
              key={question.id}
              id={`question-${index}`}
              sx={{
                transition: enableAnimations
                  ? `all ${ANIMATION_DURATIONS.MEDIUM}ms ${EASING_FUNCTIONS.STANDARD}`
                  : 'none'
              }}
            >
              {/* Requirement 9.5: Error boundary for each question */}
              <QuizComponentErrorBoundary componentName={`Întrebarea ${index + 1}`} minimal>
                <RadioComponent
                  question={question}
                  selectedAnswer={quizState.progress.answers[question.id || '']}
                  onAnswerSelect={answerIndex => handleAnswerSelect(question.id || '', answerIndex)}
                  disabled={quizState.hasSubmitted || quizState.isSubmitting || reviewMode}
                  showResults={reviewMode}
                  correctAnswer={
                    reviewMode
                      ? results?.correctAnswersMap?.[question.id || ''] ||
                        results?.correctAnswers?.find((item: any) => item.questionId === question.id)?.answer ||
                        question.correctAnswer
                      : undefined
                  }
                  compact={isMobile}
                  touchOptimized={isTouchDevice}
                  questionNumber={index + 1}
                  totalQuestions={totalQuestions}
                />
              </QuizComponentErrorBoundary>
            </Box>
          ))}
        </Box>

        {/* Submit Section with error boundary - Task 10: Compact elegant submit card */}
        {!reviewMode ? (
          <QuizComponentErrorBoundary componentName='Submit Card' minimal>
            <SubmitCard
              answeredQuestions={answeredQuestions}
              totalQuestions={totalQuestions}
              isSubmitting={quizState.isSubmitting}
              onSubmit={() => handleSubmitQuiz(false)}
              disabled={quizState.hasSubmitted}
            />
          </QuizComponentErrorBoundary>
        ) : (
          <Box
            sx={{
              width: '100%',
              maxWidth: { xs: '100%', sm: '100%', md: 900 },
              mx: 'auto',
              my: 8
            }}
          >
            {reviewModeActions}
          </Box>
        )}
      </Box>

      {/* Confirmation Dialog for incomplete quiz */}
      <DialogTransition
        open={showConfirmDialog}
        handleClose={handleDialogClose}
        handleConfirm={handleDialogConfirm}
        getUnasweredQuestions={getUnansweredQuestions}
      />
    </>
  )
}

export default QuizInterface
