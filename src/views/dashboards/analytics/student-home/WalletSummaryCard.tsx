// ** React Imports
import { useState } from 'react'

// ** Next Import
import Link from 'next/link'

// ** MUI Imports
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'

// ** Types
import type { BankTransferPaymentDTO, WalletSummaryDTO } from 'src/generated/profile-service'

// ** Custom Components Imports
import InsightCard from 'src/views/student-ui/InsightCard'
import StatusPill from 'src/views/student-ui/StatusPill'
import PaymentDetailCard from 'src/pages/acl/components/PaymentDetailCard'
import WalletHistorySheet from './WalletHistorySheet'
import WalletMovementRow, { movementFromChange, WalletBalance } from './WalletMovementRow'
import { formatRon } from 'src/views/student-ui/format'
import { accentButtonSx, accentInk } from 'src/views/student-ui/readableAccent'

const RECENT_SHOWN = 3

/**
 * The dashboard's view of the wallet: what the student owes or has in credit,
 * in words, and the last few movements. "Vezi tot istoricul" opens every
 * movement in a panel, and bank transfers open their details, as they do in
 * the full transactions table.
 */
const WalletSummaryCard = ({ summary }: { summary: WalletSummaryDTO }) => {
  const [historyOpen, setHistoryOpen] = useState(false)
  const [payment, setPayment] = useState<BankTransferPaymentDTO | null>(null)

  const balance = summary.wallet?.balance ?? 0
  const pending = summary.pendingBankTransferPayments ?? []
  const pendingTotal = pending.reduce((sum, item) => sum + (item.amount ?? 0), 0)

  const changes = [...(summary.balanceChanges ?? [])].sort(
    (a, b) => new Date(b.creation ?? 0).getTime() - new Date(a.creation ?? 0).getTime()
  )
  const recent = changes.slice(0, RECENT_SHOWN).map((change, index) => movementFromChange(change, index))
  const movementCount = changes.length + pending.length
  const canPay = balance < 0 && pending.length === 0

  const historyButton = (
    <Button
      variant={canPay ? 'text' : 'outlined'}
      onClick={() => setHistoryOpen(true)}
      sx={{
        minHeight: 44,
        px: canPay ? 3 : 5,
        fontWeight: 600,
        color: accentInk,
        width: { xs: '100%', sm: 'auto' },
        ...(!canPay && { borderColor: 'divider', '&:hover': { borderColor: accentInk } })
      }}
    >
      Vezi tot istoricul
    </Button>
  )

  return (
    <>
      <InsightCard title='Plăți' subtitle='Soldul și ultimele mișcări'>
        <WalletBalance balance={balance} />

        {pending.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <StatusPill tone='info' icon='tabler:clock'>
              Transfer în verificare: {formatRon(pendingTotal)}
            </StatusPill>
          </Box>
        )}

        {recent.length > 0 && (
          <Box component='ul' sx={{ m: 0, p: 0, mt: 4 }}>
            {recent.map((movement, index) => (
              <WalletMovementRow
                key={movement.key}
                movement={movement}
                first={index === 0}
                onOpenPayment={setPayment}
              />
            ))}
          </Box>
        )}

        <Box sx={{ mt: 'auto', pt: 5, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {canPay && (
            <Button variant='contained' component={Link} href='/payment-process' sx={accentButtonSx}>
              Plătește {formatRon(balance)}
            </Button>
          )}
          {movementCount > 0 && historyButton}
        </Box>
      </InsightCard>

      <WalletHistorySheet
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        summary={summary}
        onOpenPayment={setPayment}
      />

      {payment && (
        <PaymentDetailCard
          payment={payment}
          onClose={() => setPayment(null)}
          getUserName={() => 'Student'}
          getUserAvatar={() => null}
          userRole='student'
        />
      )}
    </>
  )
}

export default WalletSummaryCard
