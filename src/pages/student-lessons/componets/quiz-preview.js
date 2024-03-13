// ** React Imports
import { Box, Button, Card, CardContent, CardHeader, Divider, Grid, Rating, Typography } from '@mui/material'

import Icon from 'src/@core/components/icon'
import { styled } from '@mui/material/styles'
import { useEffect, useState } from 'react'
import apiClient from 'src/@core/axios/axiosEmentor'
import * as apiSpec from '../../../apiSpec'
import { useRouter } from 'next/router'
import quiz from 'src/store/apps/quiz'

const StyledBox = styled(Box)(({ theme }) => ({
  [theme.breakpoints.up('sm')]: {
    borderRight: `1px solid ${theme.palette.divider}`
  }
}))

const QuizPreview = props => {
  const [preview, setPreview] = useState(null)
  const router = useRouter()

  useEffect(() => {
    apiClient
      .get(apiSpec.QUIZ_SERVICE + `/${props.preview.quizId}`)
      .then(response => {
        setPreview(response.data)
      })
      .catch(error => {
        console.log(error)
      })
  }, [])

  const handleStartTest = () => {
    props.setPreview()
    router.push(`/quiz/${props.preview.id}`)
  }

  return (
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
                      {props.preview.chapterTitles}
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
                            {props.preview.componentType === 'CG' ? 'Complement grupat' : 'Complement simplu'}
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
                          {props.preview.questionsCount} întrebări
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', '& svg': { color: 'primary.main', mr: 2.75 } }}>
                        <Icon icon='tabler:clock-hour-2' fontSize={20} />
                        <Typography sx={{ color: 'text.secondary' }}>{props.preview.maxTime} minute</Typography>
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
                        {props.preview.title}
                      </Typography>
                    </Box>
                    <Typography sx={{ mb: 13.75, display: 'flex', color: 'text.secondary', flexDirection: 'column' }}>
                      <span>{props.preview.description}</span>
                      <Box
                        sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', paddingTop: '0.75em' }}
                      >
                        <Typography sx={{ color: 'secondary.main', marginRight: '0.3em' }}>Dificultate: </Typography>
                        <Rating
                          readOnly
                          sx={{ color: 'primary.main' }}
                          defaultValue={props.preview.difficultyLevel}
                          max={3}
                          precision={props.preview.difficultyLevel}
                          name='read-only'
                        />
                      </Box>

                      <Typography sx={{ color: 'secondary.main', marginRight: '0.3em' }}>
                        Încercări rămase: {preview ? preview.remainedAttempts : null}
                      </Typography>
                    </Typography>
                    <Button onClick={() => props.setPreview()}>Inapoi</Button>
                    <Button
                      variant='contained'
                      onClick={() => handleStartTest()}
                      disabled={preview ? preview.remainedAttempts <= 0 : true}
                    >
                      Start test
                    </Button>
                  </div>
                </CardContent>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </>
  )
}

QuizPreview.acl = {
  action: 'read',
  subject: 'student-pages'
}

export default QuizPreview
