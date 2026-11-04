// ** React Imports
import { useEffect, useState } from 'react'

// ** MUI Components
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components Imports
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Styles Import
import 'react-credit-cards/es/styles-compiled.css'
import { CircularProgress, MenuItem } from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { useAuth } from 'src/hooks/useAuth'

const StepProfessorAddress = ({ address, setAddress, counties, handlePrev, handleSubmitProfile, submitLoading }) => {
  const auth = useAuth()

  const [values, setValues] = useState(address)

  useEffect(() => {
    setValues(address)
  }, [])

  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues,
    trigger
  } = useForm({ defaultValues: address })

  // The backend stores every professor with an address (address_id is NOT NULL), so the step is required.
  // The button calls this directly, so the rules are checked here.
  const onSubmit = async () => {
    if (!(await trigger())) return

    let newValues = getValues()
    setAddress(newValues)
    handleSubmitProfile(newValues)
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
      <Box sx={{ mb: 6 }}>
        <Typography variant='h3' sx={{ mb: 1.5 }}>
          Adresa
        </Typography>
        <Typography sx={{ color: 'text.secondary' }}>Introduceți adresa de domiciliu.</Typography>
      </Box>

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
                label='Strada'
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
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={3}>
          <Controller
            name='staircase'
            control={control}
            rules={{ maxLength: { value: 5, message: 'Scara poate avea cel mult 5 caractere.' } }}
            render={({ field: { value, onChange } }) => (
              <CustomTextField
                fullWidth
                value={value}
                label='Scară'
                onChange={onChange}
                error={Boolean(errors.staircase)}
                placeholder=''
                aria-describedby='validation-async-email'
                {...(errors.staircase && { helperText: errors.staircase.message })}
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
                label='Apartament'
                onChange={onChange}
                placeholder=''
                error={Boolean(errors.apartment)}
                aria-describedby='validation-async-phone'
              />
            )}
          />
        </Grid>

        <Grid item xs={6}>
          <Button variant='text' sx={{ marginBottom: '30px' }} onClick={() => { auth.logout() }}>
            Sign Out
          </Button>
        </Grid>

        <Grid item xs={6}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
            <Button
              color='secondary'
              variant='tonal'
              onClick={goPreviousStep}
              sx={{ '& svg': { mr: 2 } }}
            >
              <Icon fontSize='1.125rem' icon='tabler:arrow-left' />
              Înapoi
            </Button>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant='contained' onClick={onSubmit} disabled={submitLoading}>
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
                Finalizare înregistrare
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </form>
  )
}

export default StepProfessorAddress
