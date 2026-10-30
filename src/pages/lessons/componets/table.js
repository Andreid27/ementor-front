// ** React Imports
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

// ** Next Import
import Link from 'next/link'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import TablePagination from '@mui/material/TablePagination'

// ** Third Party Imports
import { useSelector } from 'react-redux'

// ** API Imports
import apiClient from 'src/@core/axios/axiosEmentor'
import * as apiSpec from '../../../apiSpec'

// ** Store Imports
import { selectUser } from 'src/store/apps/user'
import { selectDashboardData } from 'src/store/apps/dashboard'

// ** Custom Components Imports
import LessonCard, { getLessonState, isLessonListed, LessonCardSkeleton, readingMinutes } from './lesson-card'
import useMyProfessors from 'src/views/dashboards/analytics/join-professor/useMyProfessors'
import StudentPageHeader from 'src/views/student-ui/StudentPageHeader'
import IllustratedState from 'src/views/student-ui/IllustratedState'
import FirstStepCallout from 'src/views/student-ui/FirstStepCallout'
import { STUDENT_ILLUSTRATIONS } from 'src/views/student-ui/illustrations'
import { accentButtonSx, accentInk } from 'src/views/student-ui/readableAccent'
import { countLabel } from 'src/views/student-ui/countLabel'
import useAssignedCount from 'src/views/student-ui/useAssignedCount'

// Newest first: by the date a lesson opens, then by when it was sent.
const SORTERS = [
  { key: 'startAfter', direction: 'DESC' },
  { key: 'assignedAt', direction: 'DESC' }
]

const ROWS_PER_PAGE_OPTIONS = [8, 16, 32]

const outlinedAccentSx = {
  minHeight: 44,
  px: 5,
  fontWeight: 600,
  color: accentInk,
  borderColor: 'divider',
  '&:hover': { borderColor: accentInk }
}

const LessonGridSkeleton = () => (
  <Grid container spacing={5} aria-hidden>
    {[0, 1, 2].map(index => (
      <Grid item xs={12} sm={6} lg={4} key={index}>
        <LessonCardSkeleton />
      </Grid>
    ))}
  </Grid>
)

const StudentLessons = () => {
  const user = useSelector(selectUser)
  const { lessonService } = useSelector(selectDashboardData)
  const { professors, status: professorsStatus } = useMyProfessors(user?.role === 'STUDENT')

  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(8)
  const [lessons, setLessons] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [status, setStatus] = useState('loading')

  // Ignores responses from a request that a newer one has replaced.
  const requestId = useRef(0)

  const loadLessons = useCallback(() => {
    const id = ++requestId.current
    setStatus('loading')

    apiClient
      .post(apiSpec.LESSON_SERVICE + '/lesson/assigned-paginated', {
        filters: [],
        sorters: SORTERS,
        page,
        pageSize: rowsPerPage
      })
      .then(response => {
        if (id !== requestId.current) return
        setLessons(response.data.data || [])
        setTotalCount(response.data.totalCount || 0)
        setStatus('ready')
      })
      .catch(error => {
        if (id !== requestId.current) return
        console.error('Failed to load lessons:', error)
        setStatus('error')
      })
  }, [page, rowsPerPage])

  useEffect(() => {
    loadLessons()
  }, [loadLessons])

  const professorsById = useMemo(
    () => Object.fromEntries(professors.map(({ professor }) => [professor.id, professor])),
    [professors]
  )

  const listed = lessons.filter(lesson => isLessonListed(lesson))

  // The dashboard's stats know about every lesson, not just this page; the page
  // itself is the fallback when the student has not opened the dashboard yet.
  const openedAnyLesson =
    (lessonService?.lastAccessedLessons?.length ?? 0) > 0 || lessons.some(lesson => Boolean(lesson.firstRead))
  const firstLesson = page === 0 && !openedAnyLesson ? listed.find(lesson => getLessonState(lesson) === 'new') : null

  const isEmpty = status === 'ready' && page === 0 && listed.length === 0
  const testsCount = useAssignedCount('tests', isEmpty)

  const renderEmpty = () => {
    if (professorsStatus === 'ready' && professors.length === 0) {
      return (
        <IllustratedState
          illustration={STUDENT_ILLUSTRATIONS.professor}
          title='Conectează-te cu profesorul'
          description='Lecțiile vin de la profesor. Scrie în panou codul de invitație primit, iar lecțiile apar aici.'
          actions={
            <Button variant='contained' component={Link} href='/dashboards/analytics' sx={accentButtonSx}>
              Mergi la panou
            </Button>
          }
        />
      )
    }

    const sender = professors.length === 1 ? professors[0].professor.fullName : 'profesorul'
    const hasTests = (testsCount ?? 0) > 0

    return (
      <IllustratedState
        illustration={STUDENT_ILLUSTRATIONS.lessons}
        title='Nicio lecție încă'
        description={
          hasTests
            ? `Când ${sender} îți trimite o lecție, o găsești aici. Până atunci, ai ${countLabel(
                testsCount,
                'un test',
                'teste'
              )} de rezolvat.`
            : `Când ${sender} îți trimite o lecție, o găsești aici.`
        }
        actions={
          <Button
            variant='outlined'
            component={Link}
            href={hasTests ? '/quizzes' : '/dashboards/analytics'}
            sx={outlinedAccentSx}
          >
            {hasTests ? 'Vezi testele' : 'Înapoi la panou'}
          </Button>
        }
      />
    )
  }

  const renderBody = () => {
    if (status === 'loading' && lessons.length === 0) {
      return (
        <Box sx={{ px: { xs: 4, md: 6 }, pb: { xs: 5, md: 6 } }}>
          <LessonGridSkeleton />
        </Box>
      )
    }

    if (status === 'error') {
      return (
        <IllustratedState
          icon='tabler:cloud-off'
          tone='error'
          title='Cursurile nu s-au încărcat'
          description='Verifică conexiunea la internet și încearcă din nou.'
          actions={
            <Button variant='contained' onClick={loadLessons} sx={accentButtonSx}>
              Reîncearcă
            </Button>
          }
        />
      )
    }

    if (isEmpty) return renderEmpty()

    return (
      <Box sx={{ px: { xs: 4, md: 6 }, pb: { xs: 4, md: 5 } }}>
        {firstLesson && (
          <Box sx={{ mb: { xs: 5, md: 6 } }}>
            <FirstStepCallout
              illustration={STUDENT_ILLUSTRATIONS.lessons}
              eyebrow='Prima ta lecție'
              title={firstLesson.title || 'Lecție fără titlu'}
              description={
                <>
                  <Box component='span' sx={{ display: 'block', mb: 0.5, fontWeight: 600, color: 'text.primary' }}>
                    {[
                      firstLesson.chapterTitles,
                      readingMinutes(firstLesson) && `${readingMinutes(firstLesson)} min de citit`
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </Box>
                  Citește în ritmul tău: timpul de studiu se salvează singur și apare în panou.
                </>
              }
              action={
                <Button
                  variant='contained'
                  component={Link}
                  href={`/lesson/${firstLesson.lessonStudentId}`}
                  sx={accentButtonSx}
                >
                  Începe lecția
                </Button>
              }
            />
          </Box>
        )}

        <Grid container spacing={5} aria-busy={status === 'loading'}>
          {listed.map(lesson => (
            <Grid item xs={12} sm={6} lg={4} key={lesson.lessonStudentId}>
              <LessonCard lesson={lesson} professor={professorsById[lesson.createdBy]} />
            </Grid>
          ))}
        </Grid>

        {/* A short list needs no paging controls. */}
        {totalCount > ROWS_PER_PAGE_OPTIONS[0] && (
          <TablePagination
            component='div'
            page={page}
            count={totalCount}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
            onPageChange={(_event, newPage) => setPage(newPage)}
            onRowsPerPageChange={event => {
              setRowsPerPage(parseInt(event.target.value, 10))
              setPage(0)
            }}
            labelRowsPerPage='Pe pagină:'
            labelDisplayedRows={({ from, to, count }) => `${from}–${to} din ${count}`}
            getItemAriaLabel={type => (type === 'next' ? 'Pagina următoare' : 'Pagina anterioară')}
            sx={{ mt: 4 }}
          />
        )}
      </Box>
    )
  }

  return (
    <>
      <StudentPageHeader title='Cursuri' subtitle='Lecțiile primite de la profesor, cele mai noi primele.' />
      {renderBody()}
    </>
  )
}

export default StudentLessons
