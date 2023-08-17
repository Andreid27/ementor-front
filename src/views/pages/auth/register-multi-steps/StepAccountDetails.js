import React, { useState } from 'react'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import FormControl from '@mui/material/FormControl'
import InputAdornment from '@mui/material/InputAdornment'
import Icon from 'src/@core/components/icon'
import CustomTextField from 'src/@core/components/mui/text-field'
import { Card, CardContent, CardHeader, CircularProgress, MenuItem } from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import axios from 'axios'
import * as apiSpec from '../../../../apiSpec'
import Select from 'src/@core/theme/overrides/select'
import countryCodesJson from './countryCodes.json' // Adjust the path accordingly

const defaultValues = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  showPassword: false,
  showConfirmPassword: false
}

const StepAccountDetails = ({ handleNext }) => {
  const [loading, setLoading] = useState(false)

  const countryCodes = countryCodesJson.map(country => ({
    value: country.code,
    label: `${country.code} ${country.emoji} ${country.dial_code}`
  }))

  const [selectedCountryCode, setSelectedCountryCode] = useState('+40')

  const [values, setValues] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    showPassword: false,
    showConfirmPassword: false
  })

  const handleClickShowPassword = () => {
    setValues({ ...values, showPassword: !values.showPassword })
  }

  const handleClickShowConfirmPassword = () => {
    setValues({ ...values, showConfirmPassword: !values.showConfirmPassword })
  }

  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

  const validateEmail = async value => {
    if (!value) {
      return 'Acest camp este obligatoriu.'
    }

    try {
      const response = await axios.get(`${apiSpec.USER_SERVICE}/check-availability/${value}`)
      if (response.data === false || response.data === undefined) {
        return 'Acestă adresă de email a fost deja folosită.'
      }

      return true
    } catch (error) {
      console.error('Error checking email availability:', error)
    }
  }

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({ defaultValues })

  const onSubmit = async data => {
    setLoading(true)

    //TODO make phone number pattern and form validation and then,
    //TODO call create user API
    await sleep(2000)
    setLoading(false)
    toast.success('Form Submitted')
    handleNext(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={5}>
        <Grid item xs={12} sm={6}>
          <Controller
            name='firstName'
            control={control}
            rules={{ required: true, minLength: 3, maxLength: 100 }}
            render={({ field: { value, onChange } }) => (
              <CustomTextField
                fullWidth
                value={value}
                label='First Name'
                onChange={onChange}
                placeholder='First Name'
                error={Boolean(errors.firstName)}
                aria-describedby='validation-async-first-name'
                {...(errors.firstName && { helperText: 'Acest câmp este obligatoriu.' })}
              />
            )}
          />
        </Grid>
        {/* ... Other fields */}
        <Grid item xs={12} sm={6}>
          <Controller
            name='lastName'
            control={control}
            rules={{ required: true, minLength: 3, maxLength: 100 }}
            render={({ field: { value, onChange } }) => (
              <CustomTextField
                fullWidth
                value={value}
                label='Last Name'
                onChange={onChange}
                placeholder='Last Name'
                error={Boolean(errors.lastName)}
                aria-describedby='validation-async-last-name'
                {...(errors.lastName && { helperText: 'Acest câmp este obligatoriu.' })}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Controller
            name='email'
            control={control}
            rules={{
              pattern: {
                value: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                message: 'Adresa de email nu este validă. Introduceți o adresă de email validă.'
              },
              validate: validateEmail
            }}
            render={({ field: { value, onChange } }) => (
              <CustomTextField
                fullWidth
                type='email'
                value={value}
                label='Email'
                onChange={onChange}
                error={Boolean(errors.email)}
                placeholder='Email'
                aria-describedby='validation-async-email'
                {...(errors.email && { helperText: errors.email.message })}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name='phone'
            control={control}
            rules={{
              required: true,
              pattern: {
                value: /^[0-9]{9}$/, // You can adjust the regex pattern for your specific phone number format
                message: 'Invalid phone number'
              }
            }}
            render={({ field: { value, onChange } }) => (
              <CustomTextField
                fullWidth
                value={value}
                label='Phone'
                onChange={onChange}
                placeholder='740 123 123'
                InputProps={{
                  startAdornment: (
                    // TODO continue here debugging.
                    <InputAdornment position='start'>
                      <Select
                        value={selectedCountryCode}
                        onChange={event => setSelectedCountryCode(event.value)}
                        name='phone'
                      >
                        {countryCodes.map(country => (
                          <MenuItem key={country.value} value={country.value}>
                            {country.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </InputAdornment>
                  )
                }}
                error={Boolean(errors.phone)}
                aria-describedby='validation-async-phone'
                {...(errors.phone && { helperText: errors.phone.message })}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name='password'
            control={control}
            rules={{ required: true }}
            render={({ field: { value, onChange } }) => (
              <CustomTextField
                fullWidth
                value={value}
                label='Password'
                onChange={onChange}
                id='validation-async-password'
                error={Boolean(errors.password)}
                type={values.showPassword ? 'text' : 'password'}
                {...(errors.password && { helperText: 'This field is required' })}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton
                        edge='end'
                        onClick={handleClickShowPassword}
                        onMouseDown={e => e.preventDefault()}
                        aria-label='toggle password visibility'
                      >
                        <Icon fontSize='1.25rem' icon={values.showPassword ? 'tabler:eye' : 'tabler:eye-off'} />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Controller
            name='confirmPassword'
            control={control}
            rules={{ required: true }}
            render={({ field: { value, onChange } }) => (
              <CustomTextField
                fullWidth
                value={value}
                label='Confirm Password'
                onChange={onChange}
                id='validation-async-confirm-password'
                error={Boolean(errors.confirmPassword)}
                type={values.showConfirmPassword ? 'text' : 'password'}
                {...(errors.confirmPassword && { helperText: 'This field is required' })}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton
                        edge='end'
                        onClick={handleClickShowConfirmPassword}
                        onMouseDown={e => e.preventDefault()}
                        aria-label='toggle confirm password visibility'
                      >
                        <Icon fontSize='1.25rem' icon={values.showConfirmPassword ? 'tabler:eye' : 'tabler:eye-off'} />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sx={{ pt: theme => `${theme.spacing(6)} !important` }}>
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
            </Button>
          </Box>
        </Grid>
      </Grid>
    </form>
  )
}

export default StepAccountDetails
