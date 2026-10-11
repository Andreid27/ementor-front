// ** React Imports
import { MouseEvent, useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'

// ** Custom Component Imports
import Icon from 'src/@core/components/icon'

// ** API
import { profileServiceClient } from 'src/generated/profile-service-client'

// ** Types
import type { GetFinanceBreakdownByEnum } from 'src/generated/profile-service-client/api'

// ** Local Imports
import useFinanceQuery from './useFinanceQuery'
import { SectionError, refetchSx } from './FinanceParts'
import {
  FinanceColors,
  FinancePeriod,
  formatAmount,
  formatCount,
  formatMoney,
  formatPercent,
  periodPhrase
} from './financeUtils'

interface BreakdownCardProps {
  period: FinancePeriod
  refreshKey: number
  colors: FinanceColors
}

const DIMENSIONS: { value: GetFinanceBreakdownByEnum; label: string }[] = [
  { value: 'PRICE', label: 'Preț' },
  { value: 'EVENT_TYPE', label: 'Tip' },
  { value: 'SERIES', label: 'Serie' }
]

// The server labels rows in English; the keys are stable, so the words are set here. Series rows keep the
// title the professor gave the series; one-off events use the calendar filter's name.
const rowLabel = (by: GetFinanceBreakdownByEnum, row: { key: string; label: string }, currency: string): string => {
  if (by === 'PRICE') return formatMoney(Number(row.key), currency)
  if (row.key === 'ONE_TO_ONE') return '1:1 (un elev)'
  if (row.key === 'GROUP') return 'Grup (2+ elevi)'
  if (row.key === 'SINGULAR') return 'Evenimente individuale'

  return row.label
}

const VISIBLE_ROWS = 6

const BreakdownCard = ({ period, refreshKey, colors }: BreakdownCardProps) => {
  // ** State
  const [by, setBy] = useState<GetFinanceBreakdownByEnum>('PRICE')
  const [showAll, setShowAll] = useState(false)

  const { data, loading, error, reload } = useFinanceQuery(
    () => profileServiceClient.finance.getFinanceBreakdown({ from: period.from, to: period.to, by }).then(r => r.data),
    [period.from, period.to, by, refreshKey]
  )

  const currency = data?.currency ?? ''
  const rows = data?.rows ?? []
  const visibleRows = showAll ? rows : rows.slice(0, VISIBLE_ROWS)

  const handleByChange = (_event: MouseEvent<HTMLElement>, next: GetFinanceBreakdownByEnum | null) => {
    if (!next) return
    setBy(next)
    setShowAll(false)
  }

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader
        title='Venit Finalizat pe Surse'
        subheader={data ? `Finalizat ${periodPhrase(period)}: ${formatAmount(data.totalEarned, currency)}` : ' '}
        subheaderTypographyProps={{ sx: { mt: 1, color: 'text.secondary' } }}
        action={
          <ToggleButtonGroup
            exclusive
            size='small'
            value={by}
            onChange={handleByChange}
            aria-label='Grupează venitul finalizat după'
          >
            {DIMENSIONS.map(dimension => (
              <ToggleButton key={dimension.value} value={dimension.value} sx={{ px: 3, textTransform: 'none' }}>
                {dimension.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        }
        sx={{ flexWrap: 'wrap', rowGap: 3, '& .MuiCardHeader-action': { m: 0 } }}
      />
      <CardContent sx={{ pt: 0 }}>
        {error ? (
          <SectionError error={error} onRetry={reload} />
        ) : !data ? (
          <Skeleton variant='rounded' height={220} />
        ) : rows.length === 0 ? (
          <Box sx={{ py: 8, gap: 2, display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
            <Icon icon='tabler:receipt-off' fontSize={32} />
            <Typography sx={{ color: 'text.secondary' }}>{`Nicio ședință finalizată ${periodPhrase(
              period
            )}.`}</Typography>
          </Box>
        ) : (
          <Box component='ul' sx={{ m: 0, p: 0, listStyle: 'none', ...refetchSx(loading) }}>
            {visibleRows.map(row => (
              <Box component='li' key={row.key} sx={{ '&:not(:last-of-type)': { mb: 4.5 } }}>
                <Box sx={{ mb: 1.5, gap: 4, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                  <Typography noWrap sx={{ fontWeight: 500, color: 'text.primary' }}>
                    {rowLabel(data.by, row, currency)}
                  </Typography>
                  <Typography sx={{ fontWeight: 500, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
                    {formatAmount(row.earned, currency)}
                  </Typography>
                </Box>
                {/* Bar length is the share of earnings; the numbers around it carry the same information */}
                <Box aria-hidden sx={{ height: 8, borderRadius: 1, bgcolor: 'action.hover' }}>
                  <Box
                    sx={{
                      height: '100%',
                      minWidth: 4,
                      width: `${row.shareOfEarned * 100}%`,
                      bgcolor: colors.confirmed,
                      borderRadius: '0 4px 4px 0'
                    }}
                  />
                </Box>
                <Typography variant='body2' sx={{ mt: 1.5, color: 'text.secondary' }}>
                  {[
                    formatPercent(row.shareOfEarned),
                    formatCount(row.billedAttendances, 'ședință', 'ședințe'),
                    formatCount(row.students, 'elev', 'elevi'),
                    row.outstanding > 0 ? `${formatAmount(row.outstanding, currency)} restanțe` : null
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </Typography>
              </Box>
            ))}
            {rows.length > VISIBLE_ROWS && (
              <Box component='li' sx={{ mt: 3 }}>
                <Button size='small' onClick={() => setShowAll(value => !value)}>
                  {showAll ? 'Arată Mai Puțin' : `Arată Toate (${rows.length})`}
                </Button>
              </Box>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

export default BreakdownCard
