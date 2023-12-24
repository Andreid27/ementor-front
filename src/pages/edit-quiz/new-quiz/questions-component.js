import React, { useState } from 'react'
import QuestionComponent from './question-component'
import { Button } from '@mui/material'

const QuestionsComponent = props => {
  const { questions, updateQuestions } = props

  const removeQuestion = index => {
    const updatedQuestions = [...questions]
    updatedQuestions.splice(index, 1)
    updateQuestions(updatedQuestions)
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
    updateQuestions(updatedQuestions)
  }

  const getQuestionValue = index => {
    return questions[index].content // or whatever property you want to retrieve
  }

  const updateQuestionValue = (index, questionContent, options) => {
    const updatedQuestions = [...questions]
    if (options.length == 5) {
      let answers = {
        answer1: options[0]?.text || '',
        answer2: options[1]?.text || '',
        answer3: options[2]?.text || '',
        answer4: options[3]?.text || '',
        answer5: options[4]?.text || ''
      }
      updatedQuestions[index] = {
        ...questionContent,
        ...answers
      }
    }
    console.log(updatedQuestions)

    updateQuestions(updatedQuestions)
  }

  return (
    <div>
      {questions.map((question, index) => (
        <QuestionComponent
          key={index}
          index={index}
          value={question}
          updateQuestionValue={updateQuestionValue}
          removeQuestion={removeQuestion}
          defaultDificultyLevel={props.difficultyLevel}
          numberOfAnswers={props.numberOfAnswers}
          componentType={props.componentType}
        />
      ))}
      <Button variant='outlined' color='info' sx={{ marginRight: '1rem', marginTop: '1rem' }} onClick={addQuestion}>
        Adaugă întrebare
      </Button>
    </div>
  )
}

export default QuestionsComponent
