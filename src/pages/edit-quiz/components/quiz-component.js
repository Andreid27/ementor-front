// ** React Imports
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid,
  InputAdornment,
  MenuItem,
  Rating,
  Typography
} from '@mui/material'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import CircularProgress from '@mui/material/CircularProgress'
import { styled } from '@mui/material/styles'
import { Controller, useForm } from 'react-hook-form'
import CustomTextField from 'src/@core/components/mui/text-field'
import { useDispatch } from 'react-redux'
import apiClient from 'src/@core/axios/axiosEmentor'
import * as apiSpec from '../../../apiSpec'
import { set } from 'nprogress'
import CustomChip from 'src/@core/components/mui/chip'
import QuestionsComponent from './questions-component'

const defaultValues = {
  title: '',
  description: '',
  componentType: 'CS',
  difficultyLevel: 0,
  maxTime: 0,
  chaptersId: [],
  questionsList: []
}

const QuizComponent = () => {
  const [loading, setLoading] = useState(true)
  const [chapters, setChapters] = useState([])
  const dispatch = useDispatch()
  const { asPath, pathname } = useRouter()
  const [selectedChapters, setSelectedChapters] = useState([])

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
    const quizId = asPath.split('/')[2]
    apiClient
      .post(apiSpec.PROD_HOST + '/service3/chapter/paginated', {
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
  }, [])

  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues
  } = useForm({ defaultValues })

  const onSubmit = async data => {
    // setLoading(true)
    console.log(getValues())

    // handleNext(data)
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
                            handleChangeChapters(e) // Your existing function to handle chip changes
                            onChange(e.target.value) // Update the form state with the selected values
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
                        onChange={onChange}
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

                <Grid item xs={6} sm={4}>
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

                <Grid item xs={12} sm={4}>
                  <Controller
                    name='difficultyLevel'
                    control={control}
                    rules={{ required: true, minLength: 3, maxLength: 100 }}
                    render={({ field: { value, onChange } }) => (
                      <div>
                        <Typography variant='subtitle2' gutterBottom>
                          Grad de dificultate
                        </Typography>
                        <Rating value={Number(value)} onChange={onChange} max={3} defaultValue={1.5} precision={0.5} />
                      </div>
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
                    render={({ field: { value, onChange } }) => <QuestionsComponent />}
                  />
                </Grid>
              </Grid>
            </CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '2em' }}>
              <Button variant='contained' onClick={onSubmit}>
                Finalizare cont
              </Button>
            </Box>
          </form>
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
