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
import StepProfessorInfo from 'src/views/pages/auth/register-multi-steps/StepProfessorInfo'
import StepProfessorBankInfo from 'src/views/pages/auth/register-multi-steps/StepProfessorBankInfo'
import StepProfessorAddress from 'src/views/pages/auth/register-multi-steps/StepProfessorAddress'

// ** Hook Import
import { useSettings } from 'src/@core/hooks/useSettings'

// ** Util Import
import { hexToRGBA } from 'src/@core/utils/hex-to-rgba'

// ** Styled Components
import { toast } from 'react-hot-toast'
import { useSelector } from 'react-redux'
import { selectTokens, selectUser } from 'src/store/apps/user'
import axios from 'axios'
import { useRouter } from 'next/router'
import { useAuth } from 'src/hooks/useAuth'
import apiClient from 'src/@core/axios/axiosEmentor'

const steps = [
  {
    title: 'Profil',
    icon: 'tabler:user',
    subtitle: 'Informații academice'
  },
  {
    title: 'Bancar',
    icon: 'tabler:credit-card',
    subtitle: 'Date bancare (opțional)'
  },
  {
    title: 'Adresa',
    icon: 'tabler:smart-home',
    subtitle: 'Adresa (opțional)'
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

const ProfessorWizard = ({ onBack }) => {
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

  const [bankInfo, setBankInfo] = useState({
    iban: '',
    bankName: '',
    accountHolderName: '',
    swiftCode: ''
  })

  const [profile, setProfile] = useState({
    university: 'choose',
    speciality: 'choose',
    profilePicture: null,
    about: '',
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
    if (activeStep === 0) {
      setProfile(props)
    } else if (activeStep === 1) {
      setBankInfo(props)
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

  const handleSubmitProfile = async addressData => {
    setSubmitLoading(true)

    // Prepare bank account data if provided
    let bankAccounts = null
    if (bankInfo && bankInfo.iban && bankInfo.iban.trim()) {
      bankAccounts = [
        {
          iban: bankInfo.iban,
          bankName: bankInfo.bankName || null,
          accountHolderName: bankInfo.accountHolderName || null,
          swiftCode: bankInfo.swiftCode || null
        }
      ]
    }

    const requestBody = {
      pictureId: profile.profilePicture,
      universityId: profile.university,
      specialityId: profile.speciality,
      about: profile.about || null,
      phone: profile.phone ? profile.prefix + profile.phone : null,
      address: addressData,
      bankAccounts: bankAccounts
    }

    try {
      await apiClient.post(apiSpec.PROD_HOST + '/professor-profile/create', requestBody)

      toast.success('Profil de profesor creat cu succes!')

      // Refresh token and redirect
      const accessTokenParams = {
        grant_type: 'refresh_token',
        client_id: authConfig.clientId,
        refresh_token: tokens.refreshToken
      }

      axios
        .post(authConfig.loginEndpoint, querystring.stringify(accessTokenParams), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        })
        .then(response => {
          auth.login(response.data)
          const returnUrl = router.query.returnUrl
          const redirectURL = returnUrl && returnUrl !== '/' ? returnUrl : '/'
          router.replace(redirectURL)
        })
        .catch(error => {
          auth.logout()
        })
    } catch (error) {
      setSubmitLoading(false)
      if (error.response?.status === 400) {
        toast.error('Date invalide. Verificați formularul.')
      } else {
        toast.error('Eroare la crearea profilului de profesor')
      }
    }
  }

  const getStepContent = step => {
    switch (step) {
      case 0:
        return (
          <StepProfessorInfo
            handleNext={handleNext}
            handlePrev={handlePrev}
            initPrerequire={initPrerequire}
            setInitPrerequire={setInitPrerequire}
            profile={profile}
            setProfile={setProfile}
          />
        )
      case 1:
        return (
          <StepProfessorBankInfo
            bankInfo={bankInfo}
            setBankInfo={setBankInfo}
            handlePrev={handlePrev}
            handleNext={handleNext}
          />
        )
      case 2:
        return (
          <StepProfessorAddress
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

export default ProfessorWizard
