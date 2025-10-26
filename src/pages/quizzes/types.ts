// ** Quiz Types

export type QuizStatus = 'completed' | 'in_progress' | 'overdue' | 'not_started'

export interface QuizGridRow {
  id: string
  title: string
  chapter: string
  duration: number
  difficulty: number
  questionsCount: number
  status: QuizStatus
  score: number
  attempts: number
  maxAttempts: number
}

export interface DataGridParams {
  page: number
  pageSize: number
  sortModel: any[]
  filterModel: {
    items: any[]
    quickFilterValues: string[]
  }
}

// ** Component Props Types
export interface QuizDataGridProps {
  quizzes: QuizGridRow[]
  loading: boolean
  error?: string
  totalCount: number
  onQuizSelect: (quizId: string) => void
  onRefresh: () => void
  onParamsChange: (params: DataGridParams) => void
}

export interface QuizActionsProps {
  quiz: QuizGridRow
  onStartQuiz: (quizId: string) => void
  onViewResults?: (quizId: string) => void
  onPreview?: (quizId: string) => void
}

export interface QuizStatusChipProps {
  status: QuizStatus
  score?: number
  variant?: 'filled' | 'outlined'
  size?: 'small' | 'medium'
}

export interface QuizDataGridSkeletonProps {
  rows?: number
}
