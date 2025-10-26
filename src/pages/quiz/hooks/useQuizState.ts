// ** React Imports
import { useState, useCallback, useEffect } from 'react'

// ** Types
import { QuizState, QuizProgress } from '../types'
import { QuizDTO } from '../../../generated/quiz-service/api'

// ** Services
import { quizUIService } from '../../quizzes/services/quizUIService'

interface UseQuizStateProps {
  quizId: string
  autoSaveInterval?: number // in milliseconds
}

interface UseQuizStateReturn {
  quizState: QuizState
  loading: boolean
  error: string | null
  updateAnswer: (questionId: string, answerIndex: number) => void
  submitQuiz: (isAutoSubmit?: boolean) => Promise<any>
  resetQuiz: () => void
  saveProgress: () => Promise<void>
}

export const useQuizState = ({
  quizId,
  autoSaveInterval = 30000 // 30 seconds default
}: UseQuizStateProps): UseQuizStateReturn => {
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

  // ** Load quiz data
  const loadQuiz = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const quizData = await quizUIService.getQuizById(quizId)

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
  }, [quizId])

  // ** Update answer
  const updateAnswer = useCallback((questionId: string, answerIndex: number) => {
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

  // ** Submit quiz
  const submitQuiz = useCallback(
    async (isAutoSubmit = false) => {
      if (quizState.isSubmitting || quizState.hasSubmitted) {
        return null
      }

      const answeredQuestions = Object.keys(quizState.progress.answers).length
      const totalQuestions = quizState.quiz?.questions?.length || 0

      // Check if all questions are answered (unless auto-submit)
      if (!isAutoSubmit && answeredQuestions < totalQuestions) {
        throw new Error('Te rugăm să răspunzi la toate întrebările înainte de a trimite testul.')
      }

      try {
        setQuizState(prev => ({ ...prev, isSubmitting: true }))
        setError(null)

        const results = await quizUIService.submitQuiz(quizId, quizState.progress.answers)

        setQuizState(prev => ({
          ...prev,
          isSubmitting: false,
          hasSubmitted: true
        }))

        return results
      } catch (err) {
        console.error('Error submitting quiz:', err)
        setError(err instanceof Error ? err.message : 'Nu am putut trimite testul')
        setQuizState(prev => ({ ...prev, isSubmitting: false }))
        throw err
      }
    },
    [quizId, quizState.progress.answers, quizState.isSubmitting, quizState.hasSubmitted, quizState.quiz]
  )

  // ** Save progress
  const saveProgress = useCallback(async () => {
    try {
      // Here you would implement actual progress saving to server
      // For now, just update the lastSaved timestamp
      setQuizState(prev => ({
        ...prev,
        progress: {
          ...prev.progress,
          lastSaved: new Date()
        }
      }))

      console.log('Progress saved:', quizState.progress)
    } catch (err) {
      console.error('Error saving progress:', err)
    }
  }, [quizState.progress])

  // ** Reset quiz
  const resetQuiz = useCallback(() => {
    setQuizState(prev => ({
      ...prev,
      progress: {
        quizId,
        answers: {},
        timeSpent: 0,
        currentQuestion: 0,
        startTime: new Date(),
        lastSaved: new Date()
      },
      timeRemaining: (prev.quiz?.maxTime || 60) * 60,
      isSubmitting: false,
      hasSubmitted: false
    }))
    setError(null)
  }, [quizId])

  // ** Timer effect
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

  // ** Auto-save effect
  useEffect(() => {
    if (!quizState.quiz || quizState.hasSubmitted || loading) return

    const autoSaveTimer = setInterval(() => {
      saveProgress()
    }, autoSaveInterval)

    return () => clearInterval(autoSaveTimer)
  }, [quizState.quiz, quizState.hasSubmitted, loading, autoSaveInterval, saveProgress])

  // ** Load quiz on mount
  useEffect(() => {
    if (quizId) {
      loadQuiz()
    }
  }, [quizId, loadQuiz])

  return {
    quizState,
    loading,
    error,
    updateAnswer,
    submitQuiz,
    resetQuiz,
    saveProgress
  }
}
