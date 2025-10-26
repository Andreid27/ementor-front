// ** React Imports
import React, { useState, useEffect } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import Fade from '@mui/material/Fade'
import Zoom from '@mui/material/Zoom'
import { useTheme } from '@mui/material/styles'
import { keyframes } from '@mui/system'

// ** Icons
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import FlashOnIcon from '@mui/icons-material/FlashOn'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import StarIcon from '@mui/icons-material/Star'
import TimerIcon from '@mui/icons-material/Timer'
import PerfectIcon from '@mui/icons-material/Stars'

// ** Types
import { PerformanceLevel } from '../types'

// ** Constants
import { ANIMATION_DURATIONS, EASING_FUNCTIONS, ANIMATION_DELAYS } from '../../quizzes/constants/animations'
import { SPACING, BORDER_RADIUS } from '../../quizzes/constants/theme'

// ** Keyframe Animations
const badgeBounce = keyframes`
  0% {
    transform: scale(0) rotate(-180deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.2) rotate(-90deg);
    opacity: 1;
  }
  70% {
    transform: scale(0.9) rotate(0deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
`

const badgeGlow = keyframes`
  0%, 100% {
    box-shadow: 0 0 10px rgba(255, 193, 7, 0.3);
  }
  50% {
    box-shadow: 0 0 20px rgba(255, 193, 7, 0.6);
  }
`

const badgeFloat = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-5px);
  }
`

// ** Achievement Types
interface Achievement {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  color: string
  glowColor: string
  earned: boolean
  condition: (score: number, totalQuestions: number, timeSpent: number, performanceLevel: PerformanceLevel) => boolean
}

interface AchievementBadgesProps {
  score: number
  totalQuestions: number
  timeSpent: number
  performanceLevel: PerformanceLevel
  previousBestScore?: number
  isFirstAttempt?: boolean
  averageTime?: number
}

// ** Achievement Definitions
const getAchievements = (theme: any): Achievement[] => [
  {
    id: 'perfect_score',
    title: 'Scor Perfect',
    description: 'Ai răspuns corect la toate întrebările!',
    icon: <PerfectIcon />,
    color: theme.palette.warning.main,
    glowColor: 'rgba(255, 193, 7, 0.6)',
    earned: false,
    condition: (score, totalQuestions) => score === totalQuestions
  },
  {
    id: 'excellent_performance',
    title: 'Performanță Excelentă',
    description: 'Scor de peste 90%!',
    icon: <EmojiEventsIcon />,
    color: theme.palette.success.main,
    glowColor: 'rgba(76, 175, 80, 0.6)',
    earned: false,
    condition: (score, totalQuestions) => (score / totalQuestions) * 100 >= 90
  },
  {
    id: 'speed_demon',
    title: 'Fulgerul',
    description: 'Ai completat testul foarte rapid!',
    icon: <FlashOnIcon />,
    color: theme.palette.info.main,
    glowColor: 'rgba(33, 150, 243, 0.6)',
    earned: false,
    condition: (score, totalQuestions, timeSpent, performanceLevel, averageTime = 1800) =>
      timeSpent < averageTime * 0.7 && performanceLevel !== 'low'
  },
  {
    id: 'improvement',
    title: 'În Progres',
    description: 'Ai îmbunătățit scorul față de ultima încercare!',
    icon: <TrendingUpIcon />,
    color: theme.palette.secondary.main,
    glowColor: 'rgba(156, 39, 176, 0.6)',
    earned: false,
    condition: (score, totalQuestions, timeSpent, performanceLevel, averageTime, previousBestScore = 0) =>
      score > previousBestScore
  },
  {
    id: 'first_try',
    title: 'Prima Încercare',
    description: 'Rezultat excelent din prima încercare!',
    icon: <StarIcon />,
    color: theme.palette.warning.dark,
    glowColor: 'rgba(255, 152, 0, 0.6)',
    earned: false,
    condition: (score, totalQuestions, timeSpent, performanceLevel, averageTime, previousBestScore, isFirstAttempt) =>
      isFirstAttempt === true && performanceLevel === 'high'
  },
  {
    id: 'time_master',
    title: 'Maestru al Timpului',
    description: 'Ai folosit timpul în mod eficient!',
    icon: <TimerIcon />,
    color: theme.palette.info.dark,
    glowColor: 'rgba(25, 118, 210, 0.6)',
    earned: false,
    condition: (score, totalQuestions, timeSpent, performanceLevel, averageTime = 1800) =>
      timeSpent >= averageTime * 0.8 && timeSpent <= averageTime * 1.2 && performanceLevel === 'high'
  }
]

// ** Badge Component
const AchievementBadge: React.FC<{
  achievement: Achievement
  delay: number
  onAnimationComplete?: () => void
}> = ({ achievement, delay, onAnimationComplete }) => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true)
      if (onAnimationComplete) {
        setTimeout(onAnimationComplete, ANIMATION_DURATIONS.LONG)
      }
    }, delay)

    return () => clearTimeout(timer)
  }, [delay, onAnimationComplete])

  if (!achievement.earned) return null

  return (
    <Zoom in={visible} timeout={ANIMATION_DURATIONS.LONG}>
      <Box
        sx={{
          display: 'inline-block',
          m: SPACING.SM
        }}
      >
        <Chip
          icon={achievement.icon}
          label={achievement.title}
          sx={{
            backgroundColor: achievement.color,
            color: 'white',
            fontWeight: 600,
            fontSize: '0.875rem',
            height: 40,
            borderRadius: BORDER_RADIUS.LG,
            animation: `
              ${badgeBounce} ${ANIMATION_DURATIONS.LONG}ms ${EASING_FUNCTIONS.BOUNCE},
              ${badgeGlow} 2s ease-in-out infinite,
              ${badgeFloat} 3s ease-in-out infinite
            `,
            cursor: 'pointer',
            transition: `all ${ANIMATION_DURATIONS.SHORT}ms ${EASING_FUNCTIONS.STANDARD}`,
            '&:hover': {
              transform: 'scale(1.05)',
              boxShadow: `0 4px 20px ${achievement.glowColor}`
            },
            '& .MuiChip-icon': {
              color: 'white',
              fontSize: '1.2rem'
            }
          }}
        />
      </Box>
    </Zoom>
  )
}

// ** Main Component
const AchievementBadges: React.FC<AchievementBadgesProps> = ({
  score,
  totalQuestions,
  timeSpent,
  performanceLevel,
  previousBestScore = 0,
  isFirstAttempt = false,
  averageTime = 1800
}) => {
  const theme = useTheme()
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [earnedCount, setEarnedCount] = useState(0)

  // ** Calculate earned achievements
  useEffect(() => {
    const allAchievements = getAchievements(theme)
    const earnedAchievements = allAchievements.map(achievement => ({
      ...achievement,
      earned: achievement.condition(
        score,
        totalQuestions,
        timeSpent,
        performanceLevel,
        averageTime,
        previousBestScore,
        isFirstAttempt
      )
    }))

    setAchievements(earnedAchievements)
    setEarnedCount(earnedAchievements.filter(a => a.earned).length)
  }, [score, totalQuestions, timeSpent, performanceLevel, previousBestScore, isFirstAttempt, averageTime, theme])

  // ** Don't render if no achievements earned
  if (earnedCount === 0) return null

  return (
    <Fade in timeout={ANIMATION_DURATIONS.LONG}>
      <Box
        sx={{
          textAlign: 'center',
          p: SPACING.LG,
          backgroundColor: theme.palette.background.paper,
          borderRadius: BORDER_RADIUS.LG,
          border: `2px solid ${theme.palette.divider}`,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: `linear-gradient(90deg, ${theme.palette.warning.main}, ${theme.palette.success.main}, ${theme.palette.info.main}, ${theme.palette.secondary.main})`,
            animation: `${badgeGlow} 3s ease-in-out infinite`
          }
        }}
      >
        <Typography
          variant='h6'
          sx={{
            fontWeight: 600,
            mb: SPACING.MD,
            color: 'text.primary',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: SPACING.SM
          }}
        >
          <EmojiEventsIcon sx={{ color: theme.palette.warning.main }} />
          Realizări Obținute ({earnedCount})
        </Typography>

        <Typography
          variant='body2'
          sx={{
            color: 'text.secondary',
            mb: SPACING.LG,
            fontStyle: 'italic'
          }}
        >
          Felicitări pentru aceste realizări speciale!
        </Typography>

        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: SPACING.SM
          }}
        >
          {achievements
            .filter(achievement => achievement.earned)
            .map((achievement, index) => (
              <AchievementBadge
                key={achievement.id}
                achievement={achievement}
                delay={index * ANIMATION_DELAYS.STAGGER}
              />
            ))}
        </Box>

        {/* Achievement descriptions on hover - could be implemented as tooltips */}
        <Box sx={{ mt: SPACING.MD }}>
          <Typography
            variant='caption'
            sx={{
              color: 'text.secondary',
              fontStyle: 'italic'
            }}
          >
            Treci cu mouse-ul peste insignele pentru a vedea descrierile
          </Typography>
        </Box>
      </Box>
    </Fade>
  )
}

export default AchievementBadges
