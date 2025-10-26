// ** React Imports
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'

// ** MUI Imports
import { alpha, Box, Card } from '@mui/material'

// ** Components
import QuizDataGrid from './components/QuizDataGrid'
import QuizPreview from './componets/quiz-preview'
import AppleToolbar from './components/AppleToolbar'
import { useTheme } from '@mui/material/styles'

// ** Services
import apiClient from 'src/@core/axios/axiosEmentor'
import * as apiSpec from '../../apiSpec'

// ** Generated API Types
import {
  FilterCriteriaObject,
  FilterCriteriaObjectOperationEnum,
  PaginatedRequest
} from '../../generated/quiz-service/api'

// ** Field mapping between DataGrid and API (moved outside component to prevent re-creation)
const mapFieldToAPI = field => {
  const fieldMap = {
    title: 'title',
    chapter: 'chapterTitles',
    duration: 'maxTime',
    difficulty: 'difficultyLevel',
    questionsCount: 'questionsCount',
    status: 'status' // This is computed, not sortable
  }

  return fieldMap[field] || field
}

const QuizzesPage = () => {
  const router = useRouter()
  const theme = useTheme()

  // ** State
  const [preview, setPreview] = useState(
    window.location.pathname.split('/')[2] && window.location.pathname.split('/')[2].length === 36
      ? { id: window.location.pathname.split('/')[2] }
      : null
  )

  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [totalCount, setTotalCount] = useState(0)
  const [searchValue, setSearchValue] = useState('')

  const [currentParams, setCurrentParams] = useState({
    page: 0,
    pageSize: 5,
    sortModel: [],
    filterModel: { items: [], quickFilterValues: [] }
  })

  // ** Handle router changes
  useEffect(() => {
    if (router && router.query && router.query.all) {
      if (router.query.all.length > 0 && router.query.all[0].length === 36) {
        setPreview({ id: router.query.all[0] })
      } else if (router.query.all.length === 0) {
        setPreview(null)
      }
    }
  }, [router, router.query])

  // ** Load quizzes data
  const loadQuizzes = useCallback(
    async (params = { page: 0, pageSize: 5, sortModel: [], filterModel: { items: [], quickFilterValues: [] } }) => {
      try {
        setLoading(true)
        setError(null)

        // Transform DataGrid sort model to API format with field mapping
        let sorters = []

        if (params.sortModel.length > 0) {
          // Add user-selected sorters first with field mapping
          sorters = params.sortModel.map(sort => ({
            key: mapFieldToAPI(sort.field),
            direction: sort.sort.toUpperCase()
          }))

          // Always add assignedAt as secondary sort if not already present
          const hasAssignedAtSort = sorters.some(sort => sort.key === 'assignedAt')
          if (!hasAssignedAtSort) {
            sorters.push({ key: 'assignedAt', direction: 'DESC' })
          }
        } else {
          // Default sort when no user selection
          sorters = [{ key: 'assignedAt', direction: 'DESC' }]
        }

        // Transform DataGrid filter model to API format using FilterCriteriaObject
        const filters = []

        // Handle column filters with field mapping and operator mapping
        if (params.filterModel.items && params.filterModel.items.length > 0) {
          params.filterModel.items.forEach(filter => {
            // Skip filters without values (except for isEmpty/isNotEmpty)
            if (filter.value === undefined && !['isEmpty', 'isNotEmpty'].includes(filter.operator)) {
              return
            }

            // Map DataGrid operators to FilterCriteriaObjectOperationEnum
            const operatorMap = {
              contains: FilterCriteriaObjectOperationEnum.Like,
              equals: FilterCriteriaObjectOperationEnum.Equal,
              startsWith: FilterCriteriaObjectOperationEnum.BeginsWith,
              endsWith: FilterCriteriaObjectOperationEnum.EndsWith,
              isEmpty: FilterCriteriaObjectOperationEnum.IsNull,
              isNotEmpty: FilterCriteriaObjectOperationEnum.IsNotNull,
              '>': FilterCriteriaObjectOperationEnum.Greater,
              '>=': FilterCriteriaObjectOperationEnum.GreaterOrEqual,
              '<': FilterCriteriaObjectOperationEnum.Less,
              '<=': FilterCriteriaObjectOperationEnum.LessOrEqual,
              '!=': FilterCriteriaObjectOperationEnum.NotEqual,
              is: FilterCriteriaObjectOperationEnum.Equal,
              not: FilterCriteriaObjectOperationEnum.NotEqual
            }

            const filterCriteria = {
              key: mapFieldToAPI(filter.field),
              operation: operatorMap[filter.operator] || FilterCriteriaObjectOperationEnum.Equal,
              value: filter.value
            }

            filters.push(filterCriteria)
          })
        }

        // Handle quick filter (search) - use proper API search model
        if (params.filterModel.quickFilterValues && params.filterModel.quickFilterValues.length > 0) {
          const searchValue = params.filterModel.quickFilterValues[0]

          // Create FilterCriteriaObject for search
          const searchFilter = {
            key: 'title',
            operation: FilterCriteriaObjectOperationEnum.Like,
            value: searchValue
          }

          filters.push(searchFilter)
        }

        // Create PaginatedRequest object
        const paginatedRequest = {
          filters,
          sorters,
          page: params.page,
          pageSize: params.pageSize
        }

        console.log('API Request:', paginatedRequest)

        const response = await apiClient.post(apiSpec.QUIZ_SERVICE + '/assigned-paginated', paginatedRequest)

        console.log('API Response:', response.data)

        // Transform data to match QuizDataGrid expected format
        const transformedQuizzes = response.data.data.map(quiz => {
          // Determine status based on API data
          let status = 'not_started'
          if (quiz.endedTime) {
            status = 'completed'
          } else if (quiz.startedAt) {
            status = 'in_progress'
          } else if (quiz.endTime && new Date(quiz.endTime) < new Date()) {
            status = 'overdue'
          }

          // Calculate score percentage if completed
          let score = null
          if (status === 'completed' && quiz.correctAnswers !== null) {
            score = Math.round((quiz.correctAnswers / quiz.questionsCount) * 100)
          }

          return {
            id: quiz.id,
            title: quiz.title || 'Untitled Quiz',
            chapter: quiz.chapterTitles || 'No Chapter',
            duration: quiz.maxTime || 60,
            difficulty: quiz.difficultyLevel || 1,
            questionsCount: quiz.questionsCount || 0,
            status,
            score,
            assignedAt: quiz.assignedAt,
            startedAt: quiz.startedAt,
            endTime: quiz.endTime,
            endedTime: quiz.endedTime
          }
        })

        setQuizzes(transformedQuizzes)
        setTotalCount(response.data.totalCount)
      } catch (err) {
        console.error('Error loading quizzes:', err)
        setError('Nu am putut încărca testele. Te rugăm să încerci din nou.')
      } finally {
        setLoading(false)
      }
    },
    []
  ) // Empty dependency array since mapFieldToAPI is now outside component

  // ** Initial load
  useEffect(() => {
    console.log('QuizzesPage: Initial load, preview:', preview)
    if (!preview) {
      loadQuizzes()
    }
  }, [loadQuizzes, preview])

  // ** Handle quiz selection
  const handleQuizSelect = quizId => {
    const selectedQuiz = quizzes.find(q => q.id === quizId)
    if (selectedQuiz) {
      setPreview(selectedQuiz)
    }
  }

  // ** Handle refresh
  const handleRefresh = () => {
    loadQuizzes()
  }

  // ** Handle search change
  const handleSearchChange = useCallback(
    value => {
      setSearchValue(value)

      const newParams = {
        ...currentParams,
        page: 0, // Reset to first page when searching
        filterModel: {
          ...currentParams.filterModel,
          quickFilterValues: value ? [value] : []
        }
      }
      setCurrentParams(newParams)
      loadQuizzes(newParams)
    },
    [currentParams, loadQuizzes]
  )

  // ** Handle params change (pagination, sorting, filtering)
  const handleParamsChange = useCallback(
    params => {
      setCurrentParams(params)
      loadQuizzes(params)
    },
    [loadQuizzes]
  )

  console.log('QuizzesPage: Rendering, preview:', preview, 'quizzes:', quizzes.length, 'loading:', loading)

  return (
    <>
      {preview ? (
        <QuizPreview preview={preview} setPreview={setPreview} userRole={'STUDENT'} />
      ) : (
        <Card
          sx={{
            height: 'auto',
            width: '100%',
            backgroundColor: alpha(theme.palette.background.paper, 0.6),
            backdropFilter: 'blur(20px)',
            border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.08)}`
          }}
        >
          {/* Search toolbar - always visible and outside of loading states */}
          <AppleToolbar onSearchChange={handleSearchChange} searchValue={searchValue} />

          {/* DataGrid content */}
          <QuizDataGrid
            quizzes={quizzes}
            loading={loading}
            error={error}
            totalCount={totalCount}
            onQuizSelect={handleQuizSelect}
            onRefresh={handleRefresh}
            onParamsChange={handleParamsChange}
          />
        </Card>
      )}
    </>
  )
}

QuizzesPage.acl = {
  action: 'read',
  subject: 'student-pages'
}

export default QuizzesPage
