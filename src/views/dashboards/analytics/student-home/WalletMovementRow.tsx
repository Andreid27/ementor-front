// ** MUI Imports
import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Types
import type { BankTransferPaymentDTO, WalletBalanceChangeDTO } from 'src/generated/profile-service'

// ** Custom Components Imports
import { formatRon, formatShortDate } from 'src/views/student-ui/format'
import { accentInk, toneInk } from 'src/views/student-ui/readableAccent'

export interface WalletMovement {
  key: string
  label: string
  icon: string
  kind: 'credit' | 'debit' | 'pending'

  /** Signed: positive adds to the balance. */
  amount: number
  caption: string

  /** The bank transfer behind it, when there is one to show in detail. */
  payment?: BankTransferPaymentDTO
}

const CHANGE_LABELS: Record<string, { label: string; icon: string }> = {
  PAYMENT_CONFIRMED: { label: 'Plată confirmată', icon: 'tabler:plus' },
  EVENT_CHARGE: { label: 'Ședință taxată', icon: 'tabler:minus' },
  ADMIN_ADJUSTMENT: { label: 'Ajustare de sold', icon: 'tabler:adjustments' }
}

const signed = (amount: number) => `${amount < 0 ? '−' : ''}${formatRon(amount)}`

export const movementFromChange = (
  change: WalletBalanceChangeDTO,
  index: number,
  withBalance = false
): WalletMovement => {
  const amount = change.amount ?? 0
  const kind = CHANGE_LABELS[change.changeType ?? ''] ?? { label: 'Modificare de sold', icon: 'tabler:arrows-diff' }
  const date = change.creation ? formatShortDate(change.creation) : ''
  const balance = withBalance && change.balanceAfter !== undefined ? `sold ${signed(change.balanceAfter)}` : ''

  return {
    key: change.id ?? `change-${index}`,
    label: kind.label,
    icon: kind.icon,
    kind: amount > 0 ? 'credit' : 'debit',
    amount,
    caption: [date, balance].filter(Boolean).join(' · '),

    // Same reference the full transactions table opens: the confirmed bank transfer.
    payment:
      change.referenceType === 'BANK_TRANSFER' && change.referenceId
        ? { id: change.referenceId, amount: change.amount, confirmedAt: change.creation }
        : undefined
  }
}

export const movementFromPending = (payment: BankTransferPaymentDTO, index: number): WalletMovement => ({
  key: payment.id ?? `pending-${index}`,
  label: 'Transfer bancar',
  icon: 'tabler:clock',
  kind: 'pending',
  amount: payment.amount ?? 0,
  caption: ['În verificare', payment.creation && formatShortDate(payment.creation)].filter(Boolean).join(' · '),
  payment: { id: payment.id, amount: payment.amount, confirmedAt: payment.confirmedAt }
})

/** The balance in words: what is owed, what is in credit, or that all is paid. */
export const WalletBalance = ({ balance }: { balance: number }) => {
  const theme = useTheme()
  const owes = balance < 0

  return (
    <Box sx={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', columnGap: 2 }}>
      <Typography
        sx={{
          fontWeight: 700,
          fontSize: '1.75rem',
          lineHeight: 1.1,
          color: owes ? toneInk(theme, theme.palette.warning.main) : 'text.primary'
        }}
      >
        {formatRon(balance)}
      </Typography>
      <Typography sx={{ color: 'text.secondary' }}>
        {owes ? 'de plată' : balance > 0 ? 'credit disponibil' : 'totul e achitat'}
      </Typography>
    </Box>
  )
}

interface WalletMovementRowProps {
  movement: WalletMovement
  first?: boolean
  onOpenPayment?: (payment: BankTransferPaymentDTO) => void
}

/** One line of the wallet: what happened, when, and by how much. Bank transfers open their details. */
const WalletMovementRow = ({ movement, first, onOpenPayment }: WalletMovementRowProps) => {
  const theme = useTheme()
  const opens = Boolean(movement.payment && onOpenPayment)

  const tint =
    movement.kind === 'credit'
      ? theme.palette.primary.main
      : movement.kind === 'pending'
      ? theme.palette.info.main
      : theme.palette.text.primary

  const amountColor =
    movement.kind === 'credit'
      ? accentInk(theme)
      : movement.kind === 'pending'
      ? toneInk(theme, theme.palette.info.main)
      : 'text.primary'

  const content = (
    <>
      <Box
        aria-hidden
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 32,
          height: 32,
          flexShrink: 0,
          borderRadius: '10px',
          color: movement.kind === 'debit' ? 'text.secondary' : toneInk(theme, tint),
          bgcolor: alpha(tint, movement.kind === 'debit' ? 0.06 : theme.palette.mode === 'light' ? 0.12 : 0.16)
        }}
      >
        <Icon icon={movement.icon} fontSize='1rem' />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
        <Typography variant='body2' sx={{ fontWeight: 500, color: 'text.primary' }}>
          {movement.label}
        </Typography>
        {movement.caption && (
          <Typography variant='caption' sx={{ color: 'text.secondary' }}>
            {movement.caption}
          </Typography>
        )}
      </Box>
      {/* The sign carries the direction; colour only repeats it. */}
      <Typography variant='body2' sx={{ fontWeight: 600, whiteSpace: 'nowrap', color: amountColor }}>
        {movement.amount > 0 ? '+' : movement.amount < 0 ? '−' : ''}
        {formatRon(movement.amount)}
      </Typography>
      {opens && (
        <Icon icon='tabler:chevron-right' fontSize='1.125rem' color={theme.palette.text.secondary} aria-hidden />
      )}
    </>
  )

  const rowSx = { display: 'flex', alignItems: 'center', gap: 3, py: 2.5 }

  return (
    <Box component='li' sx={{ listStyle: 'none', borderTop: first ? 'none' : `1px solid ${theme.palette.divider}` }}>
      {opens ? (
        // The hover wash reaches a little past the text, so the row reads as one target.
        <ButtonBase
          onClick={() => movement.payment && onOpenPayment?.(movement.payment)}
          aria-label={`${movement.label}, ${movement.caption}, ${formatRon(movement.amount)}. Vezi detaliile plății`}
          sx={{
            ...rowSx,
            width: 'calc(100% + 16px)',
            mx: -2,
            px: 2,
            borderRadius: '10px',
            '&:hover, &.Mui-focusVisible': { bgcolor: alpha(theme.palette.text.primary, 0.04) }
          }}
        >
          {content}
        </ButtonBase>
      ) : (
        <Box sx={rowSx}>{content}</Box>
      )}
    </Box>
  )
}

export default WalletMovementRow
