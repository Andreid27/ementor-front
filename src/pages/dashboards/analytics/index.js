// ** React Imports
import { useCallback, useEffect, useState } from 'react'

// ** Next Import
import Link from 'next/link'
import { useRouter } from 'next/router'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import { alpha } from '@mui/material/styles'

// ** Third Party Imports
import { useDispatch, useSelector } from 'react-redux'
import { AnimatePresence, motion } from 'framer-motion'

// ** Custom Component Import
import CongratulationsQuizzes from './components/CongratulationsQuizzes'
import StudentStatsQuestions from './components/StudentStatsQuestions'
import LastTestResults from './components/LastTestResults'
import LessonStatsOverall from './components/LessonStatsOverall'
import EventsOverview from './components/EventsOverview'
import WalletSummaryCard from 'src/views/dashboards/analytics/student-home/WalletSummaryCard'
import JoinProfessorSection from 'src/views/dashboards/analytics/join-professor/JoinProfessorSection'
import useMyProfessors from 'src/views/dashboards/analytics/join-professor/useMyProfessors'
import StudentJourneyCard from 'src/views/dashboards/analytics/student-journey/StudentJourneyCard'
import useStudentJourney from 'src/views/dashboards/analytics/student-journey/useStudentJourney'
import { completedStepIds } from 'src/views/dashboards/analytics/student-journey/journeySteps'
import EmptyStateCard from 'src/views/student-ui/EmptyStateCard'
import DashboardSkeleton, {
  CardSkeleton,
  JourneySkeleton
} from 'src/views/dashboards/analytics/student-home/DashboardSkeleton'
import useMyWallet, { isWalletEmpty } from 'src/views/dashboards/analytics/student-home/useMyWallet'
import { accentButtonSx, accentInk } from 'src/views/student-ui/readableAccent'

// ** Store Imports
import { selectUser } from 'src/store/apps/user'
import { fetchData, selectDashboardData } from 'src/store/apps/dashboard'
import { fetchNotifications } from 'src/store/apps/notifications'

const MotionGrid = motion.create(Grid)

// The journey guide's "Vezi rezultatele" scrolls here.
const RESULTS_ANCHOR_ID = 'dashboard-results'

// Keeps the results heading clear of the fixed app bar when scrolled to.
const APP_BAR_CLEARANCE = 96

const hasDashboardData = (quiz, lesson) => Boolean(quiz?.questions && quiz?.quizzes && lesson?.studentChaptersTime)

const AnalyticsDashboard = () => {
  const dispatch = useDispatch()
  const router = useRouter()
  const user = useSelector(selectUser)
  const { quizService, lessonService } = useSelector(selectDashboardData)
  const isStudent = user?.role === 'STUDENT'

  const [dataStatus, setDataStatus] = useState('loading')
  const { professors, status: professorsStatus, refresh: refreshProfessors } = useMyProfessors(isStudent)
  const wallet = useMyWallet(true)

  const loadDashboard = useCallback(() => {
    setDataStatus('loading')
    dispatch(fetchData())
      .unwrap()
      .then(() => setDataStatus('ready'))
      .catch(() => setDataStatus('error'))
  }, [dispatch])

  // The cached numbers show at once and fresh ones replace them, so a test
  // finished on another page is counted (and celebrated) on the way back here.
  useEffect(() => {
    dispatch(fetchNotifications())
    loadDashboard()
  }, [dispatch, loadDashboard])

  useEffect(() => {
    if (user?.profileCompleted === false) router.push('/register')
  }, [user?.profileCompleted, router])

  const hasData = hasDashboardData(quizService, lessonService)
  const completedQuizzes = quizService?.quizzes?.completedQuizzes ?? 0
  const lessonsOpened = lessonService?.lastAccessedLessons?.length ?? 0
  const hasTests = completedQuizzes > 0 && quizService?.questions?.totalQuestions > 0
  const hasLessons = lessonsOpened > 0 || lessonService?.studentChaptersTime?.length > 0
  const studySeconds = (lessonService?.studentChaptersTime ?? []).reduce((sum, chapter) => sum + (chapter.time ?? 0), 0)
  const professorsSettled = professorsStatus === 'ready' || professorsStatus === 'error'

  const journeyDone = completedStepIds({ professors, lessonsOpened, completedQuizzes })

  const journey = useStudentJourney({
    userId: user?.id,
    enabled: isStudent,
    done: journeyDone,
    settled: hasData && dataStatus !== 'loading' && professorsSettled
  })

  if (!hasData) {
    return (
      <Grid container spacing={6}>
        {dataStatus === 'error' ? (
          <Grid item xs={12}>
            <EmptyStateCard
              tone='error'
              icon='tabler:cloud-off'
              title='Panoul nu s-a încărcat'
              description='Verifică conexiunea la internet și încearcă din nou.'
              action={
                <Button variant='contained' onClick={loadDashboard} sx={accentButtonSx}>
                  Reîncearcă
                </Button>
              }
            />
          </Grid>
        ) : (
          <DashboardSkeleton />
        )}
      </Grid>
    )
  }

  const linkButton = (href, label) => (
    <Button variant='contained' component={Link} href={href} sx={accentButtonSx}>
      {label}
    </Button>
  )

  const paymentsButton = (
    <Button
      variant='outlined'
      component={Link}
      href='/payment-process'
      sx={{
        minHeight: 44,
        px: 5,
        fontWeight: 600,
        color: accentInk,
        borderColor: theme => alpha(accentInk(theme), 0.5),
        '&:hover': { borderColor: accentInk }
      }}
    >
      Istoric și plăți
    </Button>
  )

  const walletCard =
    wallet.status === 'loading' ? (
      <CardSkeleton />
    ) : wallet.status === 'error' ? (
      <EmptyStateCard
        heading='Plăți'
        tone='error'
        icon='tabler:cloud-off'
        title='Soldul nu s-a încărcat'
        description='Îl găsești, împreună cu istoricul, pe pagina de plăți.'
        action={paymentsButton}
      />
    ) : isWalletEmpty(wallet.summary) ? (
      <EmptyStateCard
        heading='Plăți'
        icon='tabler:wallet'
        title='Nicio plată încă'
        description='Sold curent: 0 RON. Plățile tale și ședințele taxate apar aici.'
        action={paymentsButton}
      />
    ) : (
      <WalletSummaryCard summary={wallet.summary} />
    )

  const sessionsCard = (
    <EventsOverview
      emptyDescription={
        isStudent && professorsStatus === 'ready' && professors.length === 0
          ? 'Ședințele apar aici după ce te conectezi cu profesorul.'
          : undefined
      }
    />
  )

  const resultCards = hasTests
    ? [
        { key: 'results', md: 7, anchor: true, node: <LastTestResults data={quizService} /> },
        { key: 'questions', md: 5, node: <StudentStatsQuestions questions={quizService.questions} /> }
      ]
    : []

  const lessonsCard = hasLessons ? <LessonStatsOverall data={lessonService} /> : null

  const greetingCard = {
    key: 'greeting',
    md: 7,
    node: (
      <CongratulationsQuizzes firstName={user?.firstName} completedQuizzes={completedQuizzes} studySeconds={studySeconds} />
    )
  }

  // On phones the sessions come right after the greeting: a session about to
  // start matters more than any statistic.
  const sessionsItem = { key: 'sessions', md: 5, phoneOrder: 1, node: sessionsCard }

  // Cards come in pairs that share a row (7 + 5 columns), so their heights line
  // up; the results chart grows to match the sessions list beside it. While the
  // guide is up it covers what is missing, and only cards with real data appear.
  // Without it, a missing card says how to fill it.
  const cards = journey.visible
    ? [
        ...resultCards,
        ...(lessonsCard
          ? [
              { key: 'lessons', md: 6, lg: 4, node: lessonsCard },
              { key: 'sessions', md: 6, lg: 4, node: sessionsCard },
              { key: 'wallet', md: 12, lg: 4, node: walletCard }
            ]
          : [
              { key: 'sessions', md: 6, node: sessionsCard },
              { key: 'wallet', md: 6, node: walletCard }
            ])
      ]
    : [
        ...(hasTests
          ? [greetingCard, resultCards[1], resultCards[0], sessionsItem]
          : [
              greetingCard,
              sessionsItem,
              {
                key: 'tests',
                md: 12,
                node: (
                  <EmptyStateCard
                    heading='Rezultate la teste'
                    icon='tabler:checklist'
                    title='Niciun test rezolvat încă'
                    description='Rezolvă un test ca să vezi aici răspunsurile corecte și cum evoluezi de la o lună la alta.'
                    action={linkButton('/quizzes', 'Începe un test')}
                  />
                )
              }
            ]),
        {
          key: 'lessons',
          md: 7,
          node: lessonsCard ?? (
            <EmptyStateCard
              heading='Timp de studiu'
              icon='tabler:book-2'
              title='Nicio lecție deschisă încă'
              description='Deschide o lecție din Cursuri. Timpul petrecut pe fiecare capitol apare aici.'
              action={linkButton('/lessons', 'Deschide cursurile')}
            />
          )
        },
        { key: 'wallet', md: 5, node: walletCard }
      ]

  return (
    <Grid container spacing={6}>
      <AnimatePresence initial={false}>
        {journey.visible && (
          <MotionGrid
            key='journey'
            item
            xs={12}
            exit={{
              overflow: 'hidden',
              opacity: 0,
              height: 0,
              paddingTop: 0,
              transition: { duration: 0.45, ease: [0.4, 0, 0.2, 1] }
            }}
          >
            {journey.ready ? (
              <StudentJourneyCard
                firstName={user?.firstName}
                isFirstVisit={journey.isFirstVisit}
                done={journeyDone}
                shown={journey.shown}
                celebrating={journey.celebrating}
                professors={professors}
                professorsFailed={professorsStatus === 'error'}
                lessonsOpened={lessonsOpened}
                completedQuizzes={completedQuizzes}
                onRetryProfessors={refreshProfessors}
                onDismiss={journey.dismiss}
                resultsAnchorId={RESULTS_ANCHOR_ID}
              />
            ) : (
              <JourneySkeleton />
            )}
          </MotionGrid>
        )}
      </AnimatePresence>

      <JoinProfessorSection
        isStudent={isStudent}
        professors={professors}
        status={professorsStatus}
        onJoined={refreshProfessors}
      />

      {cards.map((card, index) => (
        <Grid
          item
          key={card.key}
          xs={12}
          md={card.md}
          lg={card.lg ?? card.md}
          id={card.anchor ? RESULTS_ANCHOR_ID : undefined}
          sx={{
            // One column on phones, so a card can move up without breaking a row.
            order: { xs: card.phoneOrder ?? (index === 0 ? 0 : index + 1), md: 0 },
            ...(card.anchor && { scrollMarginTop: APP_BAR_CLEARANCE })
          }}
        >
          {card.node}
        </Grid>
      ))}
    </Grid>
  )
}

AnalyticsDashboard.acl = {
  action: 'read',
  subject: 'student-pages'
}

export default AnalyticsDashboard
