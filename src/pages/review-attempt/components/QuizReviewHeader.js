// ** React Imports
import { useState } from 'react'
import { Box, Button, Grid, Typography } from '@mui/material'
import { InView } from 'react-intersection-observer'

// ** Custom Components
import CustomAvatar from 'src/@core/components/mui/avatar'
import CountdownTimer from '../../quiz/components/CountDown/CountdownTimer'

// ** Utils
import { getInitials } from 'src/@core/utils/get-initials'

// ** Hooks
import { useAppBar } from 'src/context/AppBarContext'

const QuizReviewHeader = ({ quiz, user, onUserClick, themeColor }) => {
  const { addComponent, removeComponent } = useAppBar()
  const [isComponentAdded, setIsComponentAdded] = useState(false)

  const renderClient = user => {
    const stateNum = Math.floor(Math.random() * 6)
    const states = ['success', 'error', 'warning', 'info', 'primary', 'secondary']
    const color = states[stateNum]

    if (user.avatar && user.avatar.length) {
      return <CustomAvatar src={user.avatar} sx={{ mr: 3, width: '2.5rem', height: '2.5rem' }} />
    } else {
      return (
        <CustomAvatar skin='light' color={color} sx={{ mr: 3, fontSize: '1rem', width: '2.5rem', height: '2.5rem' }}>
          {getInitials(user.lastName ? `${user.firstName} ${user.lastName}` : 'John Doe')}
        </CustomAvatar>
      )
    }
  }

  const renderUser = () => {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Button
          sx={{ '&:hover': { backgroundColor: 'transparent' } }}
          onClick={event => {
            if (onUserClick) {
              onUserClick(event)
            }
          }}
        >
          {renderClient(user)}
        </Button>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography noWrap variant='body1' sx={{ color: 'text.primary', fontWeight: 800 }}>
            {user.firstName} {user.lastName}
          </Typography>
          <Typography noWrap variant='caption'>
            {user.email}
          </Typography>
        </Box>
      </Box>
    )
  }

  const handleVisibilityChange = isVisible => {
    if (!isVisible && !isComponentAdded) {
      addComponent(() => appBarInfo(), 'QuizReviewHeader')
      setIsComponentAdded(true)
    } else if (isVisible && isComponentAdded) {
      removeComponent(0)
      setIsComponentAdded(false)
    }
  }

  const appBarInfo = () => {
    return (
      <Grid container spacing={2} alignItems='center'>
        <Grid item xs={12} sm={3} sx={{ maxWidth: { xs: 150, sm: 'none' } }}>
          <Typography variant='h6' sx={{ fontWeight: 600 }}>
            {quiz.quiz.title}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={3} sx={{ maxWidth: { xs: 150, sm: 'none' } }}>
          <Typography
            color={themeColor}
            sx={{
              maxWidth: '20rem',
              wordBreak: 'break-word'
            }}
          >
            Rezultat: {quiz.correctCount} / {quiz.quiz.questions.length}
          </Typography>
        </Grid>
        <Grid item xs={4} sx={{ maxWidth: { xs: 130, sm: 'none' } }}>
          {renderUser()}
        </Grid>
      </Grid>
    )
  }

  return (
    <InView onChange={handleVisibilityChange}>
      {renderUser()}
    </InView>
  )
}

export default QuizReviewHeader
