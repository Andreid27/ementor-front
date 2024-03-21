// ** React Imports
import { Box, Card, CardHeader } from '@mui/material'
import { useEffect, useState } from 'react'
import CircularProgress from '@mui/material/CircularProgress'
import QuizComponent from './new-quiz/quiz-component'
import QuizView from './edit-quiz/edit'
import { useDispatch, useSelector } from 'react-redux'
import { selectNewQuiz } from 'src/store/apps/quiz'
import apiClient from 'src/@core/axios/axiosEmentor'
import { addQuiz } from 'src/store/apps/quiz'
import * as apiSpec from 'src/apiSpec'

const QuizPage = () => {
  const [loading, setLoading] = useState(true)
  const [quizId, setQuizId] = useState(null)
  const [isEdit, setIsEdit] = useState(null)
  const previousValues = useSelector(selectNewQuiz)
  const [quiz, setQuiz] = useState(null)
  const dispatch = useDispatch()
  const urlId = window.location.pathname.split('/')[2]

  useEffect(() => {
    setQuizId(urlId)
    if (urlId === 'new') {
      setIsEdit(true)
    } else {
      apiClient
        .get(apiSpec.QUIZ_SERVICE + `/${urlId}`)
        .then(response => {
          //process the response to fit the defaultValues of the form
          let data = response.data
          data.questionsList = data.questions
          data.chaptersId = data.chapters.map(chapter => chapter.id)
          data.numberOfAnswers = 5 // default value
          setQuiz(data)

          dispatch(addQuiz(response.data))
          setLoading(false)
          setIsEdit(false)
        })
        .catch(error => {
          console.log(error)
        })
    }
  }, [])

  useEffect(() => {
    if (previousValues && loading && urlId === 'new') {
      setLoading(false)
    }
  }, [previousValues])

  return (
    <Box
      sx={{
        '@media print': {
          display: 'none'
        }
      }}
    >
      {loading && isEdit == null ? (
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
          {isEdit ? (
            <>
              <CardHeader title='Editare test' />
              <QuizComponent
                previousValues={quizId === 'new' ? previousValues : quiz}
                quizId={quizId}
                setIsEdit={setIsEdit}
              />
            </>
          ) : (
            <>
              <CardHeader title='Vizualizare test' />
              <QuizView quiz={quiz} setIsEdit={setIsEdit} />
            </>
          )}
        </Card>
      )}
    </Box>
  )
}

QuizPage.acl = {
  action: 'read',
  subject: 'professor-pages'
}

export default QuizPage
