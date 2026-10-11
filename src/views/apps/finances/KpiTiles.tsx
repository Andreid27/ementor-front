// ** React Imports
import { ReactNode } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'

// ** Custom Component Imports
import Icon from 'src/@core/components/icon'

// ** Types
import type { FinanceOverviewDTO } from 'src/generated/profile-service-client/api'

// ** Local Imports
import { LegendKey, refetchSx } from './FinanceParts'
import {
  FinanceColors,
  FinancePeriod,
  TERMS,
  comparisonLabel,
  deltaOf,
  formatCount,
  formatDay,
  formatPercent,
  formatWhole,
  localDate,
  shouldEarnOf
} from './financeUtils'

interface KpiTilesProps {
  overview: FinanceOverviewDTO | null
  loading: boolean
  period: FinancePeriod
  colors: FinanceColors
}

interface TileProps {
  label: string
  legend: ReactNode
  value?: string

  // How this figure relates to the one before it, drawn as a thin bar with a caption
  share?: { fraction: number; color: string }
  relation?: string
  current?: number
  previous?: number
  higherIsBetter: boolean
  comparedTo: string
  detail?: string
  loading: boolean
}

const signedPercent = (fraction: number): string =>
  `${fraction > 0 ? '+' : '−'}${Math.abs(Math.round(fraction * 100))}%`

const KpiTile = ({
  label,
  legend,
  value,
  share,
  relation,
  current,
  previous,
  higherIsBetter,
  comparedTo,
  detail,
  loading
}: TileProps) => {
  const delta = current !== undefined && previous !== undefined ? deltaOf(current, previous) : null
  const isGood = delta && delta.direction !== 'flat' && (delta.direction === 'up') === higherIsBetter

  let comparison: ReactNode = null

  if (delta) {
    comparison = (
      <>
        <Box
          component='span'
          aria-hidden
          sx={{
            display: 'flex',
            color: delta.direction === 'flat' ? 'text.disabled' : isGood ? 'success.main' : 'error.main'
          }}
        >
          <Icon
            fontSize={16}
            icon={
              delta.direction === 'flat'
                ? 'tabler:minus'
                : delta.direction === 'up'
                ? 'tabler:arrow-up-right'
                : 'tabler:arrow-down-right'
            }
          />
        </Box>
        {delta.direction === 'flat' ? `Same as ${comparedTo}` : `${signedPercent(delta.fraction)} vs ${comparedTo}`}
      </>
    )
  } else if (current && !previous) {
    comparison = `Nothing in ${comparedTo}`
  }

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ height: '100%', p: { xs: 4, sm: 6 }, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ mb: 2, gap: 2, display: 'flex', alignItems: 'center' }}>
          {legend}
          <Typography sx={{ color: 'text.secondary' }}>{label}</Typography>
        </Box>
        {loading ? (
          <Skeleton variant='text' width='60%' sx={{ fontSize: '2rem' }} />
        ) : (
          <Typography variant='h4' sx={{ mb: 2, fontSize: { xs: '1.125rem', sm: '1.375rem' } }}>
            {value}
          </Typography>
        )}

        {/* Same height in every card, so the rows below line up across the four figures */}
        <Box sx={{ mb: 2, minHeight: 34 }}>
          {loading ? (
            <Skeleton variant='text' width='70%' />
          ) : (
            <>
              {share && (
                <Box aria-hidden sx={{ mb: 1.5, height: 4, borderRadius: 1, bgcolor: 'action.hover' }}>
                  <Box
                    sx={{
                      height: '100%',
                      borderRadius: 1,
                      bgcolor: share.color,
                      width: `${Math.min(100, Math.max(0, share.fraction * 100))}%`
                    }}
                  />
                </Box>
              )}
              <Typography variant='body2' sx={{ color: 'text.primary' }}>
                {relation}
              </Typography>
            </>
          )}
        </Box>

        <Typography
          variant='body2'
          sx={{ minHeight: 22, gap: 1, display: 'flex', alignItems: 'center', color: 'text.secondary' }}
        >
          {loading ? <Skeleton variant='text' width='45%' /> : comparison}
        </Typography>
        <Typography
          variant='body2'
          sx={{ mt: 'auto', pt: 2, color: 'text.secondary', display: { xs: 'none', sm: 'block' } }}
        >
          {loading ? <Skeleton variant='text' width='70%' /> : detail}
        </Typography>
      </CardContent>
    </Card>
  )
}

const KpiTiles = ({ overview, loading, period, colors }: KpiTilesProps) => {
  const firstLoad = loading && !overview
  const current = overview?.current
  const previous = overview?.previous
  const currency = overview?.currency ?? ''
  const comparedTo = previous ? comparisonLabel(period.preset, previous.periodStart, previous.periodEnd) : ''

  const shouldEarn = current ? shouldEarnOf(current) : undefined

  // Still owed is "as of the period's end"; for a period that hasn't ended yet that is simply today
  const periodEndsLater = current && overview ? current.periodEnd >= localDate(overview.generatedAt) : false

  const tiles: TileProps[] = [
    {
      label: TERMS.shouldEarn.label,
      legend: <LegendKey color={colors.shouldEarn} />,
      value: formatWhole(shouldEarn, currency),
      relation: current
        ? current.expected > 0
          ? `${formatWhole(current.expected, currency)} still to come`
          : 'All sessions are in the past'
        : undefined,
      current: shouldEarn,
      previous: previous ? shouldEarnOf(previous) : undefined,
      higherIsBetter: true,
      comparedTo,
      detail: current
        ? current.lost > 0
          ? `${formatWhole(current.lost, currency)} in cancelled sessions isn’t included`
          : 'Every scheduled session at each student’s price'
        : undefined,
      loading: firstLoad
    },
    {
      label: TERMS.confirmed.label,
      legend: <LegendKey color={colors.confirmed} />,
      value: formatWhole(current?.earned, currency),
      share: shouldEarn ? { fraction: (current?.earned ?? 0) / shouldEarn, color: colors.confirmed } : undefined,
      relation: shouldEarn ? `${formatPercent((current?.earned ?? 0) / shouldEarn)} of what you should earn` : '—',
      current: current?.earned,
      previous: previous?.earned,
      higherIsBetter: true,
      comparedTo,
      detail: current
        ? current.averagePricePerSession !== null
          ? `${formatCount(current.billedAttendances, 'session')} held · avg ${formatWhole(
              current.averagePricePerSession,
              currency
            )}`
          : 'No sessions confirmed yet'
        : undefined,
      loading: firstLoad
    },
    {
      label: TERMS.received.label,
      legend: <LegendKey color={colors.received} />,
      value: formatWhole(current?.collected, currency),
      share:
        current?.collectionRate !== null && current?.collectionRate !== undefined
          ? { fraction: current.collectionRate, color: colors.received }
          : undefined,
      relation:
        current?.collectionRate !== null && current?.collectionRate !== undefined
          ? `${formatPercent(current.collectionRate)} of confirmed`
          : 'Nothing confirmed yet',
      current: current?.collected,
      previous: previous?.collected,
      higherIsBetter: true,
      comparedTo,
      detail: overview
        ? overview.pendingPaymentsCount > 0
          ? `${formatWhole(overview.pendingPaymentsAmount, currency)} waiting for your confirmation`
          : TERMS.received.hint
        : undefined,
      loading: firstLoad
    },
    {
      label: TERMS.stillOwed.label,
      legend: <LegendKey color={colors.aging[2]} />,
      value: formatWhole(current?.outstanding, currency),
      relation: current
        ? periodEndsLater
          ? 'Owed by active students today'
          : `Owed by active students on ${formatDay(current.periodEnd)}`
        : undefined,
      current: current?.outstanding,
      previous: previous?.outstanding,
      higherIsBetter: false,
      comparedTo,
      detail: current
        ? current.credit > 0
          ? `${formatWhole(current.credit, currency)} paid in advance by students`
          : TERMS.stillOwed.hint
        : undefined,
      loading: firstLoad
    }
  ]

  return (
    <Grid container spacing={{ xs: 4, sm: 6 }} sx={refetchSx(loading && Boolean(overview))}>
      {tiles.map(tile => (
        <Grid item xs={6} lg={3} key={tile.label}>
          <KpiTile {...tile} />
        </Grid>
      ))}
    </Grid>
  )
}

export default KpiTiles
