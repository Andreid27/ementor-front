// ** React Imports
import { Box, Card, CardContent, LinearProgress, Typography } from '@mui/material'

import { useEffect, useState } from 'react'
import apiClient from 'src/@core/axios/axiosEmentor'
import * as apiSpec from '../../../apiSpec'
import { useRouter } from 'next/router'
import { useDispatch } from 'react-redux'
import { addQuiz } from 'src/store/apps/quiz'
import SubmitComponent from './components/SubmitComponent'
import toast from 'react-hot-toast'

const QuizEdit = props => {
  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(true)
  const [answersMap, setAnswersMap] = useState(new Map())
  const { asPath } = useRouter()
  const dispatch = useDispatch()

  useEffect(() => {
    const quizId = asPath.split('/')[2]
    apiClient
      .get(apiSpec.QUIZ_SERVICE + `/${quizId}`)
      .then(response => {
        setQuiz(response.data)

        dispatch(addQuiz(response.data))
        setLoading(false)
      })
      .catch(error => {
        console.log(error)
      })
  }, [])

  const getSubmitedQuestionAnswers = () => {
    let submitedQuestionAnswers = []
    if (answersMap.size <= 0) {
      return []
    }

    answersMap.forEach((value, key) => {
      if (!value) {
        return
      }
      submitedQuestionAnswers.push({
        questionId: key,
        answer: value.split('')[6]
      })
    })

    return submitedQuestionAnswers
  }

  return (
    <>
      {loading ? (
        <>
          <LinearProgress />
        </>
      ) : (
        <>
          <Card>
            <CardContent>
              <Box>
                <Typography variant='h6' sx={{ lineHeight: 1, fontWeight: 600, fontSize: '2.75rem !important' }}>
                  {quiz.title}
                </Typography>
                <Typography
                  variant='h6'
                  sx={{
                    lineHeight: 1,
                    fontSize: '1rem !important',
                    padding: '1em',
                    paddingLeft: '0.4em',
                    color: 'text.secondary',
                    maxWidth: '20rem',
                    wordBreak: 'break-word'
                  }}
                >
                  {quiz.description}
                </Typography>
                <Typography
                  variant='h6'
                  sx={{
                    lineHeight: 1,
                    fontSize: '1rem !important',
                    padding: '1em',
                    paddingLeft: '0.4em',
                    color: 'text.secondary',
                    maxWidth: '20rem',
                    wordBreak: 'break-word'
                  }}
                ></Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '2em' }}>
                <SubmitComponent viewResults={viewResults} loading={loading} setCompleted={setCompleted} />
              </Box>
            </CardContent>
          </Card>
        </>
      )}
    </>
  )
}

QuizEdit.acl = {
  action: 'read',
  subject: 'professor-pages'
}

export default QuizEdit
