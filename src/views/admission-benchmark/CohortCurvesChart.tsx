// ** React Imports
import { useMemo } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

// ** Third Party Imports
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useReducedMotion } from 'framer-motion'

// ** Custom Components Imports
import LineSwatch from './LineSwatch'
import { cohortColor, cohortCountsLabel, cohortDash, cohortLabel, daysToExamLabel, formatAverage } from './chartStyle'
import { accentInk } from 'src/views/student-ui/readableAccent'

// ** Types
import type { BenchmarkCurve, BenchmarkCurvePoint } from './types'

export interface PlottedCurve {
  curve: BenchmarkCurve
  slot: number
}

interface CohortCurvesChartProps {
  plotted: PlottedCurve[]
  days: number
  status: 'loading' | 'ready' | 'error'
  onRetry: () => void
}

type Row = { d: number } & Record<string, number>

/** Tick steps that land on round numbers of days for each period. */
const tickStep = (days: number) => (days <= 30 ? 5 : days <= 90 ? 15 : days <= 180 ? 30 : 60)

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)

const CurvesTooltip = ({
  active,
  label,
  plotted,
  pointsByDay
}: {
  active?: boolean
  label?: number
  plotted: PlottedCurve[]
  pointsByDay: Map<string, Map<number, BenchmarkCurvePoint>>
}) => {
  const theme = useTheme()

  if (!active || label === undefined) return null

  const rows = plotted
    .map(item => ({ ...item, point: pointsByDay.get(item.curve.key)?.get(label) }))
    .filter(item => item.point)

    // Highest first, so the list reads in the same order as the lines under the pointer.
    .sort((a, b) => b.point!.average - a.point!.average)

  if (!rows.length) return null

  return (
    <Box
      sx={{
        px: 3,
        py: 2,
        maxWidth: 340,
        borderRadius: '10px',
        bgcolor: 'background.paper',
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: `0 6px 20px ${alpha(theme.palette.common.black, 0.12)}`
      }}
    >
      <Typography variant='caption' sx={{ display: 'block', mb: 1.5, fontWeight: 600, color: 'text.secondary' }}>
        {capitalize(daysToExamLabel(label))}
      </Typography>
      {rows.map(({ curve, slot, point }) => (
        <Box key={curve.key} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', '& + &': { mt: 1.5 } }}>
          <Box sx={{ pt: '5px' }}>
            <LineSwatch stroke={cohortColor(theme, slot)} dash={cohortDash(slot)} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant='body2' sx={{ fontWeight: 600, color: 'text.primary', overflowWrap: 'anywhere' }}>
              {cohortLabel(curve)}
            </Typography>
            <Typography variant='caption' sx={{ display: 'block', color: 'text.secondary' }}>
              {formatAverage(point!.average)} · {cohortCountsLabel(point!.tests, point!.students)}
            </Typography>
          </Box>
        </Box>
      ))}
    </Box>
  )
}

/**
 * The chosen cohorts as lines over the days before their exam, left to right
 * toward the exam. A day without tests in its window is bridged, so each line
 * runs on as one smooth curve.
 */
const CohortCurvesChart = ({ plotted, days, status, onRetry }: CohortCurvesChartProps) => {
  const theme = useTheme()
  const reduceMotion = useReducedMotion()

  // One row per day before the exam, with one value per cohort that has a point that day.
  const { rows, series, pointsByDay } = useMemo(() => {
    const byDay = new Map<number, Row>()
    const series: { dataKey: string; slot: number }[] = []
    const pointsByDay = new Map<string, Map<number, BenchmarkCurvePoint>>()

    plotted.forEach(({ curve, slot }) => {
      const dataKey = `c${slot}`
      series.push({ dataKey, slot })
      pointsByDay.set(curve.key, new Map(curve.points.map(point => [point.daysBeforeExam, point])))
      curve.points.forEach(point => {
        const row = byDay.get(point.daysBeforeExam) ?? ({ d: point.daysBeforeExam } as Row)
        row[dataKey] = point.average
        byDay.set(point.daysBeforeExam, row)
      })
    })

    return { rows: Array.from(byDay.values()).sort((a, b) => b.d - a.d), series, pointsByDay }
  }, [plotted])

  const axisText = { fill: theme.palette.text.secondary, fontSize: 12 }
  const step = tickStep(days)
  const ticks = Array.from({ length: Math.floor(days / step) + 1 }, (_, index) => index * step)

  if (status === 'error') {
    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, minHeight: 120 }}>
        <Typography variant='body2' sx={{ color: 'text.secondary' }}>
          Graficul nu s-a încărcat.
        </Typography>
        <Button size='small' onClick={onRetry} sx={{ fontWeight: 600, color: accentInk }}>
          Reîncearcă
        </Button>
      </Box>
    )
  }

  if (!plotted.length && status === 'ready') {
    return (
      <Typography variant='body2' sx={{ color: 'text.secondary', minHeight: 120 }}>
        Alege o cohortă ca să vezi linia ei.
      </Typography>
    )
  }

  const described = plotted
    .filter(({ curve }) => curve.points.length > 0)
    .map(({ curve }) => {
      const averages = curve.points.map(point => point.average)

      return `${cohortLabel(curve)}: de la ${formatAverage(Math.min(...averages))} la ${formatAverage(
        Math.max(...averages)
      )}`
    })

  const empty = status === 'ready' && rows.length === 0

  return (
    <Box
      role='img'
      aria-label={`Media la teste a celor admiși, în ultimele ${days} de zile dinaintea examenului. ${
        described.length ? `${described.join('. ')}.` : 'Nicio cohortă aleasă nu are teste în această perioadă.'
      }`}
      aria-busy={status === 'loading'}
      sx={{
        position: 'relative',
        height: { xs: 280, md: 340 },
        opacity: status === 'loading' ? 0.5 : 1,
        transition: 'opacity 0.2s ease'
      }}
    >
      <ResponsiveContainer width='100%' height='100%'>
        <LineChart data={rows} margin={{ top: 8, right: 12, left: 0, bottom: 20 }}>
          <CartesianGrid vertical={false} stroke={alpha(theme.palette.text.primary, 0.08)} />
          <XAxis
            type='number'
            dataKey='d'
            domain={[0, days]}
            reversed
            ticks={ticks}
            tickLine={false}
            axisLine={false}
            tick={axisText}
            interval='preserveStartEnd'
            minTickGap={12}
            label={{ value: 'zile până la examen', position: 'insideBottom', offset: -16, ...axisText }}
          />
          <YAxis
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            tickFormatter={value => `${value}%`}
            tickLine={false}
            axisLine={false}
            tick={axisText}
            width={48}
          />
          <Tooltip
            content={<CurvesTooltip plotted={plotted} pointsByDay={pointsByDay} />}
            cursor={{ stroke: alpha(theme.palette.text.primary, 0.3) }}
          />
          {series.map(({ dataKey, slot }) => (
            <Line
              key={dataKey}
              type='monotone'
              dataKey={dataKey}
              connectNulls
              stroke={cohortColor(theme, slot)}
              strokeWidth={2.5}
              strokeDasharray={cohortDash(slot)}
              strokeLinecap='round'
              dot={false}
              activeDot={{
                r: 4,
                fill: cohortColor(theme, slot),
                stroke: theme.palette.background.paper,
                strokeWidth: 2
              }}
              isAnimationActive={!reduceMotion}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      {empty && (
        <Typography
          variant='body2'
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'grid',
            placeItems: 'center',
            px: 6,
            textAlign: 'center',
            color: 'text.secondary'
          }}
        >
          Cohortele alese nu au teste în această perioadă.
        </Typography>
      )}
    </Box>
  )
}

export default CohortCurvesChart
