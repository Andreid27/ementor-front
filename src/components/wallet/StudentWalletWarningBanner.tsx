import React from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { keyframes } from '@mui/system'
import { alpha, useTheme } from '@mui/material/styles'
import Icon from 'src/@core/components/icon'
import { useSelector } from 'react-redux'
import { selectWalletBalance } from 'src/store/apps/wallet'
import { useRouter } from 'next/router'

// -- Animations ---------------------------------------------------------

const slideDown = keyframes`
  from {
    opacity: 0;
    transform: translateY(-100%);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

const bannerPulse = keyframes`
  0%, 100% {
    background-size: 100% 100%;
    box-shadow: inset 0 0 0 0 rgba(255, 255, 255, 0);
  }
  50% {
    background-size: 110% 110%;
    box-shadow: inset 0 0 20px 0 rgba(255, 255, 255, 0.06);
  }
`

const iconPulse = keyframes`
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 currentColor;
  }
  50% {
    transform: scale(1.15);
    box-shadow: 0 0 0 6px transparent;
  }
`

const iconRingPulse = keyframes`
  0% {
    transform: scale(1);
    opacity: 0.5;
  }
  100% {
    transform: scale(2.2);
    opacity: 0;
  }
`

const shimmer = keyframes`
  0% {
    background-position: -200% center;
  }
  100% {
    background-position: 200% center;
  }
`

const glowPulse = keyframes`
  0%, 100% {
    opacity: 0.4;
  }
  50% {
    opacity: 0.8;
  }
`

// -- Component ----------------------------------------------------------

/**
 * Persistent warning banner displayed above page content for students with
 * negative wallet balance.
 *
 * - balance <= -400 and > -1000 => yellow/amber warning
 * - balance <= -1000            => red critical warning
 * - balance is null, 0, or > -400 => renders nothing
 */
const StudentWalletWarningBanner: React.FC = () => {
  const balance = useSelector(selectWalletBalance)
  const theme = useTheme()
  const router = useRouter()

  if (balance === null || balance === 0 || balance > -400) {
    return null
  }

  const isCritical = balance <= -1000

  // Palette tokens
  const severity = isCritical ? 'error' : 'warning'
  const mainColor = theme.palette[severity].main
  const darkColor = theme.palette[severity].dark

  return (
    <Box
      sx={{
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
        animation: `${slideDown} 400ms cubic-bezier(0, 0, 0.2, 1) forwards`,

        // Gradient background
        background: isCritical
          ? `linear-gradient(135deg, ${alpha(mainColor, 0.16)} 0%, ${alpha(mainColor, 0.24)} 50%, ${alpha(mainColor, 0.16)} 100%)`
          : `linear-gradient(135deg, ${alpha(mainColor, 0.12)} 0%, ${alpha(mainColor, 0.18)} 100%)`,
        borderBottom: `1px solid ${alpha(mainColor, 0.3)}`,

        // Critical: visible background pulse
        ...(isCritical && {
          animation: `${slideDown} 400ms cubic-bezier(0, 0, 0.2, 1) forwards, ${bannerPulse} 2s ease-in-out infinite 0.4s`
        })
      }}
    >
      {/* Shimmer accent line at top */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: isCritical ? '3px' : '2px',
          background: `linear-gradient(90deg, transparent, ${alpha(mainColor, isCritical ? 0.9 : 0.7)}, transparent)`,
          backgroundSize: '200% 100%',
          animation: `${shimmer} ${isCritical ? '2s' : '3s'} linear infinite`
        }}
      />

      {/* Glow layer behind shimmer line (critical only) */}
      {isCritical && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '12px',
            background: `linear-gradient(180deg, ${alpha(mainColor, 0.3)}, transparent)`,
            animation: `${glowPulse} 2s ease-in-out infinite`,
            pointerEvents: 'none'
          }}
        />
      )}

      {/* Content */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: { xs: 1, sm: 2 },
          px: { xs: 2, sm: 4 },
          py: 1.5
        }}
      >
        {/* Icon with animated backdrop */}
        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 30,
            height: 30,
            borderRadius: '50%',
            bgcolor: alpha(mainColor, isCritical ? 0.22 : 0.18),
            flexShrink: 0,
            ...(isCritical && {
              animation: `${iconPulse} 2s ease-in-out infinite`
            })
          }}
        >
          {/* Expanding ring (critical only) */}
          {isCritical && (
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                border: `2px solid ${alpha(mainColor, 0.5)}`,
                animation: `${iconRingPulse} 2s ease-out infinite`,
                pointerEvents: 'none'
              }}
            />
          )}
          <Icon
            icon={isCritical ? 'mdi:alert-circle' : 'mdi:alert'}
            fontSize={18}
            color={darkColor}
          />
        </Box>

        {/* Text */}
        <Typography
          variant='body2'
          sx={{
            fontWeight: 600,
            color: darkColor,
            letterSpacing: '0.01em',
            lineHeight: 1.5,
            textAlign: 'center'
          }}
        >
          {isCritical
            ? 'Soldul tău este critic: '
            : 'Soldul tău necesită atenție: '}
          <Typography
            component='span'
            variant='body2'
            sx={{
              fontWeight: 800,
              color: mainColor,
              mx: 0.5
            }}
          >
            {balance} RON
          </Typography>
          {isCritical
            ? '— te rugăm să efectuezi o plată cât mai curând.'
            : '— te rugăm să efectuezi o plată pentru a evita restricțiile.'}
        </Typography>

        {/* CTA button */}
        <Button
          size='small'
          variant='contained'
          onClick={() => router.push('/payment-process')}
          sx={{
            ml: { xs: 0, sm: 1 },
            px: 2.5,
            py: 0.5,
            minHeight: 32,
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.02em',
            borderRadius: '8px',
            textTransform: 'none' as const,
            bgcolor: mainColor,
            color: theme.palette[severity].contrastText,
            boxShadow: `0 2px 8px ${alpha(mainColor, 0.35)}`,
            transition: 'transform 150ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              bgcolor: darkColor,
              transform: 'translateY(-1px)',
              boxShadow: `0 4px 12px ${alpha(mainColor, 0.45)}`
            },
            '&:active': {
              transform: 'scale(0.97)'
            }
          }}
        >
          Efectuează plata
        </Button>
      </Box>
    </Box>
  )
}

export default StudentWalletWarningBanner
