// ** React Imports
import React from 'react'
import { useRouter } from 'next/router'

// ** Custom Components
import QuizInterface from '../quiz/components/QuizInterface'
import QuizErrorBoundary from '../quizzes/components/QuizErrorBoundary'

const QuizReviewAttempt = props => {
  const router = useRouter()
  const { all } = router.query

  // Extract attempt ID from the route parameters
  const attemptId = Array.isArray(all) ? all[0] : all

  return (
    <QuizErrorBoundary>
      <QuizInterface attemptId={attemptId} isProfessor={true} />
    </QuizErrorBoundary>
  )
}

QuizReviewAttempt.acl = {
  action: 'read',
  subject: 'professor-pages'
}

export default QuizReviewAttempt
