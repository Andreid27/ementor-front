// ** React Imports
import { Box, Card, CardHeader } from '@mui/material'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import CircularProgress from '@mui/material/CircularProgress'
import LessonComponent from './new-lesson/lesson-component'
import { useSelector } from 'react-redux'
import { selectNewLesson } from 'src/store/apps/lesson'

const QuizPage = () => {
  const [loading, setLoading] = useState(true)
  const { asPath } = useRouter()
  const [quizId, setQuizId] = useState(null)
  const previousValues = useSelector(selectNewLesson)

  useEffect(() => {
    setQuizId(asPath.split('/')[2])
  }, [])

  useEffect(() => {
    if (previousValues && loading) {
      setLoading(false)
    }
  }, [previousValues])

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
          <CardHeader title='Editare lecție' />
          {quizId == 'new' ? <LessonComponent previousValues={previousValues} /> : null}
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
