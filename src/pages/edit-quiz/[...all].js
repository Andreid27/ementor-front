// ** React Imports
import { Box, Button, Card, CardHeader } from '@mui/material'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import CircularProgress from '@mui/material/CircularProgress'
import { styled } from '@mui/material/styles'
import QuizComponent from './components/quiz-component'

const QuizPage = () => {
  const [loading, setLoading] = useState(true)
  const { asPath, pathname } = useRouter()

  useEffect(() => {
    const quizId = asPath.split('/')[2]
    setLoading(false)
  }, [])

  const CircularProgressIndeterminate = styled(CircularProgress)(({ theme }) => ({
    left: 0,
    position: 'absolute',
    animationDuration: '550ms',
    color: theme.palette.mode === 'light' ? '#1a90ff' : '#308fe8'
  }))

  return (
    <>
      {loading ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh' // Adjust this based on your layout
          }}
        >
          <CircularProgress color='success' size='10rem' />
        </Box>
      ) : (
        <Card>
          <CardHeader title='Editare test' />
          <QuizComponent />
        </Card>
      )}
    </>
  )
}

QuizPage.acl = {
  action: 'read',
  subject: 'professor-pages'
}

export default QuizPage
