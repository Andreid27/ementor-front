// ** React Imports
import { useState } from 'react'

// ** MUI Imports
import Avatar from '@mui/material/Avatar'
import Stepper from '@mui/material/Stepper'
import StepLabel from '@mui/material/StepLabel'
import Typography from '@mui/material/Typography'
import { styled } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import MuiStep from '@mui/material/Step'
import * as apiSpec from '../../../../apiSpec'
import authConfig from 'src/configs/auth'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components Imports
import CustomAvatar from 'src/@core/components/mui/avatar'

// ** Step Components
import StepInvitationCode from 'src/views/pages/auth/register-multi-steps/StepInvitationCode'
import StepPersonalInfo from 'src/views/pages/auth/register-multi-steps/StepPersonalInfo'
import StepBillingDetails from 'src/views/pages/auth/register-multi-steps/StepBillingDetails'

// ** Hook Import
import { useSettings } from 'src/@core/hooks/useSettings'

// ** Util Import
import { hexToRGBA } from 'src/@core/utils/hex-to-rgba'

// ** Styled Components
import { toast } from 'react-hot-toast'
import dayjs from 'dayjs'
import { useSelector } from 'react-redux'
import { selectTokens, selectUser } from 'src/store/apps/user'
import axios from 'axios'
import { useRouter } from 'next/router'
import { useAuth } from 'src/hooks/useAuth'
import apiClient from 'src/@core/axios/axiosEmentor'
import { profileServiceClient } from 'src/generated/profile-service-client'

// Simple UUID v4 generator
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8

    return v.toString(16)
  })
}

const steps = [
  {
    title: 'Invitație',
    icon: 'tabler:qrcode',
    subtitle: 'Cod profesor (opțional)'
  },
  {
    title: 'Personal',
    icon: 'tabler:users',
    subtitle: 'Detalii personale'
  },
  {
    title: 'Adresa',
    icon: 'tabler:smart-home',
    subtitle: 'Adresa de domiciliu'
  }
]

const Step = styled(MuiStep)(({ theme }) => ({
  padding: 0,
  '& .MuiStepLabel-iconContainer': {
    display: 'none'
  },
  '& .step-subtitle': {
    color: `${theme.palette.text.disabled} !important`
  },
  '& + svg': {
    color: theme.palette.text.disabled
  },
  '&.Mui-completed .step-title': {
    color: theme.palette.text.disabled
  },
  '&.Mui-completed + svg': {
    color: theme.palette.primary.main
  },
  '& .MuiStepLabel-label': {
    cursor: 'pointer'
  },
  [theme.breakpoints.down('md')]: {
    '&:not(:last-child)': {
      marginBottom: theme.spacing(6)
    },
    '& + svg': {
      display: 'none'
    }
  },
  [theme.breakpoints.up('md')]: {
    marginLeft: theme.spacing(4),
    marginRight: theme.spacing(4),
    '&:first-of-type': {
      marginLeft: 0
    },
    '&:last-of-type': {
      marginRight: 0
    }
  }
}))

const StudentWizard = ({ onBack }) => {
  // ** States
  const [activeStep, setActiveStep] = useState(0)
  const [initPrerequire, setInitPrerequire] = useState({ universities: [], counties: [] })
  const [submitLoading, setSubmitLoading] = useState(false)
  const [invitationData, setInvitationData] = useState({ code: null, professorPreview: null })

  let tokens = useSelector(selectTokens)
  const auth = useAuth()
  let user = useSelector(selectUser)

  const router = useRouter()

  const [address, setAddress] = useState({
    countyId: 'choose',
    city: '',
    street: '',
    number: '',
    block: '',
    staircase: '',
    apartment: ''
  })

  const [profile, setProfile] = useState({
    school: '',
    schoolGrade: '',
    university: 'choose',
    speciality: 'choose',
    date: dayjs(),
    profilePicture: null,
    schoolDomain: 'ch',
    schoolSpeciality: 'ch',
    prefix: '+40',
    phone: ''
  })

  // ** Hooks & Var
  const { settings } = useSettings()
  const smallScreen = useMediaQuery(theme => theme.breakpoints.down('md'))
  const { direction } = settings
  var querystring = require('querystring')

  // Handle Stepper
  const handleNext = props => {
    if (activeStep === 1) {
      setProfile(props)
    }
    setActiveStep(activeStep + 1)
  }

  const handlePrev = () => {
    if (activeStep === 0) {
      // Return to role selection
      onBack?.()
    } else if (activeStep > 0) {
      setActiveStep(activeStep - 1)
    }
  }

  const handleSubmitProfile = async data => {
    setSubmitLoading(true)

    let requestBody = {
      pictureId: profile.profilePicture,
      pictureUrl: user.profilePicture,
      universityId: profile.university,
      specialityId: profile.speciality,
      desiredExamDate: profile.date.toISOString(),
      school: profile.school,
      schoolGrade: profile.schoolGrade,
      about: profile.about,
      schoolDomain: profile.schoolDomain,
      schoolSpeciality: profile.schoolSpeciality,
      address: data,
      phone: profile.prefix + profile.phone
    }

    try {
      // Step 1: Create student profile
      console.log('Creating student profile...')

      // await apiClient.post(apiSpec.PROD_HOST + apiSpec.STUDENT_PROFILE_CONTROLLER + '/create', requestBody)
      await apiClient.post(apiSpec.LOCAL_HOST + '/student-profile/create', requestBody)
      console.log('Student profile created successfully')

      // Step 2: If invitation code exists, join professor
      if (invitationData.code) {
        console.log('Attempting to join professor with code:', invitationData.code)
        const idempotencyKey = generateUUID()
        console.log('Generated idempotency key:', idempotencyKey)
        try {
          await profileServiceClient.studentProfessorRelationship.joinByCode({
            idempotencyKey: idempotencyKey,
            joinByCodeRequest: {
              invitationCode: invitationData.code
            }
          })
          console.log('Successfully joined professor')
          toast.success('Profil creat și conectat la profesor cu succes!')
        } catch (joinError) {
          console.error('Join professor error:', joinError)
          console.error('Join error details:', {
            message: joinError.message,
            response: joinError.response,
            status: joinError.response?.status,
            headers: joinError.response?.headers
          })
          if (joinError.response?.status === 404) {
            toast.warning('Profil creat, dar codul de invitație nu mai este valid.')
          } else if (joinError.response?.status === 409) {
            toast.warning('Profil creat. Sunteți deja conectat la acest profesor.')
          } else if (joinError.message?.includes('CORS') || joinError.message?.includes('Network Error')) {
            toast.error('Profil creat, dar există o problemă de configurare pe server. Vă rugăm contactați administratorul.')
          } else {
            toast.warning('Profil creat, dar nu am putut să vă conectăm la profesor.')
          }
        }
      } else {
        console.log('No invitation code provided')
        toast.success('Profil creat cu succes!')
      }

      // Refresh token and redirect
      const accessTokenParams = {
        grant_type: 'refresh_token',
        client_id: authConfig.clientId,
        refresh_token: tokens.refreshToken
      }

      try {
        const response = await axios.post(authConfig.loginEndpoint, querystring.stringify(accessTokenParams), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        })

        auth.login(response.data)
        const returnUrl = router.query.returnUrl
        const redirectURL = returnUrl && returnUrl !== '/' ? returnUrl : '/'
        router.replace(redirectURL)
      } catch (tokenError) {
        console.error('Token refresh error:', tokenError)
        toast.error('Profil creat, dar a apărut o eroare la autentificare. Vă rugăm să vă reconectați.')
        // Don't logout - let the user stay on the page
      }
    } catch (error) {
      setSubmitLoading(false)
      console.error('Profile creation error:', error)
      if (error.response?.status === 400) {
        toast.error('Date invalide. Verificați formularul.')
      } else if (error.response?.status === 409) {
        toast.error('Profilul există deja.')
      } else {
        toast.error('Eroare la crearea profilului')
      }
    }
  }

  const getStepContent = step => {
    switch (step) {
      case 0:
        return (
          <StepInvitationCode
            handleNext={handleNext}
            invitationData={invitationData}
            setInvitationData={setInvitationData}
          />
        )
      case 1:
        return (
          <StepPersonalInfo
            handleNext={handleNext}
            handlePrev={handlePrev}
            initPrerequire={initPrerequire}
            setInitPrerequire={setInitPrerequire}
            profile={profile}
            setProfile={setProfile}
          />
        )
      case 2:
        return (
          <StepBillingDetails
            address={address}
            setAddress={setAddress}
            handlePrev={handlePrev}
            counties={initPrerequire.counties}
            handleSubmitProfile={handleSubmitProfile}
            submitLoading={submitLoading}
          />
        )
      default:
        return null
    }
  }

  const renderContent = () => {
    return getStepContent(activeStep)
  }

  return (
    <>
      <Stepper
        activeStep={activeStep}
        sx={{ mb: 11.5, justifyContent: 'space-between' }}
        connector={
          !smallScreen ? <Icon icon={direction === 'ltr' ? 'tabler:chevron-right' : 'tabler:chevron-left'} /> : null
        }
      >
        {steps.map((step, index) => {
          const RenderAvatar = activeStep >= index ? CustomAvatar : Avatar

          return (
            <Step key={index}>
              <StepLabel>
                <div className='step-label'>
                  <RenderAvatar
                    variant='rounded'
                    {...(activeStep >= index && { skin: 'light' })}
                    {...(activeStep === index && { skin: 'filled' })}
                    {...(activeStep >= index && { color: 'primary' })}
                    sx={{
                      mr: 4,
                      ...(activeStep === index && { boxShadow: theme => theme.shadows[3] }),
                      ...(activeStep > index && { color: theme => hexToRGBA(theme.palette.primary.main, 0.4) })
                    }}
                  >
                    <Icon fontSize='1.5rem' icon={step.icon} />
                  </RenderAvatar>
                  <div>
                    <Typography variant='h6' className='step-title'>
                      {step.title}
                    </Typography>
                    <Typography className='step-subtitle'>{step.subtitle}</Typography>
                  </div>
                </div>
              </StepLabel>
            </Step>
          )
        })}
      </Stepper>
      {renderContent()}
    </>
  )
}

export default StudentWizard
