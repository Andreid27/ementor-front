// ** React Imports
import React, { useState, useEffect, useMemo } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { Button } from '@mui/material'
import Chip from '@mui/material/Chip'
import LinearProgress from '@mui/material/LinearProgress'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Grid from '@mui/material/Grid'
import Fade from '@mui/material/Fade'
import Slide from '@mui/material/Slide'
import Grow from '@mui/material/Grow'
import { useTheme } from '@mui/material/styles'
import { keyframes } from '@mui/system'

// ** Icons
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import RefreshIcon from '@mui/icons-material/Refresh'
import HomeIcon from '@mui/icons-material/Home'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import QuizIcon from '@mui/icons-material/Quiz'

// ** Types
import { QuizResultsProps, PerformanceLevel } from '../types'
import { QuestionDTO } from '../../../generated/quiz-service/api'

// ** Constants
import { ANIMATION_DURATIONS, EASING_FUNCTIONS, ANIMATION_DELAYS } from '../../quizzes/constants/animations'
import { SPACING, BORDER_RADIUS, ELEVATION } from '../../quizzes/constants/theme'

// ** Utils
import { calculatePerformanceLevel } from '../../quizzes/utils/transformers'

// ** Custom Components
import AchievementBadges from './AchievementBadges'

// ** Keyframe Animations
const slideInFromBottom = keyframes`
  0% {
    transform: translateY(50px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
`

const bounceIn = keyframes`
  0% {
    transform: scale(0.3);
    opacity: 0;
  }
  50% {
    transform: scale(1.05);
    opacity: 1;
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`

const progressFill = keyframes`
  0% {
    width: 0%;
  }
  100% {
    width: var(--target-width);
  }
`

const pulseSuccess = keyframes`
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.4);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(76, 175, 80, 0);
  }
`

const pulseError = keyframes`
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.4);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(244, 67, 54, 0);
  }
`

const accordionExpand = keyframes`
  0% {
    max-height: 0;
    opacity: 0;
    transform: translateY(-10px);
  }
  100% {
    max-height: 500px;
    opacity: 1;
    transform: translateY(0);
  }
`

const cardHoverGlow = keyframes`
  0%, 100% {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  50% {
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
`

// ** Performance Chart Component
const PerformanceChart: React.FC<{
  score: number
  totalQuestions: number
  timeSpent: number
  maxTime?: number
  delay: number
}> = ({ score, totalQuestions, timeSpent, maxTime = 3600, delay }) => {
  const theme = useTheme()
  const [animated, setAnimated] = useState(false)

  const percentage = (score / totalQuestions) * 100
  const timePercentage = Math.min((timeSpent / maxTime) * 100, 100)

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <Fade in timeout={ANIMATION_DURATIONS.LONG}>
      <Card
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
          boxShadow: theme.shadows[ELEVATION.CARD],
          borderRadius: BORDER_RADIUS.LG
        }}
      >
        <CardContent sx={{ p: SPACING.LG }}>
          <Typography
            variant='h6'
            sx={{
              fontWeight: 600,
              mb: SPACING.LG,
              display: 'flex',
              alignItems: 'center',
              gap: SPACING.SM
            }}
          >
            <TrendingUpIcon color='primary' />
            Analiza performanței
          </Typography>

          <Grid container spacing={SPACING.LG}>
            {/* Score Metric */}
            <Grid item xs={12} sm={6}>
              <Box sx={{ mb: SPACING.MD }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant='body2' color='text.secondary'>
                    Scor obținut
                  </Typography>
                  <Typography variant='body2' fontWeight={600}>
                    {score}/{totalQuestions} ({Math.round(percentage)}%)
                  </Typography>
                </Box>
                <Box sx={{ position: 'relative' }}>
                  <LinearProgress
                    variant='determinate'
                    value={100}
                    sx={{
                      height: 8,
                      borderRadius: BORDER_RADIUS.SM,
                      backgroundColor: theme.palette.grey[200]
                    }}
                  />
                  <LinearProgress
                    variant='determinate'
                    value={animated ? percentage : 0}
                    sx={{
                      height: 8,
                      borderRadius: BORDER_RADIUS.SM,
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      transition: `all ${ANIMATION_DURATIONS.CELEBRATION}ms ${EASING_FUNCTIONS.STANDARD}`,
                      '& .MuiLinearProgress-bar': {
                        backgroundColor:
                          percentage >= 80
                            ? theme.palette.success.main
                            : percentage >= 60
                            ? theme.palette.warning.main
                            : theme.palette.error.main
                      }
                    }}
                  />
                </Box>
              </Box>
            </Grid>

            {/* Time Metric */}
            <Grid item xs={12} sm={6}>
              <Box sx={{ mb: SPACING.MD }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant='body2' color='text.secondary'>
                    Timp utilizat
                  </Typography>
                  <Typography variant='body2' fontWeight={600}>
                    {formatTime(timeSpent)}
                  </Typography>
                </Box>
                <Box sx={{ position: 'relative' }}>
                  <LinearProgress
                    variant='determinate'
                    value={100}
                    sx={{
                      height: 8,
                      borderRadius: BORDER_RADIUS.SM,
                      backgroundColor: theme.palette.grey[200]
                    }}
                  />
                  <LinearProgress
                    variant='determinate'
                    value={animated ? timePercentage : 0}
                    sx={{
                      height: 8,
                      borderRadius: BORDER_RADIUS.SM,
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      transition: `all ${ANIMATION_DURATIONS.CELEBRATION}ms ${EASING_FUNCTIONS.STANDARD}`,
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: theme.palette.info.main
                      }
                    }}
                  />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Fade>
  )
}

// ** Question Result Item Component
const QuestionResultItem: React.FC<{
  question: QuestionDTO
  userAnswer: number
  correctAnswer: number
  index: number
  delay: number
}> = ({ question, userAnswer, correctAnswer, index, delay }) => {
  const theme = useTheme()
  const [visible, setVisible] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const isCorrect = userAnswer === correctAnswer
  const answers = [
    { index: 1, text: question.answer1 || '', isEmpty: !question.answer1 || question.answer1.trim() === '' },
    { index: 2, text: question.answer2 || '', isEmpty: !question.answer2 || question.answer2.trim() === '' },
    { index: 3, text: question.answer3 || '', isEmpty: !question.answer3 || question.answer3.trim() === '' },
    { index: 4, text: question.answer4 || '', isEmpty: !question.answer4 || question.answer4.trim() === '' },
    { index: 5, text: question.answer5 || '', isEmpty: !question.answer5 || question.answer5.trim() === '' }
  ].filter(answer => !answer.isEmpty)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  // Auto-expand after a delay for better UX
  useEffect(() => {
    if (visible) {
      const expandTimer = setTimeout(() => setExpanded(true), 300)
      return () => clearTimeout(expandTimer)
    }
  }, [visible])

  return (
    <Slide direction='up' in={visible} timeout={ANIMATION_DURATIONS.MEDIUM}>
      <Card
        sx={{
          mb: SPACING.MD,
          borderLeft: `4px solid ${isCorrect ? theme.palette.success.main : theme.palette.error.main}`,
          transition: `all ${ANIMATION_DURATIONS.SHORT}ms ${EASING_FUNCTIONS.STANDARD}`,
          cursor: 'pointer',
          '&:hover': {
            boxShadow: theme.shadows[ELEVATION.HOVER],
            transform: 'translateY(-2px)',
            animation: `${cardHoverGlow} 1s ease-in-out`
          }
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: SPACING.MD }}>
            {/* Question Number and Status */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: SPACING.SM,
                minWidth: 'fit-content'
              }}
            >
              <Typography
                variant='h6'
                sx={{
                  fontWeight: 600,
                  color: 'text.secondary',
                  minWidth: 30
                }}
              >
                {index + 1}.
              </Typography>
              <Box
                sx={{
                  animation: isCorrect
                    ? `${pulseSuccess} 2s ease-in-out infinite`
                    : `${pulseError} 2s ease-in-out infinite`
                }}
              >
                {isCorrect ? (
                  <CheckCircleIcon sx={{ color: 'success.main', fontSize: 24 }} />
                ) : (
                  <CancelIcon sx={{ color: 'error.main', fontSize: 24 }} />
                )}
              </Box>
            </Box>

            {/* Question Content */}
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Typography
                  variant='body1'
                  sx={{
                    fontWeight: 500,
                    mb: SPACING.MD,
                    lineHeight: 1.6,
                    flex: 1
                  }}
                >
                  {question.content}
                </Typography>
                <ExpandMoreIcon
                  sx={{
                    transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: `transform ${ANIMATION_DURATIONS.SHORT}ms ${EASING_FUNCTIONS.STANDARD}`,
                    color: 'text.secondary',
                    ml: SPACING.SM
                  }}
                />
              </Box>

              {/* Answer Options */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: SPACING.SM,
                  overflow: 'hidden',
                  maxHeight: expanded ? '500px' : '0px',
                  opacity: expanded ? 1 : 0,
                  transition: `all ${ANIMATION_DURATIONS.MEDIUM}ms ${EASING_FUNCTIONS.STANDARD}`,
                  animation: expanded
                    ? `${accordionExpand} ${ANIMATION_DURATIONS.MEDIUM}ms ${EASING_FUNCTIONS.STANDARD}`
                    : 'none'
                }}
              >
                {answers.map((answer, answerIndex) => {
                  const answerNumber = answer.index
                  const isUserAnswer = userAnswer === answerNumber
                  const isCorrectAnswer = correctAnswer === answerNumber

                  return (
                    <Box
                      key={answer.index}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: SPACING.SM,
                        p: SPACING.SM,
                        borderRadius: BORDER_RADIUS.SM,
                        backgroundColor: isCorrectAnswer
                          ? theme.palette.success.light + '20'
                          : isUserAnswer && !isCorrectAnswer
                          ? theme.palette.error.light + '20'
                          : 'transparent',
                        border: `1px solid ${
                          isCorrectAnswer
                            ? theme.palette.success.main
                            : isUserAnswer && !isCorrectAnswer
                            ? theme.palette.error.main
                            : theme.palette.divider
                        }`,
                        transition: `all ${ANIMATION_DURATIONS.SHORT}ms ${EASING_FUNCTIONS.STANDARD}`,
                        '&:hover': {
                          transform: 'translateX(4px)',
                          boxShadow: theme.shadows[2]
                        }
                      }}
                    >
                      <Typography
                        variant='body2'
                        sx={{
                          fontWeight: 600,
                          color: isCorrectAnswer
                            ? 'success.main'
                            : isUserAnswer && !isCorrectAnswer
                            ? 'error.main'
                            : 'text.secondary',
                          minWidth: 20
                        }}
                      >
                        {String.fromCharCode(65 + answer.index - 1)}.
                      </Typography>
                      <Typography
                        variant='body2'
                        sx={{
                          flex: 1,
                          color: isCorrectAnswer
                            ? 'success.dark'
                            : isUserAnswer && !isCorrectAnswer
                            ? 'error.dark'
                            : 'text.primary'
                        }}
                      >
                        {answer.text}
                      </Typography>
                      {isCorrectAnswer && <CheckCircleIcon sx={{ color: 'success.main', fontSize: 16 }} />}
                      {isUserAnswer && !isCorrectAnswer && <CancelIcon sx={{ color: 'error.main', fontSize: 16 }} />}
                    </Box>
                  )
                })}
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Slide>
  )
}

// ** Main Component
const QuizResults: React.FC<QuizResultsProps> = ({
  score,
  totalQuestions,
  answers,
  correctAnswers,
  questions,
  timeSpent,
  onReturnToQuizzes,
  onReviewAnswers
}) => {
  const theme = useTheme()
  const [showDetails, setShowDetails] = useState(false)

  // ** Calculate performance metrics
  const percentage = Math.round((score / totalQuestions) * 100)
  const performanceLevel: PerformanceLevel = calculatePerformanceLevel(score, totalQuestions)

  // ** Get personalized message
  const getPersonalizedMessage = () => {
    switch (performanceLevel) {
      case 'high':
        return {
          title: 'Rezultat excelent!',
          message: 'Felicitări! Ai demonstrat o înțelegere foarte bună a materiei. Continuă să excelezi!',
          color: theme.palette.success.main
        }
      case 'medium':
        return {
          title: 'Rezultat bun!',
          message:
            'Bună treabă! Ai obținut un scor solid. Cu puțină practică în plus, vei putea obține rezultate și mai bune.',
          color: theme.palette.warning.main
        }
      case 'low':
        return {
          title: 'Continuă să exersezi!',
          message:
            'Nu te descuraja! Fiecare test este o oportunitate de învățare. Revizuiește materialul și încearcă din nou.',
          color: theme.palette.info.main
        }
    }
  }

  const personalizedMessage = getPersonalizedMessage()

  // ** Format time
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto', p: SPACING.MD }}>
      {/* Header Section */}
      <Fade in timeout={ANIMATION_DURATIONS.LONG}>
        <Card
          sx={{
            mb: SPACING.LG,
            background: `linear-gradient(135deg, ${personalizedMessage.color}15 0%, ${theme.palette.background.paper} 100%)`,
            borderTop: `4px solid ${personalizedMessage.color}`
          }}
        >
          <CardContent sx={{ p: SPACING.XL }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography
                variant='h3'
                sx={{
                  fontWeight: 700,
                  color: personalizedMessage.color,
                  mb: SPACING.MD,
                  animation: `${slideInFromBottom} ${ANIMATION_DURATIONS.LONG}ms ${EASING_FUNCTIONS.BOUNCE}`
                }}
              >
                {personalizedMessage.title}
              </Typography>

              <Typography
                variant='h6'
                sx={{
                  color: 'text.secondary',
                  mb: SPACING.LG,
                  maxWidth: 600,
                  mx: 'auto',
                  lineHeight: 1.6
                }}
              >
                {personalizedMessage.message}
              </Typography>

              {/* Score Display */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: SPACING.LG,
                  flexWrap: 'wrap'
                }}
              >
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant='h2' sx={{ fontWeight: 700, color: personalizedMessage.color }}>
                    {score}
                  </Typography>
                  <Typography variant='body1' color='text.secondary'>
                    din {totalQuestions} întrebări
                  </Typography>
                </Box>

                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant='h2' sx={{ fontWeight: 700, color: personalizedMessage.color }}>
                    {percentage}%
                  </Typography>
                  <Typography variant='body1' color='text.secondary'>
                    scor obținut
                  </Typography>
                </Box>

                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant='h4' sx={{ fontWeight: 600, color: 'text.primary' }}>
                    {formatTime(timeSpent)}
                  </Typography>
                  <Typography variant='body1' color='text.secondary'>
                    timp utilizat
                  </Typography>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Fade>

      {/* Performance Chart */}
      <Box sx={{ mb: SPACING.LG }}>
        <PerformanceChart
          score={score}
          totalQuestions={totalQuestions}
          timeSpent={timeSpent}
          delay={ANIMATION_DELAYS.STAGGER}
        />
      </Box>

      {/* Achievement Badges */}
      <Box sx={{ mb: SPACING.LG }}>
        <AchievementBadges
          score={score}
          totalQuestions={totalQuestions}
          timeSpent={timeSpent}
          performanceLevel={performanceLevel}
          previousBestScore={0} // This would come from props in a real implementation
          isFirstAttempt={true} // This would come from props in a real implementation
          averageTime={1800} // This would come from props in a real implementation
        />
      </Box>

      {/* Action Buttons */}
      <Grow in timeout={ANIMATION_DURATIONS.LONG}>
        <Card sx={{ mb: SPACING.LG }}>
          <CardContent>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                gap: SPACING.MD,
                flexWrap: 'wrap'
              }}
            >
              <Button
                variant='contained'
                size='large'
                startIcon={<RefreshIcon />}
                onClick={onReviewAnswers}
                sx={{
                  borderRadius: BORDER_RADIUS.LG,
                  px: SPACING.LG,
                  py: SPACING.MD,
                  animation: `${bounceIn} ${ANIMATION_DURATIONS.LONG}ms ${EASING_FUNCTIONS.BOUNCE} 500ms both`,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: theme.shadows[ELEVATION.HOVER]
                  }
                }}
              >
                Revizuiește răspunsurile
              </Button>

              <Button
                variant='outlined'
                size='large'
                startIcon={<HomeIcon />}
                onClick={onReturnToQuizzes}
                sx={{
                  borderRadius: BORDER_RADIUS.LG,
                  px: SPACING.LG,
                  py: SPACING.MD,
                  animation: `${bounceIn} ${ANIMATION_DURATIONS.LONG}ms ${EASING_FUNCTIONS.BOUNCE} 700ms both`,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: theme.shadows[ELEVATION.HOVER]
                  }
                }}
              >
                Înapoi la teste
              </Button>

              <Button
                variant='text'
                size='large'
                startIcon={<QuizIcon />}
                onClick={() => setShowDetails(!showDetails)}
                sx={{
                  borderRadius: BORDER_RADIUS.LG,
                  px: SPACING.LG,
                  py: SPACING.MD,
                  animation: `${bounceIn} ${ANIMATION_DURATIONS.LONG}ms ${EASING_FUNCTIONS.BOUNCE} 900ms both`,
                  '&:hover': {
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                {showDetails ? 'Ascunde detaliile' : 'Vezi detaliile'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grow>

      {/* Detailed Results */}
      {showDetails && (
        <Fade in timeout={ANIMATION_DURATIONS.LONG}>
          <Card>
            <CardContent sx={{ p: SPACING.LG }}>
              <Typography
                variant='h5'
                sx={{
                  fontWeight: 600,
                  mb: SPACING.SM,
                  display: 'flex',
                  alignItems: 'center',
                  gap: SPACING.SM
                }}
              >
                <QuizIcon color='primary' />
                Rezultate detaliate
              </Typography>

              <Typography
                variant='body2'
                sx={{
                  color: 'text.secondary',
                  mb: SPACING.LG,
                  fontStyle: 'italic'
                }}
              >
                Fă clic pe o întrebare pentru a vedea toate opțiunile de răspuns
              </Typography>

              <Box>
                {questions.map((question, index) => (
                  <QuestionResultItem
                    key={question.id || index}
                    question={question}
                    userAnswer={answers[question.id || '']}
                    correctAnswer={correctAnswers[question.id || ''] || question.correctAnswer || 1}
                    index={index}
                    delay={index * ANIMATION_DELAYS.RESULT_ITEM}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Fade>
      )}
    </Box>
  )
}

export default QuizResults
