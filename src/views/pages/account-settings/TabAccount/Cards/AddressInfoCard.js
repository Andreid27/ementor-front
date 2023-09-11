import React, { forwardRef, useImperativeHandle } from 'react'
import { Grid, MenuItem, Box, Typography } from '@mui/material'
import { useForm, Controller } from 'react-hook-form'
import CustomTextField from 'src/@core/components/mui/text-field'

// Adjust the import path as

const AddressInfoCard = ({ address, counties }, ref) => {
  // Expose the getData function through the ref
  useImperativeHandle(ref, () => ({
    getValues
  }))

  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues
  } = useForm({ defaultValues: address })

  const onSubmit = async data => {
    console.log('YESS')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Box sx={{ mb: 6 }}>
        <Typography variant='h3' sx={{ mb: 1.5 }}>
          Informații educaționale
        </Typography>
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
      </Grid>
    </form>
  )
}

export default forwardRef(AddressInfoCard)
