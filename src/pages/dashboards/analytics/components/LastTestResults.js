// ** React Imports
import { useId } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { alpha, darken, useTheme } from '@mui/material/styles'

// ** Third Party Imports
import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useReducedMotion } from 'framer-motion'

// ** Custom Components Imports
import InsightCard from 'src/views/student-ui/InsightCard'
import StatusPill from 'src/views/student-ui/StatusPill'
import { formatShortDate, percent } from 'src/views/student-ui/format'
import { countLabel } from 'src/views/student-ui/countLabel'

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
        {point.label}
      </Typography>
      <Typography sx={{ fontWeight: 700, color: 'text.primary' }}>{point.value}%</Typography>
      <Typography variant='caption' sx={{ color: 'text.secondary' }}>
        {point.correct} din {point.total} corecte
      </Typography>
    </Box>
  )
}

/**
 * Each test from the last 30 days as one point, on a fixed 0–100% scale so a
 * small dip doesn't look like a fall, with the all-time average as a dashed
 * line. Written for both readers: the student and the professor.
 */
const LastTestResults = ({ data }) => {
  const theme = useTheme()
  const reduceMotion = useReducedMotion()
  const gradientId = `results-${useId().replace(/:/g, '')}`

  const results = [...(data?.lastMonthQuizzesResults ?? [])].sort((a, b) => new Date(a.date) - new Date(b.date))

  const points = results.map((result, index) => ({
    key: index,
    label: formatShortDate(result.date),
    value: percent(result.correctAnswers, result.totalQuestions),
    correct: result.correctAnswers,
    total: result.totalQuestions
  }))

  const monthValue = percent(
    results.reduce((sum, result) => sum + result.correctAnswers, 0),
    results.reduce((sum, result) => sum + result.totalQuestions, 0)
  )
  const overall = percent(data?.questions?.correctQuestions ?? 0, data?.questions?.totalQuestions ?? 0)
  const delta = monthValue - overall

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

  return (
    <InsightCard
      title='Rezultate în ultimele 30 de zile'
      subtitle={points.length ? 'Câte un punct pentru fiecare test' : undefined}
      aside={
        points.length > 0 && (
          <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
            <Typography sx={{ fontWeight: 700, fontSize: '1.5rem', lineHeight: 1.1, color: 'text.primary' }}>
              {monthValue}%
            </Typography>
            <Typography variant='caption' sx={{ color: 'text.secondary' }}>
              media lunii
            </Typography>
          </Box>
        )
      }
    >
      {points.length === 0 ? (
        <Typography variant='body2' sx={{ color: 'text.secondary' }}>
          Niciun test în ultimele 30 de zile. Graficul apare după următorul test.
        </Typography>
      ) : (
        <>
          <Box sx={{ mb: 4 }}>
            <StatusPill tone={comparison.tone} icon={comparison.icon}>
              {comparison.label}
            </StatusPill>
          </Box>
          <Box
            role='img'
            aria-label={`${countLabel(
              points.length,
              'Un test',
              'teste'
            )} în ultimele 30 de zile, cu rezultate între ${Math.min(...values)}% și ${Math.max(
              ...values
            )}%. Media lunii: ${monthValue}%, media generală: ${overall}%.`}
            sx={{ flex: 1, minHeight: { xs: 200, md: 240 } }}
          >
            <ResponsiveContainer width='100%' height='100%' minHeight={200}>
              <AreaChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={gradientId} x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='0%' stopColor={theme.palette.primary.main} stopOpacity={0.28} />
                    <stop offset='100%' stopColor={theme.palette.primary.main} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke={alpha(theme.palette.text.primary, 0.08)} />
                {/* Keyed by test, labelled by day: two tests on the same day get one date. */}
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
                <ReferenceLine
                  y={overall}
                  stroke={theme.palette.text.secondary}
                  strokeDasharray='4 4'
                  label={{ value: `media generală ${overall}%`, position: 'insideTopLeft', ...axisText }}
                />
                <Tooltip content={<ResultTooltip />} cursor={{ stroke: alpha(line, 0.4) }} />
                <Area
                  type='monotone'
                  dataKey='value'
                  stroke={line}
                  strokeWidth={2.5}
                  fill={`url(#${gradientId})`}
                  dot={{ r: 3.5, fill: theme.palette.background.paper, stroke: line, strokeWidth: 2 }}
                  activeDot={{ r: 5, fill: line }}
                  isAnimationActive={!reduceMotion}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        </>
      )}
    </InsightCard>
  )
}

export default LastTestResults
