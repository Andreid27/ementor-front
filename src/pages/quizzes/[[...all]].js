// ** React Imports
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'

// ** MUI Imports
import { Box, Button, Card, useMediaQuery } from '@mui/material'

// ** Third Party Imports
import { useSelector } from 'react-redux'

// ** Components
import QuizDataGrid from './components/QuizDataGrid'
import QuizMobileList from './components/QuizMobileList'
import QuizPreview from './componets/quiz-preview'
import AppleToolbar from './components/AppleToolbar'
import { useTheme } from '@mui/material/styles'
import useMyProfessors from 'src/views/dashboards/analytics/join-professor/useMyProfessors'
import IllustratedState from 'src/views/student-ui/IllustratedState'
import FirstStepCallout from 'src/views/student-ui/FirstStepCallout'
import { STUDENT_ILLUSTRATIONS } from 'src/views/student-ui/illustrations'
import { accentButtonSx, accentInk } from 'src/views/student-ui/readableAccent'
import { countLabel } from 'src/views/student-ui/countLabel'
import useAssignedCount from 'src/views/student-ui/useAssignedCount'

// ** Store Imports
import { selectUser } from 'src/store/apps/user'
import { selectDashboardData } from 'src/store/apps/dashboard'

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

const outlinedAccentSx = {
  minHeight: 44,
  px: 5,
  fontWeight: 600,
  color: accentInk,
  borderColor: 'divider',
  '&:hover': { borderColor: accentInk }
}

const QuizzesPage = () => {
  const router = useRouter()
  const theme = useTheme()
  const user = useSelector(selectUser)
  const { quizService } = useSelector(selectDashboardData)
  const { professors, status: professorsStatus } = useMyProfessors(user?.role === 'STUDENT')

  // ** Responsive breakpoint - switch to mobile view on tablets and phones
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

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

        const response = await apiClient.post(apiSpec.QUIZ_SERVICE + '/assigned-paginated', paginatedRequest)

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

  // ** Handle refresh (keeps the current page and search)
  const handleRefresh = () => {
    loadQuizzes(currentParams)
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
  // The search box lives outside the grid and the card list, so their params
  // never carry it: it is added here, or paging would drop the search.
  const handleParamsChange = useCallback(
    params => {
      const withSearch = {
        ...params,
        filterModel: { ...params.filterModel, quickFilterValues: searchValue ? [searchValue] : [] }
      }
      setCurrentParams(withSearch)
      loadQuizzes(withSearch)
    },
    [loadQuizzes, searchValue]
  )

  const isEmpty = !loading && !error && quizzes.length === 0
  const lessonsCount = useAssignedCount('lessons', isEmpty && !searchValue)

  // The dashboard's stats count every test, not just this page; the page itself
  // is the fallback when the student has not opened the dashboard yet.
  const completedAnyQuiz =
    (quizService?.quizzes?.completedQuizzes ?? 0) > 0 || quizzes.some(quiz => quiz.status === 'completed')

  const firstQuiz =
    !loading && !searchValue && currentParams.page === 0 && !completedAnyQuiz
      ? quizzes.find(quiz => quiz.status === 'in_progress') || quizzes.find(quiz => quiz.status === 'not_started')
      : null

  const renderEmpty = () => {
    if (searchValue) {
      return (
        <IllustratedState
          icon='tabler:search'
          title={`Niciun test pentru „${searchValue}”`}
          description='Verifică scrierea sau caută după alt cuvânt din titlu.'
          actions={
            <Button variant='outlined' onClick={() => handleSearchChange('')} sx={outlinedAccentSx}>
              Șterge căutarea
            </Button>
          }
        />
      )
    }

    if (professorsStatus === 'ready' && professors.length === 0) {
      return (
        <IllustratedState
          illustration={STUDENT_ILLUSTRATIONS.professor}
          title='Conectează-te cu profesorul'
          description='Testele vin de la profesor. Scrie în panou codul de invitație primit, iar testele apar aici.'
          actions={
            <Button variant='contained' component={Link} href='/dashboards/analytics' sx={accentButtonSx}>
              Mergi la panou
            </Button>
          }
        />
      )
    }

    const sender = professors.length === 1 ? professors[0].professor.fullName : 'profesorul'
    const hasLessons = (lessonsCount ?? 0) > 0

    return (
      <IllustratedState
        illustration={STUDENT_ILLUSTRATIONS.tests}
        title='Niciun test încă'
        description={
          hasLessons
            ? `Când ${sender} îți trimite un test, îl găsești aici. Până atunci, ai ${countLabel(
                lessonsCount,
                'o lecție',
                'lecții'
              )} de citit.`
            : `Când ${sender} îți trimite un test, îl găsești aici.`
        }
        actions={
          <Button
            variant='outlined'
            component={Link}
            href={hasLessons ? '/lessons' : '/dashboards/analytics'}
            sx={outlinedAccentSx}
          >
            {hasLessons ? 'Deschide cursurile' : 'Înapoi la panou'}
          </Button>
        }
      />
    )
  }

  return (
    <>
      {preview ? (
        <QuizPreview preview={preview} setPreview={setPreview} userRole={'STUDENT'} />
      ) : (
        <Card>
          <AppleToolbar
            subtitle='Testele primite de la profesor, cele mai noi primele.'
            onSearchChange={handleSearchChange}
            searchValue={searchValue}
            showSearch={loading || totalCount > 0 || Boolean(searchValue)}
          />

          {firstQuiz && (
            <Box sx={{ px: { xs: 4, md: 6 }, pb: { xs: 4, md: 5 } }}>
              <FirstStepCallout
                illustration={STUDENT_ILLUSTRATIONS.tests}
                eyebrow='Primul tău test'
                title={firstQuiz.title}
                description={
                  <>
                    <Box component='span' sx={{ display: 'block', mb: 0.5, fontWeight: 600, color: 'text.primary' }}>
                      {firstQuiz.questionsCount} întrebări · {firstQuiz.duration} min
                    </Box>
                    {firstQuiz.status === 'in_progress'
                      ? 'L-ai început deja. Continuă de unde ai rămas; rezultatul îl vezi imediat ce termini.'
                      : 'Un test scurt îți arată ce știi deja. Rezultatul îl vezi imediat ce termini, iar panoul începe să-ți arate progresul.'}
                  </>
                }
                action={
                  <Button variant='contained' onClick={() => handleQuizSelect(firstQuiz.id)} sx={accentButtonSx}>
                    {firstQuiz.status === 'in_progress' ? 'Continuă testul' : 'Deschide testul'}
                  </Button>
                }
              />
            </Box>
          )}

          {/* DataGrid for desktop, card list for phones and tablets */}
          {error ? (
            <IllustratedState
              icon='tabler:cloud-off'
              tone='error'
              title='Testele nu s-au încărcat'
              description='Verifică conexiunea la internet și încearcă din nou.'
              actions={
                <Button variant='contained' onClick={handleRefresh} sx={accentButtonSx}>
                  Reîncearcă
                </Button>
              }
            />
          ) : isEmpty ? (
            renderEmpty()
          ) : isMobile ? (
            <QuizMobileList
              quizzes={quizzes}
              loading={loading}
              error={error}
              totalCount={totalCount}
              onQuizSelect={handleQuizSelect}
              onRefresh={handleRefresh}
              onParamsChange={handleParamsChange}
            />
          ) : (
            <QuizDataGrid
              quizzes={quizzes}
              loading={loading}
              error={error}
              totalCount={totalCount}
              onQuizSelect={handleQuizSelect}
              onRefresh={handleRefresh}
              onParamsChange={handleParamsChange}
            />
          )}
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
