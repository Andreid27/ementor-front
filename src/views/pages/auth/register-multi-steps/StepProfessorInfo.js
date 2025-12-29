// ** MUI Components
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Icon Imports
import Icon from 'src/@core/components/icon'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { Avatar, Card, CardContent, CardHeader, CircularProgress, Fade, Modal } from '@mui/material'
import { useSelector } from 'react-redux'
import { selectUser } from 'src/store/apps/user'
import FileUploaderImageCrop from 'src/views/forms/form-elements/file-uploader/FileUploaderImageCrop/FileUploaderImageCrop'
import CropEasy from 'src/views/forms/form-elements/file-uploader/FileUploaderImageCrop/CropComponent/CropEasy'
import { Controller, useForm } from 'react-hook-form'
import countryCodes from './countryCodes.json'
import { useAuth } from 'src/hooks/useAuth'
import apiClient from 'src/@core/axios/axiosEmentor'
import * as apiSpec from '../../../../apiSpec'

const StepProfessorInfo = ({ handleNext, handlePrev, initPrerequire, setInitPrerequire, profile, setProfile }) => {
  const user = useSelector(selectUser)
  const [file, setFile] = useState()
  const [fileName, setFileName] = useState('')
  const [openCrop, setOpenCrop] = useState(false)
  const [photoURL, setPhotoURL] = useState()
  const [universityId, setUniversityId] = useState('')
  const [specialities, setSpecialities] = useState([])
  const [loading, setLoading] = useState(false)
  const [imageValidationError, setImageValidationError] = useState(false)
  const auth = useAuth()

  useEffect(() => {
    apiClient.get(apiSpec.PROD_HOST + apiSpec.STUDENT_PROFILE_CONTROLLER + '/profile-prerequire').then(response => {
      setInitPrerequire(response.data)
    })
    setUniversityId(profile.university)
  }, [])

  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues
  } = useForm({ defaultValues: profile })

  const onSubmit = async data => {
    if (!profile.profilePicture || validateProfilePicture(profile)) {
      setImageValidationError(true)

      return
    }
    setLoading(true)
    data.profilePicture = profile.profilePicture
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
    const profilePictureLength = currentValues.profilePicture ? currentValues.profilePicture.trim().length : null
    if (profilePictureLength && profilePictureLength < 32) {
      return true
    }

    return false
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
            Informații profesor
          </Typography>
          <Typography sx={{ color: 'text.secondary' }}>
            Completați detaliile profilului dvs. academic
          </Typography>
        </Box>

        <Grid container spacing={5}>
          <Grid item xs={12} sm={6}>
            <Card className={'bro'} sx={{ width: 300, height: 300, '& .MuiCardHeader-action': { lineHeight: 0.8 } }}>
              {user && !user.profilePicture ? (
                <>
                  <CardHeader title={'Încarcă fotografia ta aici'} />
                  <CardContent sx={{ position: 'relative', '& pre': { m: '0 !important', maxHeight: 300 } }}>
                    <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                      <FileUploaderImageCrop
                        uploadFile={apiSpec.PROD_HOST + apiSpec.PROFILE_IMAGE_CONTROLLER + '/upload'}
                        setFile={setFile}
                        setOpenCrop={setOpenCrop}
                        setPhotoURL={setPhotoURL}
                        setFileName={setFileName}
                        file={file}
                        openCrop={openCrop}
                        photoURL={photoURL}
                        fileName={fileName}
                        setValues={setProfile}
                      />
                    </Box>
                  </CardContent>
                </>
              ) : (
                <Avatar
                  alt={user.name}
                  src={user.profilePicture.replace('s96-c', 's300-c')}
                  sx={{ width: 300, height: 300 }}
                  imgProps={{ referrerPolicy: 'no-referrer' }}
                  variant='square'
                />
              )}
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

              <Grid item xs={3} sm={2} style={{ marginRight: '25%' }}>
                <Controller
                  name='prefix'
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <CustomTextField select onChange={onChange} value={value} name='prefix' label='Țară'>
                      {countryCodes.map(country => (
                        <MenuItem key={country.code} value={country.dial_code}>
                          {country.emoji + country.dial_code}
                        </MenuItem>
                      ))}
                    </CustomTextField>
                  )}
                />
              </Grid>

              <Grid item xs={7} sm={7}>
                <Controller
                  name='phone'
                  control={control}
                  rules={{
                    pattern: {
                      value: /^[0-9]{9}$/,
                      message: 'Acest număr de telefon nu este valid.'
                    }
                  }}
                  render={({ field: { value, onChange } }) => (
                    <CustomTextField
                      fullWidth
                      value={value}
                      label='Număr de telefon (opțional)'
                      onChange={onChange}
                      placeholder='740123123'
                      error={Boolean(errors.phone)}
                      aria-describedby='validation-async-phone'
                      {...(errors.phone && { helperText: errors.phone.message })}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={12}>
                <Controller
                  name='university'
                  control={control}
                  rules={{ required: true, minLength: 32, maxLength: 40 }}
                  defaultValue={'choose'}
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
                      {...(errors.university && { helperText: 'Vă rugăm să selectați universitatea' })}
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
                  defaultValue={'choose'}
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
                      {...(errors.speciality && { helperText: 'Vă rugăm să selectați specializarea' })}
                    >
                      <MenuItem key={'choose'} value={'choose'}>
                        {'Alege'}
                      </MenuItem>
                      {specialities &&
                        specialities.map(speciality => (
                          <MenuItem key={speciality.specialityId} value={speciality.specialityId}>
                            {speciality.name}
                          </MenuItem>
                        ))}
                    </CustomTextField>
                  )}
                />
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Controller
              name='about'
              control={control}
              rules={{ maxLength: 500 }}
              render={({ field: { value, onChange } }) => (
                <CustomTextField
                  fullWidth
                  multiline
                  rows={4}
                  value={value}
                  label='Despre (opțional)'
                  onChange={onChange}
                  placeholder='Descrieți experiența dvs. academică...'
                  error={Boolean(errors.about)}
                  helperText={
                    errors.about
                      ? 'Descrierea nu poate depăși 500 de caractere'
                      : value
                      ? `${value.length}/500 caractere`
                      : '0/500 caractere'
                  }
                />
              )}
            />
          </Grid>

          <Grid item xs={6}>
            <Button
              variant='text'
              sx={{ marginBottom: '30px' }}
              onClick={() => {
                auth.logout()
              }}
            >
              Sign Out
            </Button>
          </Grid>

          <Grid item xs={6}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
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

export default StepProfessorInfo
