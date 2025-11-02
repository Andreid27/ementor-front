// ** Types for Quiz Taking Interface

import { QuestionDTO, QuizDTO } from '../../generated/quiz-service/api'

// ** Performance Level Type
export type PerformanceLevel = 'high' | 'medium' | 'low'

// ** Quiz Progress
export interface QuizProgress {
  quizId: string
  answers: Record<string, number>
  timeSpent: number
  currentQuestion: number
  startTime: Date
  lastSaved: Date
}

// ** Quiz State
export interface QuizState {
  quiz: QuizDTO | null
  progress: QuizProgress
  timeRemaining: number
  isSubmitting: boolean
  hasSubmitted: boolean
  userId: string | null
}

// ** Component Props
export interface CelebrationAnimationProps {
  score: number
  totalQuestions: number
  performanceLevel: PerformanceLevel
  onAnimationComplete: () => void
}

export interface ProgressCardProps {
  title: string
  timeRemaining: number
  totalQuestions: number
  answeredQuestions: number
  totalTime: number
  onTimeUp: () => void
  currentQuestionIndex: number
  quizDifficulty: string
  estimatedTimePerQuestion: number
  onScrollToQuestion: (index: number) => void
}

export interface RadioComponentProps {
  question: QuestionDTO
  selectedAnswer?: number
  onAnswerSelect: (answerIndex: number) => void
  disabled?: boolean
  showResults?: boolean
  correctAnswer?: number
  compact?: boolean
  touchOptimized?: boolean
  questionNumber: number
  totalQuestions: number
}

export interface SubmitCardProps {
  answeredQuestions: number
  totalQuestions: number
  isSubmitting: boolean
  onSubmit: () => void
  disabled?: boolean
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
