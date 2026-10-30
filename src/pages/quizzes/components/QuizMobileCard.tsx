import React from 'react'
import { Card, CardActionArea, Box, Typography, Rating, Divider, useTheme } from '@mui/material'
import Icon from 'src/@core/components/icon'
import StatusPill from 'src/views/student-ui/StatusPill'
import { accentInk } from 'src/views/student-ui/readableAccent'
import { QuizGridRow } from '../types'
import { getDifficultyColor } from '../utils/transformers'
import { getQuizStatusDisplay } from '../utils/quizStatus'

interface QuizMobileCardProps {
  quiz: QuizGridRow
  onSelect: (id: string) => void
}

const QuizMobileCard: React.FC<QuizMobileCardProps> = ({ quiz, onSelect }) => {
  const theme = useTheme()
  const display = getQuizStatusDisplay(quiz.status, quiz.score)

  // The edge repeats the status colour; the pill's icon and text carry the meaning.
  const getBorderColor = () => {
    if (quiz.status === 'completed' && typeof quiz.score === 'number') {
      if (quiz.score >= 80) return theme.palette.success.main
      if (quiz.score >= 60) return theme.palette.warning.main

      return theme.palette.error.main
    }

    switch (quiz.status) {
      case 'overdue':
        return theme.palette.error.main
      case 'in_progress':
        return theme.palette.info.main
      default:
        return null
    }
  }

  const edge = getBorderColor()

  const facts = [
    { icon: 'tabler:clock', value: quiz.duration, label: 'Minute' },
    { icon: 'tabler:list-numbers', value: quiz.questionsCount, label: 'Întrebări' }
  ]

  return (
    <Card
      component='article'
      sx={{
        mb: 3,
        boxShadow: 'none',
        border: `1px solid ${theme.palette.divider}`,
        ...(edge && { borderLeft: `4px solid ${edge}` }),
        borderRadius: 3
      }}
    >
      <CardActionArea onClick={() => onSelect(quiz.id)} sx={{ p: 5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              component='h2'
              sx={{ fontWeight: 600, color: 'text.primary', fontSize: '1rem', lineHeight: 1.35, mb: 0.5 }}
            >
              {quiz.title}
            </Typography>
            <Typography variant='body2' sx={{ color: 'text.secondary' }}>
              {quiz.chapter}
            </Typography>
          </Box>
          <StatusPill tone={display.tone} icon={display.icon}>
            {display.label}
          </StatusPill>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
          {facts.map(fact => (
            <Box key={fact.label} sx={{ textAlign: 'center' }}>
              <Icon icon={fact.icon} fontSize='1.125rem' color={theme.palette.text.secondary} aria-hidden />
              <Typography sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.9375rem' }}>{fact.value}</Typography>
              <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                {fact.label}
              </Typography>
            </Box>
          ))}
          <Box sx={{ textAlign: 'center' }}>
            <Rating
              value={quiz.difficulty}
              max={5}
              readOnly
              size='small'
              aria-label={`Dificultate ${quiz.difficulty} din 5`}
              sx={{
                mt: 0.5,
                '& .MuiRating-iconFilled': { color: getDifficultyColor(quiz.difficulty) },
                '& .MuiRating-icon': { fontSize: '0.9375rem' }
              }}
            />
            <Typography variant='caption' sx={{ display: 'block', mt: 0.5, color: 'text.secondary' }}>
              Dificultate
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            mt: 4,
            pt: 4,
            borderTop: `1px solid ${theme.palette.divider}`,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            fontWeight: 600,
            fontSize: '0.9375rem',
            color: quiz.status === 'overdue' ? 'text.secondary' : accentInk(theme)
          }}
        >
          {display.action}
          <Icon icon='tabler:arrow-right' fontSize='1.125rem' aria-hidden />
        </Box>
      </CardActionArea>
    </Card>
  )
}

export default QuizMobileCard
