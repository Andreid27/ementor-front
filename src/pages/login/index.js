// ** React Imports
import { useEffect, useState } from 'react'

// ** Next Imports
import Link from 'next/link'

// ** MUI Components
import Box from '@mui/material/Box'
import useMediaQuery from '@mui/material/useMediaQuery'
import { styled, useTheme } from '@mui/material/styles'
import MuiFormControlLabel from '@mui/material/FormControlLabel'

// ** Third Party Imports
import * as yup from 'yup'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'

// ** Hooks
import { useAuth } from 'src/hooks/useAuth'
import useBgColor from 'src/@core/hooks/useBgColor'
import { useSettings } from 'src/@core/hooks/useSettings'

// ** Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout'

// ** Demo Imports
import FallbackSpinner from 'src/@core/components/spinner'
import authConfig from 'src/configs/auth'


const LoginPage = () => {

  console.log(`${authConfig.authCode}${window.location.protocol + "//" + window.location.host}/callback`)
  window.location.href = `${authConfig.authCode}${window.location.protocol + "//" + window.location.host}/callback/`
  useEffect(() => {
    window.location.href = `${authConfig.authCode}${window.location.protocol + "//" + window.location.host}/callback/`
  })

  return (
    <FallbackSpinner />
  )
}
LoginPage.getLayout = page => <BlankLayout>{page}</BlankLayout>
LoginPage.guestGuard = true

export default LoginPage


export async function getServerSideProps() {
  return { props: {} }
}
