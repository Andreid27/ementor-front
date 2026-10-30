// ** React Imports
import { useId } from 'react'

// ** Next Import
import Link from 'next/link'

// ** MUI Imports
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import SwipeableDrawer from '@mui/material/SwipeableDrawer'
import useMediaQuery from '@mui/material/useMediaQuery'
import { alpha, useTheme } from '@mui/material/styles'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Types
import type { BankTransferPaymentDTO, WalletSummaryDTO } from 'src/generated/profile-service'

// ** Custom Components Imports
import WalletMovementRow, { movementFromChange, movementFromPending, WalletBalance } from './WalletMovementRow'
import { countLabel } from 'src/views/student-ui/countLabel'
import { formatRon } from 'src/views/student-ui/format'
import { accentButtonSx } from 'src/views/student-ui/readableAccent'

const monthLabel = (iso: string) => {
  const label = new Date(iso).toLocaleDateString('ro-RO', { month: 'long', year: 'numeric' })

  return label.charAt(0).toUpperCase() + label.slice(1)
}

const SectionLabel = ({ children }: { children: string }) => (
  <Typography
    component='h3'
    sx={{
      mt: 6,
      mb: 1,
      fontSize: '0.75rem',
      fontWeight: 700,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: 'text.secondary'
    }}
  >
    {children}
  </Typography>
)

interface WalletHistorySheetProps {
  open: boolean
  onClose: () => void
  summary: WalletSummaryDTO
  onOpenPayment: (payment: BankTransferPaymentDTO) => void
}

/**
 * Every wallet movement, newest first and grouped by month, with the balance
 * after each one. A side panel on wide screens; on phones a sheet from the
 * bottom that can be swiped away.
 */
const WalletHistorySheet = ({ open, onClose, summary, onOpenPayment }: WalletHistorySheetProps) => {
  const theme = useTheme()
  const isPhone = useMediaQuery(theme.breakpoints.down('sm'))
  const titleId = useId()

  const balance = summary.wallet?.balance ?? 0
  const pending = (summary.pendingBankTransferPayments ?? []).map(movementFromPending)

  const changes = [...(summary.balanceChanges ?? [])].sort(
    (a, b) => new Date(b.creation ?? 0).getTime() - new Date(a.creation ?? 0).getTime()
  )

  const months: { label: string; rows: ReturnType<typeof movementFromChange>[] }[] = []
  changes.forEach((change, index) => {
    const label = change.creation ? monthLabel(change.creation) : 'Fără dată'
    const movement = movementFromChange(change, index, true)
    const last = months[months.length - 1]
    if (last?.label === label) last.rows.push(movement)
    else months.push({ label, rows: [movement] })
  })

  return (
    <SwipeableDrawer
      anchor={isPhone ? 'bottom' : 'right'}
      open={open}
      onClose={onClose}
      onOpen={() => undefined}
      disableSwipeToOpen
      PaperProps={{
        role: 'dialog',
        'aria-modal': true,
        'aria-labelledby': titleId,
        sx: {
          width: { xs: '100%', sm: 440 },
          maxHeight: { xs: '90vh', sm: '100%' },
          borderRadius: { xs: '16px 16px 0 0', sm: 0 },
          display: 'flex',
          flexDirection: 'column'
        }
      }}
    >
      {isPhone && (
        <Box
          aria-hidden
          sx={{
            width: 40,
            height: 5,
            borderRadius: 3,
            mx: 'auto',
            mt: 2,
            bgcolor: alpha(theme.palette.text.primary, 0.2)
          }}
        />
      )}

      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 2,
          px: { xs: 5, sm: 6 },
          pt: { xs: 3, sm: 6 },
          pb: 4,
          borderBottom: `1px solid ${theme.palette.divider}`
        }}
      >
        <Box>
          <Typography id={titleId} component='h2' sx={{ fontWeight: 700, fontSize: '1.25rem', color: 'text.primary' }}>
            Istoric plăți
          </Typography>
          <Typography variant='body2' sx={{ mt: 0.5, color: 'text.secondary' }}>
            {countLabel(changes.length + pending.length, 'o mișcare', 'mișcări')}, cele mai noi primele
          </Typography>
        </Box>
        <IconButton onClick={onClose} aria-label='Închide istoricul' sx={{ mr: -2, mt: -1 }}>
          <Icon icon='tabler:x' fontSize='1.25rem' />
        </IconButton>
      </Box>

      <Box sx={{ flex: 1, overflowY: 'auto', px: { xs: 5, sm: 6 }, pt: 5, pb: 6 }}>
        <WalletBalance balance={balance} />

        {pending.length > 0 && (
          <>
            <SectionLabel>În verificare</SectionLabel>
            <Box component='ul' sx={{ m: 0, p: 0 }}>
              {pending.map((movement, index) => (
                <WalletMovementRow
                  key={movement.key}
                  movement={movement}
                  first={index === 0}
                  onOpenPayment={onOpenPayment}
                />
              ))}
            </Box>
          </>
        )}

        {months.map(month => (
          <Box key={month.label} component='section'>
            <SectionLabel>{month.label}</SectionLabel>
            <Box component='ul' sx={{ m: 0, p: 0 }}>
              {month.rows.map((movement, index) => (
                <WalletMovementRow
                  key={movement.key}
                  movement={movement}
                  first={index === 0}
                  onOpenPayment={onOpenPayment}
                />
              ))}
            </Box>
          </Box>
        ))}

        {changes.length === 0 && pending.length === 0 && (
          <Typography variant='body2' sx={{ mt: 5, color: 'text.secondary' }}>
            Nicio mișcare încă.
          </Typography>
        )}
      </Box>

      {balance < 0 && pending.length === 0 && (
        <Box sx={{ px: { xs: 5, sm: 6 }, py: 4, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Button
            variant='contained'
            component={Link}
            href='/payment-process'
            fullWidth
            sx={{ ...accentButtonSx, width: '100%' }}
          >
            Plătește {formatRon(balance)}
          </Button>
        </Box>
      )}
    </SwipeableDrawer>
  )
}

export default WalletHistorySheet
