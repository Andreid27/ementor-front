import React, { useEffect, useState, useRef, useCallback } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Slide from '@mui/material/Slide'
import LinearProgress from '@mui/material/LinearProgress'
import type { TransitionProps } from '@mui/material/transitions'
import { alpha, useTheme } from '@mui/material/styles'
import Icon from 'src/@core/components/icon'
import { useSelector } from 'react-redux'
import { selectWalletBalance, selectWalletLoading } from 'src/store/apps/wallet'
import { useRouter } from 'next/router'

const COOLDOWN_SECONDS = 30

const SlideTransition = React.forwardRef(function SlideTransition(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />
})

/**
 * Red warning modal shown on app initialisation (and after every refresh)
 * when the student's wallet balance is <= -1000 RON.
 *
 * The modal enforces a 30-second cooldown during which the student can only
 * navigate to the payment page. After the cooldown expires the "Continuă"
 * button becomes available.
 *
 * Does nothing if balance is null, 0, or > -1000.
 */
const StudentWalletWarningModal: React.FC = () => {
  const balance = useSelector(selectWalletBalance)
  const loading = useSelector(selectWalletLoading)
  const router = useRouter()
  const theme = useTheme()

  const [open, setOpen] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(COOLDOWN_SECONDS)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const cooldownDone = secondsLeft <= 0

  // Start the countdown when the modal opens
  const startCooldown = useCallback(() => {
    setSecondsLeft(COOLDOWN_SECONDS)

    if (timerRef.current) clearInterval(timerRef.current)

    timerRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          timerRef.current = null

          return 0
        }

        return prev - 1
      })
    }, 1000)
  }, [])

  // Show the modal once when balance loads and is critically low
  useEffect(() => {
    if (!loading && balance !== null && balance !== 0 && balance <= -1000) {
      setOpen(true)
      startCooldown()
    }
  }, [loading, balance, startCooldown])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const handleContinue = () => {
    if (!cooldownDone) return
    setOpen(false)
  }

  const handleGoToPayment = () => {
    setOpen(false)
    router.push('/payment-process')
  }

  // Progress bar value: 100 -> 0 as cooldown counts down
  const progressValue = (secondsLeft / COOLDOWN_SECONDS) * 100

  return (
    <Dialog
      open={open}
      TransitionComponent={SlideTransition}
      keepMounted
      // Block closing via backdrop / escape during cooldown
      onClose={cooldownDone ? handleContinue : undefined}
      maxWidth='sm'
      fullWidth
      PaperProps={{
        sx: {
          borderTop: '4px solid',
          borderColor: 'error.main',
          overflow: 'visible'
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2, pb: 1 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'error.main'
          }}
        >
          <Icon icon='mdi:alert-circle' color='white' fontSize={26} />
        </Box>
        <Typography variant='h6' sx={{ fontWeight: 700, color: 'error.main' }}>
          Sold critic
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Typography variant='body1' sx={{ mb: 2 }}>
          Soldul tău curent este de{' '}
          <Typography component='span' sx={{ fontWeight: 700, color: 'error.main' }}>
            {balance} RON
          </Typography>
          .
        </Typography>
        <Typography variant='body2' sx={{ color: 'text.secondary' }}>
          Te rugăm să efectuezi o plată cât mai curând posibil pentru a evita suspendarea
          accesului la platformă.
        </Typography>

        {/* Cooldown progress bar */}
        {!cooldownDone && (
          <Box sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                Poți continua în
              </Typography>
              <Typography
                variant='caption'
                sx={{
                  fontWeight: 700,
                  color: 'error.main',
                  fontVariantNumeric: 'tabular-nums'
                }}
              >
                {secondsLeft}s
              </Typography>
            </Box>
            <LinearProgress
              variant='determinate'
              value={progressValue}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: alpha(theme.palette.error.main, 0.12),
                '& .MuiLinearProgress-bar': {
                  borderRadius: 3,
                  bgcolor: 'error.main',
                  transition: 'transform 1s linear'
                }
              }}
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          onClick={handleContinue}
          color='inherit'
          disabled={!cooldownDone}
          sx={{
            transition: 'opacity 300ms ease',
            opacity: cooldownDone ? 1 : 0.4
          }}
        >
          {cooldownDone ? 'Continuă' : `Așteaptă ${secondsLeft}s`}
        </Button>
        <Button onClick={handleGoToPayment} variant='contained' color='error'>
          Mergi la plată
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default StudentWalletWarningModal
