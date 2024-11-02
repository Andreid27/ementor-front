// ** React Imports
import { Alert, Box, Button, Card, CardHeader, Grid, Typography } from '@mui/material'
import moment from 'moment'
import { useRouter } from 'next/router'
import { useState } from 'react'
import CustomAvatar from 'src/@core/components/mui/avatar'

// ** Utils Import
import { getInitials } from 'src/@core/utils/get-initials'

const PreviousAttempt = props => {
  const router = useRouter()

  const getAlertType = () => {
    const questions = props.questionsCount
    const score = (props.attempt.correctAnswers / questions) * 100
    if (score <= 50) {
      return 'error'
    }
    if (score <= 80) {
      return 'warning'
    }

    return 'success'
  }

  const renderClient = (attempt, user) => {
    const stateNum = Math.floor(Math.random() * 6)
    const states = ['success', 'error', 'warning', 'info', 'primary', 'secondary']
    const color = states[stateNum]

    if (attempt.avatar && attempt.avatar.length) {
      return (
        <CustomAvatar src={`/images/avatars/${attempt.avatar}`} sx={{ mr: 3, width: '1.875rem', height: '1.875rem' }} />
      )
    } else {
      return (
        <CustomAvatar
          skin='light'
          color={color}
          sx={{ mr: 3, fontSize: '.8rem', width: '1.875rem', height: '1.875rem' }}
        >
          {getInitials(user.lastName ? `${user.firstName} ${user.lastName} ` : 'John Doe')}
        </CustomAvatar>
      )
    }
  }

  const renderUser = attempt => {
    const user = props.users.find(user => user.id === attempt.userId)

    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {renderClient(attempt, user)}
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography noWrap variant='body2' sx={{ color: 'text.primary', fontWeight: 600 }}>
            {user.firstName} {user.lastName}
          </Typography>
          <Typography noWrap variant='caption'>
            {user.email}
          </Typography>
        </Box>
      </Box>
    )
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

  const handleViewAttempt = event => {
    event.preventDefault()
    router.push(`/review-attempt/${props.attempt.id}`)
  }

  return (
    <>
      {props ? (
        <Alert variant='outlined' severity={getAlertType()} icon={false}>
          <Box sx={{ width: '100%' }}>
            <Grid container spacing={10}>
              <Grid item xs={1} sm={1}>
                {props.index + 1}.
              </Grid>
              <Grid item xs={3} sm={3}>
                {renderUser(props.attempt)}
              </Grid>
              <Grid item xs={3.5} sm={3.5}>
                <div>Data: {formatDate(props.attempt.startAt)}</div>
                Rezultat obtinut: {props.attempt.correctAnswers}/{props.questionsCount}
              </Grid>
              <Grid item xs={2} sm={1.75}>
                {' '}
                Timp total: {calculateTime()} minute
              </Grid>
              <Grid item xs={2} sm={2}>
                <Button variant='contained' onClick={handleViewAttempt}>
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
