// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Alert from '@mui/material/Alert'
import Drawer from '@mui/material/Drawer'
import Divider from '@mui/material/Divider'
import Skeleton from '@mui/material/Skeleton'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'

// ** Custom Component Imports
import Icon from 'src/@core/components/icon'
import CustomAvatar from 'src/@core/components/mui/avatar'

// ** API
import { profileServiceClient } from 'src/generated/profile-service-client'

// ** Types
import type { FinanceLedgerEntryDTO, FinanceStudentRefDTO } from 'src/generated/profile-service-client/api'

// ** Local Imports
import useFinanceQuery from './useFinanceQuery'
import { PaymentStatusChip } from './PaymentsTable'
import { SectionError, StatusChip, StudentIdentity, readableAlertSx, refetchSx } from './FinanceParts'
import {
  FinancePeriod,
  formatAmount,
  formatCount,
  formatDateTime,
  formatInstantDay,
  formatMoney,
  periodLabel,
  periodPhrase
} from './financeUtils'

interface LedgerDrawerProps {
  student: FinanceStudentRefDTO | null
  period: FinancePeriod
  refreshKey: number
  onClose: () => void
}

// Balance is payments minus confirmed sessions: below zero the student owes, above zero they paid in advance
const balanceText = (balance: number, currency: string): string => {
  if (balance < 0) return `Datorează ${formatAmount(-balance, currency)}`
  if (balance > 0) return `Avans de ${formatAmount(balance, currency)}`

  return 'Achitat'
}

const signedMoney = (amount: number, currency: string): string =>
  `${amount > 0 ? '+' : amount < 0 ? '−' : ''}${formatMoney(Math.abs(amount), currency)}`

const MAX_ALLOCATIONS = 3

const SessionState = ({ entry, currency }: { entry: FinanceLedgerEntryDTO; currency: string }) => {
  const unpaid = entry.sessionUnpaidAmount ?? 0
  const paid = entry.sessionPaidAmount ?? 0

  if (unpaid === 0) return <StatusChip color='success' icon='tabler:check' label='Plătit' />
  if (paid === 0) return <StatusChip color='error' icon='tabler:alert-circle' label='Neplătit' />

  return (
    <StatusChip
      color='warning'
      icon='tabler:progress'
      label={`Plătit parțial · rest ${formatAmount(unpaid, currency)}`}
    />
  )
}

const LedgerEntry = ({ entry, currency }: { entry: FinanceLedgerEntryDTO; currency: string }) => {
  const isSession = entry.type === 'SESSION_CHARGE'
  const allocations = entry.allocatedToSessions ?? []

  return (
    <Box component='li' sx={{ py: 4, gap: 3, display: 'flex' }}>
      <CustomAvatar skin='light' color='secondary' variant='rounded' sx={{ width: 34, height: 34, flexShrink: 0 }}>
        <Icon icon={isSession ? 'tabler:calendar-event' : 'tabler:cash'} fontSize={20} />
      </CustomAvatar>
      <Box sx={{ minWidth: 0, flexGrow: 1 }}>
        <Box sx={{ gap: 3, display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography noWrap sx={{ fontWeight: 500, color: 'text.primary' }}>
              {isSession ? entry.sessionTitle || 'Ședință' : 'Plată'}
            </Typography>
            <Typography variant='body2' sx={{ color: 'text.secondary' }}>
              {isSession
                ? formatDateTime(entry.date)
                : [formatDateTime(entry.date), entry.paymentReferenceCode].filter(Boolean).join(' · ')}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
            <Typography
              sx={{
                fontWeight: 600,
                fontVariantNumeric: 'tabular-nums',
                color: entry.affectsBalance ? 'text.primary' : 'text.secondary'
              }}
            >
              {signedMoney(entry.amount, currency)}
            </Typography>
            <Typography variant='caption' sx={{ color: 'text.secondary' }}>
              {entry.affectsBalance ? balanceText(entry.runningBalance, currency) : 'Neinclus'}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mt: 2, gap: 2, display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
          {isSession ? (
            <SessionState entry={entry} currency={currency} />
          ) : (
            entry.paymentStatus && <PaymentStatusChip status={entry.paymentStatus} />
          )}
          {!isSession && entry.paymentStatus === 'PENDING' && (
            <Typography variant='caption' sx={{ color: 'text.secondary' }}>
              Intră la Încasat după ce o confirmi
            </Typography>
          )}
        </Box>

        {allocations.length > 0 && (
          <Box component='ul' sx={{ mt: 2, mb: 0, pl: 0, listStyle: 'none' }}>
            {allocations.slice(0, MAX_ALLOCATIONS).map(allocation => (
              <Typography
                component='li'
                variant='body2'
                key={allocation.eventAttendeeId}
                sx={{ color: 'text.secondary' }}
              >
                {`Pentru ${allocation.sessionTitle || 'o ședință'} din ${formatInstantDay(
                  allocation.sessionDate
                )} · ${formatMoney(allocation.amount, currency)}`}
              </Typography>
            ))}
            {allocations.length > MAX_ALLOCATIONS && (
              <Typography component='li' variant='body2' sx={{ color: 'text.secondary' }}>
                {`și încă ${formatCount(allocations.length - MAX_ALLOCATIONS, 'ședință', 'ședințe')}`}
              </Typography>
            )}
          </Box>
        )}
        {(entry.paymentSurplus ?? 0) > 0 && (
          <Typography variant='body2' sx={{ mt: 1, color: 'text.secondary' }}>
            {`Rest de ${formatMoney(entry.paymentSurplus, currency)} pentru ședințe viitoare`}
          </Typography>
        )}
      </Box>
    </Box>
  )
}

const LedgerDrawer = ({ student, period, refreshKey, onClose }: LedgerDrawerProps) => {
  const { data, loading, error, reload } = useFinanceQuery(
    () =>
      student
        ? profileServiceClient.finance
            .getFinanceStudentLedger({ studentId: student.studentId, from: period.from, to: period.to })
            .then(r => r.data)
        : Promise.resolve(null),
    [student?.studentId, period.from, period.to, refreshKey]
  )

  // A ledger for another student must never show while the new one loads
  const ledger = data && student && data.student.studentId === student.studentId ? data : null
  const currency = ledger?.currency ?? ''
  const notFound = (error as any)?.response?.status === 404

  const summary = ledger
    ? [
        { label: 'Sold la început', value: balanceText(ledger.openingBalance, currency) },
        { label: 'Ședințe finalizate', value: formatAmount(ledger.totalCharged, currency) },
        { label: 'Plăți încasate', value: formatAmount(ledger.totalPaid, currency) },
        { label: 'Sold la final', value: balanceText(ledger.closingBalance, currency) }
      ]
    : []

  return (
    <Drawer
      anchor='right'
      open={Boolean(student)}
      onClose={onClose}
      ModalProps={{ keepMounted: false }}
      PaperProps={{ sx: { width: { xs: '100%', sm: 540 } }, 'aria-label': 'Fișa financiară a elevului' } as any}
    >
      {student && (
        <>
          <Box sx={{ p: 6, gap: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <StudentIdentity student={student} detail={periodLabel(period)} size={44} />
            <IconButton aria-label='Închide' onClick={onClose}>
              <Icon icon='tabler:x' fontSize={20} />
            </IconButton>
          </Box>
          <Divider />
          <Box sx={{ p: 6 }}>
            {error ? (
              notFound ? (
                <Alert severity='info' sx={readableAlertSx('info')}>
                  Acest elev nu are ședințe sau plăți cu tine.
                </Alert>
              ) : (
                <SectionError error={error} onRetry={reload} />
              )
            ) : !ledger ? (
              <>
                <Skeleton variant='rounded' height={96} sx={{ mb: 6 }} />
                <Skeleton variant='rounded' height={260} />
              </>
            ) : (
              <Box sx={refetchSx(loading)}>
                <Grid container spacing={4}>
                  {summary.map(item => (
                    <Grid item xs={6} key={item.label}>
                      <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                        {item.label}
                      </Typography>
                      <Typography variant='h6'>{item.value}</Typography>
                    </Grid>
                  ))}
                </Grid>

                {ledger.outstanding > 0 && ledger.credit > 0 && (
                  <Alert severity='info' sx={{ mt: 5, ...readableAlertSx('info') }}>
                    {`O parte din plățile acestui elev (${formatAmount(
                      ledger.credit,
                      currency
                    )}) nu e încă alocată unei ședințe, așa că apare și un avans, și restanțe de ${formatAmount(
                      ledger.outstanding,
                      currency
                    )}.`}
                  </Alert>
                )}

                <Divider sx={{ mt: 5 }} />

                {ledger.entries.length === 0 ? (
                  <Typography sx={{ py: 8, textAlign: 'center', color: 'text.secondary' }}>
                    {`Nicio ședință și nicio plată ${periodPhrase(period)}.`}
                  </Typography>
                ) : (
                  <Box
                    component='ul'
                    sx={{ m: 0, p: 0, listStyle: 'none', '& > li + li': { borderTop: 1, borderColor: 'divider' } }}
                  >
                    {/* Newest first, like a bank statement; each entry still shows the balance right after it */}
                    {[...ledger.entries].reverse().map(entry => (
                      <LedgerEntry key={entry.id} entry={entry} currency={currency} />
                    ))}
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </>
      )}
    </Drawer>
  )
}

export default LedgerDrawer
