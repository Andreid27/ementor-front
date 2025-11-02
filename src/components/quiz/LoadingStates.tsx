// ** React Imports
import React from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import LinearProgress from '@mui/material/LinearProgress'
import CircularProgress from '@mui/material/CircularProgress'
import Skeleton from '@mui/material/Skeleton'
import { useTheme, alpha } from '@mui/material/styles'

// ** Hooks
import { useResponsive } from 'src/pages/quizzes/hooks/useResponsive'

// ** Apple Design System
import { APPLE_SPACING, APPLE_BORDER_RADIUS } from 'src/@core/theme/apple-design-system'

/**
 * LoadingStates - Comprehensive loading state components for quiz interface
 *
 * Requirements addressed:
 * - 9.2: Provide clear loading states for all asynchronous operations
 */

// ** Quiz Loading State - Full page loading
export const QuizLoadingState: React.FC<{ message?: string }> = ({ message = 'Se încarcă testul...' }) => {
  const theme = useTheme()
  const { isMobile } = useResponsive()

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 1200,
        mx: 'auto',
        p: isMobile ? 2 : 3,
        mt: 2
      }}
    >
      <Card
        sx={{
          borderRadius: `${APPLE_BORDER_RADIUS.LARGE}px`,
          boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
        }}
      >
        <CardContent sx={{ p: isMobile ? 3 : 4 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 6
            }}
          >
            <CircularProgress
              size={isMobile ? 48 : 60}
              thickness={3}
              sx={{
                color: theme.palette.primary.main,
                mb: 3
              }}
            />
            <Typography
              variant='h6'
              sx={{
                color: 'text.primary',
                fontWeight: 500,
                fontSize: isMobile ? '1rem' : '1.25rem',
                mb: 1
              }}
            >
              {message}
            </Typography>
            <Typography
              variant='body2'
              sx={{
                color: 'text.secondary',
                fontSize: isMobile ? '0.8rem' : '0.875rem'
              }}
            >
              Te rugăm să aștepți...
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}

// ** Progress Card Skeleton
export const ProgressCardSkeleton: React.FC = () => {
  const { isMobile } = useResponsive()

  return (
    <Card
      sx={{
        position: 'sticky',
        top: 90,
        zIndex: 1200,
        borderRadius: `${APPLE_BORDER_RADIUS.LARGE}px`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
      }}
    >
      <CardContent sx={{ p: isMobile ? 2 : 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Skeleton variant='text' width='60%' height={32} />
          <Skeleton variant='rectangular' width='100%' height={8} sx={{ borderRadius: 1 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Skeleton variant='text' width='30%' height={24} />
            <Skeleton variant='text' width='20%' height={24} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

// ** Question Card Skeleton
export const QuestionCardSkeleton: React.FC = () => {
  const { isMobile } = useResponsive()

  return (
    <Card
      sx={{
        borderRadius: `${isMobile ? APPLE_BORDER_RADIUS.MEDIUM : APPLE_BORDER_RADIUS.LARGE}px`,
        boxShadow: '0 2px 6px rgba(0,0,0,0.16)',
        mb: isMobile ? 3 : 4
      }}
    >
      <CardContent sx={{ p: isMobile ? 2 : 3 }}>
        <Skeleton variant='text' width='40%' height={24} sx={{ mb: 2 }} />
        <Skeleton variant='text' width='90%' height={28} sx={{ mb: 3 }} />

        {/* Answer options skeleton */}
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} variant='rectangular' width='100%' height={44} sx={{ borderRadius: 1, mb: 1.5 }} />
        ))}
      </CardContent>
    </Card>
  )
}

// ** Submit Button Loading State
export const SubmitButtonLoading: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <CircularProgress size={20} color='inherit' />
      <span>Se trimite...</span>
    </Box>
  )
}

// ** Inline Loading Indicator
export const InlineLoading: React.FC<{ message?: string; size?: number }> = ({
  message = 'Se încarcă...',
  size = 24
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        py: 2
      }}
    >
      <CircularProgress size={size} thickness={3} />
      <Typography variant='body2' sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
        {message}
      </Typography>
    </Box>
  )
}

// ** Progress Bar Loading
export const ProgressBarLoading: React.FC<{ message?: string }> = ({ message = 'Se procesează...' }) => {
  return (
    <Box sx={{ width: '100%', my: 2 }}>
      <LinearProgress sx={{ mb: 1, borderRadius: 1 }} />
      <Typography
        variant='body2'
        sx={{
          color: 'text.secondary',
          fontSize: '0.8rem',
          textAlign: 'center'
        }}
      >
        {message}
      </Typography>
    </Box>
  )
}

// ** Celebration Loading State
export const CelebrationLoadingState: React.FC = () => {
  const theme = useTheme()

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}
    >
      <CircularProgress
        size={60}
        thickness={3}
        sx={{
          color: theme.palette.primary.main,
          mb: 3
        }}
      />
      <Typography
        variant='h6'
        sx={{
          color: 'white',
          fontWeight: 500
        }}
      >
        Se calculează rezultatele...
      </Typography>
    </Box>
  )
}

// ** Skeleton Quiz Interface - Full page skeleton
export const QuizInterfaceSkeleton: React.FC = () => {
  const { isMobile } = useResponsive()

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 1200,
        mx: 'auto',
        p: isMobile ? 1 : 3,
        mt: 2
      }}
    >
      <ProgressCardSkeleton />
      <Box sx={{ mt: 3 }}>
        <QuestionCardSkeleton />
        <QuestionCardSkeleton />
        <QuestionCardSkeleton />
      </Box>
    </Box>
  )
}

export default {
  QuizLoadingState,
  ProgressCardSkeleton,
  QuestionCardSkeleton,
  SubmitButtonLoading,
  InlineLoading,
  ProgressBarLoading,
  CelebrationLoadingState,
  QuizInterfaceSkeleton
}
