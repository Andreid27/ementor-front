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
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import FormControl from '@mui/material/FormControl'
import CardContent from '@mui/material/CardContent'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import FormHelperText from '@mui/material/FormHelperText'
import InputAdornment from '@mui/material/InputAdornment'
import Button from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'
import ModalFileUploaderImageCrop from '../../../forms/form-elements/file-uploader/ModalFileUploaderImageCrop'
import * as apiSpec from '../../../../apiSpec'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Third Party Imports
import { useForm, Controller } from 'react-hook-form'

// ** Icon Imports
import Icon from 'src/@core/components/icon'
import { useDispatch, useSelector } from 'react-redux'
import AccountDetailsCard from './Cards/AccountDetailsCards'
import { addThumbnail, addUser, selectThumbnail } from 'src/store/apps/user'
import { handleProfileImageUrl } from 'src/@core/layouts/components/shared-components/UserDropdown'
import apiClient from 'src/@core/axios/axiosEmentor'
import { CircularProgress } from '@mui/material'
import PersonalInfoCard from './Cards/PersonalInfoCard'
import axios from 'axios'
import AddressInfoCard from './Cards/AddressInfoCard'
import { toast } from 'react-hot-toast'
import { useAuth } from 'src/hooks/useAuth'

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
    id: '',
    userId: '',
    user: {
      userId: null,
      email: '',
      firstName: '',
      lastName: '',
      phone: '',
      role: '',
      active: false,
      disabled: false,
      hasProfile: false
    },
    pictureId: '',
    universityId: '',
    specialityId: '',
    desiredExamDate: '2025-11-04T20:25:51.566Z',
    school: '',
    schoolDomain: '',
    schoolSpeciality: '',
    schoolGrade: 10,
    about: '',
    address: {
      id: '',
      countyId: '',
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
      const prerequireResponse = await axios.get(apiSpec.PROD_HOST + apiSpec.PROFILE_SERVICE + '/profile-prerequire')
      setInitPrerequire(prerequireResponse.data)

      const fullProfileResponse = await apiClient.get(apiSpec.PROFILE_SERVICE + '/get-full')
      setFullProfile(fullProfileResponse.data)

      // Set loading to false when the requests are completed successfully
      setLoading(false)
    } catch (error) {
      // Handle errors here
      console.error('Error:', error)

      // Set loading to false when there's an error
      setLoading(false)
    }
  }

  useEffect(() => {
    // Fetch data when the component mounts
    fetchData()
  }, [])

  // Render loading indicator while data is being fetched

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
      apiClient
        .delete(apiSpec.USER_SERVICE + '/delete')
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
    let accountDetailsData = accountDetailsRef.current.getValues()
    let personalInfoData = personalInfoRef.current.getValues()
    let addressInfoData = addressInfoRef.current.getValues()
    accountDetailsData.phone = accountDetailsData.prefix + accountDetailsData.phone

    personalInfoData.user = accountDetailsData
    personalInfoData.address = addressInfoData

    return personalInfoData
  }

  const sendUpdateRequest = () => {
    const requestBody = buildRequestBody()
    apiClient
      .put(apiSpec.PROFILE_SERVICE + '/update', requestBody)
      .then(async response => {
        toast.success('Cont actualizat cu succes!')
      })
      .catch(err => {
        toast.error('Eroare la actualizarea contului! Încercați mai târziu. Err:' + err)
        console.log(err)
      })
  }

  return (
    <Grid container spacing={6}>
      {/* Account Details Card  - TODO BUG - cand dai hard reload ramane cu referinta la poza veche*/}

      <ModalFileUploaderImageCrop
        openFileUpload={openFileUpload}
        setOpenFileUpload={setOpenFileUpload}
        profilePictureId={profilePictureId}
        setProfilePictureId={setProfilePictureId}
        setImgSrc={setImgSrc}
      />
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Profile Details' />
          <CardContent sx={{ pt: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ImgStyled src={imgSrc} alt='Profile Pic' />
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
                <AccountDetailsCard fullProfile={fullProfile} setFullProfile={setFullProfile} ref={accountDetailsRef} />
              </Grid>
            </Grid>
          </CardContent>
          <Divider />
          <CardContent>
            <Grid container spacing={5}>
              <Grid item xs={12}>
                <PersonalInfoCard fullProfile={fullProfile} initPrerequire={initPrerequire} ref={personalInfoRef} />
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
                Save Changes
              </Button>
              <Button type='reset' variant='tonal' color='secondary' onClick={() => setFormData(userData)}>
                Reset
              </Button>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Delete Account Card */}
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Delete Account' />
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
                        label='I confirm my account deactivation'
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
                      Please confirm you want to delete account
                    </FormHelperText>
                  )}
                </FormControl>
              </Box>
              <Button variant='contained' color='error' type='submit' disabled={errors.checkbox !== undefined}>
                Deactivate Account
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
            <Typography>Are you sure you would like to cancel your subscription?</Typography>
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
            Yes
          </Button>
          <Button variant='tonal' color='secondary' onClick={() => handleConfirmation('cancel')}>
            Cancel
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
              {userInput === 'yes' ? 'Deleted!' : 'Cancelled'}
            </Typography>
            <Typography>
              {userInput === 'yes' ? 'Your subscription cancelled successfully.' : 'Unsubscription Cancelled!!'}
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
