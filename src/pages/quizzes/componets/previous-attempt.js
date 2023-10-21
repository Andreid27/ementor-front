// ** React Imports
import { Alert, Box, Button, Card, CardHeader, Grid, Typography } from '@mui/material'
import moment from 'moment'
import { useState } from 'react'

const PreviousAttempt = props => {
  const getAlertType = () => {
    const questions = props.questionsCount
    const score = (props.attempt.correctAnswers / questions) * 100
    console.log(score)
    if (score <= 50) {
      return 'error'
    }
    if (score <= 80) {
      return 'warning'
    }

    return 'success'
  }

  const formatDate = dateString => {
    const options = { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' }

    return new Date(dateString).toLocaleDateString('ro-RO', options)
  }

  const calculateTime = () => {
    const start = new Date(props.attempt.startAt)
    const end = new Date(props.attempt.endedTime)

    const minutesDifference = (end - start) / (1000 * 60)

    // Round the minutes difference to one decimal place
    const roundedDifference = Math.round(minutesDifference * 10) / 10

    return roundedDifference
  }

  console.log(getAlertType())
  console.log(formatDate(props.attempt.startAt))
  console.log(calculateTime())

  return (
    <>
      {props ? (
        <Alert variant='outlined' severity={getAlertType()} icon={false}>
          <Box sx={{ width: '100%' }}>
            <Grid container spacing={14}>
              <Grid item xs={1} sm={1}>
                {props.index + 1}.
              </Grid>
              <Grid item xs={3} sm={3}>
                Data: {formatDate(props.attempt.startAt)}
              </Grid>
              <Grid item xs={3} sm={3}>
                {' '}
                Rezultat obtinut: {props.attempt.correctAnswers}/{props.questionsCount}
              </Grid>
              <Grid item xs={2} sm={1.75}>
                {' '}
                Timp total: {calculateTime()} minute
              </Grid>
              <Grid item xs={3} sm={3}>
                <Button variant='contained'>
                  Vezualizeaza raspunsurile <i className='fa fa-arrow-right'></i>
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Alert>
      ) : null}
    </>
  )
}

PreviousAttempt.acl = {
  action: 'read',
  subject: 'student-pages'
}

export default PreviousAttempt
