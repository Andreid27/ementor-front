// ** React Imports
import React from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { Button } from '@mui/material'
import CircularProgress from '@mui/material/CircularProgress'
import { useTheme } from '@mui/material/styles'

// ** Hooks
import { useResponsive } from '../../quizzes/hooks/useResponsive'

// ** Apple Design System
import {
  APPLE_SPACING,
  APPLE_BORDER_RADIUS,
  APPLE_ELEVATION,
  APPLE_TYPOGRAPHY
} from '../../../@core/theme/apple-design-system'

interface SubmitCardProps {
  answeredQuestions: number
  totalQuestions: number
  isSubmitting: boolean
  onSubmit: () => void
  disabled?: boolean
}

/**
 * SubmitCard Component - Compact elegant submission interface
 *
 * Requirements addressed:
 * - 4.1: Maximum width of 480px centered on page
 * - 4.2: Consistent padding of 24px desktop/16px mobile
 * - 4.3: Display submission status and question count in concise format
 * - 4.4: Single, prominent call-to-action button with loading states
 * - 4.5: Eliminate excessive height and unnecessary visual weight
 */
const SubmitCard: React.FC<SubmitCardProps> = ({
  answeredQuestions,
  totalQuestions,
  isSubmitting,
  onSubmit,
  disabled = false
}) => {
  const theme = useTheme()
  const { isMobile } = useResponsive()

  const isComplete = answeredQuestions === totalQuestions
  const remainingQuestions = totalQuestions - answeredQuestions

  // Get responsive values from Apple Design System
  const padding = isMobile ? APPLE_SPACING.CARD_PADDING.MOBILE : APPLE_SPACING.CARD_PADDING.DESKTOP
  const cardBorderRadius = isMobile ? APPLE_BORDER_RADIUS.MEDIUM : APPLE_BORDER_RADIUS.LARGE
  const elevation = APPLE_ELEVATION.SHADOWS.LIGHT.SUBTLE
  const touchTarget = isMobile ? APPLE_SPACING.TOUCH_TARGET.MOBILE : APPLE_SPACING.TOUCH_TARGET.MINIMUM

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
        mt: isMobile ? 3 : 4, // 24px mobile, 32px desktop
        mb: isMobile ? 3 : 3 // 24px bottom margin
      }}
    >
      <Card
        sx={{
          // Requirement 4.1: Maximum width of 480px centered on page
          maxWidth: 480,
          width: '100%',
          // Requirement 4.5: Eliminate excessive height - auto-sizing
          height: 'auto',
          // Requirement 2.2: Subtle elevation (2dp)
          boxShadow: elevation,
          borderRadius: `${cardBorderRadius}px`,
          // Remove excessive visual weight
          border: 'none'
        }}
      >
        <CardContent
          sx={{
            // Requirement 4.2: Consistent padding of 24px desktop/16px mobile
            p: `${padding}px`,
            '&:last-child': {
              pb: `${padding}px` // Ensure consistent bottom padding
            },
            // Requirement 4.5: Eliminate excessive height
            display: 'flex',
            flexDirection: 'column',
            gap: isMobile ? 1.5 : 2, // 12px mobile, 16px desktop
            alignItems: 'center'
          }}
        >
          {/* Title */}
          <Typography
            variant='h6'
            sx={{
              textAlign: 'center',
              color: 'text.primary',
              fontWeight: 600,
              // Typography hierarchy - max 3 font sizes per screen
              fontSize: isMobile
                ? `${APPLE_TYPOGRAPHY.BODY_LARGE.SIZE.MOBILE}px`
                : `${APPLE_TYPOGRAPHY.BODY_LARGE.SIZE.DESKTOP}px`,
              lineHeight: 1.3,
              mb: 0
            }}
          >
            Ești gata să trimiți?
          </Typography>

          {/* Requirement 4.3: Display submission status and question count in concise format */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 0.5,
              alignItems: 'center',
              width: '100%'
            }}
          >
            <Typography
              variant='body2'
              sx={{
                textAlign: 'center',
                color: 'text.secondary',
                fontSize: isMobile
                  ? `${APPLE_TYPOGRAPHY.BODY_REGULAR.SIZE.MOBILE}px`
                  : `${APPLE_TYPOGRAPHY.BODY_REGULAR.SIZE.DESKTOP}px`,
                lineHeight: 1.5
              }}
            >
              Ai răspuns la <strong>{answeredQuestions}</strong> din <strong>{totalQuestions}</strong> întrebări
            </Typography>

            {!isComplete && (
              <Typography
                variant='body2'
                sx={{
                  textAlign: 'center',
                  color: 'warning.main',
                  fontSize: isMobile
                    ? `${APPLE_TYPOGRAPHY.CAPTION.SIZE.MOBILE}px`
                    : `${APPLE_TYPOGRAPHY.BODY_REGULAR.SIZE.DESKTOP}px`,
                  lineHeight: 1.5
                }}
              >
                {remainingQuestions === 1 ? 'Mai rămâne 1 întrebare' : `Mai rămân ${remainingQuestions} întrebări`}
              </Typography>
            )}
          </Box>

          {/* Requirement 4.4: Single, prominent call-to-action button with loading states */}
          <Button
            variant='contained'
            color='primary'
            onClick={onSubmit}
            disabled={disabled || isSubmitting}
            fullWidth={isMobile}
            sx={{
              // Touch target size - minimum 44px height
              minHeight: touchTarget,
              // Consistent border radius
              borderRadius: `${APPLE_BORDER_RADIUS.MEDIUM}px`,
              // Typography
              fontSize: isMobile ? '0.95rem' : '1rem',
              fontWeight: 600,
              textTransform: 'none',
              // Padding
              px: isMobile ? 3 : 4, // 24px mobile, 32px desktop
              py: isMobile ? 1.5 : 1.25,
              // Remove excessive visual weight
              boxShadow: 'none',
              // Smooth transitions
              transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
              // Hover effects (desktop only)
              '&:hover': {
                boxShadow: APPLE_ELEVATION.SHADOWS.LIGHT.RAISED,
                transform: 'translateY(-1px)'
              },
              // Active state
              '&:active': {
                transform: 'translateY(0)'
              },
              // Disabled state
              '&.Mui-disabled': {
                backgroundColor: theme.palette.action.disabledBackground,
                color: theme.palette.action.disabled
              },
              // Mobile width
              ...(isMobile ? { width: '100%' } : { minWidth: 200 })
            }}
          >
            {isSubmitting ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={20} color='inherit' />
                <span>Se trimite...</span>
              </Box>
            ) : (
              'Trimite testul'
            )}
          </Button>
        </CardContent>
      </Card>
    </Box>
  )
}

export default SubmitCard
