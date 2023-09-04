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
import jwt_decode from 'jwt-decode'
import authConfig from 'src/configs/auth'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components Imports
import CustomAvatar from 'src/@core/components/mui/avatar'

// ** Step Components
import StepPersonalInfo from 'src/views/pages/auth/register-multi-steps/StepPersonalInfo'
import StepAccountDetails from 'src/views/pages/auth/register-multi-steps/StepAccountDetails'
import StepBillingDetails from 'src/views/pages/auth/register-multi-steps/StepBillingDetails'

// ** Hook Import
import { useSettings } from 'src/@core/hooks/useSettings'

// ** Util Import
import { hexToRGBA } from 'src/@core/utils/hex-to-rgba'

// ** Styled Components
import StepperWrapper from 'src/@core/styles/mui/stepper'
import { toast } from 'react-hot-toast'
import dayjs from 'dayjs'
import { useSelector } from 'react-redux'
import { selectTokens, selectUser } from 'src/store/apps/user'
import axios from 'axios'
import { useRouter } from 'next/router'
import { useAuth } from 'src/hooks/useAuth'

const steps = [
  {
    title: 'Cont',
    icon: 'tabler:at',
    subtitle: 'Detalii cont'
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

const RegisterMultiSteps = () => {
  // ** States
  const [activeStep, setActiveStep] = useState(0)
  const [initPrerequire, setInitPrerequire] = useState({ universities: [], counties: [] })
  const [submitLoading, setSubmitLoading] = useState(false)
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
    profilePicture: '',
    schoolDomain: 'ch',
    schoolSpeciality: 'ch'
  })

  // ** Hooks & Var
  const { settings } = useSettings()
  const smallScreen = useMediaQuery(theme => theme.breakpoints.down('md'))
  const { direction } = settings

  // Handle Stepper
  const handleNext = props => {
    if (activeStep === 1) {
      setProfile(props)
    }
    setActiveStep(activeStep + 1)
  }

  const handlePrev = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1)
    }
  }

  const handleSubmitProfile = async data => {
    setSubmitLoading(true)

    let requestBody = {
      pictureId: profile.profilePicture,
      universityId: profile.university,
      specialityId: profile.speciality,
      desiredExamDate: profile.date.toISOString(),
      school: profile.school,
      schoolGrade: profile.schoolGrade,
      about: profile.about,
      schoolDomain: profile.schoolDomain,
      schoolSpeciality: profile.schoolSpeciality,
      address: data
    }

    const response = await axios.post(apiSpec.PROFILE_SERVICE + '/create', requestBody, {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`
      }
    })

    setSubmitLoading(false)
    toast.success('Profil creat cu succes')

    window.localStorage.setItem(authConfig.storageTokenKeyName, tokens.accessToken)
    window.localStorage.setItem('userData', JSON.stringify(user))

    auth.setUser({ ...user })

    const returnUrl = router.query.returnUrl
    const redirectURL = returnUrl && returnUrl !== '/' ? returnUrl : '/'
    router.replace(redirectURL)
  }

  const getStepContent = step => {
    switch (step) {
      case 0:
        return <StepAccountDetails handleNext={handleNext} />
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
      <StepperWrapper sx={{ mb: 11.5 }}>
        <Stepper
          activeStep={activeStep}
          sx={{ justifyContent: 'space-between' }}
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
      </StepperWrapper>
      {renderContent()}
    </>
  )
}

export default RegisterMultiSteps
