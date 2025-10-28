// ** React Imports
import React, { useState, useEffect, useMemo, useRef } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import LinearProgress from '@mui/material/LinearProgress'
import Chip from '@mui/material/Chip'
import Alert from '@mui/material/Alert'
import { useTheme, alpha } from '@mui/material/styles'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components
import CountdownTimer from './CountdownTimer'

// ** Hooks
import { useResponsive } from '../../quizzes/hooks/useResponsive'

// ** Apple Design System
import {
  APPLE_DESIGN_SYSTEM,
  APPLE_ANIMATION_DURATIONS,
  APPLE_EASING_FUNCTIONS
} from '../../../@core/theme/apple-design-system'

interface ProgressCardProps {
  title: string
  timeRemaining: number
  totalQuestions: number
  answeredQuestions: number
  totalTime: number
  onTimeUp: () => void
  currentQuestionIndex?: number
  quizDifficulty?: string
  estimatedTimePerQuestion?: number
  onScrollToQuestion?: (questionIndex: number) => void
}

const ProgressCard: React.FC<ProgressCardProps> = ({
  title,
  timeRemaining,
  totalQuestions,
  answeredQuestions,
  totalTime,
  onTimeUp,
  currentQuestionIndex = 0,
  quizDifficulty = 'Mediu',
  estimatedTimePerQuestion = 60,
  onScrollToQuestion
}) => {
  const theme = useTheme()
  const { isMobile } = useResponsive()

  // ** State for scroll detection - start in compact mode on mobile to avoid initial flicker
  const [isScrolled, setIsScrolled] = useState(isMobile)
  const lastStateRef = useRef(isMobile)

  // ** Scroll detection with mobile-optimized thresholds
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY

      // Mobile: Ultra-low threshold (1px) to switch instantly
      // Desktop: Higher threshold (100px) for smoother experience
      if (isMobile) {
        // On mobile, switch to compact instantly (1px)
        setIsScrolled(scrollPosition > 1)
      } else {
        // On desktop, use hysteresis to prevent flickering
        if (lastStateRef.current) {
          // Currently compact - exit at 80px
          if (scrollPosition < 80) {
            setIsScrolled(false)
            lastStateRef.current = false
          }
        } else {
          // Currently full - enter at 120px
          if (scrollPosition > 120) {
            setIsScrolled(true)
            lastStateRef.current = true
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initialize on mount

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [isMobile])

  // ** Computed values
  const progressPercentage = useMemo(() => {
    return totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0
  }, [answeredQuestions, totalQuestions])

  const remainingQuestions = totalQuestions - answeredQuestions

  // ** Time-based calculations
  const timePercentage = useMemo(() => {
    return totalTime > 0 ? (timeRemaining / totalTime) * 100 : 0
  }, [timeRemaining, totalTime])

  const averageTimePerQuestion = useMemo(() => {
    const timeSpent = totalTime - timeRemaining
    return answeredQuestions > 0 ? Math.round(timeSpent / answeredQuestions) : 0
  }, [totalTime, timeRemaining, answeredQuestions])

  const estimatedTimeToComplete = useMemo(() => {
    if (remainingQuestions === 0) return 0
    const avgTime = averageTimePerQuestion > 0 ? averageTimePerQuestion : estimatedTimePerQuestion
    return Math.round((remainingQuestions * avgTime) / 60) // Convert to minutes
  }, [remainingQuestions, averageTimePerQuestion, estimatedTimePerQuestion])

  // ** Progress color based on completion and time
  const progressColor = useMemo(() => {
    if (progressPercentage === 100) return theme.palette.success.main
    if (timePercentage < 25 && progressPercentage < 75) return theme.palette.error.main
    if (progressPercentage >= 50) return theme.palette.primary.main
    return theme.palette.warning.main
  }, [progressPercentage, timePercentage, theme])

  // ** Time status for better user awareness
  const timeStatus = useMemo(() => {
    if (timePercentage > 50) return { color: theme.palette.success.main, status: 'Timp suficient' }
    if (timePercentage > 25) return { color: theme.palette.warning.main, status: 'Timp moderat' }
    if (timePercentage > 10) return { color: theme.palette.error.main, status: 'Timp limitat' }
    return { color: theme.palette.error.dark, status: 'Timp critic' }
  }, [timePercentage, theme])

  // ** Format time remaining for display
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <Card
      sx={{
        // FIXED: Proper sticky positioning that doesn't scroll up
        position: 'sticky',
        top: 90,
        left: 0,
        right: 0,
        zIndex: 1200,

        // MUI standard border radius
        borderRadius: theme.shape.borderRadius,

        // Shadow based on scroll state
        boxShadow: isScrolled ? '0 2px 8px rgba(0, 0, 0, 0.15)' : '0 1px 3px rgba(0, 0, 0, 0.12)',

        // Semi-transparent background with backdrop blur when scrolled
        backgroundColor: alpha(theme.palette.background.paper, isScrolled ? 0.95 : 1),
        backdropFilter: isScrolled ? 'blur(20px)' : 'none',
        WebkitBackdropFilter: isScrolled ? 'blur(20px)' : 'none',

        // Slower, elegant transformation with smooth easing
        transition: 'all 500ms cubic-bezier(0.4, 0, 0.2, 1)',

        // Border for compact mode
        borderBottom: isScrolled ? `1px solid ${alpha(theme.palette.divider, 0.2)}` : 'none',
        maxWidth: isScrolled ? '80%' : '100%',
        ml: isScrolled ? '10%' : 0,

        overflow: 'hidden'
      }}
    >
      <CardContent
        sx={{
          // Much more compact padding on mobile
          padding: isScrolled ? `12px 20px !important` : `${isMobile ? 12 : 24}px !important`,

          '&:last-child': {
            paddingBottom: isScrolled ? '12px !important' : `${isMobile ? 12 : 24}px !important`
          },

          // Layout
          display: 'flex',
          flexDirection: isScrolled ? 'row' : 'column',
          alignItems: isScrolled ? 'center' : 'stretch',
          justifyContent: isScrolled ? 'space-between' : 'flex-start',
          gap: isScrolled ? 2 : 3,

          // Smooth transitions matching Card animation
          transition: 'all 500ms cubic-bezier(0.4, 0, 0.2, 1)',

          // Prevent layout shift by using overflow instead of height changes
          overflow: 'hidden'
        }}
      >
        {isScrolled ? (
          // COMPACT LAYOUT - Stays on top always
          <>
            {!isMobile && (
              /* Quiz Title - Compact (desktop only) */
              <Box
                sx={{
                  flex: '0 0 auto',
                  maxWidth: '25%',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <Typography
                  variant='body2'
                  sx={{
                    fontWeight: 600,
                    color: 'text.primary',
                    fontSize: '0.9rem',
                    lineHeight: 1.2,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontFamily: APPLE_DESIGN_SYSTEM.TYPOGRAPHY.FONT_FAMILY
                  }}
                >
                  {title}
                </Typography>
              </Box>
            )}

            {/* Progress bar */}
            <Box sx={{ flex: 1, minWidth: 0, mr: 1 }}>
              <LinearProgress
                variant='determinate'
                value={progressPercentage}
                sx={{
                  height: 3,
                  borderRadius: 2,
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  transition: 'all 300ms cubic-bezier(0, 0, 0.2, 1)',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 2,
                    backgroundColor: progressColor,
                    transition: 'all 300ms cubic-bezier(0, 0, 0.2, 1)'
                  }
                }}
              />
            </Box>

            {/* Progress fraction */}
            <Typography
              variant='caption'
              sx={{
                color: 'text.primary',
                fontSize: isMobile ? '0.7rem' : '0.75rem',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                fontFamily: APPLE_DESIGN_SYSTEM.TYPOGRAPHY.FONT_FAMILY,
                mr: 1.5
              }}
            >
              {answeredQuestions}/{totalQuestions}
            </Typography>

            {/* Timer - Compact - Fixed width to prevent overlap */}
            <Box
              sx={{
                flex: '0 0 auto',
                minWidth: isMobile ? 50 : 60
              }}
            >
              <Typography
                variant='caption'
                sx={{
                  color: timeStatus.color,
                  fontSize: isMobile ? '0.75rem' : '0.8rem',
                  fontWeight: 600,
                  fontFamily: APPLE_DESIGN_SYSTEM.TYPOGRAPHY.FONT_FAMILY,
                  whiteSpace: 'nowrap'
                }}
              >
                {formatTime(timeRemaining)}
              </Typography>
            </Box>
          </>
        ) : null}

        {/* FULL LAYOUT - Always in DOM but hidden when scrolled */}
        {!isScrolled && (
          <Box sx={{ width: '100%' }}>
            <>
              {/* Header Section */}
              <Box sx={{ width: '100%' }}>
                {/* Quiz Title and Metadata */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: isMobile ? 'flex-start' : 'center',
                    flexDirection: isMobile ? 'column' : 'row',
                    gap: isMobile ? 2 : 16,
                    mb: isMobile ? 3 : 20,
                    pt: 2
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant='h6'
                      sx={{
                        fontWeight: 600,
                        color: 'text.primary',
                        fontSize: isMobile ? '0.875rem' : '1.25rem',
                        lineHeight: 1.2,
                        fontFamily: APPLE_DESIGN_SYSTEM.TYPOGRAPHY.FONT_FAMILY,
                        mb: isMobile ? 0 : 8
                      }}
                    >
                      {title}
                    </Typography>

                    {/* Quiz metadata - hide on mobile to save space */}
                    {!isMobile && (
                      <Box sx={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <Chip
                          size='small'
                          label={`Dificultate: ${quizDifficulty}`}
                          sx={{
                            backgroundColor: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.main,
                            fontSize: '0.7rem',
                            height: 24,
                            fontWeight: 500
                          }}
                        />
                        <Chip
                          size='small'
                          label={`${totalQuestions} întrebări`}
                          sx={{
                            backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                            color: theme.palette.secondary.main,
                            fontSize: '0.7rem',
                            height: 24,
                            fontWeight: 500
                          }}
                        />
                      </Box>
                    )}
                  </Box>

                  {/* Time Status Indicator - Compact and minimal */}
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 1,
                      backgroundColor: alpha(timeStatus.color, 0.1),
                      px: isMobile ? 1.5 : 2,
                      py: isMobile ? 0.5 : 0.75,
                      borderRadius: 1,
                      border: `1px solid ${alpha(timeStatus.color, 0.2)}`
                    }}
                  >
                    <Typography
                      variant='body2'
                      sx={{
                        color: timeStatus.color,
                        fontWeight: 600,
                        fontSize: isMobile ? '0.8rem' : '0.9rem',
                        fontFamily: APPLE_DESIGN_SYSTEM.TYPOGRAPHY.FONT_FAMILY,
                        lineHeight: 1.2
                      }}
                    >
                      {formatTime(timeRemaining)}
                    </Typography>
                    {!isMobile && (
                      <Typography
                        variant='caption'
                        sx={{
                          color: timeStatus.color,
                          fontSize: '0.65rem',
                          fontFamily: APPLE_DESIGN_SYSTEM.TYPOGRAPHY.FONT_FAMILY,
                          lineHeight: 1.2
                        }}
                      >
                        {timeStatus.status}
                      </Typography>
                    )}
                  </Box>
                </Box>

                {/* Progress Section */}
                <Box sx={{ mb: isMobile ? 8 : 16 }}>
                  {/* Progress Stats */}
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: isMobile ? 4 : 8
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: isMobile ? 6 : 16 }}>
                      <Typography
                        variant='body2'
                        sx={{
                          fontWeight: 600,
                          color: 'text.primary',
                          fontSize: isMobile ? '0.75rem' : '1rem',
                          fontFamily: APPLE_DESIGN_SYSTEM.TYPOGRAPHY.FONT_FAMILY
                        }}
                      >
                        Progres: {Math.round(progressPercentage)}%
                      </Typography>

                      <Typography
                        variant='body2'
                        sx={{
                          color: 'text.secondary',
                          fontSize: isMobile ? '0.65rem' : '0.875rem',
                          fontFamily: APPLE_DESIGN_SYSTEM.TYPOGRAPHY.FONT_FAMILY
                        }}
                      >
                        ({answeredQuestions} din {totalQuestions})
                      </Typography>
                    </Box>

                    {/* Additional insights - hide on mobile to save space */}
                    {!isMobile && (
                      <Box sx={{ textAlign: 'right' }}>
                        {remainingQuestions > 0 && estimatedTimeToComplete > 0 && (
                          <Typography
                            variant='caption'
                            sx={{
                              color: 'text.secondary',
                              fontSize: '0.7rem',
                              fontFamily: APPLE_DESIGN_SYSTEM.TYPOGRAPHY.FONT_FAMILY,
                              display: 'block'
                            }}
                          >
                            ~{estimatedTimeToComplete} min rămase
                          </Typography>
                        )}
                        {averageTimePerQuestion > 0 && (
                          <Typography
                            variant='caption'
                            sx={{
                              color: 'text.secondary',
                              fontSize: '0.7rem',
                              fontFamily: APPLE_DESIGN_SYSTEM.TYPOGRAPHY.FONT_FAMILY
                            }}
                          >
                            {averageTimePerQuestion}s/întrebare
                          </Typography>
                        )}
                      </Box>
                    )}
                  </Box>

                  {/* Enhanced Progress Bar - Smaller on mobile, big on desktop */}
                  <LinearProgress
                    variant='determinate'
                    value={progressPercentage}
                    sx={{
                      height: isMobile ? 12 : 20,
                      borderRadius: isMobile ? 6 : 10,
                      backgroundColor: alpha(theme.palette.primary.main, 0.15),
                      transition: 'all 300ms cubic-bezier(0, 0, 0.2, 1)',
                      boxShadow: `inset 0 1px 3px ${alpha(theme.palette.common.black, 0.1)}`,
                      '& .MuiLinearProgress-bar': {
                        borderRadius: isMobile ? 6 : 10,
                        backgroundColor: progressColor,
                        transition: 'all 300ms cubic-bezier(0, 0, 0.2, 1)',
                        boxShadow: `0 1px 4px ${alpha(progressColor, 0.3)}`
                      }
                    }}
                  />
                </Box>

                {/* Integrated Progress Tracker Section - More compact on mobile */}
                <Box sx={{ mt: isMobile ? 8 : 12 }}>
                  {/* Progress Status Chips */}
                  <Box sx={{ display: 'flex', gap: isMobile ? 6 : 8, flexWrap: 'wrap', mb: isMobile ? 4 : 12 }}>
                    <Chip
                      size='small'
                      icon={<Icon icon='tabler:check' fontSize='0.75rem' />}
                      label={`${answeredQuestions} completate`}
                      sx={{
                        backgroundColor: alpha(theme.palette.success.main, 0.1),
                        color: theme.palette.success.main,
                        fontWeight: 500,
                        fontSize: '0.7rem',
                        height: 24,
                        '& .MuiChip-icon': {
                          color: theme.palette.success.main
                        }
                      }}
                    />

                    {remainingQuestions > 0 && (
                      <Chip
                        size='small'
                        icon={<Icon icon='tabler:circle' fontSize='0.75rem' />}
                        label={`${remainingQuestions} rămase`}
                        sx={{
                          backgroundColor: alpha(theme.palette.warning.main, 0.1),
                          color: theme.palette.warning.main,
                          fontWeight: 500,
                          fontSize: '0.7rem',
                          height: 24,
                          '& .MuiChip-icon': {
                            color: theme.palette.warning.main
                          }
                        }}
                      />
                    )}

                    {/* Navigation hint - only show on desktop */}
                    {onScrollToQuestion && !isMobile && (
                      <Typography
                        variant='caption'
                        sx={{
                          color: 'text.secondary',
                          fontSize: '0.7rem',
                          alignSelf: 'center',
                          ml: 8
                        }}
                      >
                        Derulează pentru navigare
                      </Typography>
                    )}
                  </Box>

                  {/* Completion Alert */}
                  {progressPercentage === 100 && (
                    <Alert
                      severity='success'
                      icon={<Icon icon='tabler:circle-check' />}
                      sx={{
                        mb: 12,
                        backgroundColor: alpha(theme.palette.success.main, 0.1),
                        border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                        '& .MuiAlert-message': {
                          fontSize: '0.8rem',
                          fontWeight: 500
                        }
                      }}
                    >
                      Toate întrebările completate! Poți trimite testul.
                    </Alert>
                  )}

                  {/* Time Warning Alert */}
                  {timeRemaining < 300 && timeRemaining > 0 && (
                    <Alert
                      severity='warning'
                      icon={<Icon icon='tabler:alert-triangle' />}
                      sx={{
                        backgroundColor: alpha(theme.palette.warning.main, 0.1),
                        border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                        '& .MuiAlert-message': {
                          fontSize: '0.8rem',
                          fontWeight: 500
                        }
                      }}
                    >
                      Atenție! Mai ai puțin timp rămas ({formatTime(timeRemaining)}).
                    </Alert>
                  )}
                </Box>
              </Box>
            </>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

export default ProgressCard
