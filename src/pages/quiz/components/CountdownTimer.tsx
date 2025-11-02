// ** React Imports
import React, { useMemo, useEffect, useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Chip from '@mui/material/Chip'
import { useTheme } from '@mui/material/styles'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Hooks
import { useResponsive } from '../../quizzes/hooks/useResponsive'

// ** Types
import { CountdownTimerProps } from '../types'

// ** Constants
import { ANIMATION_DURATIONS, EASING_FUNCTIONS } from '../../quizzes/constants/animations'
import { SPACING } from '../../quizzes/constants/theme'

const CountdownTimer: React.FC<
  CountdownTimerProps & {
    compact?: boolean
  }
> = ({ timeRemaining, timeSpent, totalTime, onTimeUp, showWarnings = true, compact = false }) => {
  const theme = useTheme()
  const { isMobile, shouldReduceMotion } = useResponsive()
  const [hasWarned5Min, setHasWarned5Min] = useState(false)
  const [hasWarned1Min, setHasWarned1Min] = useState(false)

  // ** Computed values
  const progressPercentage = useMemo(() => {
    return totalTime > 0 ? ((totalTime - timeRemaining) / totalTime) * 100 : 0
  }, [timeRemaining, totalTime])

  const timePercentage = useMemo(() => {
    return totalTime > 0 ? (timeRemaining / totalTime) * 100 : 0
  }, [timeRemaining, totalTime])

  const getTimeColor = useMemo(() => {
    if (timePercentage > 50) return theme.palette.success.main
    if (timePercentage > 25) return theme.palette.warning.main
    if (timePercentage > 10) return theme.palette.error.main
    return theme.palette.error.dark
  }, [timePercentage, theme])

  const getTimeStatus = useMemo(() => {
    if (timePercentage > 50) return 'good'
    if (timePercentage > 25) return 'warning'
    if (timePercentage > 10) return 'critical'
    return 'danger'
  }, [timePercentage])

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const getStatusIcon = useMemo(() => {
    switch (getTimeStatus) {
      case 'good':
        return 'tabler:clock'
      case 'warning':
        return 'tabler:clock-hour-4'
      case 'critical':
        return 'tabler:alert-triangle'
      case 'danger':
        return 'tabler:alert-circle'
      default:
        return 'tabler:clock'
    }
  }, [getTimeStatus])

  const getStatusText = useMemo(() => {
    switch (getTimeStatus) {
      case 'good':
        return 'Timp suficient'
      case 'warning':
        return 'Timp moderat'
      case 'critical':
        return 'Timp limitat'
      case 'danger':
        return 'Timp critic!'
      default:
        return 'Timp rămas'
    }
  }, [getTimeStatus])

  // ** Warning effects
  useEffect(() => {
    if (showWarnings) {
      // 5 minute warning
      if (timeRemaining <= 300 && timeRemaining > 299 && !hasWarned5Min) {
        setHasWarned5Min(true)
        // You could show a toast notification here
        console.log('5 minute warning!')
      }

      // 1 minute warning
      if (timeRemaining <= 60 && timeRemaining > 59 && !hasWarned1Min) {
        setHasWarned1Min(true)
        // You could show a toast notification here
        console.log('1 minute warning!')
      }
    }
  }, [timeRemaining, showWarnings, hasWarned5Min, hasWarned1Min])

  // ** Time up effect
  // useEffect(() => {
  //   if (timeRemaining === 0) {
  //     onTimeUp()
  //   }
  // }, [timeRemaining, onTimeUp])

  // Responsive sizing
  const circularSize = compact ? 40 : isMobile ? 60 : 70
  const circularThickness = compact ? 3.5 : 4

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      {/* Circular Progress Timer */}
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {/* SVG Gradient Definition */}
        <svg width={0} height={0}>
          <defs>
            <linearGradient id='timer-gradient' x1='0%' y1='0%' x2='100%' y2='100%'>
              <stop offset='0%' stopColor={theme.palette.error.main} />
              <stop offset='50%' stopColor={theme.palette.warning.main} />
              <stop offset='100%' stopColor={theme.palette.success.main} />
            </linearGradient>
          </defs>
        </svg>

        <CircularProgress
          variant='determinate'
          value={progressPercentage}
          size={circularSize}
          thickness={circularThickness}
          sx={{
            color: getTimeColor,
            transition: shouldReduceMotion()
              ? 'none'
              : `color ${ANIMATION_DURATIONS.MEDIUM}ms ${EASING_FUNCTIONS.STANDARD}`,
            transform: 'rotate(-90deg)',

            '& .MuiCircularProgress-circle': {
              strokeLinecap: 'round',
              stroke: timePercentage > 25 ? getTimeColor : 'url(#timer-gradient)',
              transition: shouldReduceMotion()
                ? 'none'
                : `stroke-dashoffset ${ANIMATION_DURATIONS.SHORT}ms ${EASING_FUNCTIONS.STANDARD}`
            }
          }}
        />

        {/* Background circle */}
        <CircularProgress
          variant='determinate'
          value={100}
          size={circularSize}
          thickness={circularThickness}
          sx={{
            color: theme.palette.action.hover,
            position: 'absolute',
            transform: 'rotate(-90deg)',
            zIndex: -1
          }}
        />

        {/* Time display */}
        <Box
          sx={{
            position: 'absolute',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Typography
            variant={compact ? 'body2' : 'h6'}
            sx={{
              fontWeight: 700,
              color: getTimeColor,
              fontFamily: 'monospace',
              fontSize: compact ? '0.55rem' : isMobile ? '0.85rem' : '0.95rem',
              lineHeight: 1,
              transition: shouldReduceMotion()
                ? 'none'
                : `color ${ANIMATION_DURATIONS.MEDIUM}ms ${EASING_FUNCTIONS.STANDARD}`
            }}
          >
            {formatTime(timeSpent ? timeSpent : timeRemaining)}
          </Typography>
        </Box>
      </Box>

      {/* Critical time warning */}
      {getTimeStatus === 'danger' && timeRemaining > 0 && (
        <Box
          sx={{
            mt: 3,
            p: 2.5,
            borderRadius: 1,
            backgroundColor: `${theme.palette.error.main}10`,
            border: `1px solid ${theme.palette.error.main}30`,
            animation: `pulse ${ANIMATION_DURATIONS.CELEBRATION}ms ${EASING_FUNCTIONS.STANDARD} infinite`
          }}
        >
          <Typography
            variant='caption'
            sx={{
              color: theme.palette.error.main,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Icon icon='tabler:alert-triangle' fontSize='0.875rem' />
            Timpul se apropie de sfârșit!
          </Typography>
        </Box>
      )}
    </Box>
  )
}

export default CountdownTimer
