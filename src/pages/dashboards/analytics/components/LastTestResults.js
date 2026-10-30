// ** React Imports
import { useEffect, useId, useRef, useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import { alpha, darken, useTheme } from '@mui/material/styles'

// ** Third Party Imports
import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useReducedMotion } from 'framer-motion'

// ** API Imports
import apiClient from 'src/@core/axios/axiosEmentor'
import * as apiSpec from 'src/apiSpec'

// ** Custom Components Imports
import InsightCard from 'src/views/student-ui/InsightCard'
import StatusPill from 'src/views/student-ui/StatusPill'
import { formatShortDate, percent } from 'src/views/student-ui/format'
import { countLabel } from 'src/views/student-ui/countLabel'
import { accentInk } from 'src/views/student-ui/readableAccent'

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
const ALL_DAYS = 3650
const STORAGE_KEY = 'ementor.results-period'

/** One point per test, oldest first. Dates carry the year unless every test is from this year. */
const toPoints = results => {
  const sorted = [...results].sort((a, b) => new Date(a.date) - new Date(b.date))
  const years = new Set(sorted.map(result => new Date(result.date).getFullYear()))
  const showYear = years.size > 1 || !years.has(new Date().getFullYear())

  return sorted.map((result, index) => ({
    key: index,
    label: showYear
      ? new Date(result.date).toLocaleDateString('ro-RO', { day: 'numeric', month: 'short', year: '2-digit' })
      : formatShortDate(result.date),

    // The time tells apart two tests taken on the same day.
    title: new Date(result.date).toLocaleString('ro-RO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    value: percent(result.correctAnswers, result.totalQuestions),
    correct: result.correctAnswers,
    total: result.totalQuestions
  }))
}

const readSavedDays = () => {
  try {
    const saved = Number(window.localStorage.getItem(STORAGE_KEY))

    return PERIODS.some(period => period.days === saved) ? saved : DEFAULT_DAYS
  } catch {
    return DEFAULT_DAYS
  }
}

const ResultTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null

  const point = payload[0].payload

  return (
    <Box
      sx={{
        px: 3,
        py: 2,
        borderRadius: '10px',
        bgcolor: 'background.paper',
        boxShadow: theme => `0 6px 20px ${alpha(theme.palette.common.black, 0.12)}`
      }}
    >
      <Typography variant='caption' sx={{ color: 'text.secondary' }}>
        {point.title}
      </Typography>
      <Typography sx={{ fontWeight: 700, color: 'text.primary' }}>{point.value}%</Typography>
      <Typography variant='caption' sx={{ display: 'block', color: 'text.secondary' }}>
        {point.correct} din {point.total} corecte
      </Typography>
    </Box>
  )
}

/**
 * Test results over a period the student picks, on a fixed 0–100% scale so a
 * small dip doesn't look like a fall, with the all-time average as a dashed
 * line. Written for both readers: the student on their dashboard, and the
 * professor looking at one student (pass `studentId`).
 *
 * `data` is the 30-day stats the page already loaded; other periods are
 * fetched here once each.
 */
const LastTestResults = ({ data, studentId }) => {
  const theme = useTheme()
  const reduceMotion = useReducedMotion()
  const gradientId = `results-${useId().replace(/:/g, '')}`

  const [days, setDays] = useState(DEFAULT_DAYS)
  const [loaded, setLoaded] = useState({})
  const [status, setStatus] = useState('ready')
  const requestId = useRef(0)

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

  const choosePeriod = (_event, value) => {
    if (!value) return
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

  // While a new period loads, the previous one stays on screen, dimmed.
  const [shownDays, setShownDays] = useState(DEFAULT_DAYS)
  useEffect(() => {
    if (days === DEFAULT_DAYS || loaded[days]) setShownDays(days)
  }, [days, loaded])

  const shownPeriod = PERIODS.find(item => item.days === shownDays) ?? PERIODS[0]
  const shownData = shownDays === DEFAULT_DAYS ? data : loaded[shownDays]
  const results = shownData?.lastMonthQuizzesResults ?? []
  const points = toPoints(results)

  const periodValue = percent(
    results.reduce((sum, result) => sum + result.correctAnswers, 0),
    results.reduce((sum, result) => sum + result.totalQuestions, 0)
  )
  const overall = percent(data?.questions?.correctQuestions ?? 0, data?.questions?.totalQuestions ?? 0)
  const delta = periodValue - overall
  const compare = shownDays !== ALL_DAYS

  const comparison =
    delta >= 1
      ? { tone: 'accent', icon: 'tabler:trending-up', label: `${delta}% peste media generală` }
      : delta <= -1
      ? { tone: 'warning', icon: 'tabler:trending-down', label: `${-delta}% sub media generală` }
      : { tone: 'neutral', icon: 'tabler:equal', label: 'La nivelul mediei generale' }

  // The bright theme green is under 3:1 as a line on white; one step deeper reads clearly.
  const line = theme.palette.mode === 'light' ? darken(theme.palette.primary.main, 0.2) : theme.palette.primary.main
  const axisText = { fill: theme.palette.text.secondary, fontSize: 12 }
  const values = points.map(point => point.value)

  // Every test keeps its point; only the marks get finer as tests get denser.
  const dense = points.length > 40

  const dot =
    points.length > 150
      ? false
      : dense
      ? { r: 2, fill: line, strokeWidth: 0 }
      : { r: 3.5, fill: theme.palette.background.paper, stroke: line, strokeWidth: 2 }

  const loading = status === 'loading'

  const periodControl = (
    <ToggleButtonGroup
      exclusive
      size='small'
      value={days}
      onChange={choosePeriod}
      aria-label='Perioada'
      sx={{
        mb: 4,
        width: { xs: '100%', sm: 'auto' },
        '& .MuiToggleButton-root': {
          flex: { xs: 1, sm: 'none' },
          minHeight: 36,
          px: { xs: 1, sm: 3 },
          fontSize: '0.8125rem',
          fontWeight: 600,
          textTransform: 'none',
          color: 'text.secondary',
          '&.Mui-selected': {
            color: accentInk(theme),
            bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'light' ? 0.12 : 0.16)
          }
        }
      }}
    >
      {PERIODS.map(item => (
        <ToggleButton key={item.days} value={item.days}>
          {item.short}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
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

    if (points.length === 0) {
      return (
        <Box sx={{ opacity: loading ? 0.5 : 1 }}>
          <Typography variant='body2' sx={{ color: 'text.secondary' }}>
            {shownDays === DEFAULT_DAYS
              ? 'Niciun test în ultimele 30 de zile. Graficul apare după următorul test.'
              : `Niciun test în ${shownPeriod.long}.`}
          </Typography>
          {!isAll && !loading && (
            <Button
              size='small'
              onClick={event => choosePeriod(event, ALL_DAYS)}
              sx={{ mt: 2, ml: -2, fontWeight: 600, color: accentInk }}
            >
              Vezi toate rezultatele
            </Button>
          )}
        </Box>
      )
    }

    return (
      <>
        {compare && (
          <Box sx={{ mb: 4 }}>
            <StatusPill tone={comparison.tone} icon={comparison.icon}>
              {comparison.label}
            </StatusPill>
          </Box>
        )}
        <Box
          role='img'
          aria-label={`${countLabel(results.length, 'Un test', 'teste')} în ${
            shownPeriod.long
          }, cu rezultate între ${Math.min(...values)}% și ${Math.max(
            ...values
          )}%. Media perioadei: ${periodValue}%, media generală: ${overall}%.`}
          sx={{
            flex: 1,
            minHeight: { xs: 200, md: 240 },
            opacity: loading ? 0.5 : 1,
            transition: 'opacity 0.2s ease'
          }}
        >
          <ResponsiveContainer width='100%' height='100%' minHeight={200}>
            {/* A new period starts a fresh chart, so a hover from the old data never lands on the new one. */}
            <AreaChart key={shownDays} data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='0%' stopColor={theme.palette.primary.main} stopOpacity={0.28} />
                  <stop offset='100%' stopColor={theme.palette.primary.main} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke={alpha(theme.palette.text.primary, 0.08)} />
              {/* Keyed by point, labelled by date: two tests on the same day get one date. */}
              <XAxis
                dataKey='key'
                tickFormatter={index =>
                  index > 0 && points[index - 1]?.label === points[index]?.label ? '' : points[index]?.label ?? ''
                }
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
              {compare && (
                <ReferenceLine
                  y={overall}
                  stroke={theme.palette.text.secondary}
                  strokeDasharray='4 4'
                  label={{ value: `media generală ${overall}%`, position: 'insideTopLeft', ...axisText }}
                />
              )}
              <Tooltip content={<ResultTooltip />} cursor={{ stroke: alpha(line, 0.4) }} />
              <Area
                type='monotone'
                dataKey='value'
                stroke={line}
                strokeWidth={dense ? 1.75 : 2.5}
                fill={`url(#${gradientId})`}
                dot={dot}
                activeDot={{ r: 5, fill: line }}
                isAnimationActive={!reduceMotion}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </>
    )
  }

  return (
    <InsightCard
      title='Rezultate la teste'
      subtitle={points.length ? 'Câte un punct pentru fiecare test' : undefined}
      aside={
        points.length > 0 && (
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
