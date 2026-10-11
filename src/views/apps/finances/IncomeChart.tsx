// ** React Imports
import { MouseEvent, forwardRef, useMemo, useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Table from '@mui/material/Table'
import Divider from '@mui/material/Divider'
import Tooltip from '@mui/material/Tooltip'
import Skeleton from '@mui/material/Skeleton'
import TableRow from '@mui/material/TableRow'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import TableContainer from '@mui/material/TableContainer'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import ToggleButton, { ToggleButtonProps } from '@mui/material/ToggleButton'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'

// ** Third Party Imports
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip as ChartTooltip, XAxis, YAxis } from 'recharts'

// ** Custom Component Imports
import Icon from 'src/@core/components/icon'
import RechartsWrapper from 'src/@core/styles/libs/recharts'

// ** Types
import type { FinanceTimeseriesDTO } from 'src/generated/profile-service-client/api'

// ** Local Imports
import { LegendKey, SectionError, refetchSx } from './FinanceParts'
import {
  FinanceColors,
  FinancePeriod,
  Granularity,
  TERMS,
  bucketAxisLabel,
  bucketTitle,
  formatCompact,
  formatMoney,
  formatWhole,
  localDate,
  periodPhrase,
  shouldEarnOf
} from './financeUtils'

interface IncomeChartProps {
  timeseries: FinanceTimeseriesDTO | null
  loading: boolean
  error: unknown
  onRetry: () => void
  period: FinancePeriod
  colors: FinanceColors
}

interface ChartRow {
  key: string
  axisLabel: string
  title: string
  shouldEarn: number
  confirmed: number

  // Null for buckets that start after today: future payments are unknown, not zero
  received: number | null

  // The parts of "should earn" that aren't confirmed yet, plus what was cancelled
  notConfirmed: number
  stillToCome: number
  cancelled: number
}

type SeriesKey = 'shouldEarn' | 'confirmed' | 'received'

// Left to right inside each period: the target, what is certain, what arrived
const SERIES: SeriesKey[] = ['shouldEarn', 'confirmed', 'received']

const CHART_HEIGHT = 300

// On a phone the chart turns sideways: one row per period, so each bar gets the full width
const COMPACT_ROW_HEIGHT = 46

const UNIT_TITLES: Record<Granularity, string> = {
  DAY: 'Venituri pe Zile',
  WEEK: 'Venituri pe Săptămâni',
  MONTH: 'Venituri pe Luni'
}

// A toggle button that also shows its name on hover, for the icon-only Chart / Table switch
const TooltipToggleButton = forwardRef<HTMLButtonElement, ToggleButtonProps & { title: string }>(
  ({ title, ...props }, ref) => (
    <Tooltip title={title}>
      <ToggleButton ref={ref} {...props} aria-label={title} />
    </Tooltip>
  )
)

TooltipToggleButton.displayName = 'TooltipToggleButton'

interface IncomeTooltipProps {
  active?: boolean
  payload?: { payload: ChartRow }[]
  colors: FinanceColors
  currency: string
}

// Values lead, labels follow: the reader already knows the series and wants the number
const IncomeTooltip = ({ active, payload, colors, currency }: IncomeTooltipProps) => {
  if (!active || !payload?.length) return null

  const row = payload[0].payload

  const notes = [
    row.notConfirmed > 0 ? `${formatMoney(row.notConfirmed, currency)} în ședințe ținute, dar nefinalizate` : null,
    row.stillToCome > 0 ? `${formatMoney(row.stillToCome, currency)} în ședințe viitoare` : null,
    row.cancelled > 0 ? `${formatMoney(row.cancelled, currency)} anulate, neincluse` : null
  ].filter(Boolean)

  return (
    <Box className='recharts-custom-tooltip' sx={{ minWidth: 240 }}>
      <Typography variant='body2' sx={{ mb: 1.5, fontWeight: 500, color: 'text.primary' }}>
        {row.title}
      </Typography>
      {SERIES.filter(key => row[key] !== null).map(key => (
        <Box key={key} sx={{ py: 0.5, gap: 2, display: 'flex', alignItems: 'center' }}>
          <LegendKey color={colors[key]} />
          <Typography
            variant='body2'
            sx={{ fontWeight: 600, color: 'text.primary', fontVariantNumeric: 'tabular-nums' }}
          >
            {formatMoney(row[key], currency)}
          </Typography>
          <Typography variant='body2' sx={{ color: 'text.secondary' }}>
            {TERMS[key].label}
          </Typography>
        </Box>
      ))}
      {notes.length > 0 && (
        <>
          <Divider sx={{ my: 1.5 }} />
          {notes.map(note => (
            <Typography key={note} variant='body2' sx={{ color: 'text.secondary' }}>
              {note}
            </Typography>
          ))}
        </>
      )}
    </Box>
  )
}

const summarize = (rows: ChartRow[], currency: string, phrase: string, isPast: boolean): string => {
  const total = (key: 'shouldEarn' | 'confirmed' | 'received') => rows.reduce((sum, row) => sum + (row[key] ?? 0), 0)

  const shouldEarn = total('shouldEarn')
  const confirmed = total('confirmed')
  const received = total('received')

  const Phrase = phrase.charAt(0).toUpperCase() + phrase.slice(1)

  if (!shouldEarn && !received) return `Nicio ședință și nicio plată ${phrase}.`

  if (isPast) {
    return `${Phrase} ai avut planificat ${formatWhole(shouldEarn, currency)}: ai finalizat ședințe de ${formatWhole(
      confirmed,
      currency
    )} și ai încasat ${formatWhole(received, currency)}.`
  }

  return `${Phrase} ai planificat ${formatWhole(shouldEarn, currency)}. Până acum ai finalizat ședințe de ${formatWhole(
    confirmed,
    currency
  )} și ai încasat ${formatWhole(received, currency)}.`
}

const IncomeChart = ({ timeseries, loading, error, onRetry, period, colors }: IncomeChartProps) => {
  // ** State
  const [view, setView] = useState<'chart' | 'table'>('chart')

  // ** Hook
  const theme = useTheme()
  const compact = useMediaQuery(theme.breakpoints.down('sm'))

  const currency = timeseries?.currency ?? ''
  const today = timeseries ? localDate(timeseries.generatedAt) : ''

  const rows: ChartRow[] = useMemo(
    () =>
      (timeseries?.buckets ?? []).map(bucket => ({
        key: bucket.bucketStart,
        axisLabel: bucketAxisLabel(bucket, timeseries!.granularity),
        title: bucketTitle(bucket, timeseries!.granularity),
        shouldEarn: shouldEarnOf(bucket),
        confirmed: bucket.earned,
        received: bucket.bucketStart > today ? null : bucket.collected,
        notConfirmed: bucket.awaitingCompletion,
        stillToCome: bucket.expected,
        cancelled: bucket.lost
      })),
    [timeseries, today]
  )

  const summary = timeseries ? summarize(rows, currency, periodPhrase(period), period.to < today) : ' '
  const isEmpty = rows.every(row => !row.shouldEarn && !row.received)

  const handleViewChange = (_event: MouseEvent<HTMLElement>, next: 'chart' | 'table' | null) => {
    if (next) setView(next)
  }

  const totals = rows.reduce(
    (sum, row) => ({
      shouldEarn: sum.shouldEarn + row.shouldEarn,
      confirmed: sum.confirmed + row.confirmed,
      received: sum.received + (row.received ?? 0),
      notConfirmed: sum.notConfirmed + row.notConfirmed,
      stillToCome: sum.stillToCome + row.stillToCome,
      cancelled: sum.cancelled + row.cancelled
    }),
    { shouldEarn: 0, confirmed: 0, received: 0, notConfirmed: 0, stillToCome: 0, cancelled: 0 }
  )

  const tableColumns: { key: keyof typeof totals; label: string }[] = [
    { key: 'shouldEarn', label: TERMS.shouldEarn.label },
    { key: 'confirmed', label: TERMS.confirmed.label },
    { key: 'received', label: TERMS.received.label },
    // Same state names as the calendar
    { key: 'notConfirmed', label: 'Nefinalizat' },
    { key: 'stillToCome', label: 'Viitor' },
    { key: 'cancelled', label: 'Anulat' }
  ]

  const numberCell = { fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' } as const

  return (
    <Card>
      <CardHeader
        title={timeseries ? UNIT_TITLES[timeseries.granularity] : 'Venituri'}
        subheader={summary}
        subheaderTypographyProps={{ sx: { mt: 1, color: 'text.secondary' } }}
        action={
          <ToggleButtonGroup
            exclusive
            size='small'
            value={view}
            onChange={handleViewChange}
            aria-label='Mod de afișare'
          >
            <TooltipToggleButton value='chart' title='Grafic'>
              <Icon icon='tabler:chart-bar' fontSize={18} />
            </TooltipToggleButton>
            <TooltipToggleButton value='table' title='Tabel'>
              <Icon icon='tabler:table' fontSize={18} />
            </TooltipToggleButton>
          </ToggleButtonGroup>
        }
      />
      <CardContent sx={{ pt: 0 }}>
        {error ? (
          <SectionError error={error} onRetry={onRetry} />
        ) : !timeseries ? (
          <Skeleton variant='rounded' height={CHART_HEIGHT + 80} />
        ) : (
          <Box sx={refetchSx(loading)}>
            {/* What each bar means, in words: the legend doubles as the explanation */}
            <Box
              component='ul'
              sx={{
                m: 0,
                mb: 5,
                p: 0,
                gap: 4,
                listStyle: 'none',
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }
              }}
            >
              {SERIES.map(key => (
                <Box component='li' key={key} sx={{ gap: 2, display: 'flex', alignItems: 'baseline' }}>
                  <Box sx={{ flexShrink: 0, transform: 'translateY(1px)' }}>
                    <LegendKey color={colors[key]} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 500, color: 'text.primary' }}>{TERMS[key].label}</Typography>
                    <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                      {TERMS[key].hint}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>

            {view === 'chart' ? (
              isEmpty ? (
                <Box
                  sx={{
                    gap: 2,
                    height: CHART_HEIGHT,
                    display: 'flex',
                    alignItems: 'center',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    color: 'text.secondary'
                  }}
                >
                  <Icon icon='tabler:calendar-off' fontSize={32} />
                  <Typography sx={{ color: 'text.secondary' }}>{summary}</Typography>
                </Box>
              ) : (
                <RechartsWrapper
                  role='img'
                  aria-label={`Grafic cu bare al veniturilor, în ${currency}. ${summary} Treci la tabel pentru toate sumele.`}
                >
                  <ResponsiveContainer
                    width='100%'
                    height={compact ? rows.length * COMPACT_ROW_HEIGHT + 32 : CHART_HEIGHT}
                  >
                    <BarChart
                      data={rows}
                      layout={compact ? 'vertical' : 'horizontal'}
                      barGap={2}
                      barCategoryGap='22%'
                      margin={{ top: 8, right: 4, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid vertical={compact} horizontal={!compact} stroke={theme.palette.divider} />
                      {compact ? (
                        <>
                          <XAxis
                            type='number'
                            tickLine={false}
                            axisLine={false}
                            allowDecimals={false}
                            tickFormatter={formatCompact}
                            tick={{ fill: theme.palette.text.secondary, fontSize: 13 }}
                          />
                          <YAxis
                            type='category'
                            dataKey='axisLabel'
                            width={48}
                            tickLine={false}
                            axisLine={{ stroke: theme.palette.divider }}
                            tick={{ fill: theme.palette.text.secondary, fontSize: 13 }}
                          />
                        </>
                      ) : (
                        <>
                          <XAxis
                            dataKey='axisLabel'
                            tickLine={false}
                            axisLine={{ stroke: theme.palette.divider }}
                            tick={{ fill: theme.palette.text.secondary, fontSize: 13 }}
                            interval='preserveStartEnd'
                            minTickGap={8}
                          />
                          <YAxis
                            width={44}
                            tickLine={false}
                            axisLine={false}
                            allowDecimals={false}
                            tickFormatter={formatCompact}
                            tick={{ fill: theme.palette.text.secondary, fontSize: 13 }}
                          />
                        </>
                      )}
                      <ChartTooltip
                        cursor={{ fill: theme.palette.action.hover }}
                        content={<IncomeTooltip colors={colors} currency={currency} />}
                      />
                      {SERIES.map(key => (
                        <Bar
                          key={key}
                          dataKey={key}
                          name={TERMS[key].label}
                          fill={colors[key]}
                          maxBarSize={compact ? 10 : 18}
                          radius={compact ? [0, 4, 4, 0] : [4, 4, 0, 0]}
                          isAnimationActive={false}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </RechartsWrapper>
              )
            ) : (
              <TableContainer>
                <Table size='small' aria-label={`${UNIT_TITLES[timeseries.granularity]}, în ${currency}`}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Perioadă</TableCell>
                      {tableColumns.map(column => (
                        <TableCell key={column.key} align='right'>
                          {column.label}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map(row => (
                      <TableRow key={row.key}>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.title}</TableCell>
                        {tableColumns.map(column => (
                          <TableCell key={column.key} align='right' sx={numberCell}>
                            {formatMoney(row[column.key], currency)}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                    <TableRow sx={{ '& .MuiTableCell-root': { fontWeight: 600, borderBottom: 0 } }}>
                      <TableCell>Total</TableCell>
                      {tableColumns.map(column => (
                        <TableCell key={column.key} align='right' sx={numberCell}>
                          {formatMoney(totals[column.key], currency)}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

export default IncomeChart
