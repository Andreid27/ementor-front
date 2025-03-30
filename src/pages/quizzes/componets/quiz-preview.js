// ** React Imports
import { Box, Button, Card, CardContent, CardHeader, CircularProgress, Divider, Grid, Rating, Typography } from '@mui/material'

import Icon from 'src/@core/components/icon'
import { styled } from '@mui/material/styles'
import { useEffect, useState } from 'react'
import apiClient from 'src/@core/axios/axiosEmentor'
import * as apiSpec from '../../../apiSpec'
import { useRouter } from 'next/router'
import PreviousAttempt from './previous-attempt'
import PreviousAttemptProfessor from './previous-attempt-professor'

const StyledBox = styled(Box)(({ theme }) => ({
  [theme.breakpoints.up('sm')]: {
    borderRight: `1px solid ${theme.palette.divider}`
  }
}))

const QuizPreview = props => {
  console.log(props)
  const [preview, setPreview] = useState()
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const [previewMetadata, setPreviewMetadata] = useState(props.preview)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setPreviewMetadata(props.preview)
        let quizId = props.preview && props.preview.quizId ? props.preview.quizId : null;
        if (props.userRole === 'STUDENT') {
          const response = await apiClient.get(apiSpec.QUIZ_SERVICE + `/attempt-preview/${props.preview.id}`)
          setPreviewMetadata(response.data)
          quizId = response.data.quizId

          const quizResponse = await apiClient.get(apiSpec.QUIZ_SERVICE + `/${quizId}`)
          setPreview(quizResponse.data)
        } else {
          const response = await apiClient.get(apiSpec.QUIZ_SERVICE + `/${props.preview.id}`)
          setPreview(response.data)
          setPreviewMetadata(response.data)
        }
      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [props.preview])

  const handleStartTest = () => {
    props.setPreview()
    router.push(`/quiz/${previewMetadata.id}`)
  }

  const handleViewQuiz = () => {
    props.setPreview()
    router.push(`/edit-quiz/${props.preview.id}`)
  }

  const handleBack = () => {
    props.setPreview()
    if (router.query.all && router.query.all.length > 0) {
      router.query.all = []
      router.push(router)
    }
  }

  return (
    <>
      {loading ? (
        <Card>
          <CardContent>
            <Box sx={{ minHeight: '50vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <CircularProgress size='20vh' />
            </Box>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', padding: '1em' }}>
                <Grid container spacing={6}>
                  <Grid item xs={12} sm={7}>
                    <CardContent sx={{ p: theme => `${theme.spacing(3.25, 5.75, 6.25)} !important` }}>
                      <Typography variant='h3' sx={{ mb: 3.5 }}>
                        {preview && preview.chapters.length > 1 ? 'Capitole' : 'Capitol'}
                      </Typography>
                      <Divider
                        sx={{
                          mt: theme => `${theme.spacing(6.5)} !important`,
                          mb: theme => `${theme.spacing(6.75)} !important`
                        }}
                      />
                      {preview != null ? (
                        preview.chapters.map((chapter, index) => (
                          <div key={index}>
                            <Typography variant='h5' sx={{ mb: 3.5 }}>
                              {chapter.title}
                            </Typography>
                            <Typography sx={{ color: 'text.secondary' }}>{chapter.description}</Typography>
                            <Divider
                              sx={{
                                mt: theme => `${theme.spacing(6.5)} !important`,
                                mb: theme => `${theme.spacing(6.75)} !important`
                              }}
                            />
                          </div>
                        ))
                      ) : (
                        <Typography variant='h5' sx={{ mb: 3.5 }}>
                          {previewMetadata.chapterTitles}
                        </Typography>
                      )}

                      <Grid container spacing={4}>
                        <Grid item xs={12} sm={5}>
                          <StyledBox>
                            <Box
                              sx={{
                                mb: 6.75,
                                display: 'flex',
                                alignItems: 'center',
                                '& svg': { color: 'primary.main', mr: 2.75 }
                              }}
                            >
                              <Icon icon='tabler:clipboard-check' fontSize={20} />
                              <Typography sx={{ color: 'text.secondary' }}>
                                {previewMetadata.componentType === 'CG' ? 'Complement grupat' : 'Complement simplu'}
                              </Typography>
                            </Box>

                            <Box
                              sx={{ display: 'flex', alignItems: 'center', '& svg': { color: 'primary.main', mr: 2.75 } }}
                            >
                              <Icon icon='tabler:user' fontSize={20} />
                              <Typography sx={{ color: 'text.secondary' }}>Dr. Drd. Angie Enache</Typography>
                            </Box>
                          </StyledBox>
                        </Grid>
                        <Grid item xs={12} sm={7}>
                          <Box
                            sx={{
                              mb: 6.75,
                              display: 'flex',
                              alignItems: 'center',
                              '& svg': { color: 'primary.main', mr: 2.75 }
                            }}
                          >
                            <Icon icon='tabler:list-numbers' fontSize={20} />{' '}
                            <Typography sx={{ color: 'text.secondary' }}>
                              {previewMetadata.questionsCount ? previewMetadata.questionsCount : previewMetadata?.questions?.length} întrebări
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', '& svg': { color: 'primary.main', mr: 2.75 } }}>
                            <Icon icon='tabler:clock-hour-2' fontSize={20} />
                            <Typography sx={{ color: 'text.secondary' }}>{previewMetadata.maxTime} minute</Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Grid>
                  <Grid
                    item
                    sm={5}
                    xs={12}
                    sx={{ pt: ['0 !important', '1.5rem !important'], pl: ['1.5rem !important', '0 !important'] }}
                  >
                    <CardContent
                      sx={{
                        height: '100%',
                        display: 'flex',
                        textAlign: 'center',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'action.hover',
                        p: theme => `${theme.spacing(18, 5, 16)} !important`
                      }}
                    >
                      <div>
                        <Box sx={{ mb: 3.5, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                          <Typography variant='h6' sx={{ lineHeight: 1, fontWeight: 600, fontSize: '2.75rem !important' }}>
                            {previewMetadata.title}
                          </Typography>
                        </Box>
                        <Typography sx={{ mb: 13.75, display: 'flex', color: 'text.secondary', flexDirection: 'column' }}>
                          <span>{previewMetadata.description}</span>
                          <Box
                            sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', paddingTop: '0.75em' }}
                          >
                            <Typography sx={{ color: 'secondary.main', marginRight: '0.3em' }}>Dificultate: </Typography>
                            <Rating
                              readOnly
                              sx={{ color: 'primary.main' }}
                              defaultValue={previewMetadata.difficultyLevel}
                              max={3}
                              precision={previewMetadata.difficultyLevel}
                              name='read-only'
                            />
                          </Box>

                          <Typography sx={{ color: 'secondary.main', marginRight: '0.3em' }}>
                            {
                              props.userRole === 'STUDENT' ?
                                `Încercări rămase: ${preview ? preview.remainedAttempts : null}` :
                                `Rezolvări trimise: ${preview ? preview.quizPreviousAttempts.length : null}`
                            }

                          </Typography>
                        </Typography>
                        <Button onClick={() => handleBack()}>Inapoi</Button>
                        {props.userRole === 'STUDENT' ?
                          (<Button
                            variant='contained'
                            onClick={() => handleStartTest()}
                            disabled={preview ? preview.remainedAttempts <= 0 : true}
                          >
                            Start test
                          </Button>) :
                          (
                            <Button
                              variant='contained'
                              onClick={() => handleViewQuiz()}
                              disabled={preview ? preview.remainedAttempts <= 0 : true}
                            >
                              Vezi test
                            </Button>)
                        }

                      </div>
                    </CardContent>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
          {preview && preview.quizPreviousAttempts.length > 0 ? (
            <>
              <Card sx={{ marginTop: '2rem' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', padding: '1em' }}>
                    <Grid container spacing={6}>
                      <Grid item xs={12} sm={12}>
                        <Typography variant='h4'>Încercări anterioare</Typography>
                      </Grid>
                      {preview.quizPreviousAttempts.map((attempt, index) => (
                        <Grid key={attempt.id} item xs={12} sm={12}>
                          {props.userRole === 'STUDENT' ? (
                            <PreviousAttempt attempt={attempt} questionsCount={previewMetadata.questionsCount} index={index} />
                          ) : (
                            <PreviousAttemptProfessor
                              attempt={attempt}
                              questionsCount={props.preview.questionsCount}
                              index={index}
                              users={props.users}
                            />)}
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </CardContent>
              </Card>
            </>
          ) : null}
        </>
      )}
    </>
  )
}

QuizPreview.acl = {
  action: 'read',
  subject: 'student-pages'
}

export default QuizPreview
