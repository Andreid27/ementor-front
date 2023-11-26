import React, { useState } from 'react'
import QuestionComponent from './question-component'

const QuestionsComponent = () => {
  const [answers, setAnswers] = useState([
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false }
  ])

  return <QuestionComponent />
}

export default QuestionsComponent
