// ** React Imports
import { useState, useEffect, useCallback } from 'react'

// ** Types
import { QuizGridRow, DataGridParams } from '../types'

// ** Services
import { quizUIService } from '../services/quizUIService'

interface UseQuizDataReturn {
  quizzes: QuizGridRow[]
  loading: boolean
  error: string | null
  totalCount: number
  refetch: () => void
  updateParams: (params: DataGridParams) => void
}

export const useQuizData = (): UseQuizDataReturn => {
  // ** State
  const [quizzes, setQuizzes] = useState<QuizGridRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [currentParams, setCurrentParams] = useState<DataGridParams>({
    page: 0,
    pageSize: 5,
    sortModel: [],
    filterModel: { items: [], quickFilterValues: [] }
  })

  // ** Fetch data function
  const fetchQuizzes = useCallback(async (params: DataGridParams) => {
    try {
      setLoading(true)
      setError(null)

      const response = await quizUIService.getQuizzesForDataGrid(params)

      setQuizzes(response.data)
      setTotalCount(response.total)
    } catch (err) {
      console.error('Error fetching quizzes:', err)
      setError(err instanceof Error ? err.message : 'A apărut o eroare la încărcarea testelor')
      setQuizzes([])
      setTotalCount(0)
    } finally {
      setLoading(false)
    }
  }, [])

  // ** Update params and refetch
  const updateParams = useCallback(
    (params: DataGridParams) => {
      setCurrentParams(params)
      fetchQuizzes(params)
    },
    [fetchQuizzes]
  )

  // ** Refetch with current params
  const refetch = useCallback(() => {
    fetchQuizzes(currentParams)
  }, [fetchQuizzes, currentParams])

  // ** Initial fetch
  useEffect(() => {
    const initialParams = {
      page: 0,
      pageSize: 5,
      sortModel: [],
      filterModel: { items: [], quickFilterValues: [] }
    }
    console.log('useQuizData initial fetch with params:', initialParams)
    fetchQuizzes(initialParams)
  }, [fetchQuizzes]) // Only run on mount with explicit initial params

  return {
    quizzes,
    loading,
    error,
    totalCount,
    refetch,
    updateParams
  }
}
