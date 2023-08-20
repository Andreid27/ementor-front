// ** MUI Components
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import FormControl from '@mui/material/FormControl'
import InputAdornment from '@mui/material/InputAdornment'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import * as apiSpec from '../../../../apiSpec'
import * as source from 'src/views/forms/form-elements/file-uploader/FileUploaderSourceCode'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Icon Imports
import Icon from 'src/@core/components/icon'
import axios from 'axios'
import { useEffect, useState } from 'react'
import FileUploaderRestrictions from 'src/views/forms/form-elements/file-uploader/FileUploaderRestrictions'
import CardSnippet from 'src/@core/components/card-snippet'
import FileUploaderSingle from 'src/views/forms/form-elements/file-uploader/FileUploaderSingle'
import { Card, CardContent, CardHeader, CircularProgress, Fade, Modal } from '@mui/material'
import { useSelector } from 'react-redux'
import { selectAccessToken, selectTokens } from 'src/store/apps/user'
import FileUploaderImageCrop from 'src/views/forms/form-elements/file-uploader/FileUploaderImageCrop/FileUploaderImageCrop'
import CropEasy from 'src/views/forms/form-elements/file-uploader/FileUploaderImageCrop/CropComponent/CropEasy'
import { Controller, useForm } from 'react-hook-form'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import CustomInput from '../../../forms/form-elements/pickers/PickersCustomInput'
import { useTheme } from '@emotion/react'
import PickersMonthYearDropdowns from 'src/views/forms/form-elements/pickers/PickersMonthYearDropdowns'
import { LocalizationProvider } from '@mui/x-date-pickers'
import dayjs from 'dayjs'

const defaultValues = {
  school: '',
  schoolGrade: '',
  university: 'choose',
  speciality: 'choose',
  date: dayjs(),
  profilePicture: ''
}

const StepPersonalDetails = ({ handleNext, handlePrev }) => {
  const [initPrerequire, setInitPrerequire] = useState({ universities: [], counties: [] })

  let accessToken = useSelector(selectTokens)
  const [file, setFile] = useState()
  const [fileName, setFileName] = useState('')
  const [openCrop, setOpenCrop] = useState(false)
  const [photoURL, setPhotoURL] = useState()
  const [universityId, setUniversityId] = useState('')
  const [specialities, setSpecialities] = useState([])
  const [loading, setLoading] = useState(false)
  const [imageValidationError, setImageValidationError] = useState(false)

  const theme = useTheme()
  const { direction } = theme

  useEffect(() => {
    axios.get(apiSpec.PROFILE_SERVICE + '/profile-prerequire').then(response => {
      console.log(response.data)
      setInitPrerequire(response.data)
    })
  }, [])

  const [values, setValues] = useState({
    school: '',
    schoolGrade: '',
    university: '',
    speciality: '',
    date: '',
    profilePicture: ''
  })

  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues
  } = useForm({ defaultValues })

  const onSubmit = async data => {
    if (validateProfilePicture(values)) {
      setImageValidationError(true)

      return
    }
    setLoading(true)
    data.profilePicture = values.profilePicture
    setLoading(false)
    handleNext(data)
  }

  useEffect(() => {
    if (
      initPrerequire.universities.length > 0 &&
      universityId != 'choose' &&
      universityId &&
      initPrerequire.universities
    ) {
      let currentSpecialities = initPrerequire.universities.find(
        currentUniversity => currentUniversity.id === universityId
      ).specialities
      setSpecialities(currentSpecialities)
    }
  }, [universityId])

  const validateProfilePicture = currentValues => {
    const profilePictureLength = currentValues.profilePicture.trim().length
    if (profilePictureLength < 32) {
      return true
    } else {
      return false
    }
  }

  return (
    <>
      <Modal
        open={openCrop}
        onClose={() => setOpenCrop(false)}
        closeAfterTransition
        style={{
          overlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)'
          },
          content: {
            position: 'absolute',
            top: '10%',
            left: '10%',
            width: '80%',
            height: '80%',
            padding: '20px',
            border: '1px solid #ccc',
            background: '#fff'
          }
        }}
      >
        <Fade in={openCrop}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%'
            }}
          >
            <CropEasy {...{ photoURL, setOpenCrop, setPhotoURL, setFile, fileName }} />
          </div>
        </Fade>
      </Modal>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ mb: 6 }}>
          <Typography variant='h3' sx={{ mb: 1.5 }}>
            Personal Information
          </Typography>
          <Typography sx={{ color: 'text.secondary' }}>Enter Your Personal Information</Typography>
        </Box>

        <Grid container spacing={5}>
          <Grid item xs={12} sm={6}>
            <Card className={'bro'} sx={{ width: 300, height: 300, '& .MuiCardHeader-action': { lineHeight: 0.8 } }}>
              <CardHeader title={'Încarcă fotografia ta aici'} />
              <CardContent sx={{ position: 'relative', '& pre': { m: '0 !important', maxHeight: 300 } }}>
                <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                  <FileUploaderImageCrop
                    uploadFile={apiSpec.PROFILE_SERVICE + '-image/upload'}
                    setFile={setFile}
                    setOpenCrop={setOpenCrop}
                    setPhotoURL={setPhotoURL}
                    setFileName={setFileName}
                    file={file}
                    openCrop={openCrop}
                    photoURL={photoURL}
                    fileName={fileName}
                    setValues={setValues}
                  />
                </Box>
              </CardContent>
            </Card>
            {imageValidationError && (
              <Typography variant='caption' color='error'>
                Fotografia de profil este obligatorie.
              </Typography>
            )}
          </Grid>

          <Grid item xs={12} sm={6}>
            <Grid container spacing={5}>
              <Grid item xs={12} sm={12}></Grid>
              <Grid item xs={12} sm={12}></Grid>

              <Grid item xs={12} sm={12}>
                <Controller
                  name='university'
                  control={control}
                  rules={{ required: true, minLength: 32, maxLength: 40 }}
                  defaultValue={'choose'} // This sets the default value
                  render={({ field: { value, onChange } }) => (
                    <CustomTextField
                      select
                      fullWidth
                      onChange={e => {
                        onChange(e)
                        setUniversityId(e.target.value)
                      }}
                      value={value}
                      name='university'
                      label='Universitate'
                      error={Boolean(errors.university)}
                      aria-describedby='validation-async-last-name'
                      {...(errors.university && { helperText: 'Acest câmp este obligatoriu.' })}
                    >
                      <MenuItem key={'choose'} value={'choose'}>
                        {'Alege'}
                      </MenuItem>
                      {initPrerequire &&
                        initPrerequire.universities.map(university => (
                          <MenuItem key={university.id} value={university.id}>
                            {university.name}
                          </MenuItem>
                        ))}
                    </CustomTextField>
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={12}>
                <Controller
                  name='speciality'
                  control={control}
                  rules={{ required: true, minLength: 32, maxLength: 40 }}
                  defaultValue={'choose'} // This sets the default value
                  render={({ field: { value, onChange } }) => (
                    <CustomTextField
                      select
                      fullWidth
                      onChange={e => {
                        onChange(e)
                      }}
                      value={value}
                      name='speciality'
                      label='Specializare'
                      error={Boolean(errors.speciality)}
                      aria-describedby='validation-async-last-name'
                      {...(errors.speciality && { helperText: 'Acest câmp este obligatoriu.' })}
                    >
                      <MenuItem key={'choose'} value={'choose'}>
                        {'Alege'}
                      </MenuItem>
                      {specialities &&
                        specialities.map(speciality => (
                          <MenuItem key={speciality.id} value={speciality.id}>
                            {speciality.name}
                          </MenuItem>
                        ))}
                    </CustomTextField>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={12} sx={{ marginTop: '0.5rem' }}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <Box>
                    <Controller
                      name='date'
                      control={control}
                      defaultValue={new Date()} // Set the default value here
                      render={({ field: { onChange, value } }) => (
                        <DatePicker
                          slotProps={{ textField: { fullWidth: true } }}
                          label={'Luna și Anul dorit pentru examen'}
                          views={['month', 'year']}
                          value={value} // Get the value here
                          onChange={onChange} // Set the value here
                        />
                      )}
                    />
                  </Box>
                </LocalizationProvider>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12} sm={8}>
            <Controller
              name='school'
              control={control}
              rules={{ required: true, minLength: 3, maxLength: 100 }}
              render={({ field: { value, onChange } }) => (
                <CustomTextField
                  fullWidth
                  value={value}
                  label='Liceu'
                  onChange={onChange}
                  placeholder='Colegiul Național "Gheorghe Lazăr"'
                  error={Boolean(errors.school)}
                  aria-describedby='validation-async-first-name'
                  {...(errors.school && { helperText: 'Acest câmp este obligatoriu.' })}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Controller
              name='schoolGrade'
              control={control}
              rules={{
                required: true,
                pattern: {
                  value: /^\d\.\d\d$/,
                  message: 'Acest număr de telefonu este valid.'
                }
              }}
              render={({ field: { value, onChange } }) => (
                <CustomTextField
                  fullWidth
                  value={value}
                  label='Media generală / Nota de la BAC'
                  onChange={onChange}
                  placeholder='9.99'
                  error={Boolean(errors.schoolGrade)}
                  aria-describedby='validation-async-last-name'
                  {...(errors.schoolGrade && { helperText: 'Acest câmp este obligatoriu.' })}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sx={{ pt: theme => `${theme.spacing(6)} !important` }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button color='secondary' variant='tonal' onClick={handlePrev} sx={{ '& svg': { mr: 2 } }}>
                <Icon fontSize='1.125rem' icon='tabler:arrow-left' />
                Previous
              </Button>
              <Button type='submit' variant='contained'>
                {loading ? (
                  <CircularProgress
                    sx={{
                      color: 'common.white',
                      width: '20px !important',
                      height: '20px !important',
                      mr: theme => theme.spacing(2)
                    }}
                  />
                ) : null}
                Următorul pas
                <Icon fontSize='1.125rem' icon='tabler:arrow-right' />
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </>
  )
}

export default StepPersonalDetails
