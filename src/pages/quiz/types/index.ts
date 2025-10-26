// Quiz Taking Types - Shared types for quiz components
import { QuestionDTO } from '../../../generated/quiz-service/api'

// Quiz progress for taking interface
export interface QuizProgress {
  quizId: string
  answers: Record<string, number> // questionId -> answer index (1-5)
  timeSpent: number // in seconds
  currentQuestion: number
  startTime: Date
  lastSaved: Date
}

// Quiz state for the taking interface
export interface QuizState {
  quiz: any // Will be QuizDTO from API
  progress: QuizProgress
  timeRemaining: number // in seconds
  isSubmitting: boolean
  hasSubmitted: boolean
}

// Component props interfaces
export interface RadioComponentProps {
  question: QuestionDTO
  selectedAnswer?: number // Answer index (1-5)
  onAnswerSelect: (answerIndex: number) => void
  disabled?: boolean
  showResults?: boolean
  correctAnswer?: number // Correct answer index
}

export interface ProgressTrackerProps {
  totalQuestions: number
  answeredQuestions: number
  currentQuestion: number
  timeRemaining: number
  onScrollToQuestion?: (questionIndex: number) => void
}

export interface CountdownTimerProps {
  timeRemaining: number // in seconds
  totalTime: number // in seconds
  onTimeUp: () => void
  showWarnings?: boolean
}

export interface CelebrationAnimationProps {
  score: number
  totalQuestions: number
  onAnimationComplete: () => void
  performanceLevel: 'high' | 'medium' | 'low'
}

export interface QuizResultsProps {
  score: number
  totalQuestions: number
  answers: Record<string, number>
  correctAnswers: Record<string, number>
  questions: QuestionDTO[]
  timeSpent: number
  onReturnToQuizzes: () => void
  onReviewAnswers: () => void
}

// Animation and interaction types
export type AnimationDuration = 150 | 200 | 300 | 400 | 500 | 1000 | 2000
export type EasingFunction = 'ease-out' | 'ease-in' | 'ease-in-out' | 'cubic-bezier(0.4, 0, 0.2, 1)'

// Performance level for results
export type PerformanceLevel = 'high' | 'medium' | 'low'
