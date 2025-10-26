// ** Types for Quiz components

export interface QuizGridRow {
  id: string
  title: string
  chapter: string
  duration: number // in minutes
  difficulty: number // 1-5 scale
  questionsCount: number
  status: 'not_started' | 'in_progress' | 'completed' | 'overdue'
  score?: number // percentage
  assignedAt?: Date
  completedAt?: Date
  dueDate?: Date
}

export interface DataGridParams {
  page: number
  pageSize: number
  sortModel: Array<{
    field: string
    sort: 'asc' | 'desc'
  }>
  filterModel: {
    items: Array<{
      FilterCriteriaObjectFilterCriteriaObject
    }>
    quickFilterValues?: string[] // Make optional to match GridFilterModel
  }
}

export interface QuizStatusChipProps {
  status: string
  score?: number
}

export interface QuizActionsProps {
  quiz: QuizGridRow
  onStartQuiz: (quizId: string) => void
  onViewResults: (quizId: string) => void
  onPreview: (quizId: string) => void
}

export interface EmptyStateProps {
  title?: string
  description?: string
  icon?: string
  actionLabel?: string
  onAction?: () => void
}

export interface QuizDataGridSkeletonProps {
  rows?: number
}

export interface RetryButtonProps {
  onRetry: () => void
  loading?: boolean
}
