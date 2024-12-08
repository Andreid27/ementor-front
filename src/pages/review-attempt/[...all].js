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
import { useEffect, useRef, useState } from 'react'
import apiClient from 'src/@core/axios/axiosEmentor'
import * as apiSpec from '../../apiSpec'
import { useRouter } from 'next/router'
import RadioComponent from './components/Radio/RedioComponent'
import { useDispatch, useSelector } from 'react-redux'
import { addQuiz } from 'src/store/apps/quiz'
import SubmitComponent from './components/SubmitComponent'
import toast from 'react-hot-toast'
import RadioComponentReview from './components/Radio/RedioComponent'
import CustomAvatar from 'src/@core/components/mui/avatar'
import { useAppBar } from 'src/context/AppBarContext'
import { InView } from "react-intersection-observer";

// ** Utils Import
import { getInitials } from 'src/@core/utils/get-initials'
import { selectAllStudents } from 'src/store/apps/user'
import CountdownTimer from '../quiz/components/CountDown/CountdownTimer'
import extractProfilePicture from 'src/@core/axios/profile-picture-extractor'
import profilePictureDownloader from 'src/@core/axios/profile-picture-downloader'
import UserViewDrawer from '../student-profile/components/UserViewDrawer'
import { useTheme } from '@emotion/react'

const StyledBox = styled(Box)(({ theme }) => ({
  [theme.breakpoints.up('sm')]: {
    borderRight: `1px solid ${theme.palette.divider}`
  }
}))

const QuizReviewAttempt = props => {
  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(true)
  const [viewResults, setViewResults] = useState(true)
  const [completed, setCompleted] = useState(true)
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false)
  const [answersMap, setAnswersMap] = useState(new Map())
  const dispatch = useDispatch()
  const [user, setUser] = useState(null)
  const students = useSelector(selectAllStudents)
  const { addComponent, removeComponent } = useAppBar();
  const [isComponentAdded, setIsComponentAdded] = useState(false);
  const theme = useTheme()
  const [themeColor, setThemeColor] = useState('info');

  const renderClient = user => {
    const stateNum = Math.floor(Math.random() * 6)
    const states = ['success', 'error', 'warning', 'info', 'primary', 'secondary']
    const color = states[stateNum]

    if (user.avatar && user.avatar.length) {
      return <CustomAvatar src={user.avatar} sx={{ mr: 3, width: '2.5rem', height: '2.5rem' }} />
    } else {
      return (
        <CustomAvatar skin='light' color={color} sx={{ mr: 3, fontSize: '1rem', width: '2.5rem', height: '2.5rem' }}>
          {getInitials(user.lastName ? `${user.firstName} ${user.lastName} ` : 'John Doe')}
        </CustomAvatar>
      )
    }
  }

  const renderUser = () => {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Button
          sx={{ "&:hover": { backgroundColor: "transparent" } }}
          onClick={event => handleOpenDialog(event, 'PROFILE')}
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

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const quizId = window.location.pathname.split('/')[2];
        const response = await apiClient.get(`${apiSpec.QUIZ_SERVICE}/attempt/${quizId}`);

        const quizData = response.data;
        setQuiz(quizData);

        let selectedUser = students.find(student => student.id === quizData.studentId);

        const processedUser = extractProfilePicture(selectedUser);

        const avatar = processedUser?.type === 'API'
          ? await profilePictureDownloader(processedUser.url, processedUser.userId)
          : processedUser?.type === 'EXTERNAL'
            ? processedUser.url
            : null;

        const color = handleColorChange(quizData.correctCount * 100 / quizData.quiz.questions.length);
        setThemeColor(theme.palette[color].main);

        selectedUser = { ...selectedUser, avatar: avatar };

        setUser(selectedUser);


        dispatch(addQuiz(quizData));
        setLoading(false);
      } catch (error) {
        console.error(error);
      }
    };

    fetchQuizData();

  }, []);

  const handleVisibilityChange = isVisible => {
    if (!isVisible && !isComponentAdded) {
      addComponent(() => appBarInfo(), 'QuizReviewAttempt');
      setIsComponentAdded(true);
    } else if (isVisible && isComponentAdded) {
      removeComponent(0);
      setIsComponentAdded(false);
    }
  };

  function handleColorChange(correctPercentage) {
    let color = 'info'
    if (correctPercentage < 50) color = 'error'
    else if (correctPercentage < 80) color = 'warning'
    else if (correctPercentage >= 80) color = 'success'

    return color
  }

  const appBarInfo = () => {

    return (
      <Grid container spacing={2} alignItems="center">
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
            {viewResults ? `Rezultat: ${quiz.correctCount} / ${quiz.quiz.questions.length}` : null}
          </Typography>
        </Grid>
        <Grid item xs={4} sx={{ maxWidth: { xs: 130, sm: 'none' } }}>
          {renderUser()}
        </Grid>
      </Grid>
    )
  }

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

  const handleOpenDialog = (event, dialogType) => {
    event.stopPropagation()

    if (dialogType === 'PROFILE') {
      setProfileDrawerOpen(true)
    }
  }

  const handleCloseDialog = () => {
    setProfileDrawerOpen(false)
  }

  return (
    <>
      {loading ? (
        <>
          <LinearProgress />
        </>
      ) : (
        <>
          {profileDrawerOpen && (
            <UserViewDrawer open={profileDrawerOpen} onClose={handleCloseDialog} userId={user.id} tab="account" />
          )}
          <Card>
            <CardContent>
              <Grid container spacing={6}>
                <Grid item xs={12} sm={9}>
                  <Box>
                    <Typography variant='h6' sx={{ lineHeight: 1, fontWeight: 600, fontSize: '2.75rem !important' }}>
                      {quiz.quiz.title}
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
                      {quiz.quiz.description}
                    </Typography>
                    <Typography
                      variant='h6'
                      color={themeColor}
                      sx={{
                        lineHeight: 1,
                        fontSize: '1rem !important',
                        padding: '1em',
                        paddingLeft: '0.4em',
                        maxWidth: '20rem',
                        wordBreak: 'break-word'
                      }}
                    >
                      {viewResults ? `Răspunsuri corecte: ${quiz.correctCount} / ${quiz.quiz.questions.length}` : null}
                    </Typography>
                    <Typography
                      variant='h5'
                      color={themeColor}
                      sx={{
                        lineHeight: 1,
                        fontSize: '1rem !important',
                        padding: '1em',
                        paddingTop: '0',
                        paddingLeft: '0.4em',
                        maxWidth: '20rem',
                        wordBreak: 'break-word'
                      }}

                      fontWeight={1000}
                    >
                      {viewResults ? `≈ ${parseFloat(quiz.correctCount / quiz.quiz.questions.length * 100).toFixed(2)}%` : null}
                    </Typography>

                  </Box>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <InView onChange={handleVisibilityChange}>
                    <Box
                      sx={{ marginTop: '-10rem', marginBottom: '1rem', marginLeft: '1rem' }}>
                      <CountdownTimer
                        targetTimestamp={new Date(quiz.enddedAt).getTime()}
                        size={150}
                        startTime={new Date(quiz.startedAt).getTime()}
                        completed={true}
                        initialTimeRemaining={quiz.quiz.maxTime * 60}
                      />
                    </Box>
                  </InView>
                  {renderUser()}
                </Grid>
              </Grid>

              <Grid container spacing={6}>
                <Grid item xs={12} sm={12}>
                  <CardContent sx={{ p: theme => `${theme.spacing(3.25, 5.75, 6.25)} !important` }}></CardContent>
                  {quiz.quiz.questions.map((question, index) => (
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

QuizReviewAttempt.acl = {
  action: 'read',
  subject: 'professor-pages'
}

export default QuizReviewAttempt
