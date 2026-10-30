// ** React Imports
import React, { useState, useEffect, useCallback, useMemo, useRef, use } from 'react'

// ** Next Imports
import { useRouter } from 'next/router'

// ** MUI Imports
import Box from '@mui/material/Box'
import Fade from '@mui/material/Fade'
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
import { QuizLoadingState, QuizInterfaceSkeleton } from 'src/components/quiz/LoadingStates'
import {
  QuizLoadError,
  SubmitError,
  ValidationError,
  CelebrationErrorFallback
} from 'src/components/quiz/ErrorMessages'
import QuizContentProtection from 'src/components/quiz/QuizContentProtection'
import { QuizClock, createQuizClock, getRemainingMs } from 'src/components/quiz/quizClock'
import QuizIntegrityNotice from 'src/components/quiz/integrity/QuizIntegrityNotice'
import QuizIntegrityReport from 'src/components/quiz/integrity/QuizIntegrityReport'
import IntegrityQuestionMarker, { hasIntegrityMarker } from 'src/components/quiz/integrity/IntegrityQuestionMarker'
import { useQuizIntegrityReport } from 'src/components/quiz/integrity/useQuizIntegrityReport'
import { QuizIntegrityTracker, startQuizIntegrityTracker } from 'src/components/quiz/integrity/integrityTracker'
import { indexQuestionStats } from 'src/components/quiz/integrity/integrityFormat'
import type { AnswerSelectionSource, BlockedAction, SubmitTrigger } from 'src/components/quiz/integrity/integrityTypes'

// ** Hooks
import { useResponsive, useResponsiveQuizInterface } from '../../quizzes/hooks/useResponsive'

// ** Types
import { QuizState } from '../types'
import { QuestionDTO, SubmitQuizDTO } from '../../../generated/quiz-service/api'

// ** Services
import { quizUIService } from '../../quizzes/services/quizUIService'

// ** Utils
import { calculatePerformanceLevel } from '../../quizzes/utils/transformers'

// ** Constants
import { ANIMATION_DURATIONS, EASING_FUNCTIONS } from '../../quizzes/constants/animations'
import { SPACING } from '../../quizzes/constants/theme'
import { useSelector } from 'react-redux'
import { selectAllStudents } from 'src/store/apps/user'
import extractProfilePicture from 'src/@core/axios/profile-picture-extractor'
import profilePictureDownloader from 'src/@core/axios/profile-picture-downloader'

interface QuizInterfaceProps {
  quizId?: string
  attemptId?: string
  isProfessor?: boolean
}

// A failed automatic submit at time up is retried after this delay
const TIME_UP_RETRY_DELAY_MS = 5000

// Seconds left (rounded up, so 0:00 means the time is up) and seconds used, read from the quiz clock
const readQuizClock = (clock: QuizClock) => {
  const remainingMs = Math.max(0, getRemainingMs(clock, Date.now(), performance.now()))

  return {
    timeRemaining: Math.ceil(remainingMs / 1000),
    timeSpent: Math.floor((clock.durationMs - remainingMs) / 1000)
  }
}

const QuizInterface: React.FC<QuizInterfaceProps> = ({ quizId, attemptId, isProfessor }) => {
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
    hasSubmitted: false,
    userId: null
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
  const students = useSelector(selectAllStudents)
  const [user, setUser] = useState<any>(null)
  const quizClockRef = useRef<QuizClock | null>(null)

  // The integrity record lives outside React state: it must not add renders to a page that re-renders every second
  const trackerRef = useRef<QuizIntegrityTracker | null>(null)

  // ** Computed values
  const answeredQuestions = useMemo(() => {
    return Object.keys(quizState.progress.answers).length
  }, [quizState.progress.answers])

  const totalQuestions = quizState.quiz?.questions?.length || 0
  const isQuizComplete = answeredQuestions === totalQuestions

  // Taking the quiz, as opposed to reviewing an attempt: the only time the integrity record is kept
  const isTakingQuiz =
    Boolean(quizId) && !isProfessor && !loading && Boolean(quizState.quiz) && !quizState.hasSubmitted && !reviewMode

  // Once the time is up the answers are final, even while a failed automatic submit is being retried
  const isTimeUp = isTakingQuiz && quizState.timeRemaining === 0

  // ** Integrity report, for the professor reviewing a student's attempt (students never see it)
  const { state: integrityState, retry: retryIntegrity } = useQuizIntegrityReport(
    attemptId,
    Boolean(isProfessor && attemptId)
  )

  // Hidden until the professor opens it, together with the markers on the questions
  const [showIntegrity, setShowIntegrity] = useState(false)

  const integrityByQuestion = useMemo(
    () => indexQuestionStats(integrityState.status === 'ready' ? integrityState.report : null),
    [integrityState]
  )

  // ** Load quiz data with enhanced error handling
  useEffect(() => {
    const loadQuiz = async () => {
      try {
        setLoading(true)
        setError(null)

        if (attemptId) {
          // Load attempt data for review
          const attemptData: SubmitQuizDTO = await quizUIService.getQuizAttempt(attemptId)
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
            userId: attemptData.studentId || null,
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
          // The student may not be loaded yet, for example when the attempt is opened from a link; the review
          // then shows without the student's card instead of failing
          let selectedUser = isProfessor && students.find(student => student.id === attemptData.studentId)
          if (selectedUser) {
            const processedUser = extractProfilePicture(selectedUser)

            const avatar =
              processedUser?.type === 'API'
                ? await profilePictureDownloader(processedUser.url, processedUser.userId)
                : processedUser?.type === 'EXTERNAL'
                ? processedUser.url
                : null

            selectedUser = { ...selectedUser, avatar: avatar }

            setUser(selectedUser)
          }

          setLoading(false)
          setReviewMode(true)
        } else if (quizId) {
          // Start the quiz attempt
          const quizData = await quizUIService.startQuiz(quizId)

          // The countdown runs from the server's deadline, so a slowed or paused timer cannot stretch it
          const clock = createQuizClock(
            { serverTime: quizData.serverTime, endTime: quizData.endTime, maxTimeMinutes: quizData.maxTime || 60 },
            Date.now(),
            performance.now()
          )
          quizClockRef.current = clock

          setQuizState(prev => ({
            ...prev,
            quiz: quizData,
            timeRemaining: readQuizClock(clock).timeRemaining,
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

  // ** Timer countdown, read from the quiz clock several times a second and again when the tab comes back,
  // ** so the display never skips a second; the state changes only when a shown value does
  useEffect(() => {
    const clock = quizClockRef.current
    if (!clock || !quizState.quiz || quizState.hasSubmitted || loading) return

    const tick = () => {
      const { timeRemaining, timeSpent } = readQuizClock(clock)

      setQuizState(prev =>
        prev.timeRemaining === timeRemaining && prev.progress.timeSpent === timeSpent
          ? prev
          : { ...prev, timeRemaining, progress: { ...prev.progress, timeSpent } }
      )
    }

    tick()
    const timer = setInterval(tick, 250)
    document.addEventListener('visibilitychange', tick)

    return () => {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [quizState.quiz, quizState.hasSubmitted, loading])

  // ** Integrity record: starts when the questions are on screen and stops after the submit or on leaving the page.
  // ** Without a submit the record is thrown away
  useEffect(() => {
    if (!isTakingQuiz || !quizId) return

    const tracker = startQuizIntegrityTracker({
      quizStudentId: quizId,
      questionOrder: (quizState.quiz?.questions || []).map(question => question.id || ''),
      serverEndTime: quizState.quiz?.endTime || '',
      clockOffsetMs: quizClockRef.current?.clockOffsetMs ?? 0
    })
    trackerRef.current = tracker

    return () => {
      tracker?.stop()
      if (trackerRef.current === tracker) trackerRef.current = null
    }

    // The quiz does not change while it is taken; restarting would lose the record
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTakingQuiz, quizId])

  const handleBlockedAction = useCallback((action: BlockedAction) => {
    trackerRef.current?.recordBlockedAction(action)
  }, [])

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
  const handleAnswerSelect = useCallback((questionId: string, answerIndex: number, source: AnswerSelectionSource) => {
    trackerRef.current?.recordAnswer(questionId, answerIndex, source)

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

  // ** Handle quiz submission with enhanced error handling.
  // ** MANUAL asks for confirmation when questions are unanswered; the dialog then submits as MANUAL_INCOMPLETE
  const handleSubmitQuiz = useCallback(
    async (trigger: SubmitTrigger) => {
      if (quizState.isSubmitting || quizState.hasSubmitted) return

      // Check if all questions are answered (unless the student already confirmed, or time is up)
      if (trigger === 'MANUAL' && !isQuizComplete) {
        // Show confirmation dialog for incomplete quiz
        setShowConfirmDialog(true)
        return
      }

      // Proceed with submission
      try {
        setQuizState(prev => ({ ...prev, isSubmitting: true }))
        setSubmitError(null)
        setError(null)

        // Without an integrity record the answers are sent alone
        const integrity = trackerRef.current?.buildPayload(trigger) ?? null

        // Requirement 9.2: Clear loading state during submission
        // Submit quiz answers
        const submitResults = await quizUIService.submitQuiz(quizId, quizState.progress.answers, integrity)

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

  // ** Auto-submit when time runs out; after a failed attempt it tries again every few seconds, not in a tight loop
  useEffect(() => {
    if (quizState.timeRemaining !== 0 || quizState.hasSubmitted || quizState.isSubmitting || !quizState.quiz) return

    const timer = setTimeout(() => handleSubmitQuiz('TIME_UP'), submitError ? TIME_UP_RETRY_DELAY_MS : 0)

    return () => clearTimeout(timer)
  }, [
    quizState.timeRemaining,
    quizState.hasSubmitted,
    quizState.isSubmitting,
    quizState.quiz,
    handleSubmitQuiz,
    submitError
  ])

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
    if (isProfessor) {
      router.push('/student-results')
    } else {
      router.push('/quizzes')
    }
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
    await handleSubmitQuiz('MANUAL_INCOMPLETE')
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
        onGoBack={() => {
          if (isProfessor) {
            router.push('/student-results')
          } else {
            router.push('/quizzes')
          }
        }}
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
      {/* Students cannot copy, paste, print or save the questions; professors reviewing an attempt can */}
      {!isProfessor && <QuizContentProtection onBlocked={handleBlockedAction} />}

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
            user={user}
            onReviewAnswers={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
          />
          {isProfessor && (
            <QuizComponentErrorBoundary componentName='Integritatea testului' minimal>
              <QuizIntegrityReport
                state={integrityState}
                onRetry={retryIntegrity}
                shown={showIntegrity}
                onToggle={() => setShowIntegrity(shown => !shown)}
              />
            </QuizComponentErrorBoundary>
          )}
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
            onTimeUp={() => handleSubmitQuiz('TIME_UP')}
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
                onRetry={() => handleSubmitQuiz(isTimeUp ? 'TIME_UP' : 'MANUAL')}
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

        {quizId && !reviewMode && <QuizIntegrityNotice />}

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
              data-question-id={question.id}
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
                  onAnswerSelect={(answerIndex, source) => handleAnswerSelect(question.id || '', answerIndex, source)}
                  disabled={quizState.hasSubmitted || quizState.isSubmitting || reviewMode || isTimeUp}
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
                  reviewMarker={
                    showIntegrity && hasIntegrityMarker(integrityByQuestion[question.id || '']) ? (
                      <IntegrityQuestionMarker stats={integrityByQuestion[question.id || '']} />
                    ) : undefined
                  }
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
              onSubmit={() => handleSubmitQuiz(isTimeUp ? 'TIME_UP' : 'MANUAL')}
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
