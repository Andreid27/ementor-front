// ** React Imports
import { useEffect, useRef, useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Dialog from '@mui/material/Dialog'
import Divider from '@mui/material/Divider'
import { styled } from '@mui/material/styles'
import Checkbox from '@mui/material/Checkbox'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import FormControl from '@mui/material/FormControl'
import CardContent from '@mui/material/CardContent'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import FormHelperText from '@mui/material/FormHelperText'
import Button from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import ModalFileUploaderImageCrop from '../../../forms/form-elements/file-uploader/ModalFileUploaderImageCrop'
import * as apiSpec from '../../../../apiSpec'

// ** Third Party Imports
import { useForm, Controller } from 'react-hook-form'

// ** Icon Imports
import Icon from 'src/@core/components/icon'
import { useDispatch, useSelector } from 'react-redux'
import AccountDetailsCard from './Cards/AccountDetailsCards'
import { addThumbnail, addUser, selectThumbnail, selectTokens, updateUserHasProfile } from 'src/store/apps/user'
import apiClient from 'src/@core/axios/axiosEmentor'
import { Avatar, CircularProgress } from '@mui/material'
import PersonalInfoCard from './Cards/PersonalInfoCard'
import ProfessorInfoCard from './Cards/ProfessorInfoCard'
import axios from 'axios'
import AddressInfoCard from './Cards/AddressInfoCard'
import { toast } from 'react-hot-toast'
import { useAuth } from 'src/hooks/useAuth'
import jwtDecode from 'jwt-decode'
import { Router, useRouter } from 'next/router'

const ImgStyled = styled('img')(({ theme }) => ({
  width: 100,
  height: 100,
  marginRight: theme.spacing(6),
  borderRadius: theme.shape.borderRadius
}))

const ButtonStyled = styled(Button)(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    textAlign: 'center'
  }
}))

const ResetButtonStyled = styled(Button)(({ theme }) => ({
  marginLeft: theme.spacing(4),
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    marginLeft: 0,
    textAlign: 'center',
    marginTop: theme.spacing(2)
  }
}))

const TabAccount = () => {
  const { logout } = useAuth()
  const router = useRouter()

  // ** State
  const [open, setOpen] = useState(false)
  const userData = useSelector(state => state.user)
  const [userInput, setUserInput] = useState('yes')
  const [formData, setFormData] = useState(userData.data)
  const [imgSrc, setImgSrc] = useState(userData.thumbnailUrl)
  const [secondDialogOpen, setSecondDialogOpen] = useState(false)
  const [openFileUpload, setOpenFileUpload] = useState(false)
  const [profilePictureId, setProfilePictureId] = useState({})
  const [initPrerequire, setInitPrerequire] = useState({ universities: [], counties: [] })
  const dispatch = useDispatch()

  const accountDetailsRef = useRef()
  const personalInfoRef = useRef()
  const addressInfoRef = useRef()

  const [fullProfile, setFullProfile] = useState({
    id: null,
    userId: '',
    user: {
      userId: null,
      email: '',
      firstName: '',
      lastName: '',
      phone: '',
      prefix: '+40',
      role: null,
      active: false,
      disabled: false,
      hasProfile: false
    },
    pictureId: null,
    universityId: 'choose',
    specialityId: 'choose',
    desiredExamDate: '2025-11-04T20:25:51.566Z',
    school: '',
    schoolDomain: 'ch',
    schoolSpeciality: 'ch',
    schoolGrade: 10,
    about: '',
    address: {
      id: null,
      countyId: 'choose',
      countyValue: '',
      city: '',
      street: '',
      number: '',
      block: '',
      staircase: '',
      apartment: 0
    }
  })

  const [loading, setLoading] = useState(true)

  // Define an async function to fetch the data
  const fetchData = async () => {
    try {
      const userRole = userData.data.role
      const isStudent = userRole === 'STUDENT'
      const isProfessor = userRole === 'PROFESSOR'

      // Fetch prerequisites
      const prerequireResponse = await apiClient.get(
        apiSpec.PROD_HOST + apiSpec.STUDENT_PROFILE_CONTROLLER + '/profile-prerequire'
      )
      setInitPrerequire(prerequireResponse.data)

      // Fetch profile based on role
      let fullProfileResponse
      if (isStudent) {
        fullProfileResponse = await apiClient.get(apiSpec.STUDENT_PROFILE_CONTROLLER + '/get-full')
      } else if (isProfessor) {
        // fullProfileResponse = await apiClient.get(apiSpec.PROD_HOST + '/professor-profile/get-full')
        fullProfileResponse = await apiClient.get(apiSpec.LOCAL_HOST + '/professor-profile/get-full')
      } else {
        throw new Error('Unknown user role')
      }

      setFullProfile(fullProfileResponse.data)

      // Fetch profile picture if exists
      if (fullProfileResponse.data.pictureId) {
        const pictureEndpoint = isStudent
          ? `${apiSpec.STUDENT_PROFILE_CONTROLLER}-image/download/${fullProfileResponse.data.pictureId}`
          : `${apiSpec.PROD_HOST}/profile-image/download/${fullProfileResponse.data.pictureId}`

        const profilePictureResponse = await apiClient.get(pictureEndpoint, {
          responseType: 'blob'
        })
        const imageBlob = profilePictureResponse.data
        const newImageUrl = URL.createObjectURL(imageBlob)
        setImgSrc(newImageUrl)
      } else {
        setImgSrc(userData.thumbnailUrl.replace('s96-c', 's300-c'))
      }
      setLoading(false)
    } catch (error) {
      console.error('Error:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    //TODO continue here updating the small profile picture component on this dispatch
    dispatch(addThumbnail(imgSrc))
  }, [imgSrc])

  // ** Hooks
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({ defaultValues: { checkbox: false } })
  const handleClose = () => setOpen(false)

  const handleSecondDialogClose = () => {
    setSecondDialogOpen(false)
  }
  const onSubmit = () => setOpen(true)

  const handleConfirmation = value => {
    handleClose()
    if (value === 'yes') {
      const userRole = userData.data.role
      const isStudent = userRole === 'STUDENT'

      const deleteEndpoint = isStudent
        ? apiSpec.STUDENT_PROFILE_CONTROLLER + '/' + fullProfile.user.userId
        : apiSpec.PROD_HOST + '/professor-profile/' + fullProfile.user.userId

      apiClient
        .delete(deleteEndpoint)
        .then(async response => {
          logout()
          dispatch(updateTokens({ accessToken: '', refreshToken: '' }))
          toast.success('Cont dezactivat cu succes!')
        })
        .catch(err => {
          toast.error('Eroare la dezactivarea contului! Încercați mai târziu. Err:' + err)
          console.log(err)
        })
    }
    setUserInput(value)
    setSecondDialogOpen(true)
  }

  const handleFormChange = (field, value) => {
    setFormData({ ...formData, [field]: value })
  }
  if (loading) {
    return (
      <div>
        <CircularProgress /> {/* You can customize the loading indicator */}
      </div>
    )
  }

  const buildRequestBody = () => {
    const userRole = userData.data.role
    const isStudent = userRole === 'STUDENT'
    const isProfessor = userRole === 'PROFESSOR'

    let accountDetailsData = accountDetailsRef.current.getValues()
    let personalInfoData = personalInfoRef.current.getValues()
    let addressInfoData = addressInfoRef.current.getValues()
    accountDetailsData.phone = accountDetailsData.prefix + accountDetailsData.phone

    if (isStudent) {
      // Student request body structure
      personalInfoData.user = accountDetailsData
      personalInfoData.address = addressInfoData

      if (userData.data.hasProfile === false) {
        const userId = jwtDecode(userData.tokens.accessToken).userId
        personalInfoData.user.email = userData.data.email
        personalInfoData.userId = userId
        personalInfoData.user.userId = userId
        if (profilePictureId.profilePicture == undefined || profilePictureId.profilePicture == null) {
          toast.error('Vă rugăm să reîncărcați poza de profil')

          return
        }
        personalInfoData.pictureId = profilePictureId.profilePicture
      }

      return personalInfoData
    } else if (isProfessor) {
      // Professor request body structure
      const requestBody = {
        fullName: personalInfoData.fullName,
        universityId: personalInfoData.universityId,
        specialityId: personalInfoData.specialityId,
        about: personalInfoData.about || null,
        user: accountDetailsData,
        address: addressInfoData,
        pictureId: fullProfile.pictureId
      }

      if (userData.data.hasProfile === false) {
        const userId = jwtDecode(userData.tokens.accessToken).userId
        requestBody.user.email = userData.data.email
        requestBody.userId = userId
        requestBody.user.userId = userId
        if (profilePictureId.profilePicture == undefined || profilePictureId.profilePicture == null) {
          toast.error('Vă rugăm să reîncărcați poza de profil')

          return
        }
        requestBody.pictureId = profilePictureId.profilePicture
      }

      return requestBody
    }
  }

  const sendUpdateRequest = () => {
    const requestBody = buildRequestBody()
    const userRole = userData.data.role
    const isStudent = userRole === 'STUDENT'
    const isProfessor = userRole === 'PROFESSOR'

    if (userData.data.hasProfile === false) {
      const createEndpoint = isStudent
        ? apiSpec.STUDENT_PROFILE_CONTROLLER + '/create'
        : apiSpec.PROD_HOST + '/professor-profile/create'

      apiClient
        .post(createEndpoint, requestBody)
        .then(async response => {
          toast.success('Profil creat cu succes!')
          dispatch(updateUserHasProfile(true))
          updateHasProfileInLocalStorage(true)
          logout()

          router.replace('/')
        })
        .catch(err => {
          toast.error('Eroare la actualizarea contului! Încercați mai târziu. Err:' + err)
          console.log(err)
        })
    } else {
      const updateEndpoint = isStudent
        ? apiSpec.STUDENT_PROFILE_CONTROLLER + '/update'
        : apiSpec.PROD_HOST + '/professor-profile/update'

      apiClient
        .put(updateEndpoint, requestBody)
        .then(async response => {
          toast.success('Cont actualizat cu succes!')
        })
        .catch(err => {
          toast.error('Eroare la actualizarea contului! Încercați mai târziu. Err:' + err)
          console.log(err)
        })
    }
  }

  function updateHasProfileInLocalStorage(hasProfile) {
    // Retrieve userData from localStorage
    const userData = JSON.parse(localStorage.getItem('userData'))

    // Check if userData exists
    if (userData) {
      // Update the hasProfile property based on the provided boolean value
      userData.hasProfile = hasProfile

      // Save the updated userData back to localStorage
      localStorage.setItem('userData', JSON.stringify(userData))
    } else {
      console.log('userData not found in localStorage')
    }
  }

  const handleCopyInvitationCode = () => {
    if (fullProfile.invitationCode) {
      navigator.clipboard.writeText(fullProfile.invitationCode)
      toast.success('Cod de invitație copiat!')
    }
  }

  return (
    <Grid container spacing={6}>
      {/* Account Details Card  - !!TODO BUG - cand dai hard reload ramane cu referinta la poza veche*/}
      {/* !!TODO BUG 2 - cand are poza de profil OIDC si uploadeaza una in profile picture trebuie sa dea manual save. Altfel nu se asociaza */}

      <ModalFileUploaderImageCrop
        openFileUpload={openFileUpload}
        setOpenFileUpload={setOpenFileUpload}
        profilePictureId={profilePictureId}
        setProfilePictureId={setProfilePictureId}
        setImgSrc={setImgSrc}
      />
      {userData.data.role === 'PROFESSOR' && fullProfile.invitationCode && (
        <Grid item xs={12}>
          <Alert severity='info'>
            <AlertTitle sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
              <Icon icon='tabler:qrcode' fontSize={24} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
              Codul tău de invitație pentru studenți
            </AlertTitle>
            <Typography variant='body2' sx={{ mb: 3 }}>
              Distribuie acest cod studenților pentru ca aceștia să se poată conecta la tine ca profesor.
            </Typography>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 3,
                backgroundColor: 'background.paper',
                borderRadius: 1,
                border: theme => `2px solid ${theme.palette.primary.main}`
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant='h4'
                  sx={{
                    fontFamily: 'monospace',
                    letterSpacing: '0.1em',
                    color: 'primary.main',
                    fontWeight: 700,
                    textAlign: 'center'
                  }}
                >
                  {fullProfile.invitationCode}
                </Typography>
              </Box>
              <Tooltip title='Copiază codul'>
                <IconButton
                  color='primary'
                  onClick={handleCopyInvitationCode}
                  sx={{
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'primary.dark'
                    }
                  }}
                >
                  <Icon icon='tabler:copy' fontSize={20} />
                </IconButton>
              </Tooltip>
            </Box>
          </Alert>
        </Grid>
      )}
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Profile Details' />
          <CardContent sx={{ pt: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box padding={5}>
                <Avatar alt={fullProfile.firstName} src={imgSrc} variant='rounded' sx={{ width: 100, height: 100 }} />
              </Box>
              <div>
                <ButtonStyled
                  component='label'
                  variant='contained'
                  htmlFor='account-settings-upload-image'
                  onClick={() => {
                    setOpenFileUpload(true)
                    console.log(openFileUpload)
                  }}
                >
                  Actulizează poza de profil
                </ButtonStyled>

                <Typography sx={{ mt: 4, color: 'text.disabled' }}>
                  Permise sunt doar PNG sau JPEG. Dimensiune maximă 20MB.
                </Typography>
              </div>
            </Box>
          </CardContent>
          <Divider />
          <CardContent>
            <Grid container spacing={5}>
              <Grid item xs={12}>
                <AccountDetailsCard
                  fullProfile={fullProfile}
                  setFullProfile={setFullProfile}
                  userRole={userData.data.role}
                  ref={accountDetailsRef}
                />
              </Grid>
            </Grid>
          </CardContent>
          <Divider />
          <CardContent>
            <Grid container spacing={5}>
              <Grid item xs={12}>
                {userData.data.role === 'STUDENT' ? (
                  <PersonalInfoCard fullProfile={fullProfile} initPrerequire={initPrerequire} ref={personalInfoRef} />
                ) : (
                  <ProfessorInfoCard fullProfile={fullProfile} initPrerequire={initPrerequire} ref={personalInfoRef} />
                )}
              </Grid>
            </Grid>
          </CardContent>
          <Divider />
          <CardContent>
            <Grid container spacing={5}>
              <Grid item xs={12}>
                <AddressInfoCard
                  address={fullProfile.address}
                  counties={initPrerequire.counties}
                  ref={addressInfoRef}
                />
              </Grid>
            </Grid>
            <Grid item xs={12} sx={{ pt: theme => `${theme.spacing(6.5)} !important` }}>
              <Button
                variant='contained'
                sx={{ mr: 4 }}
                onClick={() => {
                  sendUpdateRequest()
                }}
              >
                Salvează
              </Button>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Delete Account Card */}
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Dezactivare cont' />
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Box sx={{ mb: 4 }}>
                <FormControl>
                  <Controller
                    name='checkbox'
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <FormControlLabel
                        label='Confirm dezactivarea contului meu'
                        sx={{ '& .MuiTypography-root': { color: errors.checkbox ? 'error.main' : 'text.secondary' } }}
                        control={
                          <Checkbox
                            {...field}
                            size='small'
                            name='validation-basic-checkbox'
                            sx={errors.checkbox ? { color: 'error.main' } : null}
                          />
                        }
                      />
                    )}
                  />
                  {errors.checkbox && (
                    <FormHelperText
                      id='validation-basic-checkbox'
                      sx={{ mx: 0, color: 'error.main', fontSize: theme => theme.typography.body2.fontSize }}
                    >
                      Sunteți sigur ca doriți dezactivarea contului?
                    </FormHelperText>
                  )}
                </FormControl>
              </Box>
              <Button variant='contained' color='error' type='submit' disabled={errors.checkbox !== undefined}>
                Dezactivează contul
              </Button>
            </form>
          </CardContent>
        </Card>
      </Grid>

      {/* Deactivate Account Dialogs */}
      <Dialog fullWidth maxWidth='xs' open={open} onClose={handleClose}>
        <DialogContent
          sx={{
            pb: theme => `${theme.spacing(6)} !important`,
            px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
            pt: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
          }}
        >
          <Box
            sx={{
              display: 'flex',
              textAlign: 'center',
              alignItems: 'center',
              flexDirection: 'column',
              justifyContent: 'center',
              '& svg': { mb: 6, color: 'warning.main' }
            }}
          >
            <Icon icon='tabler:alert-circle' fontSize='5.5rem' />
            <Typography>Sunteți sigur ca doriți dezactivarea contului?</Typography>
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            justifyContent: 'center',
            px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
            pb: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
          }}
        >
          <Button variant='contained' sx={{ mr: 2 }} onClick={() => handleConfirmation('yes')}>
            Da
          </Button>
          <Button variant='tonal' color='secondary' onClick={() => handleConfirmation('cancel')}>
            Anulează
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog fullWidth maxWidth='xs' open={secondDialogOpen} onClose={handleSecondDialogClose}>
        <DialogContent
          sx={{
            pb: theme => `${theme.spacing(6)} !important`,
            px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
            pt: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexDirection: 'column',
              '& svg': {
                mb: 8,
                color: userInput === 'yes' ? 'success.main' : 'error.main'
              }
            }}
          >
            <Icon fontSize='5.5rem' icon={userInput === 'yes' ? 'tabler:circle-check' : 'tabler:circle-x'} />
            <Typography variant='h4' sx={{ mb: 5 }}>
              {userInput === 'yes' ? 'Dezactivat!' : 'Anulat'}
            </Typography>
            <Typography>
              {userInput === 'yes' ? 'Contul a fost dezactivat cu succes.' : 'Dezactivarea contului a fost anulată!'}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            justifyContent: 'center',
            px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
            pb: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
          }}
        >
          <Button variant='contained' color='success' onClick={handleSecondDialogClose}>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}

export default TabAccount
