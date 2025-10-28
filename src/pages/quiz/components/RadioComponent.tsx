// ** React Imports
import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Box, Card, CardContent, Typography, useTheme, alpha, Fade, Zoom, keyframes } from '@mui/material'
import { styled } from '@mui/material/styles'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked'
import { RadioComponentProps } from '../types'
import { useResponsive } from '../../quizzes/hooks/useResponsive'

// ** Apple Design System
import {
  APPLE_DESIGN_SYSTEM,
  APPLE_SPACING,
  APPLE_TYPOGRAPHY,
  APPLE_BORDER_RADIUS,
  APPLE_ELEVATION,
  APPLE_ANIMATION_DURATIONS,
  APPLE_EASING_FUNCTIONS
} from '../../../@core/theme/apple-design-system'

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

// Styled components using Apple Design System
// Task 6: Optimize Question Card spacing and visual hierarchy
const QuestionCard = styled(Card)<{ compact?: boolean }>(({ theme }) => ({
  // Requirement 2.1: Maximum 32px spacing between questions on desktop, 24px on mobile
  marginBottom: 0, // Remove margin - spacing handled by parent container gap

  // Requirement 2.2: Apple Design System border radius (12px desktop/8px mobile)
  borderRadius: APPLE_BORDER_RADIUS.QUESTION_CARD.DESKTOP, // 12px on desktop

  // Requirement 2.2: Apple Design System elevation (2dp)
  boxShadow: APPLE_ELEVATION.SHADOWS.LIGHT.RAISED, // 2dp elevation
  border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,

  // Apple Design System transitions
  transition: `all ${APPLE_ANIMATION_DURATIONS.STANDARD}ms ${APPLE_EASING_FUNCTIONS.STANDARD}`,
  animation: `${slideInFromBottom} ${APPLE_ANIMATION_DURATIONS.COMPLEX}ms ${APPLE_EASING_FUNCTIONS.DECELERATE}`,
  position: 'relative',
  overflow: 'hidden',

  // Apple Design System typography
  fontFamily: APPLE_TYPOGRAPHY.FONT_FAMILY,

  // Mobile-first responsive design
  [theme.breakpoints.down('sm')]: {
    // Requirement 2.2: 8px on mobile (Apple Design System)
    borderRadius: APPLE_BORDER_RADIUS.QUESTION_CARD.MOBILE, // 8px on mobile
    boxShadow: APPLE_ELEVATION.SHADOWS.LIGHT.RAISED // Maintain 2dp elevation
  },

  // Tablet adjustments
  [theme.breakpoints.between('sm', 'md')]: {
    borderRadius: (APPLE_BORDER_RADIUS.QUESTION_CARD.MOBILE + APPLE_BORDER_RADIUS.QUESTION_CARD.DESKTOP) / 2 // 10px on tablet
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
    transition: `opacity ${APPLE_ANIMATION_DURATIONS.STANDARD}ms ease`
  },

  // Requirement 2.3: Gentle visual feedback without excessive emphasis
  // Hover effects only on devices that support hover
  '@media (hover: hover) and (pointer: fine)': {
    '&:hover': {
      // Subtle elevation increase (from 2dp to 3dp equivalent)
      boxShadow: APPLE_ELEVATION.SHADOWS.LIGHT.FLOATING,
      // Gentle lift without excessive scale
      transform: 'translateY(-2px)',
      borderColor: alpha(theme.palette.primary.main, 0.2),

      '&::before': {
        opacity: 1
      }
    }
  },

  // Touch device optimizations
  '@media (hover: none) and (pointer: coarse)': {
    '&:active': {
      transform: 'scale(0.98)',
      boxShadow: APPLE_ELEVATION.SHADOWS.LIGHT.SUBTLE
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

const QuestionHeader = styled(Box)<{ compact?: boolean }>(({ theme }) => ({
  // Requirement 2.4: Apple Design System padding (24px desktop/16px mobile)
  padding: `${APPLE_SPACING.LG}px ${APPLE_SPACING.LG}px ${APPLE_SPACING.MD}px`, // 24px horizontal, 16px bottom on desktop
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,

  // Apple Design System typography
  fontFamily: APPLE_TYPOGRAPHY.FONT_FAMILY,

  // Mobile-first responsive padding
  [theme.breakpoints.down('sm')]: {
    // Requirement 2.4: 16px on mobile (Apple Design System)
    padding: `${APPLE_SPACING.MD}px ${APPLE_SPACING.MD}px ${APPLE_SPACING.SM + 4}px` // 16px horizontal, 12px bottom on mobile
  },

  // Tablet padding
  [theme.breakpoints.between('sm', 'md')]: {
    padding: `${(APPLE_SPACING.MD + APPLE_SPACING.LG) / 2}px ${(APPLE_SPACING.MD + APPLE_SPACING.LG) / 2}px ${
      APPLE_SPACING.SM + 6
    }px` // 20px horizontal on tablet
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
}>(({ theme, selected, correct, incorrect, disabled, index = 0 }) => ({
  // Requirement 3.4: Apply consistent 12px spacing between answer options
  margin: theme.spacing(1.5, 0), // 12px vertical spacing

  // Requirement 3.1: Implement subtle borders (1px) with 8px rounded corners
  borderRadius: theme.spacing(1), // 8px rounded corners
  cursor: disabled ? 'default' : 'pointer',
  border: `1px solid ${
    correct
      ? theme.palette.success.main
      : incorrect
      ? theme.palette.error.main
      : selected
      ? theme.palette.primary.main
      : alpha(theme.palette.divider, 0.2)
  }`, // 1px subtle border
  backgroundColor: correct
    ? alpha(theme.palette.success.main, 0.04)
    : incorrect
    ? alpha(theme.palette.error.main, 0.04)
    : selected
    ? alpha(theme.palette.primary.main, 0.04)
    : theme.palette.background.paper,

  // Requirement 3.2: Add immediate visual feedback with 200ms smooth transitions
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', // 200ms transition

  // Requirement 3.3: Ensure minimum 44px touch targets on all devices
  minHeight: 44, // Minimum 44px touch target
  display: 'flex',
  alignItems: 'center',
  position: 'relative',
  overflow: 'hidden',
  animation: `${slideInFromBottom} ${0.3 + index * 0.08}s ease-out`,

  // Task 9: Mobile-first responsive adjustments with enhanced touch optimization
  [theme.breakpoints.down('sm')]: {
    // Requirement 3.4: Maintain 12px spacing on mobile
    margin: theme.spacing(1.5, 0), // 12px vertical spacing
    // Requirement 3.1: 8px rounded corners
    borderRadius: theme.spacing(1), // 8px
    // Requirement 8.2: Minimum 48px touch targets on mobile
    minHeight: 48, // 48px touch target on mobile
    // Task 9: Enhanced mobile typography and spacing quality
    padding: theme.spacing(0.5, 0) // Additional padding for better touch area
  },

  // Tablet adjustments for progressive enhancement
  [theme.breakpoints.between('sm', 'md')]: {
    minHeight: 46 // Progressive enhancement between mobile and desktop
  },

  // Selection pulse animation (optimized for mobile)
  ...(selected &&
    !disabled && {
      animation: `${pulseAnimation} 0.5s ease-out`
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

  // Requirement 3.5: Implement hover states only on hover-capable devices
  '@media (hover: hover) and (pointer: fine)': {
    '&:hover': !disabled
      ? {
          // Subtle hover effect without excessive scale
          transform: 'translateY(-1px)',
          boxShadow: `0 4px 12px ${alpha(
            correct ? theme.palette.success.main : incorrect ? theme.palette.error.main : theme.palette.primary.main,
            0.15
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

  // Task 9: Enhanced touch device optimizations - Requirement 8.2
  '@media (hover: none) and (pointer: coarse)': {
    // Improve touch target area
    padding: theme.spacing(0.5, 0),

    '&:active': !disabled
      ? {
          // Task 9: Touch feedback with subtle scale animation (0.98x) on press
          transform: 'scale(0.98)',
          transition: 'transform 0.1s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: `0 2px 8px ${alpha(
            correct ? theme.palette.success.main : incorrect ? theme.palette.error.main : theme.palette.primary.main,
            0.2
          )}`,
          // Enhanced visual feedback for touch
          backgroundColor: correct
            ? alpha(theme.palette.success.main, 0.08)
            : incorrect
            ? alpha(theme.palette.error.main, 0.08)
            : selected
            ? alpha(theme.palette.primary.main, 0.08)
            : alpha(theme.palette.action.hover, 0.04)
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

const AnswerContent = styled(CardContent)<{ compact?: boolean; touchOptimized?: boolean }>(({ theme }) => ({
  padding: theme.spacing(1.5, 2),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  // Requirement 3.3: Ensure minimum 44px touch targets on all devices
  minHeight: 44,
  '&:last-child': {
    paddingBottom: theme.spacing(1.5)
  },

  // Task 9: Enhanced mobile-first responsive padding and touch targets
  [theme.breakpoints.down('sm')]: {
    // Task 9: Optimized padding for mobile touch interactions
    padding: theme.spacing(2, 2.5), // Increased from 1.5 to 2 for better touch area
    // Requirement 8.2: Minimum 48px touch targets on mobile
    minHeight: 48,
    '&:last-child': {
      paddingBottom: theme.spacing(2) // Consistent padding
    }
  },

  // Tablet adjustments for progressive enhancement
  [theme.breakpoints.between('sm', 'md')]: {
    padding: theme.spacing(1.75, 2.25),
    minHeight: 46 // Progressive enhancement
  }
}))

const AnswerText = styled(Typography)<{ compact?: boolean }>(({ theme, compact }) => ({
  fontWeight: 500,
  fontSize: compact ? '0.9rem' : '1rem',
  lineHeight: compact ? 1.4 : 1.5,
  flex: 1,
  marginRight: theme.spacing(2),
  wordBreak: 'break-word',
  hyphens: 'auto',

  // Task 9: Enhanced mobile-first responsive typography matching desktop quality (Requirement 8.3)
  [theme.breakpoints.down('sm')]: {
    // Task 9: Improved mobile typography - larger, more readable
    fontSize: compact ? '0.875rem' : '0.9375rem', // Increased from 0.85rem for better readability
    lineHeight: 1.4, // Improved from 1.3 for better readability
    marginRight: theme.spacing(1.5),
    fontWeight: 500, // Maintain consistent weight
    letterSpacing: '0.01em' // Subtle letter spacing for clarity
  },

  // Tablet typography for progressive enhancement
  [theme.breakpoints.between('sm', 'md')]: {
    fontSize: compact ? '0.9rem' : '0.95rem',
    lineHeight: 1.4,
    fontWeight: 500
  }
}))

const AnswerLabel = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  fontSize: '1rem',
  marginRight: theme.spacing(2),
  minWidth: '24px',
  color: theme.palette.text.secondary,

  // Task 9: Enhanced mobile typography matching desktop quality (Requirement 8.3)
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.9375rem', // Slightly larger for better mobile readability
    fontWeight: 600,
    minWidth: '28px', // Slightly larger touch target
    marginRight: theme.spacing(1.5)
  },

  // Tablet adjustments
  [theme.breakpoints.between('sm', 'md')]: {
    fontSize: '0.95rem',
    minWidth: '26px'
  }
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
    questionNumber?: number
    totalQuestions?: number
  }
> = ({
  question,
  selectedAnswer,
  onAnswerSelect,
  disabled = false,
  showResults = false,
  correctAnswer,
  compact = false,
  touchOptimized = false,
  questionNumber,
  totalQuestions
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

      // Task 9: Optimized delay for mobile devices
      const delay = isMobile ? 80 : 150

      // Task 9: Add haptic feedback for touch devices where supported
      // Provide immediate tactile feedback before visual animation
      if (isTouchDevice && 'vibrate' in navigator) {
        try {
          // Light haptic feedback (30ms) for selection
          navigator.vibrate(30)
        } catch (error) {
          // Silently fail if vibration is not supported
          console.debug('Haptic feedback not available:', error)
        }
      }

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

  // Debug logging for review mode
  if (showResults) {
    console.log('Review Mode Debug:', {
      questionId: question.id,
      questionContent: question.content?.substring(0, 50),
      correctAnswer,
      localSelected,
      showResults
    })
  }

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
      // Show correct answer icon
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

      // Show user's incorrect answer icon
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

      // Return null for non-selected, non-correct answers
      return null
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
          {/* Task 6/7: Question numbering system - "Întrebarea X din Y" */}
          {questionNumber !== undefined && totalQuestions !== undefined && (
            <Typography
              variant='caption'
              sx={{
                display: 'block',
                fontWeight: 500,
                color: theme.palette.text.secondary,
                fontSize: compact ? '0.8rem' : '0.875rem',
                mb: 1,
                // Task 9: Enhanced mobile-first responsive typography (Requirement 8.3)
                [theme.breakpoints.down('sm')]: {
                  fontSize: '0.8125rem', // Improved from 0.75rem for better readability
                  fontWeight: 500,
                  letterSpacing: '0.01em'
                },
                // Tablet typography
                [theme.breakpoints.between('sm', 'md')]: {
                  fontSize: '0.8125rem'
                }
              }}
            >
              Întrebarea {questionNumber} din {totalQuestions}
            </Typography>
          )}
          <Typography
            variant='body1'
            component='h3'
            sx={{
              fontWeight: 500,
              lineHeight: 1.5,
              color: theme.palette.text.primary,
              fontSize: compact ? '0.95rem' : '1rem',
              // Task 9: Enhanced mobile-first responsive typography matching desktop quality (Requirement 8.3)
              [theme.breakpoints.down('sm')]: {
                fontSize: compact ? '0.9rem' : '0.9375rem', // Improved readability
                lineHeight: 1.45, // Better line height for mobile reading
                fontWeight: 500,
                letterSpacing: '0.01em' // Subtle spacing for clarity
              },
              // Tablet typography
              [theme.breakpoints.between('sm', 'md')]: {
                fontSize: compact ? '0.95rem' : '1rem',
                lineHeight: 1.5
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
            // Requirement 2.4: Consistent internal padding of 24px desktop/16px mobile
            padding: theme.spacing(3, 3, 3), // 24px on desktop
            // Mobile-first responsive padding
            [theme.breakpoints.down('sm')]: {
              // Requirement 2.4: 16px on mobile
              padding: theme.spacing(2, 2, 2) // 16px on mobile
            },
            // Tablet padding
            [theme.breakpoints.between('sm', 'md')]: {
              padding: theme.spacing(2.5, 2.5, 2.5) // 20px on tablet
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
                  {showResults ? (
                    // Show correct/incorrect icons in review mode
                    isCorrect ? (
                      <CheckCircleIcon sx={{ color: theme.palette.success.main, fontSize: 24, mr: 1 }} />
                    ) : isIncorrect ? (
                      <CancelIcon sx={{ color: theme.palette.error.main, fontSize: 24, mr: 1 }} />
                    ) : (
                      <RadioButtonUncheckedIcon sx={{ color: theme.palette.text.disabled, fontSize: 24, mr: 1 }} />
                    )
                  ) : (
                    renderStatusIcon(option.index)
                  )}
                  <Box
                    sx={{
                      display: 'flex',
                      flex: 1,
                      flexDirection: 'column',
                      alignItems: 'flex-start'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
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
                  </Box>
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
