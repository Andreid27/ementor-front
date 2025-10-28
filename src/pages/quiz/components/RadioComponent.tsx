// ** React Imports
import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Box, Card, CardContent, Typography, useTheme, alpha, Fade, Grow, Zoom, Slide, keyframes } from '@mui/material'
import { styled } from '@mui/material/styles'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked'
import { RadioComponentProps } from '../types'
import { useResponsive } from '../../quizzes/hooks/useResponsive'
import { TOUCH_TARGETS } from '../../quizzes/constants/responsive'

// Animation keyframes
const pulseAnimation = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`

const checkmarkAnimation = keyframes`
  0% {
    transform: scale(0) rotate(0deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.2) rotate(180deg);
    opacity: 0.8;
  }
  100% {
    transform: scale(1) rotate(360deg);
    opacity: 1;
  }
`

const slideInFromBottom = keyframes`
  0% {
    transform: translateY(20px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
`

const shimmerAnimation = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`

// Styled components for responsive premium design
const QuestionCard = styled(Card)<{ compact?: boolean }>(({ theme, compact }) => ({
  marginBottom: compact ? theme.spacing(2.5) : theme.spacing(4),
  borderRadius: compact ? theme.spacing(1) : theme.spacing(2),
  boxShadow: compact ? '0 1px 4px rgba(0, 0, 0, 0.08)' : '0 2px 8px rgba(0, 0, 0, 0.08)',
  border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  animation: `${slideInFromBottom} 0.5s ease-out`,
  position: 'relative',
  overflow: 'hidden',

  // Mobile-first responsive design
  [theme.breakpoints.down('sm')]: {
    marginBottom: theme.spacing(2),
    borderRadius: theme.spacing(1),
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)'
  },

  // Tablet adjustments
  [theme.breakpoints.between('sm', 'md')]: {
    marginBottom: theme.spacing(3),
    borderRadius: theme.spacing(1.5)
  },

  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-200px',
    width: '200px',
    height: '100%',
    background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.primary.main, 0.1)}, transparent)`,
    animation: `${shimmerAnimation} 2s infinite`,
    opacity: 0,
    transition: 'opacity 0.3s ease'
  },

  // Hover effects only on devices that support hover
  '@media (hover: hover) and (pointer: fine)': {
    '&:hover': {
      boxShadow: compact ? '0 4px 12px rgba(0, 0, 0, 0.12)' : '0 8px 24px rgba(0, 0, 0, 0.15)',
      transform: compact ? 'translateY(-2px)' : 'translateY(-4px) scale(1.01)',
      borderColor: alpha(theme.palette.primary.main, 0.3),

      '&::before': {
        opacity: 1
      }
    }
  },

  // Touch device optimizations
  '@media (hover: none) and (pointer: coarse)': {
    '&:active': {
      transform: 'scale(0.98)',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)'
    }
  },

  // Reduced motion support
  '@media (prefers-reduced-motion: reduce)': {
    animation: 'none',
    transition: 'box-shadow 0.2s ease',
    '&:hover': {
      transform: 'none',
      '&::before': {
        animation: 'none'
      }
    },
    '&::before': {
      animation: 'none'
    }
  }
}))

const QuestionHeader = styled(Box)<{ compact?: boolean }>(({ theme, compact }) => ({
  padding: compact ? theme.spacing(2, 2.5, 1.5) : theme.spacing(3, 4, 2),
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,

  // Mobile-first responsive padding
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2, 2.5, 1.5)
  },

  // Tablet padding
  [theme.breakpoints.between('sm', 'md')]: {
    padding: compact ? theme.spacing(2.5, 3, 1.5) : theme.spacing(2.5, 3.5, 2)
  }
}))

const AnswerOption = styled(Card)<{
  selected?: boolean
  correct?: boolean
  incorrect?: boolean
  disabled?: boolean
  index?: number
  compact?: boolean
  touchOptimized?: boolean
}>(({ theme, selected, correct, incorrect, disabled, index = 0, compact, touchOptimized }) => ({
  margin: compact ? theme.spacing(1, 0) : theme.spacing(1.5, 0),
  borderRadius: compact ? theme.spacing(1) : theme.spacing(1.5),
  cursor: disabled ? 'default' : 'pointer',
  border: `2px solid ${
    correct
      ? theme.palette.success.main
      : incorrect
      ? theme.palette.error.main
      : selected
      ? theme.palette.primary.main
      : alpha(theme.palette.divider, 0.2)
  }`,
  backgroundColor: correct
    ? alpha(theme.palette.success.main, 0.04)
    : incorrect
    ? alpha(theme.palette.error.main, 0.04)
    : selected
    ? alpha(theme.palette.primary.main, 0.04)
    : theme.palette.background.paper,
  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
  minHeight: touchOptimized ? TOUCH_TARGETS.COMFORTABLE : compact ? 48 : 56,
  display: 'flex',
  alignItems: 'center',
  position: 'relative',
  overflow: 'hidden',
  animation: `${slideInFromBottom} ${0.3 + index * 0.08}s ease-out`,

  // Mobile-first responsive adjustments
  [theme.breakpoints.down('sm')]: {
    margin: theme.spacing(0.75, 0),
    borderRadius: theme.spacing(1),
    minHeight: TOUCH_TARGETS.COMFORTABLE
  },

  // Selection pulse animation (reduced for mobile)
  ...(selected &&
    !disabled && {
      animation: compact ? `${pulseAnimation} 0.4s ease-out` : `${pulseAnimation} 0.6s ease-out`
    }),

  // Shimmer effect on hover (only for hover-capable devices)
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.common.white, 0.2)}, transparent)`,
    transition: 'left 0.4s ease',
    opacity: 0
  },

  // Hover effects only on devices that support hover
  '@media (hover: hover) and (pointer: fine)': {
    '&:hover': !disabled
      ? {
          transform: compact ? 'translateY(-1px) scale(1.01)' : 'translateY(-2px) scale(1.02)',
          boxShadow: `0 ${compact ? '4px 12px' : '8px 20px'} ${alpha(
            correct ? theme.palette.success.main : incorrect ? theme.palette.error.main : theme.palette.primary.main,
            0.25
          )}`,
          borderColor: correct
            ? theme.palette.success.main
            : incorrect
            ? theme.palette.error.main
            : theme.palette.primary.main,

          '&::before': {
            left: '100%',
            opacity: 1
          }
        }
      : {}
  },

  // Touch device optimizations
  '@media (hover: none) and (pointer: coarse)': {
    '&:active': !disabled
      ? {
          transform: 'scale(0.97)',
          transition: 'all 0.1s ease',
          boxShadow: `0 2px 8px ${alpha(
            correct ? theme.palette.success.main : incorrect ? theme.palette.error.main : theme.palette.primary.main,
            0.2
          )}`
        }
      : {}
  },

  // Reduced motion support
  '@media (prefers-reduced-motion: reduce)': {
    animation: 'none',
    transition: 'border-color 0.2s ease, background-color 0.2s ease',
    '&:hover': {
      transform: 'none',
      '&::before': {
        transition: 'none',
        left: '-100%',
        opacity: 0
      }
    },
    '&:active': {
      transform: 'none'
    },
    '&::before': {
      display: 'none'
    }
  }
}))

const AnswerContent = styled(CardContent)<{ compact?: boolean; touchOptimized?: boolean }>(
  ({ theme, compact, touchOptimized }) => ({
    padding: compact ? theme.spacing(1.5, 2.5) : theme.spacing(2, 3),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: touchOptimized ? TOUCH_TARGETS.COMFORTABLE : compact ? 48 : 56,
    '&:last-child': {
      paddingBottom: compact ? theme.spacing(1.5) : theme.spacing(2)
    },

    // Mobile-first responsive padding
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(1.5, 2),
      minHeight: TOUCH_TARGETS.COMFORTABLE,
      '&:last-child': {
        paddingBottom: theme.spacing(1.5)
      }
    },

    // Tablet adjustments
    [theme.breakpoints.between('sm', 'md')]: {
      padding: compact ? theme.spacing(1.75, 2.25) : theme.spacing(2, 2.75),
      minHeight: touchOptimized ? TOUCH_TARGETS.COMFORTABLE : 50
    }
  })
)

const AnswerText = styled(Typography)<{ compact?: boolean }>(({ theme, compact }) => ({
  fontWeight: 500,
  fontSize: compact ? '0.9rem' : '1rem',
  lineHeight: compact ? 1.4 : 1.5,
  flex: 1,
  marginRight: theme.spacing(2),
  wordBreak: 'break-word',
  hyphens: 'auto',

  // Mobile-first responsive typography
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.85rem',
    lineHeight: 1.3,
    marginRight: theme.spacing(1.5)
  },

  // Tablet typography
  [theme.breakpoints.between('sm', 'md')]: {
    fontSize: compact ? '0.9rem' : '0.95rem',
    lineHeight: 1.4
  }
}))

const AnswerLabel = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  fontSize: '1rem',
  marginRight: theme.spacing(2),
  minWidth: '24px',
  color: theme.palette.text.secondary
}))

const StatusIcon = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: 28,
  height: 28,
  borderRadius: '50%',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
}))

const SelectionIndicator = styled(Box)<{ selected?: boolean }>(({ theme, selected }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: 24,
  height: 24,
  borderRadius: '50%',
  marginRight: theme.spacing(1),
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  transform: selected ? 'scale(1.1)' : 'scale(1)',

  '& .MuiSvgIcon-root': {
    fontSize: 20,
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
  }
}))

const RadioComponent: React.FC<
  RadioComponentProps & {
    compact?: boolean
    touchOptimized?: boolean
  }
> = ({
  question,
  selectedAnswer,
  onAnswerSelect,
  disabled = false,
  showResults = false,
  correctAnswer,
  compact = false,
  touchOptimized = false
}) => {
  const theme = useTheme()
  const { isMobile, isTablet, isTouchDevice, shouldReduceMotion, supportsHover } = useResponsive()

  const [localSelected, setLocalSelected] = useState<number | undefined>(selectedAnswer)
  const [isAnimating, setIsAnimating] = useState(false)
  const [justSelected, setJustSelected] = useState<number | undefined>(undefined)
  const cardRef = useRef<HTMLDivElement>(null)

  // Update local state when selectedAnswer prop changes
  useEffect(() => {
    setLocalSelected(selectedAnswer)
  }, [selectedAnswer])

  const handleAnswerSelect = useCallback(
    (answerIndex: number) => {
      if (disabled || showResults || isAnimating) return

      setIsAnimating(true)
      setJustSelected(answerIndex)

      // Shorter delay for mobile devices
      const delay = isMobile ? 100 : 150

      setTimeout(() => {
        setLocalSelected(answerIndex)
        onAnswerSelect(answerIndex)
        setIsAnimating(false)

        // Clear the just selected state after animation
        setTimeout(
          () => {
            setJustSelected(undefined)
          },
          shouldReduceMotion() ? 200 : 600
        )
      }, delay)

      // Add haptic feedback on touch devices
      if (isTouchDevice && 'vibrate' in navigator) {
        navigator.vibrate(30)
      }
    },
    [disabled, showResults, onAnswerSelect, isAnimating, isMobile, isTouchDevice, shouldReduceMotion]
  )

  // Simplified keyboard handling for responsive design
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, answerIndex: number) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        handleAnswerSelect(answerIndex)
      }
    },
    [handleAnswerSelect]
  )

  // Answer options with labels - keep all 5 slots, mark empty ones
  const answerOptions = [
    {
      index: 1,
      label: 'A',
      text: question.answer1 || '',
      isEmpty: !question.answer1 || question.answer1.trim() === ''
    },
    {
      index: 2,
      label: 'B',
      text: question.answer2 || '',
      isEmpty: !question.answer2 || question.answer2.trim() === ''
    },
    {
      index: 3,
      label: 'C',
      text: question.answer3 || '',
      isEmpty: !question.answer3 || question.answer3.trim() === ''
    },
    {
      index: 4,
      label: 'D',
      text: question.answer4 || '',
      isEmpty: !question.answer4 || question.answer4.trim() === ''
    },
    { index: 5, label: 'E', text: question.answer5 || '', isEmpty: !question.answer5 || question.answer5.trim() === '' }
  ]

  const renderStatusIcon = (answerIndex: number) => {
    const isCorrect = correctAnswer === answerIndex
    const isSelected = localSelected === answerIndex
    const isJustSelected = justSelected === answerIndex

    if (showResults) {
      if (isCorrect) {
        return (
          <Zoom in timeout={500} style={{ transitionDelay: '200ms' }}>
            <StatusIcon
              sx={{
                backgroundColor: alpha(theme.palette.success.main, 0.1),
                animation: `${checkmarkAnimation} 0.8s ease-out`
              }}
            >
              <CheckCircleIcon
                sx={{
                  color: theme.palette.success.main,
                  fontSize: 24
                }}
              />
            </StatusIcon>
          </Zoom>
        )
      }

      if (isSelected && !isCorrect) {
        return (
          <Zoom in timeout={500} style={{ transitionDelay: '200ms' }}>
            <StatusIcon
              sx={{
                backgroundColor: alpha(theme.palette.error.main, 0.1)
              }}
            >
              <CancelIcon
                sx={{
                  color: theme.palette.error.main,
                  fontSize: 24
                }}
              />
            </StatusIcon>
          </Zoom>
        )
      }
    } else {
      // Show selection indicator during quiz taking
      return (
        <SelectionIndicator selected={isSelected || isJustSelected}>
          {isSelected || isJustSelected ? (
            <Zoom in timeout={200}>
              <RadioButtonCheckedIcon
                sx={{
                  color: theme.palette.primary.main,
                  animation: isJustSelected ? `${pulseAnimation} 0.6s ease-out` : 'none'
                }}
              />
            </Zoom>
          ) : (
            <RadioButtonUncheckedIcon
              sx={{
                color: alpha(theme.palette.text.secondary, 0.6)
              }}
            />
          )}
        </SelectionIndicator>
      )
    }

    return null
  }

  return (
    <Fade in timeout={shouldReduceMotion() ? 100 : 300}>
      <QuestionCard compact={compact} ref={cardRef}>
        <QuestionHeader compact={compact}>
          <Typography
            variant='body1'
            component='h3'
            sx={{
              fontWeight: 500,
              lineHeight: 1.5,
              color: theme.palette.text.secondary,
              fontSize: compact ? '0.95rem' : '1rem',
              // Mobile-first responsive typography
              [theme.breakpoints.down('sm')]: {
                fontSize: '0.9rem',
                lineHeight: 1.4
              },
              // Tablet typography
              [theme.breakpoints.between('sm', 'md')]: {
                fontSize: compact ? '0.95rem' : '1rem'
              }
            }}
          >
            {question.content}
          </Typography>
          {showResults && (
            <Typography
              variant='body2'
              sx={{
                mt: 1,
                color: 'text.secondary',
                fontSize: compact ? '0.8rem' : '0.875rem',
                [theme.breakpoints.down('sm')]: {
                  fontSize: '0.75rem'
                }
              }}
            >
              {localSelected === correctAnswer
                ? 'Răspuns corect'
                : `Răspuns corect: ${answerOptions.find(opt => opt.index === correctAnswer)?.label}`}
            </Typography>
          )}
        </QuestionHeader>

        <CardContent
          sx={{
            padding: compact ? theme.spacing(2, 2.5, 3) : theme.spacing(3, 4, 4),
            // Mobile-first responsive padding
            [theme.breakpoints.down('sm')]: {
              padding: theme.spacing(2, 2.5, 2.5)
            },
            // Tablet padding
            [theme.breakpoints.between('sm', 'md')]: {
              padding: compact ? theme.spacing(2.5, 3, 3) : theme.spacing(2.5, 3.5, 3.5)
            }
          }}
        >
          {answerOptions.map((option, index) => {
            const isSelected = localSelected === option.index
            const isCorrect = showResults && correctAnswer === option.index
            const isIncorrect = showResults && isSelected && correctAnswer !== option.index

            return (
              <AnswerOption
                key={option.index}
                selected={isSelected}
                correct={isCorrect}
                incorrect={isIncorrect}
                disabled={disabled || showResults}
                index={index}
                compact={compact}
                touchOptimized={touchOptimized}
                onClick={() => handleAnswerSelect(option.index)}
                onKeyDown={e => handleKeyDown(e, option.index)}
                tabIndex={disabled || showResults ? -1 : 0}
              >
                <AnswerContent compact={compact} touchOptimized={touchOptimized}>
                  {!showResults && renderStatusIcon(option.index)}
                  <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                    <AnswerLabel
                      sx={{
                        color: isCorrect
                          ? theme.palette.success.main
                          : isIncorrect
                          ? theme.palette.error.main
                          : isSelected
                          ? theme.palette.primary.main
                          : theme.palette.text.secondary,
                        fontSize: compact ? '0.9rem' : '1rem',
                        [theme.breakpoints.down('sm')]: {
                          fontSize: '0.85rem'
                        }
                      }}
                    >
                      {option.label}.
                    </AnswerLabel>
                    <AnswerText
                      compact={compact}
                      sx={{
                        color: isCorrect
                          ? theme.palette.success.dark
                          : isIncorrect
                          ? theme.palette.error.dark
                          : option.isEmpty
                          ? theme.palette.text.disabled
                          : theme.palette.text.primary,
                        fontStyle: option.isEmpty ? 'italic' : 'normal'
                      }}
                    >
                      {option.text || '(Răspuns lipsă)'}
                    </AnswerText>
                  </Box>
                  {showResults && renderStatusIcon(option.index)}
                </AnswerContent>
              </AnswerOption>
            )
          })}
        </CardContent>
      </QuestionCard>
    </Fade>
  )
}

// Maintain ACL for backward compatibility
RadioComponent.acl = {
  action: 'read',
  subject: 'student-pages'
}

export default RadioComponent
