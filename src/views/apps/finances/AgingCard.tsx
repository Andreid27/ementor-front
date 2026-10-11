// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Divider from '@mui/material/Divider'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import ButtonBase from '@mui/material/ButtonBase'

// ** Custom Component Imports
import Icon from 'src/@core/components/icon'

// ** Types
import type { FinanceAgingDTO, FinanceStudentRefDTO } from 'src/generated/profile-service-client/api'

// ** Local Imports
import { LegendKey, SectionError, StudentIdentity, refetchSx } from './FinanceParts'
import { FinanceColors, formatAmount, formatCount, formatDay } from './financeUtils'

interface AgingCardProps {
  aging: FinanceAgingDTO | null
  loading: boolean
  error: unknown
  onRetry: () => void
  colors: FinanceColors
  onSelectStudent: (student: FinanceStudentRefDTO) => void
}

// The server labels buckets in English; the keys are stable, so the words are set here
const AGE_LABELS: Record<string, string> = {
  '0-30': '0–30 de zile',
  '31-60': '31–60 de zile',
  '61-90': '61–90 de zile',
  '90+': 'Peste 90 de zile'
}

const AgingCard = ({ aging, loading, error, onRetry, colors, onSelectStudent }: AgingCardProps) => {
  const currency = aging?.currency ?? ''
  const total = aging?.totalOutstanding ?? 0

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader
        title='Restanțe după Vechime'
        subheader={aging ? `Situația de azi · elevii activi datorează ${formatAmount(total, currency)}` : ' '}
        subheaderTypographyProps={{ sx: { mt: 1, color: 'text.secondary' } }}
      />
      <CardContent sx={{ pt: 0 }}>
        {error ? (
          <SectionError error={error} onRetry={onRetry} />
        ) : !aging ? (
          <Skeleton variant='rounded' height={220} />
        ) : total === 0 ? (
          <Box sx={{ py: 8, gap: 2, display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
            <Icon icon='tabler:circle-check' fontSize={32} />
            <Typography sx={{ color: 'text.secondary' }}>Niciun elev activ nu are restanțe acum.</Typography>
          </Box>
        ) : (
          <Box sx={refetchSx(loading)}>
            {/* Share of the unpaid amount per age; decorative, the legend below carries the same numbers as text */}
            <Box aria-hidden sx={{ mb: 5, height: 10, gap: '2px', display: 'flex' }}>
              {aging.buckets
                .filter(bucket => bucket.amount > 0)
                .map(bucket => {
                  const index = aging.buckets.indexOf(bucket)

                  return (
                    <Box
                      key={bucket.key}
                      sx={{
                        minWidth: 4,
                        flexBasis: 0,
                        flexGrow: bucket.amount,
                        borderRadius: 1,
                        bgcolor: colors.aging[index]
                      }}
                    />
                  )
                })}
            </Box>

            <Grid container spacing={4}>
              {aging.buckets.map((bucket, index) => (
                <Grid item xs={6} key={bucket.key}>
                  <Box sx={{ mb: 1, gap: 2, display: 'flex', alignItems: 'center' }}>
                    <LegendKey color={colors.aging[index]} />
                    <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                      {AGE_LABELS[bucket.key] ?? bucket.label}
                    </Typography>
                  </Box>
                  <Typography variant='h6'>{formatAmount(bucket.amount, currency)}</Typography>
                  <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                    {bucket.amount > 0
                      ? `${formatCount(bucket.studentsCount, 'elev', 'elevi')} · ${formatCount(
                          bucket.sessionsCount,
                          'ședință',
                          'ședințe'
                        )}`
                      : 'Nimic'}
                  </Typography>
                </Grid>
              ))}
            </Grid>

            {aging.topStudents.length > 0 && (
              <>
                <Divider sx={{ my: 5 }} />
                <Typography variant='body2' sx={{ mb: 2, fontWeight: 500, color: 'text.secondary' }}>
                  Cele mai mari restanțe
                </Typography>
                {aging.topStudents.map(row => (
                  <ButtonBase
                    key={row.student.studentId}
                    onClick={() => onSelectStudent(row.student)}
                    sx={{
                      px: 2,
                      py: 2,
                      mx: -2,
                      gap: 3,
                      width: 'calc(100% + 16px)',
                      display: 'flex',
                      borderRadius: 1,
                      textAlign: 'left',
                      justifyContent: 'space-between',
                      '&:hover, &.Mui-focusVisible': { bgcolor: 'action.hover' }
                    }}
                  >
                    <StudentIdentity
                      student={row.student}
                      detail={`${formatCount(
                        row.unpaidSessions,
                        'ședință neplătită',
                        'ședințe neplătite'
                      )} · din ${formatDay(row.oldestUnpaidSessionDate)}`}
                    />
                    <Typography sx={{ fontWeight: 500, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
                      {formatAmount(row.outstanding, currency)}
                    </Typography>
                  </ButtonBase>
                ))}
              </>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

export default AgingCard
