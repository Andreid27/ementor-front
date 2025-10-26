// ** React Imports
import React, { useState, useEffect, useCallback } from 'react'

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

// ** Constants
import { ANIMATION_DURATIONS, EASING_FUNCTIONS } from '../../quizzes/constants/animations'
import { SPACING, ELEVATION } from '../../quizzes/constants/theme'

// ** Keyframe Animations
const confettiAnimation = keyframes`
  0% {
    transform: translateY(-100vh) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(720deg);
    opacity: 0;
  }
`

const particleFloat = keyframes`
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
    opacity: 0.7;
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
    opacity: 1;
  }
`

const pulseGlow = keyframes`
  0%, 100% {
    box-shadow: 0 0 20px rgba(76, 175, 80, 0.3);
  }
  50% {
    box-shadow: 0 0 40px rgba(76, 175, 80, 0.6);
  }
`

const scoreCountUp = keyframes`
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`

// ** Confetti Component
const ConfettiPiece: React.FC<{ delay: number; color: string; size: number; left: number }> = ({
  delay,
  color,
  size,
  left
}) => (
  <Box
    sx={{
      position: 'absolute',
      top: '-10px',
      left: `${left}%`,
      width: `${size}px`,
      height: `${size}px`,
      backgroundColor: color,
      borderRadius: size > 6 ? '2px' : '50%',
      animation: `${confettiAnimation} 3s linear ${delay}ms infinite`,
      zIndex: 1000
    }}
  />
)

// ** Particle Component
const FloatingParticle: React.FC<{ delay: number; color: string; size: number; left: number; top: number }> = ({
  delay,
  color,
  size,
  left,
  top
}) => (
  <Box
    sx={{
      position: 'absolute',
      left: `${left}%`,
      top: `${top}%`,
      width: `${size}px`,
      height: `${size}px`,
      backgroundColor: color,
      borderRadius: '50%',
      animation: `${particleFloat} 4s ease-in-out ${delay}ms infinite`,
      opacity: 0.7,
      zIndex: 999
    }}
  />
)

// ** Main Component
const CelebrationAnimation: React.FC<CelebrationAnimationProps> = ({
  score,
  totalQuestions,
  performanceLevel,
  onAnimationComplete
}) => {
  const theme = useTheme()
  const [currentScore, setCurrentScore] = useState(0)
  const [showScore, setShowScore] = useState(false)
  const [showMessage, setShowMessage] = useState(false)
  const [animationPhase, setAnimationPhase] = useState<'loading' | 'celebration' | 'score' | 'message' | 'complete'>(
    'loading'
  )

  // ** Calculate percentage
  const percentage = Math.round((score / totalQuestions) * 100)

  // ** Get performance-based configuration
  const getPerformanceConfig = useCallback(() => {
    switch (performanceLevel) {
      case 'high':
        return {
          colors: [theme.palette.success.main, theme.palette.success.light, '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b'],
          message: 'Felicitări! Rezultat excelent!',
          subMessage: 'Ai demonstrat o înțelegere foarte bună a materiei.',
          particleCount: 50,
          confettiCount: 100,
          animationType: 'confetti'
        }
      case 'medium':
        return {
          colors: [theme.palette.warning.main, theme.palette.warning.light, '#ff9800', '#ffc107', '#ffeb3b'],
          message: 'Bună treabă!',
          subMessage: 'Rezultat bun, continuă să exersezi pentru a te îmbunătăți.',
          particleCount: 30,
          confettiCount: 0,
          animationType: 'particles'
        }
      case 'low':
        return {
          colors: [theme.palette.info.main, theme.palette.info.light, '#2196f3', '#03a9f4'],
          message: 'Nu te descuraja!',
          subMessage: 'Fiecare încercare este un pas către progres. Încearcă din nou!',
          particleCount: 20,
          confettiCount: 0,
          animationType: 'supportive'
        }
      default:
        return {
          colors: [theme.palette.primary.main],
          message: 'Test completat!',
          subMessage: 'Mulțumim pentru participare.',
          particleCount: 20,
          confettiCount: 0,
          animationType: 'supportive'
        }
    }
  }, [performanceLevel, theme])

  const config = getPerformanceConfig()

  // ** Animation sequence
  useEffect(() => {
    const sequence = async () => {
      // Phase 1: Loading (500ms)
      await new Promise(resolve => setTimeout(resolve, 500))
      setAnimationPhase('celebration')

      // Phase 2: Celebration animation (1500ms)
      await new Promise(resolve => setTimeout(resolve, 1500))
      setAnimationPhase('score')
      setShowScore(true)

      // Phase 3: Score count-up animation (1000ms)
      const countUpDuration = 1000
      const steps = 50
      const increment = score / steps
      const stepDuration = countUpDuration / steps

      for (let i = 0; i <= steps; i++) {
        setTimeout(() => {
          setCurrentScore(Math.min(Math.round(i * increment), score))
        }, i * stepDuration)
      }

      await new Promise(resolve => setTimeout(resolve, countUpDuration + 200))
      setAnimationPhase('message')
      setShowMessage(true)

      // Phase 4: Message display (2000ms)
      await new Promise(resolve => setTimeout(resolve, 2000))
      setAnimationPhase('complete')

      // Phase 5: Transition out (500ms)
      await new Promise(resolve => setTimeout(resolve, 500))
      onAnimationComplete()
    }

    sequence()
  }, [score, onAnimationComplete])

  // ** Generate confetti pieces
  const confettiPieces = React.useMemo(() => {
    if (config.confettiCount === 0) return []

    return Array.from({ length: config.confettiCount }, (_, i) => ({
      id: i,
      delay: Math.random() * 2000,
      color: config.colors[Math.floor(Math.random() * config.colors.length)],
      size: Math.random() * 8 + 4,
      left: Math.random() * 100
    }))
  }, [config.confettiCount, config.colors])

  // ** Generate floating particles
  const particles = React.useMemo(() => {
    return Array.from({ length: config.particleCount }, (_, i) => ({
      id: i,
      delay: Math.random() * 3000,
      color: config.colors[Math.floor(Math.random() * config.colors.length)],
      size: Math.random() * 6 + 3,
      left: Math.random() * 100,
      top: Math.random() * 100
    }))
  }, [config.particleCount, config.colors])

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
        zIndex: 9999,
        overflow: 'hidden'
      }}
    >
      {/* Confetti Animation */}
      {config.animationType === 'confetti' &&
        animationPhase === 'celebration' &&
        confettiPieces.map(piece => (
          <ConfettiPiece key={piece.id} delay={piece.delay} color={piece.color} size={piece.size} left={piece.left} />
        ))}

      {/* Floating Particles */}
      {(config.animationType === 'particles' || config.animationType === 'supportive') &&
        (animationPhase === 'celebration' || animationPhase === 'score') &&
        particles.map(particle => (
          <FloatingParticle
            key={particle.id}
            delay={particle.delay}
            color={particle.color}
            size={particle.size}
            left={particle.left}
            top={particle.top}
          />
        ))}

      {/* Loading Phase */}
      {animationPhase === 'loading' && (
        <Fade in timeout={500}>
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress
              size={60}
              sx={{
                color: theme.palette.primary.main,
                mb: SPACING.LG
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
        </Fade>
      )}

      {/* Score Display */}
      {showScore && (
        <Zoom in timeout={ANIMATION_DURATIONS.LONG}>
          <Box
            sx={{
              textAlign: 'center',
              mb: SPACING.XL
            }}
          >
            {/* Circular Progress with Score */}
            <Box
              sx={{
                position: 'relative',
                display: 'inline-flex',
                mb: SPACING.LG
              }}
            >
              <CircularProgress
                variant='determinate'
                value={100}
                size={200}
                thickness={4}
                sx={{
                  color: 'rgba(255, 255, 255, 0.1)',
                  position: 'absolute'
                }}
              />
              <CircularProgress
                variant='determinate'
                value={percentage}
                size={200}
                thickness={4}
                sx={{
                  color: config.colors[0],
                  animation: performanceLevel === 'high' ? `${pulseGlow} 2s ease-in-out infinite` : 'none',
                  transition: `all ${ANIMATION_DURATIONS.LONG}ms ${EASING_FUNCTIONS.STANDARD}`
                }}
              />
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
                    animation: `${scoreCountUp} ${ANIMATION_DURATIONS.LONG}ms ${EASING_FUNCTIONS.BOUNCE}`,
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
                    mt: -1
                  }}
                >
                  din {totalQuestions}
                </Typography>
                <Typography
                  variant='body1'
                  sx={{
                    color: config.colors[0],
                    fontWeight: 600,
                    mt: 1
                  }}
                >
                  {percentage}%
                </Typography>
              </Box>
            </Box>
          </Box>
        </Zoom>
      )}

      {/* Message Display */}
      {showMessage && (
        <Fade in timeout={ANIMATION_DURATIONS.LONG}>
          <Box
            sx={{
              textAlign: 'center',
              maxWidth: 600,
              px: SPACING.LG
            }}
          >
            <Typography
              variant='h3'
              sx={{
                color: 'white',
                fontWeight: 700,
                mb: SPACING.MD,
                fontSize: { xs: '2rem', sm: '3rem' }
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

      {/* Completion Phase - Fade Out */}
      {animationPhase === 'complete' && (
        <Fade in={false} timeout={500}>
          <Box />
        </Fade>
      )}
    </Box>
  )
}

export default CelebrationAnimation
