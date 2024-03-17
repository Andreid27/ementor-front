// ** React Imports
import { Box, Button, CardContent, Chip, Grid, InputAdornment } from '@mui/material'
import Router, { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import CircularProgress from '@mui/material/CircularProgress'
import { Controller, useForm } from 'react-hook-form'
import CustomTextField from 'src/@core/components/mui/text-field'
import { useDispatch, useSelector } from 'react-redux'
import apiClient from 'src/@core/axios/axiosEmentor'
import * as apiSpec from '../../../apiSpec'
import toast from 'react-hot-toast'
import DialogTransition from './DialogTransition'
import { updateNewLesson } from 'src/store/apps/lesson'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'
import dynamic from 'next/dynamic'
import 'react-quill/dist/quill.snow.css'
import FileUploaderMultiple from './FileUploaderMultiple'

const QuillNoSSRWrapper = dynamic(import('react-quill'), { ssr: false })
const Quill = QuillNoSSRWrapper.Quill
var Size = Quill ? Quill.import('attributors/style/size') : null
if (Size) {
  Size.whitelist = ['10px', '20px', '30px', '40px', '50px', '60px', '70px']
  Quill.register(Size, true)
}

// Customize toolbar
const modules = {
  toolbar: [
    [{ font: [] }, { size: ['small', false, 'large', 'huge'] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ color: [] }, { background: [] }],
    [{ script: 'sub' }, { script: 'super' }],
    [{ header: 1 }, { header: 2 }, 'blockquote', 'code-block'],
    [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
    [{ direction: 'rtl' }, { align: [] }],
    ['clean']
  ]
}

const defaultValues = {
  title: '',
  description: '',
  timeToRead: 5,
  chapters: [],
  files: []
}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const LessonComponent = props => {
  const { previousValues } = props
  const [loading, setLoading] = useState(true)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [chapters, setChapters] = useState([])
  const dispatch = useDispatch()
  const [dialogOpen, setDialogOpen] = useState(false)
  const uploadFilesRef = React.createRef()

  const uploadFiles = () => {
    return uploadFilesRef.current.uploadFiles()
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
  }, [])

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    getValues
  } = useForm({
    defaultValues: previousValues && previousValues != {} ? previousValues : defaultValues
  })

  const cacheNewLesson = () => {
    dispatch(updateNewLesson(getValues()))
  }

  useEffect(() => {
    // Set up an interval only if not loading
    if (!loading) {
      const intervalId = setInterval(() => {
        cacheNewLesson()
      }, 60000) // 60000 milliseconds = 1 minute

      // Clean up the interval when the component is unmounted
      return () => {
        clearInterval(intervalId)
        console.log('Component will unmount, cleanup here')
        cacheNewLesson()
      }
    }
  }, [loading]) // The empty dependency array ensures that this effect runs only once when the component mounts

  const validateLesson = lessonData => {
    const errors = {}

    // Check required fields
    const requiredFields = ['title', 'description', 'timeToRead', 'chapters']
    requiredFields.forEach(field => {
      if (!lessonData[field] || (Array.isArray(lessonData[field]) && lessonData[field].length === 0)) {
        errors[field] = `${field} is required`
      }
    })

    return errors
  }

  const onSubmit = async data => {
    try {
      let values = getValues()
      values.timeToRead = values.timeToRead * 60
      const validationErrors = validateLesson(values)
      setSubmitLoading(true)
      values.files = await uploadFiles()

      if (Object.keys(validationErrors).length === 0) {
        // Perform the API call and return a promise
        const apiPromise = new Promise((resolve, reject) => {
          apiClient
            .post(apiSpec.LESSON_SERVICE + '/lesson/create', values)
            .then(async response => {
              console.log('Success')
              resolve(response)
              if (response.status === 201) {
                reset({ ...defaultValues })
                dispatch(updateNewLesson({}))
              }
              await delay(3000)
              await Router.push('/all-lessons')
            })
            .catch(error => {
              console.log(error)
              reject(error)
            })
            .finally(() => {
              setSubmitLoading(false) // Set loading to false when the request is complete
            })
        })

        // Use toast.promise to handle loading, success, and error states
        return toast.promise(apiPromise, {
          loading: 'Loading',
          success: 'Lecția a fost creată cu succes',
          error: 'Eroare la crearea lecției'
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
      toast.error('An unexpected error occurred: ' + error.message)
      setSubmitLoading(false)
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
    Router.push('/all-lessons')
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
              Resetare lecție
            </Button>
          </Box>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent>
              <Grid container spacing={5}>
                <Grid item xs={12} sm={5}>
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
                        placeholder='Lecția 1 - Admitere'
                        error={Boolean(errors.lastName)}
                        aria-describedby='validation-async-title'
                        {...(errors.lastName && { helperText: 'Acest câmp este obligatoriu.' })}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={5}>
                  <Controller
                    name='chapters'
                    control={control}
                    rules={{ required: true, minLength: 3, maxLength: 100 }}
                    render={({ field: { value, onChange } }) => (
                      <CustomAutocomplete
                        multiple
                        value={value}
                        options={chapters}
                        id='autocomplete-fixed-option'
                        getOptionLabel={option => option.title || ''}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        renderInput={params => (
                          <CustomTextField {...params} label='Capitole' placeholder='Selectează un capitol' />
                        )}
                        onChange={(event, newValue) => {
                          onChange(newValue)
                        }}
                        renderTags={(value, getTagProps) =>
                          value.map((option, index) => (
                            <Chip
                              label={option.title}
                              {...getTagProps({ index })}
                              onDelete={() => {
                                const newValue = [...value]
                                newValue.splice(index, 1)
                                onChange(newValue)
                              }}
                              key={option.id}
                            />
                          ))
                        }
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={6} sm={2}>
                  <Controller
                    name='timeToRead'
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

                <Grid item xs={12} sm={12}>
                  <Controller
                    name='description'
                    control={control}
                    rules={{ required: true, minLength: 3, maxLength: 100 }}
                    render={({ field: { value, onChange } }) => (
                      <>
                        <style jsx global>{`
                          .ql-editor {
                            min-height: 20vh;
                            max-height: 40vh;
                          }
                        `}</style>
                        <QuillNoSSRWrapper
                          placeholder='Introduceți aici o descriere pentru lecție...'
                          theme='snow'
                          value={value}
                          onChange={onChange}
                          modules={modules}
                        />
                      </>
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={12}>
                  <Controller
                    name='files'
                    control={control}
                    rules={{ required: true, minLength: 3, maxLength: 100 }}
                    render={({ field: { value, onChange } }) => (
                      <Box padding={'2rem'} border={'dashed'} borderRadius={'25px'}>
                        <FileUploaderMultiple ref={uploadFilesRef} />
                      </Box>
                    )}
                  />
                </Grid>
              </Grid>
            </CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '2em', marginBottom: '2.5em' }}>
              <Button variant='contained' onClick={onSubmit}>
                {submitLoading ? <CircularProgress color='info' /> : 'Încarcă lecția'}
              </Button>
            </Box>
          </form>
          <DialogTransition open={dialogOpen} handleClose={handleCloseDialog} handleConfirm={handleConfirmation} />
        </>
      )}
    </>
  )
}

LessonComponent.acl = {
  action: 'read',
  subject: 'professor-pages'
}

export default LessonComponent
