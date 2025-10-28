// ** Utility functions for data transformation and formatting

/**
 * Format duration from minutes to human readable format
 */
export const formatDuration = (minutes: number): string => {
  if (!minutes || minutes <= 0) return '0 min'

  if (minutes < 60) {
    return `${minutes} min`
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (remainingMinutes === 0) {
    return `${hours}h`
  }

  return `${hours}h ${remainingMinutes}min`
}

/**
 * Get color for difficulty rating
 */
export const getDifficultyColor = (difficulty: number): string => {
  if (difficulty <= 1) return '#4caf50' // Green - Easy
  if (difficulty <= 2) return '#8bc34a' // Light Green - Easy-Medium
  if (difficulty <= 3) return '#ff9800' // Orange - Medium
  if (difficulty <= 4) return '#f44336' // Red - Hard
  return '#9c27b0' // Purple - Very Hard
}

/**
 * Calculate performance level based on score
 */
export const calculatePerformanceLevel = (score: number, totalQuestions: number): 'high' | 'medium' | 'low' => {
  const percentage = (score / totalQuestions) * 100

  if (percentage >= 80) return 'high'
  if (percentage >= 60) return 'medium'
  return 'low'
}

/**
 * Get performance color based on score percentage
 */
export const getPerformanceColor = (score: number, totalQuestions: number): string => {
  const level = calculatePerformanceLevel(score, totalQuestions)

  switch (level) {
    case 'high':
      return '#4caf50' // Green
    case 'medium':
      return '#ff9800' // Orange
    case 'low':
      return '#f44336' // Red
    default:
      return '#9e9e9e' // Grey
  }
}

/**
 * Format quiz status for display
 */
export const formatQuizStatus = (status: string): string => {
  switch (status) {
    case 'not_started':
      return 'Neînceput'
    case 'in_progress':
      return 'În progres'
    case 'completed':
      return 'Completat'
    case 'overdue':
      return 'Expirat'
    default:
      return 'Necunoscut'
  }
}

/**
 * Get status color
 */
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'completed':
      return '#4caf50' // Green
    case 'in_progress':
      return '#ff9800' // Orange
    case 'overdue':
      return '#f44336' // Red
    case 'not_started':
    default:
      return '#9e9e9e' // Grey
  }
}

/**
 * Format time remaining
 */
export const formatTimeRemaining = (seconds: number): string => {
  if (seconds <= 0) return '0:00'

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

/**
 * Calculate quiz progress percentage
 */
export const calculateProgress = (answeredQuestions: number, totalQuestions: number): number => {
  if (totalQuestions === 0) return 0
  return Math.round((answeredQuestions / totalQuestions) * 100)
}

// ** Types
import { QuizzesView } from '../../../generated/quiz-service/api'
import { QuizGridRow } from '../types'

/**
 * Transform QuizzesView from API to QuizGridRow for DataGrid
 */
export const transformQuizDTOToGridRow = (quiz: QuizzesView): QuizGridRow => {
  return {
    id: quiz.id || '',
    title: quiz.title || 'Untitled Quiz',
    chapter: quiz.chapterTitles || 'No Chapter',
    duration: quiz.maxTime || 0,
    difficulty: quiz.difficultyLevel || 1,
    questionsCount: quiz.questionsCount || 0,
    status: 'available', // Default status, can be enhanced based on user progress
    score: undefined // Will be populated based on user attempts
  }
}
