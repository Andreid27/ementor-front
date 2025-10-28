// ** React Imports
import React from 'react'
import { useRouter } from 'next/router'

// ** Custom Components
import QuizInterface from './components/QuizInterface'

const QuizAttempt = () => {
  const router = useRouter()
  const { all } = router.query

  // Extract quiz ID from the route parameters
  const quizId = Array.isArray(all) ? all[0] : all

  if (!quizId) {
    return (
      <div>
        <p>Quiz ID not found</p>
      </div>
    )
  }

  return <QuizInterface quizId={quizId} />
}

QuizAttempt.acl = {
  action: 'read',
  subject: 'student-pages'
}

export default QuizAttempt
