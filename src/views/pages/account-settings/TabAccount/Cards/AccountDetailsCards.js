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
import * as apiSpec from '../../../../../apiSpec'
import authConfig from '../../../../../../src/configs/auth'
import countryCodes from '../../../auth/register-multi-steps/countryCodes.json' // Adjust the path accordingly
import { addUser, updateTokens } from 'src/store/apps/user'
import { useDispatch } from 'react-redux'

const AccountDetailsCard = ({ fullProfile, setFullProfile }) => {
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  const phoneNumber = fullProfile.user.phone.substring(fullProfile.user.phone.length - 9)
  const prefix = fullProfile.user.phone.substring(0, fullProfile.user.phone.length - 9)

  const [loadedUser, setLoadedUser] = useState({
    ...fullProfile.user,
    phone: phoneNumber,
    prefix: prefix
  })

  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues
  } = useForm({ defaultValues: loadedUser })

  const onSubmit = async data => {
    setLoading(true)
    data.phone = data.prefix + data.phone
    axios
      .post(authConfig.registerEndpoint, data)
      .then(async response => {
        dispatch(addUser(response.data.userData))
        dispatch(updateTokens({ accessToken: response.data.accessToken, refreshToken: response.data.refreshToken }))
      })
      .catch(err => {
        console.log(err)
      })
    setLoading(false)
    toast.success('Cont creat cu succes!')
    handleNext(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={5}>
        <Grid item xs={12} sm={6}>
          <Controller
            name='lastName'
            control={control}
            rules={{ required: true, minLength: 3, maxLength: 100 }}
            render={({ field: { value, onChange } }) => (
              <CustomTextField
                fullWidth
                value={value}
                label='Nume'
                onChange={onChange}
                placeholder='Popescu'
                error={Boolean(errors.lastName)}
                aria-describedby='validation-async-last-name'
                {...(errors.lastName && { helperText: 'Acest câmp este obligatoriu.' })}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Controller
            name='firstName'
            control={control}
            rules={{ required: true, minLength: 3, maxLength: 100 }}
            render={({ field: { value, onChange } }) => (
              <CustomTextField
                fullWidth
                value={value}
                label='Prenume'
                onChange={onChange}
                placeholder='Maria'
                error={Boolean(errors.firstName)}
                aria-describedby='validation-async-first-name'
                {...(errors.firstName && { helperText: 'Acest câmp este obligatoriu.' })}
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
              }
            }}
            render={({ field: { value } }) => (
              <CustomTextField
                fullWidth
                type='email'
                value={value}
                label='Email'
                disabled // Set the input field as read-only by adding the disabled attribute
                placeholder='Email'
                aria-describedby='validation-async-email'
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Grid container spacing={1}>
            <Grid item xs={3} sm={2} style={{ marginRight: '50px' }}>
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

            <Grid item xs={7} sm={4}>
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
          </Grid>
        </Grid>
      </Grid>
    </form>
  )
}

export default AccountDetailsCard
