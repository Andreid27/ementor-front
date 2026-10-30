// ** React Imports
import { useEffect, useId, useMemo, useRef, useState } from 'react'

// ** Next Import
import NextLink from 'next/link'

// ** MUI Imports
import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import Button from '@mui/material/Button'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import { alpha, darken, useTheme } from '@mui/material/styles'

// ** Third Party Imports
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import { useReducedMotion } from 'framer-motion'

// ** API Imports
import apiClient from 'src/@core/axios/axiosEmentor'
import * as apiSpec from 'src/apiSpec'
import { fetchBenchmarkLine, isNotFound } from 'src/views/admission-benchmark/benchmarkApi'

// ** Custom Components Imports
import InsightCard from 'src/views/student-ui/InsightCard'
import StatusPill from 'src/views/student-ui/StatusPill'
import { percent } from 'src/views/student-ui/format'
import { countLabel } from 'src/views/student-ui/countLabel'
import { accentInk } from 'src/views/student-ui/readableAccent'
import LineSwatch from 'src/views/admission-benchmark/LineSwatch'
import PeriodToggle from 'src/views/admission-benchmark/PeriodToggle'
import {
  DAY_MS,
  cohortColor,
  cohortCountsLabel,
  cohortLabel,
  dayToTime,
  daysToExamLabel,
  formatAverage,
  smoothCurve,
  smoothingRadius,
  timeTicks,
  timeToDay
} from 'src/views/admission-benchmark/chartStyle'

/*
 * The periods the student can look back over. The quiz service takes the window
 * as ?days= (30 when omitted); "Tot" asks for ten years, which is everything.
 * Every period shows each test as its own point: nothing is averaged away.
 */
const PERIODS = [
  { days: 30, short: '30 zile', long: 'ultimele 30 de zile' },
  { days: 90, short: '3 luni', long: 'ultimele 3 luni' },
  { days: 180, short: '6 luni', long: 'ultimele 6 luni' },
  { days: 365, short: '1 an', long: 'ultimul an' },
  { days: 3650, short: 'Tot', long: 'toată perioada' }
]

const DEFAULT_DAYS = 30

// How far before the exam the admitted students' curves reach (quiz-service's benchmark.window-days).
const COHORT_REACH_DAYS = 730
const ALL_DAYS = 3650
const STORAGE_KEY = 'ementor.results-period'
const PROFILE_PATH = '/pages/account-settings/account'

// How long a period waits for the cohort line before showing the tests without it.
const BENCHMARK_GRACE_MS = 1000

/*
 * On the student's own chart the admitted students' average is drawn this
 * many points higher than it is (capped at 100%), so students aim a little
 * above the real bar. Nothing on the student's screen says so; the professor's
 * view of the same student shows the real average.
 */
const STUDENT_COHORT_OFFSET = 2

const NONE = []

/** One point per test, oldest first, placed at the moment it was taken. */
const toTests = results =>
  results
    .map(result => {
      const time = new Date(result.date).getTime()

      return {
        t: time,
        day: timeToDay(time),

        // The time tells apart two tests taken on the same day.
        title: new Date(time).toLocaleString('ro-RO', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        value: percent(result.correctAnswers, result.totalQuestions),
        correct: result.correctAnswers,
        total: result.totalQuestions
      }
    })
    .sort((a, b) => a.t - b.t)

// The student's line follows a rolling average, so one good or bad test bends it instead of breaking it.
const ROLLING_TESTS = 5

/**
 * Each test with the average of itself and up to four tests before it,
 * counted by questions the way "media perioadei" is. Only a day's last test
 * carries it onto the line: two tests hours apart would otherwise draw a
 * vertical jump, so the line moves once a day.
 */
const withRollingAverage = tests =>
  tests.map((test, index) => {
    const recent = tests.slice(Math.max(0, index - ROLLING_TESTS + 1), index + 1)
    const lastOfDay = tests[index + 1]?.day !== test.day

    return {
      ...test,
      averageOf: recent.length,
      average: lastOfDay
        ? percent(
            recent.reduce((sum, item) => sum + item.correct, 0),
            recent.reduce((sum, item) => sum + item.total, 0)
          )
        : undefined
    }
  })

/** The cohort's days at noon. Days without data are bridged, so the line runs on without a break. */
const toCohortRows = points =>
  points.map(point => ({ t: dayToTime(point.date), day: point.date, cohort: point.average }))

const readSavedDays = () => {
  try {
    const saved = Number(window.localStorage.getItem(STORAGE_KEY))

    return PERIODS.some(period => period.days === saved) ? saved : DEFAULT_DAYS
  } catch {
    return DEFAULT_DAYS
  }
}

const startOfDay = time => {
  const date = new Date(time)
  date.setHours(0, 0, 0, 0)

  return date.getTime()
}

/**
 * Everything on the day under the pointer: the student's tests, each as it
 * always was, then the cohort's average for that day. Reading the whole day
 * keeps a test reachable on a long period, where a day is about a pixel wide.
 */
const DayTooltip = ({ active, label, testsByDay, cohortByDay, cohortStroke, showCounts }) => {
  if (!active || label == null) return null

  const day = timeToDay(label)
  const tests = testsByDay.get(day) ?? []
  const cohort = cohortByDay.get(day)

  if (!tests.length && !cohort) return null

  return (
    <Box
      sx={{
        px: 3,
        py: 2,
        maxWidth: 280,
        borderRadius: '10px',
        bgcolor: 'background.paper',

        // The paper matches the card under it; the hairline keeps them apart in the dark theme.
        border: theme => `1px solid ${theme.palette.divider}`,
        boxShadow: theme => `0 6px 20px ${alpha(theme.palette.common.black, 0.12)}`
      }}
    >
      {tests.map((test, index) => (
        <Box key={test.t} sx={{ mt: index ? 2 : 0 }}>
          <Typography variant='caption' sx={{ color: 'text.secondary' }}>
            {test.title}
          </Typography>
          <Typography sx={{ fontWeight: 700, color: 'text.primary' }}>{test.value}%</Typography>
          <Typography variant='caption' sx={{ display: 'block', color: 'text.secondary' }}>
            {test.correct} din {test.total} corecte
          </Typography>
        </Box>
      ))}
      {tests.length > 0 && tests[tests.length - 1].averageOf > 1 && (
        <Typography variant='caption' sx={{ display: 'block', mt: 1.5, color: 'text.secondary' }}>
          Media ultimelor {tests[tests.length - 1].averageOf} teste:{' '}
          <Box component='span' sx={{ fontWeight: 700, color: 'text.primary' }}>
            {tests[tests.length - 1].average}%
          </Box>
        </Typography>
      )}
      {cohort && (
        <Box sx={tests.length ? { mt: 2, pt: 2, borderTop: theme => `1px solid ${theme.palette.divider}` } : undefined}>
          <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontWeight: 700, color: 'text.primary' }}>
            <Box
              component='span'
              aria-hidden
              sx={{ width: 10, height: 10, flexShrink: 0, borderRadius: '50%', bgcolor: cohortStroke }}
            />
            {formatAverage(cohort.average)} · media celor admiși
          </Typography>
          <Typography variant='caption' sx={{ display: 'block', color: 'text.secondary' }}>
            {daysToExamLabel(cohort.daysBeforeExam)}

            {/* How many tests and students stand behind a point is for the professor, not the student. */}
            {showCounts && ` · ${cohortCountsLabel(cohort.tests, cohort.students)}`}
          </Typography>
        </Box>
      )}
    </Box>
  )
}

/** "Azi", just left of the today line, above the plot. */
const TodayLabel = ({ viewBox, fill }) => (
  <text x={viewBox.x - 6} y={viewBox.y - 8} textAnchor='end' fill={fill} fontSize={12} fontWeight={600}>
    Azi
  </text>
)

/**
 * Names the shaded days ahead, right of the today line: the full name when it
 * fits before the chart's edge, a short one on narrow charts, else nothing.
 */
const AheadLabel = ({ viewBox, names, fill }) => {
  const fits = text => viewBox.width + 8 >= text.length * 6.6 + 6
  const text = names.find(name => name && fits(name))
  if (!text) return null

  return (
    <text x={viewBox.x + 6} y={viewBox.y - 8} textAnchor='start' fill={fill} fontSize={12}>
      {text}
    </text>
  )
}

/**
 * Test results over a period the student picks, on a fixed 0–100% scale so a
 * small dip doesn't look like a fall, with the all-time average as a dashed
 * line. When the student has a target university, speciality and exam date,
 * a second line shows how students admitted there were scoring at the same
 * distance from their exam, running 30 days past today.
 *
 * Written for both readers: the student on their dashboard, and the professor
 * looking at one student (pass `studentId`). `data` is the 30-day stats the
 * page already loaded; other periods are fetched here once each.
 */
const LastTestResults = ({ data, studentId }) => {
  const theme = useTheme()
  const reduceMotion = useReducedMotion()
  const gradientId = `results-${useId().replace(/:/g, '')}`

  const [days, setDays] = useState(DEFAULT_DAYS)
  const [loaded, setLoaded] = useState({})
  const [status, setStatus] = useState('ready')
  const requestId = useRef(0)

  // The cohort line per period: undefined while unknown, null when there is none to draw.
  const [benchmarks, setBenchmarks] = useState({})
  const [waited, setWaited] = useState({})
  const benchmarkRequests = useRef(new Set())

  // The saved period is a per-device convenience, read once on the client.
  useEffect(() => {
    setDays(readSavedDays())
  }, [])

  const statsUrl = studentId
    ? `${apiSpec.QUIZ_SERVICE}/dashboard-stats/${studentId}`
    : `${apiSpec.QUIZ_SERVICE}/dashboard-stats`

  const loadPeriod = periodDays => {
    if (periodDays === DEFAULT_DAYS) return

    const id = ++requestId.current
    setStatus('loading')

    apiClient
      .get(statsUrl, { params: { days: periodDays } })
      .then(response => {
        if (id !== requestId.current) return
        setLoaded(previous => ({ ...previous, [periodDays]: response.data }))
        setStatus('ready')
      })
      .catch(error => {
        if (id !== requestId.current) return
        console.error('Failed to load test results for the period:', error)
        setStatus('error')
      })
  }

  useEffect(() => {
    if (days !== DEFAULT_DAYS && !loaded[days]) loadPeriod(days)

    // Fetch only when the chosen period has no data yet.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days, statsUrl])

  // The cohort line is extra: a failed or refused call only means no line.
  useEffect(() => {
    if (benchmarks[days] !== undefined) return

    if (!benchmarkRequests.current.has(days)) {
      benchmarkRequests.current.add(days)
      fetchBenchmarkLine(days, studentId)
        .then(line => setBenchmarks(previous => ({ ...previous, [days]: line })))
        .catch(error => {
          if (!isNotFound(error)) console.error('Failed to load the admitted students line:', error)
          setBenchmarks(previous => ({ ...previous, [days]: null }))
        })
    }

    const timer = setTimeout(() => setWaited(previous => ({ ...previous, [days]: true })), BENCHMARK_GRACE_MS)

    return () => clearTimeout(timer)

    // Each period is fetched once; the card remounts for another student.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days])

  const choosePeriod = value => {
    setDays(value)
    if (value === DEFAULT_DAYS || loaded[value]) setStatus('ready')
    try {
      window.localStorage.setItem(STORAGE_KEY, String(value))
    } catch {
      // Without storage the card simply opens on 30 days next time.
    }
  }

  const period = PERIODS.find(item => item.days === days) ?? PERIODS[0]
  const isAll = days === ALL_DAYS

  // A period appears once its tests are in and its cohort line has arrived or
  // stopped being waited for; until then the previous one stays, dimmed.
  const statsReady = days === DEFAULT_DAYS || Boolean(loaded[days])
  const benchmarkSettled = benchmarks[days] !== undefined || Boolean(waited[days])
  const [shownDays, setShownDays] = useState(null)
  useEffect(() => {
    if (statsReady && benchmarkSettled) setShownDays(days)
  }, [days, statsReady, benchmarkSettled])

  const shownPeriod = PERIODS.find(item => item.days === shownDays) ?? PERIODS[0]
  const shownData = shownDays === DEFAULT_DAYS ? data : loaded[shownDays]
  const results = shownData?.lastMonthQuizzesResults ?? NONE
  const tests = useMemo(() => withRollingAverage(toTests(results)), [results])

  const benchmark = shownDays === null ? undefined : benchmarks[shownDays]
  const cohortLine = benchmark?.status === 'READY' && benchmark.points.length > 0 ? benchmark : null

  // Drawn smoothed; the tooltip reads the same values, so its point sits on the line.
  // The cohort reaches back at most two years, so "Tot" smooths it as that span does.
  const cohortPoints = useMemo(() => {
    if (!cohortLine) return NONE

    const smoothed = smoothCurve(
      cohortLine.points,
      smoothingRadius(Math.min(shownDays ?? DEFAULT_DAYS, COHORT_REACH_DAYS) + 30)
    )

    return studentId
      ? smoothed
      : smoothed.map(point => ({
          ...point,
          average: Math.min(100, Math.round((point.average + STUDENT_COHORT_OFFSET) * 10) / 10)
        }))
  }, [cohortLine, shownDays, studentId])

  const periodValue = percent(
    results.reduce((sum, result) => sum + result.correctAnswers, 0),
    results.reduce((sum, result) => sum + result.totalQuestions, 0)
  )
  const overall = percent(data?.questions?.correctQuestions ?? 0, data?.questions?.totalQuestions ?? 0)
  const delta = periodValue - overall
  const compare = shownDays !== ALL_DAYS

  // Named in full: "media generală" alone didn't say whose average it was, or of what.
  const allTestsAverage = studentId ? 'media elevului din toate testele' : 'media ta din toate testele'
  const inPeriod = `În ${shownPeriod.long}`

  const comparison =
    delta >= 1
      ? {
          tone: 'accent',
          icon: 'tabler:trending-up',
          label: `${inPeriod}: ${delta}% mai bine decât ${allTestsAverage}`
        }
      : delta <= -1
      ? {
          tone: 'warning',
          icon: 'tabler:trending-down',
          label: `${inPeriod}: ${-delta}% mai slab decât ${allTestsAverage}`
        }
      : { tone: 'neutral', icon: 'tabler:equal', label: `${inPeriod}: la fel ca ${allTestsAverage}` }

  // The bright theme green is under 3:1 as a line on white; one step deeper reads clearly.
  const line = theme.palette.mode === 'light' ? darken(theme.palette.primary.main, 0.2) : theme.palette.primary.main
  const cohortStroke = cohortColor(theme, 0)
  const axisText = { fill: theme.palette.text.secondary, fontSize: 12 }
  const values = tests.map(test => test.value)

  // Every test keeps its point around the average line; the marks get finer as tests get denser.
  const dot =
    tests.length > 150
      ? { r: 1.75, fill: alpha(line, 0.7), strokeWidth: 0 }
      : tests.length > 40
      ? { r: 2.5, fill: line, strokeWidth: 0 }
      : { r: 3.5, fill: theme.palette.background.paper, stroke: line, strokeWidth: 2 }

  // Recharts restarts its line animations whenever the data or the axis moves; both stay the same
  // until the shown data changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const now = useMemo(() => Date.now(), [shownDays, cohortLine])

  const rows = useMemo(() => [...tests, ...toCohortRows(cohortPoints)].sort((a, b) => a.t - b.t), [tests, cohortPoints])

  // The time axis covers the period up to today, or to 30 days past it when the cohort line runs ahead.
  // "Tot" starts at the first point instead of ten years back.
  const start =
    shownDays === ALL_DAYS
      ? startOfDay(Math.min(rows[0]?.t ?? now, now - DEFAULT_DAYS * DAY_MS))
      : startOfDay(now - (shownDays ?? DEFAULT_DAYS) * DAY_MS)
  const end = cohortLine?.to ? Math.max(now, dayToTime(cohortLine.to) + DAY_MS / 2) : now
  const ahead = end > now
  const { ticks, format } = timeTicks(start, end)

  // The shaded days stop at the exam when it comes sooner than 30 days.
  const aheadNames =
    cohortLine?.to === cohortLine?.examDate ? ['Până la examen'] : ['Următoarele 30 de zile', '+30 zile']

  const testsByDay = new Map()
  tests.forEach(test => testsByDay.set(test.day, [...(testsByDay.get(test.day) ?? []), test]))
  const cohortByDay = new Map(cohortPoints.map(point => [point.date, point]))
  const cohortAverages = cohortPoints.map(point => point.average)

  const loading = status === 'loading' || days !== shownDays
  const hasChart = tests.length > 0 || cohortLine !== null

  const profileLink = (
    <Link component={NextLink} href={PROFILE_PATH} sx={{ fontWeight: 600, color: accentInk, whiteSpace: 'nowrap' }}>
      Completează profilul
    </Link>
  )

  // One quiet line saying why there is no cohort line, written for whoever is reading.
  const benchmarkNote = (() => {
    switch (benchmark?.status) {
      case 'NO_TARGET':
        return studentId ? (
          'Elevul nu are universitatea și specializarea țintă în profil.'
        ) : (
          <>Alege universitatea și specializarea în profil ca să te compari cu cei admiși. {profileLink}</>
        )
      case 'NO_EXAM_DATE':
        return studentId ? (
          'Elevul nu are data examenului în profil.'
        ) : (
          <>Adaugă data examenului în profil ca să vezi linia celor admiși. {profileLink}</>
        )
      case 'NO_COHORT_DATA':
        return `Încă nu avem studenți admiși la ${benchmark.specialityName}.`
      case 'READY':
        return cohortLine ? null : 'Linia celor admiși apare când mai sunt cel mult doi ani până la examen.'
      default:
        return null
    }
  })()

  const legend = [
    { key: 'tests', label: studentId ? 'Testele elevului' : 'Testele tale', show: tests.length > 0 },
    { key: 'trend', label: `Media ultimelor ${ROLLING_TESTS} teste`, show: tests.length > 1 },
    { key: 'cohort', label: cohortLine && `Media celor admiși la ${cohortLabel(cohortLine)}`, show: !!cohortLine },
    {
      key: 'overall',
      label: `${allTestsAverage.charAt(0).toUpperCase()}${allTestsAverage.slice(1)}: ${overall}%`,
      show: compare && tests.length > 0
    }
  ].filter(item => item.show)

  const swatches = {
    tests: <LineSwatch stroke={line} dot={theme.palette.background.paper} line={false} />,
    trend: <LineSwatch stroke={line} />,
    cohort: <LineSwatch stroke={cohortStroke} width={3} />,
    overall: <LineSwatch stroke={theme.palette.text.secondary} dash='4 4' width={1.5} />
  }

  const chartLabel = [
    tests.length > 0 &&
      `${countLabel(tests.length, 'Un test', 'teste')} în ${shownPeriod.long}, cu rezultate între ${Math.min(
        ...values
      )}% și ${Math.max(...values)}%. Media ultimelor ${ROLLING_TESTS} teste a ajuns la ${
        tests[tests.length - 1]?.average
      }%. Media perioadei: ${periodValue}%, ${allTestsAverage}: ${overall}%.`,
    cohortLine &&
      `Media celor admiși la ${cohortLabel(cohortLine)}: între ${formatAverage(
        Math.min(...cohortAverages)
      )} și ${formatAverage(Math.max(...cohortAverages))}, până pe ${new Date(end).toLocaleDateString('ro-RO', {
        day: 'numeric',
        month: 'long'
      })}.`
  ]
    .filter(Boolean)
    .join(' ')

  const periodControl = (
    <Box sx={{ mb: 4 }}>
      <PeriodToggle periods={PERIODS} value={days} onChange={choosePeriod} />
    </Box>
  )

  const note = benchmarkNote && (
    <Typography variant='body2' sx={{ mt: 3, color: 'text.secondary', opacity: loading ? 0.5 : 1 }}>
      {benchmarkNote}
    </Typography>
  )

  const renderBody = () => {
    if (status === 'error') {
      return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}>
          <Typography variant='body2' sx={{ color: 'text.secondary' }}>
            Rezultatele pentru {period.long} nu s-au încărcat.
          </Typography>
          <Button size='small' onClick={() => loadPeriod(days)} sx={{ fontWeight: 600, color: accentInk }}>
            Reîncearcă
          </Button>
        </Box>
      )
    }

    if (shownDays === null) {
      return <Skeleton variant='rounded' sx={{ flex: 1, minHeight: { xs: 200, md: 240 }, borderRadius: '10px' }} />
    }

    const noTests = (
      <Box sx={{ opacity: loading ? 0.5 : 1 }}>
        <Typography variant='body2' sx={{ color: 'text.secondary' }}>
          {shownDays === DEFAULT_DAYS
            ? 'Niciun test în ultimele 30 de zile. Graficul apare după următorul test.'
            : `Niciun test în ${shownPeriod.long}.`}
        </Typography>
        {!isAll && !loading && (
          <Button
            size='small'
            onClick={() => choosePeriod(ALL_DAYS)}
            sx={{ mt: 2, ml: -2, fontWeight: 600, color: accentInk }}
          >
            Vezi toate rezultatele
          </Button>
        )}
      </Box>
    )

    if (!hasChart) {
      return (
        <>
          {noTests}
          {note}
        </>
      )
    }

    return (
      <>
        {tests.length > 0 && compare && (
          <Box sx={{ mb: 4 }}>
            <StatusPill tone={comparison.tone} icon={comparison.icon} wrap>
              {comparison.label}
            </StatusPill>
          </Box>
        )}
        {tests.length === 0 && <Box sx={{ mb: 3 }}>{noTests}</Box>}
        <Box
          role='img'
          aria-label={chartLabel}
          sx={{
            flex: 1,
            minHeight: { xs: 200, md: 240 },
            opacity: loading ? 0.5 : 1,
            transition: 'opacity 0.2s ease'
          }}
        >
          <ResponsiveContainer width='100%' height='100%' minHeight={200}>
            {/* New data starts a fresh chart, so a hover from the old data never lands on the new one. */}
            <ComposedChart
              key={`${shownDays}-${cohortLine ? 'cohort' : 'tests'}`}
              data={rows}
              margin={{ top: ahead ? 24 : 8, right: 8, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id={gradientId} x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='0%' stopColor={theme.palette.primary.main} stopOpacity={0.28} />
                  <stop offset='100%' stopColor={theme.palette.primary.main} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke={alpha(theme.palette.text.primary, 0.08)} />
              {ahead && (
                <ReferenceArea
                  x1={now}
                  x2={end}
                  fill={alpha(theme.palette.text.primary, theme.palette.mode === 'light' ? 0.04 : 0.06)}
                  ifOverflow='hidden'
                  label={<AheadLabel names={aheadNames} fill={theme.palette.text.secondary} />}
                />
              )}
              <XAxis
                type='number'
                scale='time'
                dataKey='t'
                domain={[start, end]}
                ticks={ticks}
                tickFormatter={format}
                tickLine={false}
                axisLine={false}
                tick={axisText}
                interval='preserveStartEnd'
                minTickGap={16}
              />
              <YAxis
                domain={[0, 100]}
                ticks={[0, 50, 100]}
                tickFormatter={value => `${value}%`}
                tickLine={false}
                axisLine={false}
                tick={axisText}
                width={48}
              />
              {compare && tests.length > 0 && (
                <ReferenceLine y={overall} stroke={theme.palette.text.secondary} strokeDasharray='4 4' />
              )}
              {ahead && (
                <ReferenceLine
                  x={now}
                  stroke={alpha(theme.palette.text.primary, 0.35)}
                  label={<TodayLabel fill={theme.palette.text.primary} />}
                />
              )}
              <Tooltip
                content={
                  <DayTooltip
                    testsByDay={testsByDay}
                    cohortByDay={cohortByDay}
                    cohortStroke={cohortStroke}
                    showCounts={Boolean(studentId)}
                  />
                }
                cursor={{ stroke: alpha(line, 0.4) }}
              />
              {/* Fill, then the cohort, then the student's average and tests on top: the student's own data leads. */}
              <Area
                type='monotone'
                dataKey='average'
                connectNulls
                stroke='none'
                fill={`url(#${gradientId})`}
                dot={false}
                activeDot={false}
                isAnimationActive={!reduceMotion}
              />
              <Line
                type='monotone'
                dataKey='cohort'
                connectNulls
                stroke={cohortStroke}
                strokeWidth={3}
                strokeLinecap='round'
                dot={false}
                activeDot={{ r: 4, fill: cohortStroke, stroke: theme.palette.background.paper, strokeWidth: 2 }}
                isAnimationActive={!reduceMotion}
              />
              <Line
                type='monotone'
                dataKey='average'
                connectNulls
                stroke={line}
                strokeWidth={2.5}
                strokeLinecap='round'
                dot={false}
                activeDot={false}
                isAnimationActive={!reduceMotion}
              />
              {/*
                Each test as a point of its own, off the line when it was above or below the trend. Recharts
                draws a line's points only once its animation ends, and an animation cut short by new data
                never ends, so the points don't animate.
              */}
              <Line
                dataKey='value'
                stroke='none'
                dot={dot}
                activeDot={{ r: 5, fill: line, stroke: theme.palette.background.paper, strokeWidth: 2 }}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </Box>
        {/* The tests alone need no legend; the cohort line always gets its name. */}
        {(legend.length > 1 || cohortLine) && (
          <Box
            component='ul'
            sx={{
              m: 0,
              mt: 3,
              p: 0,
              listStyle: 'none',
              display: 'flex',
              flexWrap: 'wrap',
              columnGap: 4,
              rowGap: 1.5,
              opacity: loading ? 0.5 : 1
            }}
          >
            {legend.map(item => (
              <Box
                component='li'
                key={item.key}
                sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0, color: 'text.secondary' }}
              >
                {swatches[item.key]}
                <Typography variant='body2' component='span' sx={{ color: 'inherit', overflowWrap: 'anywhere' }}>
                  {item.label}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
        {note}
      </>
    )
  }

  return (
    <InsightCard
      title='Rezultate la teste'
      subtitle={tests.length ? 'Câte un punct pentru fiecare test' : undefined}
      aside={
        tests.length > 0 && (
          <Box sx={{ textAlign: { xs: 'left', sm: 'right' }, opacity: loading ? 0.5 : 1 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '1.5rem', lineHeight: 1.1, color: 'text.primary' }}>
              {periodValue}%
            </Typography>
            <Typography variant='caption' sx={{ color: 'text.secondary' }}>
              media perioadei
            </Typography>
          </Box>
        )
      }
    >
      <Box aria-busy={loading} sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {periodControl}
        {renderBody()}
      </Box>
    </InsightCard>
  )
}

export default LastTestResults
