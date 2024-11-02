// ** React Imports
import { Button, CircularProgress } from '@mui/material'
import Router from 'next/router'
import DialogTransition from './DialogTransition'
import { useState } from 'react'

const SubmitComponent = props => {
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleOpenDialog = () => {
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
  }

  if (props.viewResults) {
    return (
      <>
        <Button
          variant='contained'
          color='primary'
          size='large'
          onClick={() => {
            Router.push('/quizzes')
          }}
        >
          Înapoi
        </Button>
      </>
    )
  }

  const submitQuiz = () => {
    handleOpenDialog()
  }

  const handleConfirmation = () => {
    props.setCompleted(true)
    handleCloseDialog()
  }

  const getUnasweredQuestions = () => {
    let unasweredQuestions = 0
    let answersMap = props.getSubmitedQuestionAnswers()
    answersMap.forEach(question => {
      if (question.answer === undefined || question.answer === '0') {
        unasweredQuestions++
      }
    })

    return unasweredQuestions
  }

  return (
    <>
      <Button
        variant='contained'
        color='primary'
        size='large'
        onClick={() => {
          submitQuiz()
        }}
      >
        {props.loadingButton ? <CircularProgress color='info' /> : 'Finalizeaza testul'}
      </Button>
      <DialogTransition
        open={dialogOpen}
        handleClose={handleCloseDialog}
        handleConfirm={handleConfirmation}
        getUnasweredQuestions={getUnasweredQuestions}
      />
    </>
  )
}

SubmitComponent.acl = {
  action: 'read',
  subject: 'student-pages'
}

export default SubmitComponent
