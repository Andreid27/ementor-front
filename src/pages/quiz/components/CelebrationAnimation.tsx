/**
 * Apple-Style Celebration Animation Component
 *
 * Complete rebuild following Apple's animation principles with error-free functionality.
 *
 * Requirements addressed:
 * - 5.1: Fix all existing errors and console warnings
 * - 5.2: Implement smooth score progression with counting animations
 * - 5.3: Create performance-based visual effects (confetti for high, particles for medium)
 * - 5.4: Ensure animation completes within 4 seconds with smooth transitions
 * - 5.5: Add reduced motion support respecting user preferences
 */

// ** React Imports
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Fade from '@mui/material/Fade'
import Zoom from '@mui/material/Zoom'
import { useTheme } from '@mui/material/styles'
import { keyframes } from '@mui/system'

// ** Types
import { CelebrationAnimationProps, PerformanceLevel } from '../types'

// ** Apple Design System
import {
  APPLE_ANIMATION_DURATIONS,
  APPLE_EASING_FUNCTIONS,
  APPLE_REDUCED_MOTION
} from '../../../@core/theme/apple-design-system/animations'

// ============================================================================
// ANIMATION PHASES
// ============================================================================

type AnimationPhase = 'loading' | 'score' | 'celebration' | 'message' | 'complete'

// ============================================================================
// KEYFRAME ANIMATIONS - Apple-Style
// ============================================================================

// Confetti animation for high performance (Requirement 5.3)
const confettiAnimation = keyframes`
  0% {
    transform: translateY(-10vh) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(110vh) rotate(720deg);
    opacity: 0;
  }
`

// Particle float animation for medium performance (Requirement 5.3)
const particleFloat = keyframes`
  0%, 100% {
    transform: translateY(0) rotate(0deg);
    opacity: 0.6;
  }
  50% {
    transform: translateY(-30px) rotate(180deg);
    opacity: 1;
  }
`

// Score count-up animation with Apple spring physics (Requirement 5.2)
const scoreReveal = keyframes`
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  60% {
    transform: scale(1.05);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`

// Pulse glow for high performance
const pulseGlow = keyframes`
  0%, 100% {
    filter: drop-shadow(0 0 20px rgba(76, 175, 80, 0.4));
  }
  50% {
    filter: drop-shadow(0 0 40px rgba(76, 175, 80, 0.7));
  }
`

// Message fade-in with slide
const messageFadeIn = keyframes`
  0% {
    transform: translateY(20px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
`

// ============================================================================
// CONFETTI COMPONENT
// ============================================================================

interface ConfettiPieceProps {
  delay: number
  color: string
  size: number
  left: number
  duration: number
}

const ConfettiPiece: React.FC<ConfettiPieceProps> = React.memo(({ delay, color, size, left, duration }) => {
  const prefersReducedMotion = APPLE_REDUCED_MOTION.DETECT_REDUCED_MOTION()

  if (prefersReducedMotion) return null

  return (
    <Box
      sx={{
        position: 'absolute',
        top: '-10px',
        left: `${left}%`,
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: color,
        borderRadius: size > 6 ? '2px' : '50%',
        animation: `${confettiAnimation} ${duration}ms linear ${delay}ms`,
        animationFillMode: 'forwards',
        pointerEvents: 'none',
        zIndex: 1000,
        willChange: 'transform, opacity'
      }}
    />
  )
})

ConfettiPiece.displayName = 'ConfettiPiece'

// ============================================================================
// PARTICLE COMPONENT
// ============================================================================

interface FloatingParticleProps {
  delay: number
  color: string
  size: number
  left: number
  top: number
  duration: number
}

const FloatingParticle: React.FC<FloatingParticleProps> = React.memo(({ delay, color, size, left, top, duration }) => {
  const prefersReducedMotion = APPLE_REDUCED_MOTION.DETECT_REDUCED_MOTION()

  if (prefersReducedMotion) return null

  return (
    <Box
      sx={{
        position: 'absolute',
        left: `${left}%`,
        top: `${top}%`,
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: color,
        borderRadius: '50%',
        animation: `${particleFloat} ${duration}ms ease-in-out ${delay}ms infinite`,
        opacity: 0.7,
        pointerEvents: 'none',
        zIndex: 999,
        willChange: 'transform, opacity'
      }}
    />
  )
})

FloatingParticle.displayName = 'FloatingParticle'

// ============================================================================
// PERFORMANCE CONFIGURATION
// ============================================================================

interface PerformanceConfig {
  colors: string[]
  message: string
  subMessage: string
  confettiCount: number
  particleCount: number
  animationType: 'confetti' | 'particles' | 'supportive'
}

const getPerformanceConfig = (performanceLevel: PerformanceLevel, themeColors: any): PerformanceConfig => {
  switch (performanceLevel) {
    case 'high':
      return {
        colors: ['#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107'],
        message: 'Felicitări! Rezultat excelent!',
        subMessage: 'Ai demonstrat o înțelegere foarte bună a materiei.',
        confettiCount: 80,
        particleCount: 0,
        animationType: 'confetti'
      }
    case 'medium':
      return {
        colors: ['#2196f3', '#03a9f4', '#00bcd4', '#4fc3f7'],
        message: 'Bună treabă!',
        subMessage: 'Rezultat bun, continuă să exersezi pentru a te îmbunătăți.',
        confettiCount: 0,
        particleCount: 40,
        animationType: 'particles'
      }
    case 'low':
      return {
        colors: ['#9c27b0', '#ba68c8', '#ce93d8'],
        message: 'Nu te descuraja!',
        subMessage: 'Fiecare încercare este un pas către progres. Încearcă din nou!',
        confettiCount: 0,
        particleCount: 25,
        animationType: 'supportive'
      }
  }
}

// ============================================================================
// MAIN CELEBRATION ANIMATION COMPONENT
// ============================================================================

const CelebrationAnimation: React.FC<CelebrationAnimationProps> = ({
  score,
  totalQuestions,
  performanceLevel,
  onAnimationComplete
}) => {
  const theme = useTheme()
  const [animationPhase, setAnimationPhase] = useState<AnimationPhase>('loading')
  const [currentScore, setCurrentScore] = useState(0)
  const [showScore, setShowScore] = useState(false)
  const [showMessage, setShowMessage] = useState(false)
  const animationTimeoutRef = useRef<NodeJS.Timeout[]>([])
  const countUpIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Detect reduced motion preference (Requirement 5.5)
  const prefersReducedMotion = APPLE_REDUCED_MOTION.DETECT_REDUCED_MOTION()

  // Get performance configuration
  const config = useMemo(() => getPerformanceConfig(performanceLevel, theme.palette), [performanceLevel, theme])

  // Calculate percentage
  const percentage = useMemo(() => Math.round((score / totalQuestions) * 100), [score, totalQuestions])

  // ============================================================================
  // ANIMATION SEQUENCE - Requirement 5.4: Complete within 4 seconds
  // ============================================================================

  useEffect(() => {
    // Clear any existing timeouts
    animationTimeoutRef.current.forEach(timeout => clearTimeout(timeout))
    animationTimeoutRef.current = []

    if (countUpIntervalRef.current) {
      clearInterval(countUpIntervalRef.current)
    }

    const runAnimationSequence = async () => {
      try {
        // Phase 1: Loading (500ms) - Requirement 5.4
        const loadingTimeout = setTimeout(
          () => {
            setAnimationPhase('score')
            setShowScore(true)
          },
          prefersReducedMotion ? 100 : APPLE_ANIMATION_DURATIONS.CELEBRATION.LOADING
        )
        animationTimeoutRef.current.push(loadingTimeout)

        // Phase 2: Score reveal and count-up (1200ms) - Requirements 5.2, 5.4
        const scoreTimeout = setTimeout(
          () => {
            // Start score count-up animation (Requirement 5.2)
            const countUpDuration = prefersReducedMotion ? 100 : 1000
            const steps = prefersReducedMotion ? 1 : 50
            const increment = score / steps
            const stepDuration = countUpDuration / steps

            let currentStep = 0
            countUpIntervalRef.current = setInterval(() => {
              currentStep++
              if (currentStep <= steps) {
                setCurrentScore(Math.min(Math.round(currentStep * increment), score))
              } else {
                if (countUpIntervalRef.current) {
                  clearInterval(countUpIntervalRef.current)
                  countUpIntervalRef.current = null
                }
              }
            }, stepDuration)
          },
          prefersReducedMotion ? 100 : APPLE_ANIMATION_DURATIONS.CELEBRATION.LOADING
        )
        animationTimeoutRef.current.push(scoreTimeout)

        // Phase 3: Celebration effects (1500ms) - Requirements 5.3, 5.4
        const celebrationTimeout = setTimeout(
          () => {
            setAnimationPhase('celebration')
          },
          prefersReducedMotion
            ? 200
            : APPLE_ANIMATION_DURATIONS.CELEBRATION.LOADING + APPLE_ANIMATION_DURATIONS.CELEBRATION.SCORE_REVEAL
        )
        animationTimeoutRef.current.push(celebrationTimeout)

        // Phase 4: Message display (2000ms) - Requirement 5.4
        const messageTimeout = setTimeout(
          () => {
            setAnimationPhase('message')
            setShowMessage(true)
          },
          prefersReducedMotion
            ? 300
            : APPLE_ANIMATION_DURATIONS.CELEBRATION.LOADING + APPLE_ANIMATION_DURATIONS.CELEBRATION.SCORE_REVEAL + 500
        )
        animationTimeoutRef.current.push(messageTimeout)

        // Phase 5: Complete and transition out (4000ms total) - Requirement 5.4
        const completeTimeout = setTimeout(
          () => {
            setAnimationPhase('complete')
            // Give time for fade out
            const finalTimeout = setTimeout(
              () => {
                onAnimationComplete()
              },
              prefersReducedMotion ? 100 : 500
            )
            animationTimeoutRef.current.push(finalTimeout)
          },
          prefersReducedMotion ? 500 : APPLE_ANIMATION_DURATIONS.CELEBRATION.TOTAL - 500
        )
        animationTimeoutRef.current.push(completeTimeout)
      } catch (error) {
        // Requirement 5.1: Error-free functionality
        console.error('Celebration animation error:', error)
        // Fallback: complete immediately
        onAnimationComplete()
      }
    }

    runAnimationSequence()

    // Cleanup function
    return () => {
      animationTimeoutRef.current.forEach(timeout => clearTimeout(timeout))
      if (countUpIntervalRef.current) {
        clearInterval(countUpIntervalRef.current)
      }
    }
  }, [score, onAnimationComplete, prefersReducedMotion, config])

  // ============================================================================
  // GENERATE CONFETTI AND PARTICLES - Requirement 5.3
  // ============================================================================

  const confettiPieces = useMemo(() => {
    if (config.confettiCount === 0 || prefersReducedMotion) return []

    return Array.from({ length: config.confettiCount }, (_, i) => ({
      id: `confetti-${i}`,
      delay: Math.random() * 1500,
      color: config.colors[Math.floor(Math.random() * config.colors.length)],
      size: Math.random() * 6 + 4,
      left: Math.random() * 100,
      duration: 2500 + Math.random() * 1000
    }))
  }, [config.confettiCount, config.colors, prefersReducedMotion])

  const particles = useMemo(() => {
    if (config.particleCount === 0 || prefersReducedMotion) return []

    return Array.from({ length: config.particleCount }, (_, i) => ({
      id: `particle-${i}`,
      delay: Math.random() * 2000,
      color: config.colors[Math.floor(Math.random() * config.colors.length)],
      size: Math.random() * 5 + 3,
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: 3000 + Math.random() * 1000
    }))
  }, [config.particleCount, config.colors, prefersReducedMotion])

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        backdropFilter: prefersReducedMotion ? 'none' : 'blur(10px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        overflow: 'hidden',
        transition: prefersReducedMotion
          ? 'none'
          : `opacity ${APPLE_ANIMATION_DURATIONS.STANDARD}ms ${APPLE_EASING_FUNCTIONS.DECELERATE}`,
        opacity: animationPhase === 'complete' ? 0 : 1
      }}
    >
      {/* Confetti Animation - Requirement 5.3 */}
      {config.animationType === 'confetti' &&
        (animationPhase === 'celebration' || animationPhase === 'message') &&
        confettiPieces.map(piece => (
          <ConfettiPiece
            key={piece.id}
            delay={piece.delay}
            color={piece.color}
            size={piece.size}
            left={piece.left}
            duration={piece.duration}
          />
        ))}

      {/* Floating Particles - Requirement 5.3 */}
      {(config.animationType === 'particles' || config.animationType === 'supportive') &&
        (animationPhase === 'celebration' || animationPhase === 'message' || animationPhase === 'score') &&
        particles.map(particle => (
          <FloatingParticle
            key={particle.id}
            delay={particle.delay}
            color={particle.color}
            size={particle.size}
            left={particle.left}
            top={particle.top}
            duration={particle.duration}
          />
        ))}

      {/* Loading Phase - Requirement 5.4 */}
      {animationPhase === 'loading' && (
        <Fade in timeout={prefersReducedMotion ? 1 : APPLE_ANIMATION_DURATIONS.STANDARD}>
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress
              size={60}
              thickness={2}
              sx={{
                color: config.colors[0],
                mb: 3
              }}
            />
            <Typography
              variant='h6'
              sx={{
                color: 'white',
                fontWeight: 500,
                fontSize: { xs: '1rem', sm: '1.25rem' }
              }}
            >
              Se calculează rezultatele...
            </Typography>
          </Box>
        </Fade>
      )}

      {/* Score Display - Requirements 5.2, 5.4 */}
      {showScore && animationPhase !== 'loading' && (
        <Zoom in timeout={prefersReducedMotion ? 1 : APPLE_ANIMATION_DURATIONS.CELEBRATION.SCORE_REVEAL}>
          <Box
            sx={{
              textAlign: 'center',
              mb: showMessage ? 4 : 0,
              transition: prefersReducedMotion
                ? 'none'
                : `all ${APPLE_ANIMATION_DURATIONS.STANDARD}ms ${APPLE_EASING_FUNCTIONS.STANDARD}`
            }}
          >
            {/* Circular Progress with Score */}
            <Box
              sx={{
                position: 'relative',
                display: 'inline-flex',
                mb: 3
              }}
            >
              {/* Background circle */}
              <CircularProgress
                variant='determinate'
                value={100}
                size={200}
                thickness={3}
                sx={{
                  color: 'rgba(255, 255, 255, 0.1)',
                  position: 'absolute'
                }}
              />
              {/* Progress circle with animation */}
              <CircularProgress
                variant='determinate'
                value={percentage}
                size={200}
                thickness={3}
                sx={{
                  color: config.colors[0],
                  animation:
                    performanceLevel === 'high' && !prefersReducedMotion
                      ? `${pulseGlow} 2s ease-in-out infinite`
                      : 'none',
                  transition: prefersReducedMotion
                    ? 'none'
                    : `stroke-dashoffset ${APPLE_ANIMATION_DURATIONS.CELEBRATION.SCORE_REVEAL}ms ${APPLE_EASING_FUNCTIONS.SPRING}`
                }}
              />
              {/* Score text */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Typography
                  variant='h2'
                  sx={{
                    color: 'white',
                    fontWeight: 700,
                    animation: prefersReducedMotion
                      ? 'none'
                      : `${scoreReveal} ${APPLE_ANIMATION_DURATIONS.CELEBRATION.SCORE_REVEAL}ms ${APPLE_EASING_FUNCTIONS.SPRING}`,
                    fontSize: { xs: '2.5rem', sm: '3.5rem' }
                  }}
                >
                  {currentScore}
                </Typography>
                <Typography
                  variant='h6'
                  sx={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontWeight: 500,
                    mt: -0.5,
                    fontSize: { xs: '1rem', sm: '1.25rem' }
                  }}
                >
                  din {totalQuestions}
                </Typography>
                <Typography
                  variant='body1'
                  sx={{
                    color: config.colors[0],
                    fontWeight: 600,
                    mt: 1,
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  }}
                >
                  {percentage}%
                </Typography>
              </Box>
            </Box>
          </Box>
        </Zoom>
      )}

      {/* Message Display - Requirement 5.4 */}
      {showMessage && (
        <Fade in timeout={prefersReducedMotion ? 1 : APPLE_ANIMATION_DURATIONS.CELEBRATION.MESSAGE_DISPLAY}>
          <Box
            sx={{
              textAlign: 'center',
              maxWidth: 600,
              px: { xs: 3, sm: 4 },
              animation: prefersReducedMotion
                ? 'none'
                : `${messageFadeIn} ${APPLE_ANIMATION_DURATIONS.STANDARD}ms ${APPLE_EASING_FUNCTIONS.DECELERATE}`
            }}
          >
            <Typography
              variant='h3'
              sx={{
                color: 'white',
                fontWeight: 700,
                mb: 2,
                fontSize: { xs: '1.75rem', sm: '2.5rem' }
              }}
            >
              {config.message}
            </Typography>
            <Typography
              variant='h6'
              sx={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontWeight: 400,
                lineHeight: 1.6,
                fontSize: { xs: '1rem', sm: '1.25rem' }
              }}
            >
              {config.subMessage}
            </Typography>
          </Box>
        </Fade>
      )}
    </Box>
  )
}

// Requirement 5.1: Error-free functionality with proper display name
CelebrationAnimation.displayName = 'CelebrationAnimation'

export default CelebrationAnimation
