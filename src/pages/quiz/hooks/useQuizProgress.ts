// ** React Imports
import { useState, useEffect, useCallback, useMemo } from 'react'

// ** Types
import { QuizProgress } from '../types'

interface UseQuizProgressProps {
  totalQuestions: number
  answers: Record<string, number>
  timeRemaining: number
  onProgressChange?: (progress: number) => void
  onAllQuestionsAnswered?: () => void
}

interface UseQuizProgressReturn {
  progressPercentage: number
  answeredQuestions: number
  unansweredQuestions: number
  isComplete: boolean
  currentQuestionIndex: number
  setCurrentQuestionIndex: (index: number) => void
  getQuestionStatus: (questionIndex: number) => 'answered' | 'current' | 'unanswered'
  scrollToQuestion: (questionIndex: number) => void
  getProgressStats: () => {
    total: number
    answered: number
    remaining: number
    percentage: number
  }
}

export const useQuizProgress = ({
  totalQuestions,
  answers,
  timeRemaining,
  onProgressChange,
  onAllQuestionsAnswered
}: UseQuizProgressProps): UseQuizProgressReturn => {
  // ** State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)

  // ** Computed values
  const answeredQuestions = useMemo(() => {
    return Object.keys(answers).length
  }, [answers])

  const unansweredQuestions = useMemo(() => {
    return totalQuestions - answeredQuestions
  }, [totalQuestions, answeredQuestions])

  const progressPercentage = useMemo(() => {
    return totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0
  }, [answeredQuestions, totalQuestions])

  const isComplete = useMemo(() => {
    return answeredQuestions === totalQuestions
  }, [answeredQuestions, totalQuestions])

  // ** Get question status
  const getQuestionStatus = useCallback(
    (questionIndex: number): 'answered' | 'current' | 'unanswered' => {
      // This would need to be implemented based on how questions are identified
      // For now, we'll use a simple approach
      const questionId = `question-${questionIndex}` // This should match your actual question ID format

      if (answers[questionId] !== undefined) {
        return 'answered'
      }

      if (questionIndex === currentQuestionIndex) {
        return 'current'
      }

      return 'unanswered'
    },
    [answers, currentQuestionIndex]
  )

  // ** Scroll to question
  const scrollToQuestion = useCallback((questionIndex: number) => {
    const questionElement = document.getElementById(`question-${questionIndex}`)
    if (questionElement) {
      questionElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      })
      setCurrentQuestionIndex(questionIndex)
    }
  }, [])

  // ** Get progress stats
  const getProgressStats = useCallback(
    () => ({
      total: totalQuestions,
      answered: answeredQuestions,
      remaining: unansweredQuestions,
      percentage: progressPercentage
    }),
    [totalQuestions, answeredQuestions, unansweredQuestions, progressPercentage]
  )

  // ** Progress change effect
  useEffect(() => {
    if (onProgressChange) {
      onProgressChange(progressPercentage)
    }
  }, [progressPercentage, onProgressChange])

  // ** All questions answered effect
  useEffect(() => {
    if (isComplete && onAllQuestionsAnswered) {
      onAllQuestionsAnswered()
    }
  }, [isComplete, onAllQuestionsAnswered])

  // ** Auto-scroll to current question on mount
  useEffect(() => {
    // Find the first unanswered question and set it as current
    for (let i = 0; i < totalQuestions; i++) {
      if (getQuestionStatus(i) === 'unanswered') {
        setCurrentQuestionIndex(i)
        break
      }
    }
  }, [totalQuestions, getQuestionStatus])

  // ** Intersection Observer for tracking current question
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-50% 0px -50% 0px', // Trigger when question is in the middle of viewport
      threshold: 0
    }

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const questionId = entry.target.id
          const questionIndex = parseInt(questionId.split('-')[1])
          if (!isNaN(questionIndex)) {
            setCurrentQuestionIndex(questionIndex)
          }
        }
      })
    }

    const observer = new IntersectionObserver(observerCallback, observerOptions)

    // Observe all question elements
    for (let i = 0; i < totalQuestions; i++) {
      const questionElement = document.getElementById(`question-${i}`)
      if (questionElement) {
        observer.observe(questionElement)
      }
    }

    return () => {
      observer.disconnect()
    }
  }, [totalQuestions])

  return {
    progressPercentage,
    answeredQuestions,
    unansweredQuestions,
    isComplete,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    getQuestionStatus,
    scrollToQuestion,
    getProgressStats
  }
}
