import React, { useState } from 'react'
import QuestionComponent from './question-component'
import { Button } from '@mui/material'

const QuestionsComponent = props => {
  const [questions, setQuestions] = useState([
    {
      content: '',
      answer1: '',
      answer2: '',
      answer3: '',
      answer4: '',
      answer5: '',
      correctAnswer: 0,
      source: '',
      sourcePage: 0,
      difficultyLevel: 0,
      hint: ''
    },
    {
      content: '',
      answer1: '',
      answer2: '',
      answer3: '',
      answer4: '',
      answer5: '',
      correctAnswer: 0,
      source: '',
      sourcePage: 0,
      difficultyLevel: 0,
      hint: ''
    },
    {
      content: '',
      answer1: '',
      answer2: '',
      answer3: '',
      answer4: '',
      answer5: '',
      correctAnswer: 0,
      source: '',
      sourcePage: 0,
      difficultyLevel: 0,
      hint: ''
    },
    {
      content: '',
      answer1: '',
      answer2: '',
      answer3: '',
      answer4: '',
      answer5: '',
      correctAnswer: 0,
      source: '',
      sourcePage: 0,
      difficultyLevel: 0,
      hint: ''
    },
    {
      content: '',
      answer1: '',
      answer2: '',
      answer3: '',
      answer4: '',
      answer5: '',
      correctAnswer: 0,
      source: '',
      sourcePage: 0,
      difficultyLevel: 0,
      hint: ''
    },
    {
      content: '',
      answer1: '',
      answer2: '',
      answer3: '',
      answer4: '',
      answer5: '',
      correctAnswer: 0,
      source: '',
      sourcePage: 0,
      difficultyLevel: 0,
      hint: ''
    },
    {
      content: '',
      answer1: '',
      answer2: '',
      answer3: '',
      answer4: '',
      answer5: '',
      correctAnswer: 0,
      source: '',
      sourcePage: 0,
      difficultyLevel: 0,
      hint: ''
    },
    {
      content: '',
      answer1: '',
      answer2: '',
      answer3: '',
      answer4: '',
      answer5: '',
      correctAnswer: 0,
      source: '',
      sourcePage: 0,
      difficultyLevel: 0,
      hint: ''
    },
    {
      content: '',
      answer1: '',
      answer2: '',
      answer3: '',
      answer4: '',
      answer5: '',
      correctAnswer: 0,
      source: '',
      sourcePage: 0,
      difficultyLevel: 0,
      hint: ''
    },
    {
      content: '',
      answer1: '',
      answer2: '',
      answer3: '',
      answer4: '',
      answer5: '',
      correctAnswer: 0,
      source: '',
      sourcePage: 0,
      difficultyLevel: 0,
      hint: ''
    },
    {
      content: '',
      answer1: '',
      answer2: '',
      answer3: '',
      answer4: '',
      answer5: '',
      correctAnswer: 0,
      source: '',
      sourcePage: 0,
      difficultyLevel: 0,
      hint: ''
    },
    {
      content: '',
      answer1: '',
      answer2: '',
      answer3: '',
      answer4: '',
      answer5: '',
      correctAnswer: 0,
      source: '',
      sourcePage: 0,
      difficultyLevel: 0,
      hint: ''
    },
    {
      content: '',
      answer1: '',
      answer2: '',
      answer3: '',
      answer4: '',
      answer5: '',
      correctAnswer: 0,
      source: '',
      sourcePage: 0,
      difficultyLevel: 0,
      hint: ''
    },
    {
      content: '',
      answer1: '',
      answer2: '',
      answer3: '',
      answer4: '',
      answer5: '',
      correctAnswer: 0,
      source: '',
      sourcePage: 0,
      difficultyLevel: 0,
      hint: ''
    },
    {
      content: '',
      answer1: '',
      answer2: '',
      answer3: '',
      answer4: '',
      answer5: '',
      correctAnswer: 0,
      source: '',
      sourcePage: 0,
      difficultyLevel: 0,
      hint: ''
    }
  ])

  const removeQuestion = index => {
    const updatedQuestions = [...questions]
    updatedQuestions.splice(index, 1)
    setQuestions(updatedQuestions)
  }

  const addQuestion = () => {
    const updatedQuestions = [...questions]
    updatedQuestions.push({
      content: '',
      answer1: '',
      answer2: '',
      answer3: '',
      answer4: '',
      answer5: '',
      correctAnswer: 0,
      source: '',
      sourcePage: 0,
      difficultyLevel: props.difficultyLevel,
      hint: ''
    })
    setQuestions(updatedQuestions)
  }

  const getQuestionValue = index => {
    return questions[index].content // or whatever property you want to retrieve
  }

  return (
    <div>
      {questions.map((question, index) => (
        <QuestionComponent
          key={index}
          index={index}
          value={question.content}
          removeQuestion={removeQuestion}
          defaultDificultyLevel={props.difficultyLevel}
        />
      ))}
      <Button variant='outlined' color='info' sx={{ marginRight: '1rem', marginTop: '1rem' }} onClick={addQuestion}>
        Adaugă întrebare
      </Button>
    </div>
  )
}

export default QuestionsComponent
