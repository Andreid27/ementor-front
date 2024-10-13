// ** MUI Components
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import * as apiSpec from '../../../../apiSpec'

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
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { useTheme } from '@emotion/react'
import { LocalizationProvider } from '@mui/x-date-pickers'
import schoolSpecialities from './schoolSpecialities.json'
import schoolDomains from './schoolDomains.json'
import countryCodes from './countryCodes.json'
import { useAuth } from 'src/hooks/useAuth'


const StepPersonalDetails = ({ handleNext, initPrerequire, setInitPrerequire, setCounties, profile, setProfile }) => {
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

  const theme = useTheme()
  const { direction } = theme

  useEffect(() => {
    axios.get(apiSpec.PROD_HOST + apiSpec.PROFILE_CONTROLLER + '/profile-prerequire').then(response => {
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
    if (validateProfilePicture(profile)) {
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
            Informații personale
          </Typography>
          <Typography sx={{ color: 'text.secondary' }}>
            Intrduceți detalii personale în formularul de mai jos
          </Typography>
        </Box>

        <Grid container spacing={5}>
          <Grid item xs={12} sm={6}>
            <Card className={'bro'} sx={{ width: 300, height: 300, '& .MuiCardHeader-action': { lineHeight: 0.8 } }}>

              {user && !user.profilePicture ?
                <>
                  <CardHeader title={'Încarcă fotografia ta aici'} />
                  <CardContent sx={{ position: 'relative', '& pre': { m: '0 !important', maxHeight: 300 } }}>
                    <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                      <FileUploaderImageCrop
                        uploadFile={apiSpec.PROD_HOST + apiSpec.PROFILE_CONTROLLER + '-image/upload'}
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
                : <Avatar alt={user.name} src={user.profilePicture.replace('s96-c', 's300-c')}
                  sx={{ width: 300, height: 300 }}
                  imgProps={{ referrerPolicy: 'no-referrer' }} variant="square" />
              }
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
                    required: true,
                    pattern: {
                      value: /^[0-9]{9}$/, // You can adjust the regex pattern for your specific phone number format
                      message: 'Acest număr de telefonu este valid.'
                    }
                  }}
                  render={({ field: { value, onChange } }) => (
                    <CustomTextField
                      fullWidth
                      value={value}
                      label='Număr de telefon'
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
                          <MenuItem key={speciality.specialityId} value={speciality.specialityId}>
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

          <Grid item xs={12} sm={6}>
            <Controller
              name='schoolDomain'
              control={control}
              rules={{ required: true, minLength: 4, maxLength: 50 }}
              defaultValue={'ch'} // This sets the default value
              render={({ field: { value, onChange } }) => (
                <CustomTextField
                  select
                  fullWidth
                  onChange={e => {
                    onChange(e)
                  }}
                  value={value}
                  name='schoolDomain'
                  label='Domeniu de studiu'
                  error={Boolean(errors.schoolDomain)}
                  aria-describedby='validation-async-last-name'
                  {...(errors.schoolDomain && { helperText: 'Acest câmp este obligatoriu.' })}
                >
                  <MenuItem key={'ch'} value={'ch'}>
                    {'Alege'}
                  </MenuItem>
                  {schoolDomains &&
                    Object.entries(schoolDomains).map(([key, value]) => (
                      <MenuItem key={key} value={key}>
                        {value}
                      </MenuItem>
                    ))}
                </CustomTextField>
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller
              name='schoolSpeciality'
              control={control}
              rules={{ required: true, minLength: 4, maxLength: 50 }}
              defaultValue={'ch'} // This sets the default value
              render={({ field: { value, onChange } }) => (
                <CustomTextField
                  select
                  fullWidth
                  onChange={e => {
                    onChange(e)
                  }}
                  value={value}
                  name='schoolSpeciality'
                  label='Specializarea'
                  error={Boolean(errors.schoolSpeciality)}
                  aria-describedby='validation-async-last-name'
                  {...(errors.schoolSpeciality && { helperText: 'Acest câmp este obligatoriu.' })}
                >
                  <MenuItem key={'ch'} value={'ch'}>
                    {'Alege'}
                  </MenuItem>
                  {schoolSpecialities &&
                    Object.entries(schoolSpecialities).map(([key, value]) => (
                      <MenuItem key={key} value={key}>
                        {value}
                      </MenuItem>
                    ))}
                </CustomTextField>
              )}
            />
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
                  value: /^\d([.,]\d{1,2})?$/,
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

          <Grid item xs={6}>
            <Button variant='text' sx={{ marginBottom: '30px' }}
              onClick={() => { auth.logout() }}>
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

export default StepPersonalDetails
