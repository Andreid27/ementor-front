// ** React Imports
import React from 'react'
import { useRouter } from 'next/router'

// ** MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

// ** Custom Components
import QuizInterface from './components/QuizInterface'
import QuizErrorBoundary from '../quizzes/components/QuizErrorBoundary'

const QuizAttempt = () => {
  const router = useRouter()
  const { all } = router.query

  // Extract quiz ID from the route parameters
  const quizId = Array.isArray(all) ? all[0] : all

  if (!quizId) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '50vh',
          p: 3
        }}
      >
        <Typography variant='h6' sx={{ mb: 2, color: 'text.primary' }}>
          ID-ul testului nu a fost găsit
        </Typography>
        <Button
          variant='contained'
          onClick={() => router.push('/quizzes')}
          sx={{ borderRadius: 2, textTransform: 'none' }}
        >
          Înapoi la teste
        </Button>
      </Box>
    )
  }

  // Requirement 9.5: Wrap entire quiz interface in error boundary
  return (
    <QuizErrorBoundary>
      <QuizInterface quizId={quizId} />
    </QuizErrorBoundary>
  )
}

QuizAttempt.acl = {
  action: 'read',
  subject: 'student-pages'
}

export default QuizAttempt
