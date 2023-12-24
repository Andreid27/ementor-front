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
import * as apiSpec from '../../../apiSpec'
import { useRouter } from 'next/router'
import CountdownTimer from './components/CountDown/CountdownTimer'
import RadioComponent from './components/Radio/RedioComponent'
import { useDispatch } from 'react-redux'
import { addQuiz } from 'src/store/apps/quiz'
import SubmitComponent from './components/SubmitComponent'
import toast from 'react-hot-toast'
import RadioComponentReview from './components/Radio/RedioComponent'

const StyledBox = styled(Box)(({ theme }) => ({
  [theme.breakpoints.up('sm')]: {
    borderRight: `1px solid ${theme.palette.divider}`
  }
}))

const QuizEdit = props => {
  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(true)
  const [viewResults, setViewResults] = useState(true)
  const [completed, setCompleted] = useState(true)
  const [resultSet, setResultSet] = useState(null)
  const [answersMap, setAnswersMap] = useState(new Map())
  const { asPath, pathname } = useRouter()
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

              <Grid container spacing={6}>
                <Grid item xs={12} sm={12}>
                  <CardContent sx={{ p: theme => `${theme.spacing(3.25, 5.75, 6.25)} !important` }}></CardContent>
                  {quiz.questions.map((question, index) => (
                    <RadioComponentReview
                      key={question.id}
                      question={question}
                      answersMap={quiz.submitedQuestionAnswers}
                      setAnswersMap={setAnswersMap}
                      viewResults={viewResults}
                      resultSet={quiz}
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

QuizEdit.acl = {
  action: 'read',
  subject: 'professor-pages'
}

export default QuizEdit
