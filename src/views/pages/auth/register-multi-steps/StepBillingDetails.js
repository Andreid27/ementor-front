// ** React Imports
import { useEffect, useState } from 'react'

// ** MUI Components
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import FormControl from '@mui/material/FormControl'
import InputAdornment from '@mui/material/InputAdornment'

// ** Third Party Imports
import Payment from 'payment'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components Imports
import CustomTextField from 'src/@core/components/mui/text-field'
import CustomRadioIcons from 'src/@core/components/custom-radio/icons'

// ** Util Import
import { formatCVC, formatExpirationDate, formatCreditCardNumber } from 'src/@core/utils/format'

// ** Styles Import
import 'react-credit-cards/es/styles-compiled.css'
import { CircularProgress, IconButton, MenuItem } from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { toast } from 'react-hot-toast'

const StepBillingDetails = ({ address, setAddress, counties, handlePrev, handleSubmitProfile, submitLoading }) => {
  const dispatch = useDispatch()

  const [values, setValues] = useState(address)

  useEffect(() => {
    console.log(address)
    setValues(address)
  }, [])

  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues
  } = useForm({ defaultValues: address })

  const onSubmit = async data => {
    setAddress(getValues())
    handleSubmitProfile()
  }

  const goPreviousStep = () => {
    const newValues = getValues()

    for (let key in newValues) {
      if (newValues[key] !== undefined) {
        values[key] = newValues[key]
      }
    }

    setAddress(values)
    handlePrev()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={5}>
        <Grid item xs={12} sm={6}>
          <Controller
            name='countyId'
            control={control}
            rules={{ required: true, minLength: 32, maxLength: 40 }}
            defaultValue={'choose'}
            render={({ field: { value, onChange } }) => (
              <CustomTextField
                select
                fullWidth
                onChange={onChange}
                value={value}
                name='countyId'
                label='Județ'
                error={Boolean(errors.countyId)}
                aria-describedby='validation-async-last-name'
                {...(errors.countyId && { helperText: 'Acest câmp este obligatoriu.' })}
              >
                <MenuItem key={'choose'} value={'choose'}>
                  {'Alege'}
                </MenuItem>
                {counties &&
                  counties.map(county => (
                    <MenuItem key={county.id} value={county.id}>
                      {county.name}
                    </MenuItem>
                  ))}
              </CustomTextField>
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name='city'
            control={control}
            rules={{ required: true, minLength: 3, maxLength: 100 }}
            render={({ field: { value, onChange } }) => (
              <CustomTextField
                fullWidth
                value={value}
                label='Oraș'
                onChange={onChange}
                placeholder='București'
                error={Boolean(errors.city)}
                aria-describedby='validation-async-first-name'
                {...(errors.city && { helperText: 'Acest câmp este obligatoriu.' })}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name='street'
            control={control}
            rules={{ required: true, minLength: 3, maxLength: 200 }}
            render={({ field: { value, onChange } }) => (
              <CustomTextField
                fullWidth
                value={value}
                label='Stada'
                onChange={onChange}
                error={Boolean(errors.street)}
                placeholder='Bulevardul Unirii'
                aria-describedby='validation-async-email'
                {...(errors.street && { helperText: 'Acest câmp este obligatoriu.' })}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name='number'
            control={control}
            rules={{ required: true, maxLength: 10 }}
            render={({ field: { value, onChange } }) => (
              <CustomTextField
                fullWidth
                value={value}
                label='Număr'
                onChange={onChange}
                error={Boolean(errors.number)}
                placeholder='124'
                aria-describedby='validation-async-email'
                {...(errors.number && { helperText: 'Acest câmp este obligatoriu.' })}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name='block'
            control={control}
            rules={{ maxLength: 50 }}
            render={({ field: { value, onChange } }) => (
              <CustomTextField
                fullWidth
                value={value}
                label='Bloc'
                onChange={onChange}
                placeholder=''
                error={Boolean(errors.block)}
                aria-describedby='validation-async-phone'
                {...(errors.block && { helperText: 'Acest câmp este obligatoriu.' })}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={3}>
          <Controller
            name='staircase'
            control={control}
            rules={{ maxLength: 5 }}
            render={({ field: { value, onChange } }) => (
              <CustomTextField
                fullWidth
                value={value}
                label='Scară'
                onChange={onChange}
                error={Boolean(errors.staircase)}
                placeholder=''
                aria-describedby='validation-async-email'
                {...(errors.staircase && { helperText: 'Acest câmp este obligatoriu.' })}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={3}>
          <Controller
            name='apartment'
            control={control}
            render={({ field: { value, onChange } }) => (
              <CustomTextField
                fullWidth
                type='number'
                value={value}
                label='Apartment'
                onChange={onChange}
                placeholder=''
                error={Boolean(errors.apartment)}
                aria-describedby='validation-async-phone'
                {...(errors.apartment && { helperText: 'Acest câmp este obligatoriu.' })}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sx={{ pt: theme => `${theme.spacing(6)} !important` }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              color='secondary'
              variant='tonal'
              type='submit'
              onClick={goPreviousStep}
              sx={{ '& svg': { mr: 2 } }}
            >
              <Icon fontSize='1.125rem' icon='tabler:arrow-left' />
              Previous
            </Button>
            <Button variant='contained' onClick={onSubmit}>
              {submitLoading ? (
                <CircularProgress
                  sx={{
                    color: 'common.white',
                    width: '20px !important',
                    height: '20px !important',
                    mr: theme => theme.spacing(2)
                  }}
                />
              ) : null}
              Finalizare cont
            </Button>
          </Box>
        </Grid>
      </Grid>
    </form>
  )
}

export default StepBillingDetails
