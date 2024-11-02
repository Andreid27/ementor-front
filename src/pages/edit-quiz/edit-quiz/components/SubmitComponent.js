// ** React Imports
import { Button, Card, CardHeader, CircularProgress } from '@mui/material'
import { useRouter } from 'next/router'
import { useState } from 'react'

const SubmitComponent = props => {
  const router = useRouter()
  if (props.viewResults) {
    return (
      <>
        <Button
          variant='contained'
          color='primary'
          size='large'
          onClick={() => {
            router.push(`/all-quizzes`)
          }}
        >
          Înapoi
        </Button>
      </>
    )
  }

  return (
    <>
      <Button
        variant='contained'
        color='primary'
        size='large'
        onClick={() => {
          props.setCompleted(true)
        }}
      >
        {props.loadingButton ? <CircularProgress color='info' /> : 'Finalizeaza testul'}
      </Button>
    </>
  )
}

SubmitComponent.acl = {
  action: 'read',
  subject: 'student-pages'
}

export default SubmitComponent
