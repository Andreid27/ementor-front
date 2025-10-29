// ** React Imports
import React from 'react'
import { useRouter } from 'next/router'

// ** Custom Components
import QuizInterface from '../quiz/components/QuizInterface'
import QuizErrorBoundary from '../quizzes/components/QuizErrorBoundary'

const QuizAttempt = () => {
  const router = useRouter()
  const { all } = router.query

  // Extract attempt ID from the route parameters
  const attemptId = Array.isArray(all) ? all[0] : all

  return (
    <QuizErrorBoundary>
      <QuizInterface attemptId={attemptId} />
    </QuizErrorBoundary>
  )
}

QuizAttempt.acl = {
  action: 'read',
  subject: 'student-pages'
}

export default QuizAttempt
