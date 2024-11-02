// ** React Imports
import { Box, Button, CardContent, Grid, InputAdornment, MenuItem, Rating, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import CircularProgress from '@mui/material/CircularProgress'
import { Controller, useForm } from 'react-hook-form'
import CustomTextField from 'src/@core/components/mui/text-field'
import { useDispatch, useSelector } from 'react-redux'
import apiClient from 'src/@core/axios/axiosEmentor'
import * as apiSpec from '../../../apiSpec'
import CustomChip from 'src/@core/components/mui/chip'
import QuestionsComponent from './questions-component'
import toast from 'react-hot-toast'
import { updateNewQuiz } from 'src/store/apps/quiz'
import DialogTransition from './DialogTransition'
import validator from 'validator'
import Router from 'next/router'

const defaultValues = {
  title: '',
  description: '',
  componentType: 'CS',
  difficultyLevel: 0,
  maxTime: 0,
  numberOfAnswers: 5,
  chaptersId: [],
  questionsList: [
    {
      content: '',
      answer1: '',
      answer2: '',
      answer3: '',
      answer4: '',
      answer5: '',
      correctAnswer: 0,
      source: '',
      sourcePage: 0,
      difficultyLevel: 0,
      hint: ''
    },
    {
      content: '',
      answer1: '',
      answer2: '',
      answer3: '',
      answer4: '',
      answer5: '',
      correctAnswer: 0,
      source: '',
      sourcePage: 0,
      difficultyLevel: 0,
      hint: ''
    },
    {
      content: '',
      answer1: '',
      answer2: '',
      answer3: '',
      answer4: '',
      answer5: '',
      correctAnswer: 0,
      source: '',
      sourcePage: 0,
      difficultyLevel: 0,
      hint: ''
    },
    {
      content: '',
      answer1: '',
      answer2: '',
      answer3: '',
      answer4: '',
      answer5: '',
      correctAnswer: 0,
      source: '',
      sourcePage: 0,
      difficultyLevel: 0,
      hint: ''
    },
    {
      content: '',
      answer1: '',
      answer2: '',
      answer3: '',
      answer4: '',
      answer5: '',
      correctAnswer: 0,
      source: '',
      sourcePage: 0,
      difficultyLevel: 0,
      hint: ''
    },
    {
      content: '',
      answer1: '',
      answer2: '',
      answer3: '',
      answer4: '',
      answer5: '',
      correctAnswer: 0,
      source: '',
      sourcePage: 0,
      difficultyLevel: 0,
      hint: ''
    },
    {
      content: '',
      answer1: '',
      answer2: '',
      answer3: '',
      answer4: '',
      answer5: '',
      correctAnswer: 0,
      source: '',
      sourcePage: 0,
      difficultyLevel: 0,
      hint: ''
    },
    {
      content: '',
      answer1: '',
      answer2: '',
      answer3: '',
      answer4: '',
      answer5: '',
      correctAnswer: 0,
      source: '',
      sourcePage: 0,
      difficultyLevel: 0,
      hint: ''
    },
    {
      content: '',
      answer1: '',
      answer2: '',
      answer3: '',
      answer4: '',
      answer5: '',
      correctAnswer: 0,
      source: '',
      sourcePage: 0,
      difficultyLevel: 0,
      hint: ''
    },
    {
      content: '',
      answer1: '',
      answer2: '',
      answer3: '',
      answer4: '',
      answer5: '',
      correctAnswer: 0,
      source: '',
      sourcePage: 0,
      difficultyLevel: 0,
      hint: ''
    },
    {
      content: '',
      answer1: '',
      answer2: '',
      answer3: '',
      answer4: '',
      answer5: '',
      correctAnswer: 0,
      source: '',
      sourcePage: 0,
      difficultyLevel: 0,
      hint: ''
    },
    {
      content: '',
      answer1: '',
      answer2: '',
      answer3: '',
      answer4: '',
      answer5: '',
      correctAnswer: 0,
      source: '',
      sourcePage: 0,
      difficultyLevel: 0,
      hint: ''
    },
    {
      content: '',
      answer1: '',
      answer2: '',
      answer3: '',
      answer4: '',
      answer5: '',
      correctAnswer: 0,
      source: '',
      sourcePage: 0,
      difficultyLevel: 0,
      hint: ''
    },
    {
      content: '',
      answer1: '',
      answer2: '',
      answer3: '',
      answer4: '',
      answer5: '',
      correctAnswer: 0,
      source: '',
      sourcePage: 0,
      difficultyLevel: 0,
      hint: ''
    },
    {
      content: '',
      answer1: '',
      answer2: '',
      answer3: '',
      answer4: '',
      answer5: '',
      correctAnswer: 0,
      source: '',
      sourcePage: 0,
      difficultyLevel: 0,
      hint: ''
    }
  ]
}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const QuizComponent = props => {
  const { previousValues, quizId } = props
  const [loading, setLoading] = useState(true)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [chapters, setChapters] = useState([])
  const dispatch = useDispatch()
  const [selectedChapters, setSelectedChapters] = useState([])
  const [numberOfAnswers, setNumberOfAnswers] = useState(5)
  const [questionsDefaultDifficultyLevel, setQuestionsDefaultDifficultyLevel] = useState()
  const [componentType, setComponentType] = useState('CS')
  const [dialogOpen, setDialogOpen] = useState(false)

  const loadPreviousValues =
    previousValues && previousValues != {} && previousValues.questionsList && previousValues.questionsList.length > 0

  const ITEM_HEIGHT = 48
  const ITEM_PADDING_TOP = 8

  const MenuProps = {
    PaperProps: {
      style: {
        width: 250,
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP
      }
    }
  }

  const handleChangeChapters = event => {
    setSelectedChapters(event.target.value)
  }

  useEffect(() => {
    apiClient
      .post('/service3/chapter/paginated', {
        filters: [],
        sorters: [],
        page: 0,
        pageSize: 1000
      })
      .then(response => {
        setChapters(response.data.data)
        setLoading(false)
      })
      .catch(error => {
        console.log(error)
      })
    if (loadPreviousValues) {
      setSelectedChapters(previousValues.chaptersId)
      setQuestionsDefaultDifficultyLevel(previousValues.difficultyLevel)
    }
  }, [])

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    getValues
  } = useForm({
    defaultValues: loadPreviousValues ? previousValues : defaultValues
  })

  const cacheNewQuiz = () => {
    if (quizId === 'new') {
      dispatch(updateNewQuiz(getValues()))
    }
  }

  useEffect(() => {
    // Set up an interval only if not loading
    if (!loading) {
      const intervalId = setInterval(() => {
        cacheNewQuiz()
      }, 60000) // 60000 milliseconds = 1 minute

      // Clean up the interval when the component is unmounted
      return () => {
        clearInterval(intervalId)
        console.log('Component will unmount, cleanup here')
        cacheNewQuiz()
      }
    }
  }, [loading]) // The empty dependency array ensures that this effect runs only once when the component mounts

  const validateQuiz = quizData => {
    const errors = {}

    // Check required fields
    const requiredFields = [
      'title',
      'description',
      'componentType',
      'difficultyLevel',
      'maxTime',
      'chaptersId',
      'questionsList'
    ]
    requiredFields.forEach(field => {
      if (!quizData[field] || (Array.isArray(quizData[field]) && quizData[field].length === 0)) {
        errors[field] = `${field} is required`
      }
    })

    // Check questionsList content and correctAnswer
    if (quizData.questionsList) {
      quizData.questionsList.forEach((question, index) => {
        if (!question.content) {
          errors[`questionsList[${index}].content`] = `Content for question ${index + 1} is required`
        }
        if (question.correctAnswer === undefined || question.correctAnswer === 0) {
          errors[`questionsList[${index}].correctAnswer`] = `Correct answer for question ${
            index + 1
          } is required and should be different than 0`
        }
      })
    }

    return errors
  }

  const onSubmit = async data => {
    try {
      const validationErrors = validateQuiz(getValues())

      if (Object.keys(validationErrors).length === 0) {
        // Perform the API call and return a promise
        const apiPromise = new Promise((resolve, reject) => {
          if (quizId === 'new') {
            apiClient
              .post(apiSpec.QUIZ_SERVICE + '/create-complete', getValues())
              .then(async response => {
                console.log('Success')
                resolve(response)
                if (response.status === 201) {
                  reset({ ...defaultValues })
                  dispatch(updateNewQuiz({}))
                }
                await delay(3000)
                await Router.push('/all-quizzes')
              })
              .catch(error => {
                console.log(error)
                reject(error)
              })
              .finally(() => {
                setSubmitLoading(false)
              })
          } else if (validator.isUUID(quizId, 4)) {
            apiClient
              .put(apiSpec.QUIZ_SERVICE + `/update-complete`, getValues())
              .then(async response => {
                console.log('Success')
                resolve(response)

                await delay(3000)
                await Router.push('/all-quizzes')
              })
              .catch(error => {
                console.log(error)
                reject(error)
              })
              .finally(() => {
                setSubmitLoading(false)
              })
            resolve()
          }
        })

        return toast.promise(apiPromise, {
          loading: 'Loading',
          success: `Testul a fost ${validator.isUUID(quizId, 4) && quizId != 'new' ? 'modificat' : 'creat'} cu succes`,
          error: 'Eroare la crearea testului'
        })
      } else {
        // Handle validation errors
        toast.error('Eroare de validare: ' + JSON.stringify(validationErrors), {
          duration: 5000,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true
        })
      }
    } catch (error) {
      console.error('An unexpected error occurred:', error)
    }
  }

  const handleOpenDialog = () => {
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
  }

  const handleConfirmation = () => {
    reset({ ...defaultValues })
    handleCloseDialog()
    Router.push('/all-quizzes')
  }

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
        <>
          <Box display='flex' justifyContent='flex-end' marginRight='0.7em' marginTop='-3.5rem'>
            <Button
              variant='outlined'
              color='error'
              onClick={() => {
                handleOpenDialog()
              }}
            >
              Resetare test
            </Button>
          </Box>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent>
              <Grid container spacing={5}>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name='title'
                    control={control}
                    rules={{ required: true, minLength: 3, maxLength: 100 }}
                    render={({ field: { value, onChange } }) => (
                      <CustomTextField
                        fullWidth
                        value={value}
                        label='Titlu'
                        onChange={onChange}
                        placeholder='Test 1 - Admitere'
                        error={Boolean(errors.lastName)}
                        aria-describedby='validation-async-title'
                        {...(errors.lastName && { helperText: 'Acest câmp este obligatoriu.' })}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller
                    name='chaptersId'
                    control={control}
                    rules={{ required: true, minLength: 3, maxLength: 100 }}
                    render={({ field: { value, onChange } }) => (
                      <CustomTextField
                        select
                        fullWidth
                        label='Capitol'
                        id='select-multiple-chip'
                        SelectProps={{
                          MenuProps,
                          multiple: true,
                          value: selectedChapters,
                          onChange: e => {
                            handleChangeChapters(e)
                            onChange(e.target.value)
                          },
                          renderValue: selected => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                              {selected.map(value => (
                                <CustomChip
                                  key={value}
                                  label={chapters.find(chapter => chapter.id === value)?.title}
                                  sx={{ m: 0.75 }}
                                  color='primary'
                                />
                              ))}
                            </Box>
                          )
                        }}
                      >
                        {chapters.map(chapter => (
                          <MenuItem key={chapter.id} value={chapter.id}>
                            {chapter.title}
                          </MenuItem>
                        ))}
                      </CustomTextField>
                    )}
                  />
                </Grid>

                <Grid item xs={6} sm={4}>
                  <Controller
                    name='componentType'
                    control={control}
                    rules={{ required: true, minLength: 32, maxLength: 40 }}
                    defaultValue={'CS'}
                    render={({ field: { value, onChange } }) => (
                      <CustomTextField
                        select
                        fullWidth
                        onChange={e => {
                          setComponentType(e.target.value) // Your existing function to handle chip changes
                          onChange(e.target.value) // Update the form state with the selected values
                        }}
                        value={value}
                        name='componentType'
                        label='Tipul de complement'
                        error={Boolean(errors.countyId)}
                        aria-describedby='validation-async-last-name'
                        {...(errors.countyId && { helperText: 'Acest câmp este obligatoriu.' })}
                      >
                        <MenuItem key={'CS'} value={'CS'}>
                          {'Complement simplu'}
                        </MenuItem>
                        <MenuItem key={'CG'} value={'CG'}>
                          {'Complement grupat'}
                        </MenuItem>
                        <MenuItem key={'CM'} value={'CM'}>
                          {'Complement multiplu'}
                        </MenuItem>
                      </CustomTextField>
                    )}
                  />
                </Grid>

                <Grid item xs={6} sm={2}>
                  <Controller
                    name='maxTime'
                    control={control}
                    rules={{ required: true, minLength: 3, maxLength: 100 }}
                    render={({ field: { value, onChange } }) => (
                      <CustomTextField
                        fullWidth
                        value={value}
                        type='number'
                        label='Timpul maxim:'
                        onChange={onChange}
                        placeholder='120'
                        error={Boolean(errors.lastName)}
                        aria-describedby='validation-async-title'
                        {...(errors.lastName && { helperText: 'Acest câmp este obligatoriu.' })}
                        InputProps={{
                          endAdornment: <InputAdornment position='start'>min</InputAdornment>
                        }}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={4} sm={3}>
                  <Controller
                    name='difficultyLevel'
                    control={control}
                    rules={{ required: true, minLength: 3, maxLength: 100 }}
                    render={({ field: { value, onChange } }) => (
                      <div>
                        <Typography variant='subtitle2' gutterBottom>
                          Grad de dificultate
                        </Typography>
                        <Rating
                          value={Number(value)}
                          onChange={e => {
                            onChange(e)
                            setQuestionsDefaultDifficultyLevel(e.target.value) // Set the value in real-time
                          }}
                          max={3}
                          defaultValue={1.5}
                          precision={1}
                        />
                      </div>
                    )}
                  />
                </Grid>

                <Grid item xs={8} sm={3}>
                  <Controller
                    name='numberOfAnswers'
                    control={control}
                    rules={{ required: true, minLength: 3, maxLength: 100 }}
                    render={({ field: { value, onChange } }) => (
                      <CustomTextField
                        fullWidth
                        value={value}
                        type='number'
                        label='Numărul de răspunsuri posibile:'
                        onChange={e => {
                          onChange(e)
                          setNumberOfAnswers(e.target.value) // Set the value in real-time
                        }}
                        placeholder='5'
                        error={Boolean(errors.lastName)}
                        aria-describedby='validation-async-title'
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={12}>
                  <Controller
                    name='description'
                    control={control}
                    rules={{ required: true, minLength: 3, maxLength: 100 }}
                    render={({ field: { value, onChange } }) => (
                      <CustomTextField
                        fullWidth
                        rows={4}
                        multiline
                        value={value}
                        label='Descriere'
                        onChange={onChange}
                        placeholder='Aceasta este descrierea testului.'
                        error={Boolean(errors.lastName)}
                        aria-describedby='validation-async-description'
                        {...(errors.lastName && { helperText: 'Acest câmp este obligatoriu.' })}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={12}>
                  <Controller
                    name='questionsList'
                    control={control}
                    rules={{ required: true, minLength: 3, maxLength: 100 }}
                    render={({ field: { value, onChange } }) => (
                      <QuestionsComponent
                        questions={value}
                        updateQuestions={updatedQuestions => onChange(updatedQuestions)}
                        numberOfAnswers={numberOfAnswers}
                        difficultyLevel={questionsDefaultDifficultyLevel}
                        componentType={componentType}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '2em', marginBottom: '2.5em' }}>
              <Button variant='contained' onClick={onSubmit}>
                {submitLoading ? <CircularProgress color='info' /> : 'Finalizare test'}
              </Button>
            </Box>
          </form>
          <DialogTransition open={dialogOpen} handleClose={handleCloseDialog} handleConfirm={handleConfirmation} />
        </>
      )}
    </>
  )
}

QuizComponent.acl = {
  action: 'read',
  subject: 'professor-pages'
}

export default QuizComponent
