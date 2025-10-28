/**
 * Apple Design System Usage Examples
 *
 * Demonstrates how to use the Apple Design System in React components
 * for the quiz interface redesign.
 */

import React from 'react'
import { Box, Card, Typography, Button, FormControlLabel, Radio } from '@mui/material'
import { useAppleDesignSystem, useAppleTypography, useAppleSpacing } from './useAppleDesignSystem'

/**
 * Example Progress Card Component (Requirements 1.1-1.5)
 */
export const ExampleProgressCard: React.FC<{
  title: string
  progress: number
  timeRemaining: string
  compact?: boolean
}> = ({ title, progress, timeRemaining, compact = false }) => {
  const { spacing, colors, borderRadius, elevation } = useAppleDesignSystem()
  const titleTypography = useAppleTypography('bodyLarge')
  const captionTypography = useAppleTypography('caption')

  return (
    <Box
      className={`quiz-progress-card ${compact ? 'compact' : ''}`}
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        padding: spacing.getComponentPadding('progress'),
        backgroundColor: colors.get('background', 'secondary'),
        borderBottom: `1px solid ${colors.get('border')}`,
        boxShadow: elevation.getComponent('progress'),
        backdropFilter: 'blur(8px)',
        minHeight: compact ? 48 : 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        transition: `all ${300}ms cubic-bezier(0.4, 0, 0.2, 1)`
      }}
    >
      <Box sx={{ flex: 1 }}>
        <Typography sx={titleTypography}>{title}</Typography>
        <Box
          sx={{
            width: '100%',
            height: 4,
            backgroundColor: colors.get('border'),
            borderRadius: borderRadius.get('small'),
            mt: spacing.get(0.5),
            overflow: 'hidden'
          }}
        >
          <Box
            sx={{
              width: `${progress}%`,
              height: '100%',
              backgroundColor: colors.get('primary'),
              borderRadius: borderRadius.get('small'),
              transition: `width 300ms cubic-bezier(0.4, 0, 0.2, 1)`
            }}
          />
        </Box>
        {!compact && (
          <Typography sx={{ ...captionTypography, mt: spacing.get(0.5) }}>
            Progres: {progress}% • {timeRemaining}
          </Typography>
        )}
      </Box>
      {compact && <Typography sx={captionTypography}>{timeRemaining}</Typography>}
    </Box>
  )
}

/**
 * Example Question Card Component (Requirements 2.1-2.5)
 */
export const ExampleQuestionCard: React.FC<{
  questionNumber: number
  totalQuestions: number
  questionText: string
  children: React.ReactNode
}> = ({ questionNumber, totalQuestions, questionText, children }) => {
  const { spacing, colors, borderRadius, elevation } = useAppleDesignSystem()
  const questionTypography = useAppleTypography('bodyLarge')
  const captionTypography = useAppleTypography('caption')

  return (
    <Card
      className='quiz-question-card'
      sx={{
        padding: spacing.getComponentPadding('question'),
        marginBottom: spacing.values.QUESTION_SPACING.DESKTOP,
        borderRadius: borderRadius.getComponent('questionCard'),
        backgroundColor: colors.get('background'),
        border: `1px solid ${colors.get('border')}`,
        boxShadow: elevation.getComponent('question'),
        transition: `all 300ms cubic-bezier(0.4, 0, 0.2, 1)`,

        '&:hover': {
          transform: 'translateY(-1px)',
          boxShadow: elevation.get('floating')
        },

        '&:focus-within': {
          borderColor: colors.get('primary'),
          boxShadow: `${elevation.get('floating')}, 0 0 0 3px rgba(0, 122, 255, 0.1)`
        },

        '@media (max-width: 767px)': {
          marginBottom: spacing.values.QUESTION_SPACING.MOBILE
        }
      }}
    >
      <Typography
        className='quiz-question-number'
        sx={{
          ...captionTypography,
          color: colors.get('text', 'secondary'),
          marginBottom: spacing.get(1)
        }}
      >
        Întrebarea {questionNumber} din {totalQuestions}
      </Typography>

      <Typography
        className='quiz-question-text'
        sx={{
          ...questionTypography,
          color: colors.get('text'),
          marginBottom: spacing.get(3)
        }}
      >
        {questionText}
      </Typography>

      {children}
    </Card>
  )
}

/**
 * Example Radio Component (Requirements 3.1-3.5)
 */
export const ExampleRadioOption: React.FC<{
  value: string
  label: string
  selected: boolean
  disabled?: boolean
  onChange: (value: string) => void
}> = ({ value, label, selected, disabled = false, onChange }) => {
  const { spacing, colors, borderRadius, animation } = useAppleDesignSystem()
  const bodyTypography = useAppleTypography('bodyRegular')

  return (
    <FormControlLabel
      className={`quiz-answer-option ${selected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
      control={
        <Radio
          checked={selected}
          onChange={() => onChange(value)}
          disabled={disabled}
          sx={{
            padding: spacing.get(1),
            transition: `all ${animation.getDuration('micro')}ms ${animation.getEasing('standard')}`,

            '&:hover': {
              backgroundColor: colors.getInteractive('hover', 'background')
            },

            '&.Mui-checked': {
              color: colors.get('primary')
            }
          }}
        />
      }
      label={label}
      sx={{
        margin: 0,
        marginBottom: spacing.values.ANSWER_SPACING,
        padding: `${spacing.get(1)}px ${spacing.get(2)}px`,
        border: `1px solid ${selected ? colors.getInteractive('selected', 'border') : colors.get('border')}`,
        borderRadius: borderRadius.getComponent('radio'),
        backgroundColor: selected ? colors.getInteractive('selected', 'background') : colors.get('background'),
        minHeight: spacing.values.TOUCH_TARGET.MINIMUM,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: `all ${animation.getDuration('micro')}ms ${animation.getEasing('standard')}`,

        '&:hover': !disabled && {
          borderColor: colors.get('primary'),
          backgroundColor: colors.getInteractive('hover', 'background')
        },

        '&:focus': {
          outline: 'none',
          borderColor: colors.get('primary'),
          boxShadow: '0 0 0 3px rgba(0, 122, 255, 0.1)'
        },

        '@media (max-width: 767px)': {
          minHeight: spacing.values.TOUCH_TARGET.MOBILE
        },

        '& .MuiFormControlLabel-label': {
          ...bodyTypography,
          color: disabled ? colors.getInteractive('disabled', 'text') : colors.get('text')
        }
      }}
      disabled={disabled}
    />
  )
}

/**
 * Example Submit Card Component (Requirements 4.1-4.5)
 */
export const ExampleSubmitCard: React.FC<{
  answeredQuestions: number
  totalQuestions: number
  onSubmit: () => void
  onReview: () => void
  isLoading?: boolean
}> = ({ answeredQuestions, totalQuestions, onSubmit, onReview, isLoading = false }) => {
  const { spacing, colors, borderRadius, elevation, components } = useAppleDesignSystem()
  const bodyTypography = useAppleTypography('bodyRegular')
  const displayTypography = useAppleTypography('display')

  return (
    <Card
      className='quiz-submit-card'
      sx={{
        maxWidth: components.SUBMIT_CARD.MAX_WIDTH,
        margin: `${spacing.get(4)}px auto`,
        padding: spacing.getComponentPadding('submit'),
        borderRadius: borderRadius.get('large'),
        backgroundColor: colors.get('background'),
        border: `1px solid ${colors.get('border')}`,
        boxShadow: elevation.getComponent('submit'),
        textAlign: 'center'
      }}
    >
      <Typography sx={{ ...displayTypography, marginBottom: spacing.get(2) }}>Ești gata să trimiți?</Typography>

      <Typography sx={{ ...bodyTypography, marginBottom: spacing.get(3) }}>
        Ai răspuns la {answeredQuestions} din {totalQuestions} întrebări
      </Typography>

      <Typography sx={{ ...bodyTypography, marginBottom: spacing.get(4), color: colors.get('text', 'secondary') }}>
        Completează întrebările rămase sau trimite testul
      </Typography>

      <Box sx={{ display: 'flex', gap: spacing.get(2), justifyContent: 'center' }}>
        <Button
          variant='outlined'
          onClick={onReview}
          disabled={isLoading}
          sx={{
            minHeight: components.SUBMIT_CARD.BUTTON_HEIGHT.DESKTOP,
            borderRadius: borderRadius.get('medium'),

            '@media (max-width: 767px)': {
              minHeight: components.SUBMIT_CARD.BUTTON_HEIGHT.MOBILE
            }
          }}
        >
          Revizuiește
        </Button>

        <Button
          className='quiz-submit-button'
          variant='contained'
          onClick={onSubmit}
          disabled={isLoading}
          sx={{
            minHeight: components.SUBMIT_CARD.BUTTON_HEIGHT.DESKTOP,
            borderRadius: borderRadius.get('medium'),
            backgroundColor: colors.get('primary'),
            boxShadow: elevation.get('subtle'),

            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: elevation.get('raised')
            },

            '&:active': {
              transform: 'translateY(0)'
            },

            '&:disabled': {
              backgroundColor: colors.getInteractive('disabled', 'background'),
              color: colors.getInteractive('disabled', 'text'),
              transform: 'none',
              boxShadow: 'none'
            },

            '@media (max-width: 767px)': {
              minHeight: components.SUBMIT_CARD.BUTTON_HEIGHT.MOBILE
            }
          }}
        >
          {isLoading ? 'Se trimite...' : 'Trimite Testul'}
        </Button>
      </Box>
    </Card>
  )
}

/**
 * Example Complete Quiz Interface
 */
export const ExampleQuizInterface: React.FC = () => {
  const [selectedAnswers, setSelectedAnswers] = React.useState<Record<number, string>>({})
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const { spacing } = useAppleSpacing()

  const questions = [
    {
      id: 1,
      text: 'Care este capitala Franței?',
      options: [
        { value: 'A', label: 'A. Londra' },
        { value: 'B', label: 'B. Berlin' },
        { value: 'C', label: 'C. Paris' },
        { value: 'D', label: 'D. Madrid' }
      ]
    },
    {
      id: 2,
      text: 'Care este cel mai mare ocean de pe Pământ?',
      options: [
        { value: 'A', label: 'A. Oceanul Atlantic' },
        { value: 'B', label: 'B. Oceanul Pacific' },
        { value: 'C', label: 'C. Oceanul Indian' },
        { value: 'D', label: 'D. Oceanul Arctic' }
      ]
    }
  ]

  const handleAnswerChange = (questionId: number, answer: string) => {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: answer }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsSubmitting(false)
    alert('Test trimis cu succes!')
  }

  const handleReview = () => {
    alert('Revizuire test...')
  }

  const answeredCount = Object.keys(selectedAnswers).length
  const progress = (answeredCount / questions.length) * 100

  return (
    <Box className='apple-container'>
      <ExampleProgressCard title='Test de Geografie' progress={progress} timeRemaining='15:30 minute rămase' />

      <Box sx={{ padding: `${spacing.get(3)}px 0` }}>
        {questions.map(question => (
          <ExampleQuestionCard
            key={question.id}
            questionNumber={question.id}
            totalQuestions={questions.length}
            questionText={question.text}
          >
            {question.options.map(option => (
              <ExampleRadioOption
                key={option.value}
                value={option.value}
                label={option.label}
                selected={selectedAnswers[question.id] === option.value}
                onChange={value => handleAnswerChange(question.id, value)}
              />
            ))}
          </ExampleQuestionCard>
        ))}

        <ExampleSubmitCard
          answeredQuestions={answeredCount}
          totalQuestions={questions.length}
          onSubmit={handleSubmit}
          onReview={handleReview}
          isLoading={isSubmitting}
        />
      </Box>
    </Box>
  )
}

export default ExampleQuizInterface
