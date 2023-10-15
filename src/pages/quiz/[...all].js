// ** React Imports
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Divider,
  Grid,
  LinearProgress,
  Rating,
  Typography
} from '@mui/material'

import Icon from 'src/@core/components/icon'
import { styled } from '@mui/material/styles'
import { useEffect, useState } from 'react'
import apiClient from 'src/@core/axios/axiosEmentor'
import * as apiSpec from '../../apiSpec'
import { useRouter } from 'next/router'
import CountdownTimer from './components/CountDown/CountdownTimer'
import RadioComponent from './components/Radio/RedioComponent'
import { useDispatch } from 'react-redux'
import { addQuiz } from 'src/store/apps/quiz'
import SubmitComponent from './components/SubmitComponent'

const StyledBox = styled(Box)(({ theme }) => ({
  [theme.breakpoints.up('sm')]: {
    borderRight: `1px solid ${theme.palette.divider}`
  }
}))

const QuizAttempt = props => {
  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingButton, setLoadingButton] = useState(false)
  const [viewResults, setViewResults] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [resultSet, setResultSet] = useState(null)
  const [answersMap, setAnswersMap] = useState(new Map())
  const { asPath, pathname } = useRouter()
  const dispatch = useDispatch()

  useEffect(() => {
    const quizId = asPath.split('/')[2]
    console.log(quizId)
    apiClient
      .get(apiSpec.QUIZ_SERVICE + `/start/${quizId}`)
      .then(response => {
        setQuiz(response.data)

        dispatch(addQuiz(response.data))
        setLoading(false)

        console.log(quiz)
      })
      .catch(error => {
        console.log(error)
      })
  }, [])

  console.log(quiz)

  const handleStartTest = () => {
    props.setPreview()
    router.push(`/quiz/${props.preview.id}`)
  }

  useEffect(() => {
    if (completed) {
      setLoadingButton(true)

      let body = {
        quizStudentId: asPath.split('/')[2],
        submitedQuestionAnswers: getSubmitedQuestionAnswers()
      }
      console.log(body)

      apiClient.post(apiSpec.QUIZ_SERVICE + `/submit`, body).then(response => {
        console.log(response)
        setLoadingButton(false)

        setResultSet(response.data)
        setViewResults(true)
      })
    }
  }, [completed])

  const getSubmitedQuestionAnswers = () => {
    let submitedQuestionAnswers = []
    if (answersMap.size <= 0) {
      return []
    }

    answersMap.forEach((value, key) => {
      submitedQuestionAnswers.push({
        questionId: key,
        answer: value.split('')[6]
      })
    })

    return submitedQuestionAnswers
  }

  console.log(completed)

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
              <Box sx={{ mb: 3.5, display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
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
                  >
                    {viewResults ? `Răspunsuri corecte: ${resultSet.correctCount} / ${quiz.questions.length}` : null}
                  </Typography>
                </Box>
                <CountdownTimer
                  targetTimestamp={new Date(quiz.endTime).getTime()}
                  size={150}
                  setCompleted={setCompleted}
                />
              </Box>

              <Grid container spacing={6}>
                <Grid item xs={12} sm={12}>
                  <CardContent sx={{ p: theme => `${theme.spacing(3.25, 5.75, 6.25)} !important` }}></CardContent>
                  {quiz.questions.map((question, index) => (
                    <RadioComponent
                      key={question.id}
                      question={question}
                      answersMap={answersMap}
                      setAnswersMap={setAnswersMap}
                      viewResults={viewResults}
                      resultSet={resultSet}
                    />
                  ))}
                </Grid>
              </Grid>
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

QuizAttempt.acl = {
  action: 'read',
  subject: 'student-pages'
}

export default QuizAttempt
