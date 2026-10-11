// ** Next Import
import Link from 'next/link'

// ** MUI Imports
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import AlertTitle from '@mui/material/AlertTitle'

// ** Custom Component Imports
import Icon from 'src/@core/components/icon'

// ** Types
import type { FinanceOverviewDTO } from 'src/generated/profile-service-client/api'

// ** Local Imports
import { readableAlertSx } from './FinanceParts'
import { formatAmount, formatCount } from './financeUtils'

interface AttentionStripProps {
  overview: FinanceOverviewDTO | null
}

export const hasAttentionItems = (overview: FinanceOverviewDTO | null): boolean =>
  Boolean(overview && (overview.current.sessionsAwaitingCompletion > 0 || overview.pendingPaymentsCount > 0))

// On a phone the action drops below the text instead of squeezing it into a narrow column
const compactActionSx = {
  flexWrap: { xs: 'wrap', sm: 'nowrap' },
  '& .MuiAlert-message': { flex: { xs: '1 1 0', sm: 'initial' } },
  '& .MuiAlert-action': { width: { xs: '100%', sm: 'auto' }, ml: { xs: 0, sm: 'auto' }, pl: { xs: 0, sm: 4 } }
} as const

// Things the professor can act on right now. Renders nothing when there are none.
const AttentionStrip = ({ overview }: AttentionStripProps) => {
  if (!overview || !hasAttentionItems(overview)) return null

  const { current, currency, pendingPaymentsCount, pendingPaymentsAmount } = overview
  const awaiting = current.sessionsAwaitingCompletion

  return (
    <Box
      sx={{
        gap: 4,
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: awaiting && pendingPaymentsCount ? '1fr 1fr' : '1fr' }
      }}
    >
      {awaiting > 0 && (
        <Alert
          severity='warning'
          sx={{ ...readableAlertSx('warning'), ...compactActionSx }}
          icon={<Icon icon='tabler:calendar-exclamation' />}
          action={
            <Button
              component={Link}
              href='/apps/calendar'
              variant='outlined'
              color='inherit'
              size='small'
              sx={{ whiteSpace: 'nowrap' }}
            >
              Open Calendar
            </Button>
          }
        >
          <AlertTitle>{`${formatCount(awaiting, 'past session')} not confirmed`}</AlertTitle>
          {`Mark ${awaiting === 1 ? 'it' : 'them'} complete in the calendar to confirm ${formatAmount(
            current.awaitingCompletion,
            currency
          )}.`}
        </Alert>
      )}
      {pendingPaymentsCount > 0 && (
        <Alert
          severity='info'
          sx={{ ...readableAlertSx('info'), ...compactActionSx }}
          icon={<Icon icon='tabler:cash' />}
          action={
            <Button
              component={Link}
              href='/acl'
              variant='outlined'
              color='inherit'
              size='small'
              sx={{ whiteSpace: 'nowrap' }}
            >
              Review Payments
            </Button>
          }
        >
          <AlertTitle>{`${formatCount(pendingPaymentsCount, 'payment')} waiting for you`}</AlertTitle>
          {`Confirm ${pendingPaymentsCount === 1 ? 'it' : 'them'} to count ${formatAmount(
            pendingPaymentsAmount,
            currency
          )} as received.`}
        </Alert>
      )}
    </Box>
  )
}

export default AttentionStrip
