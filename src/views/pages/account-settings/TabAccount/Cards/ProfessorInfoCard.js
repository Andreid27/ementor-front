import { Box, Grid, MenuItem, Typography } from '@mui/material'
import { forwardRef, useImperativeHandle, useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import CustomTextField from 'src/@core/components/mui/text-field'

const ProfessorInfoCard = ({ fullProfile, initPrerequire }, ref) => {
  const [universityId, setUniversityId] = useState(fullProfile.universityId)
  const [specialities, setSpecialities] = useState([])

  // Expose the getData function through the ref
  useImperativeHandle(ref, () => ({
    getValues
  }))

  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues,
    reset
  } = useForm({ defaultValues: fullProfile })

  const onSubmit = async data => {}

  useEffect(() => {
    reset(fullProfile)
    setSpecialitiesByUniversityId()
  }, [initPrerequire, universityId, fullProfile, reset])

  const setSpecialitiesByUniversityId = () => {
    if (
      initPrerequire.universities.length > 0 &&
      universityId != 'choose' &&
      universityId &&
      initPrerequire.universities
    ) {
      let currentSpecialities = initPrerequire.universities.find(
        currentUniversity => currentUniversity.id === universityId
      ).specialities
      setSpecialities(currentSpecialities)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ mb: 6 }}>
          <Typography variant='h3' sx={{ mb: 1.5 }}>
            Informații academice
          </Typography>
        </Box>

        <Grid container spacing={5}>
          <Grid item xs={12}>
            <Controller
              name='fullName'
              control={control}
              rules={{
                required: 'Numele complet este obligatoriu',
                minLength: { value: 3, message: 'Numele trebuie să conțină cel puțin 3 caractere' },
                maxLength: { value: 100, message: 'Numele nu poate depăși 100 de caractere' }
              }}
              render={({ field: { value, onChange } }) => (
                <CustomTextField
                  fullWidth
                  value={value}
                  label='Nume complet (cu titluri academice)'
                  onChange={onChange}
                  placeholder='Conf. Dr. Ing. Popescu Ion'
                  error={Boolean(errors.fullName)}
                  {...(errors.fullName && { helperText: errors.fullName.message })}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Controller
              name='universityId'
              control={control}
              rules={{ required: true, minLength: 32, maxLength: 40 }}
              defaultValue={'choose'}
              render={({ field: { value, onChange } }) => (
                <CustomTextField
                  select
                  fullWidth
                  onChange={e => {
                    onChange(e)
                    setUniversityId(e.target.value)
                  }}
                  value={value}
                  name='universityId'
                  label='Universitate'
                  error={Boolean(errors.universityId)}
                  aria-describedby='validation-async-last-name'
                  {...(errors.universityId && { helperText: 'Acest câmp este obligatoriu.' })}
                >
                  <MenuItem key={'choose'} value={'choose'}>
                    {'Alege'}
                  </MenuItem>
                  {initPrerequire &&
                    initPrerequire.universities.map(university => (
                      <MenuItem key={university.id} value={university.id}>
                        {university.name}
                      </MenuItem>
                    ))}
                </CustomTextField>
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Controller
              name='specialityId'
              control={control}
              rules={{ required: true, minLength: 32, maxLength: 40 }}
              defaultValue={'choose'}
              render={({ field: { value, onChange } }) => (
                <CustomTextField
                  select
                  fullWidth
                  onChange={e => {
                    onChange(e)
                  }}
                  value={value}
                  name='speciality'
                  label='Specializare'
                  error={Boolean(errors.speciality)}
                  aria-describedby='validation-async-last-name'
                  {...(errors.specialityId && { helperText: 'Acest câmp este obligatoriu.' })}
                >
                  <MenuItem key={'choose'} value={'choose'}>
                    {'Alege'}
                  </MenuItem>
                  {specialities &&
                    specialities.map(speciality => (
                      <MenuItem key={speciality.specialityId} value={speciality.specialityId}>
                        {speciality.name}
                      </MenuItem>
                    ))}
                </CustomTextField>
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Controller
              name='about'
              control={control}
              rules={{
                maxLength: { value: 500, message: 'Descrierea nu poate depăși 500 de caractere' }
              }}
              render={({ field: { value, onChange } }) => (
                <CustomTextField
                  fullWidth
                  multiline
                  rows={4}
                  value={value || ''}
                  label='Despre (opțional)'
                  onChange={onChange}
                  placeholder='Descrieți experiența dvs. academică...'
                  error={Boolean(errors.about)}
                  {...(errors.about && { helperText: errors.about.message })}
                />
              )}
            />
          </Grid>
        </Grid>
      </form>
    </>
  )
}

export default forwardRef(ProfessorInfoCard)
