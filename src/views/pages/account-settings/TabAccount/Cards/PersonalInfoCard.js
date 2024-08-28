import { useTheme } from '@emotion/react'
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Grid,
  Icon,
  MenuItem,
  Typography
} from '@mui/material'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import axios from 'axios'
import { forwardRef, useImperativeHandle, useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useSelector } from 'react-redux'
import CustomTextField from 'src/@core/components/mui/text-field'
import { selectTokens } from 'src/store/apps/user'
import schoolDomains from '../../../auth/register-multi-steps/schoolDomains.json'
import schoolSpecialities from '../../../auth/register-multi-steps/schoolSpecialities.json'
import * as apiSpec from '../../../../../apiSpec'

const PersonalInfoCard = ({ fullProfile, initPrerequire }, ref) => {
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
    getValues
  } = useForm({ defaultValues: fullProfile })

  const onSubmit = async data => {}

  useEffect(() => {
    setSpecialitiesByUniversityId()
  }, [initPrerequire, universityId])

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
            Informații educaționale
          </Typography>
        </Box>

        <Grid container spacing={5}>
          <Grid item xs={12} sm={6}>
            <Controller
              name='universityId'
              control={control}
              rules={{ required: true, minLength: 32, maxLength: 40 }}
              defaultValue={'choose'} // This sets the default value
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
              defaultValue={'choose'} // This sets the default value
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
          <Grid item xs={12} sm={6} sx={{ marginTop: '0.6rem' }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Controller
                name='desiredExamDate'
                control={control}
                defaultValue={new Date()} // Set the default value here
                render={({ field: { onChange, value } }) => (
                  <DatePicker
                    slotProps={{ textField: { fullWidth: true } }}
                    label={'Luna și Anul dorit pentru examen'}
                    views={['month', 'year']}
                    value={dayjs(value)} // Get the value here
                    onChange={onChange} // Set the value here
                  />
                )}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12} sm={3}>
            <Controller
              name='schoolDomain'
              control={control}
              rules={{ required: true, minLength: 4, maxLength: 50 }}
              defaultValue={'ch'} // This sets the default value
              render={({ field: { value, onChange } }) => (
                <CustomTextField
                  select
                  fullWidth
                  onChange={e => {
                    onChange(e)
                  }}
                  value={value}
                  name='schoolDomain'
                  label='Domeniu de studiu'
                  error={Boolean(errors.schoolDomain)}
                  aria-describedby='validation-async-last-name'
                  {...(errors.schoolDomain && { helperText: 'Acest câmp este obligatoriu.' })}
                >
                  <MenuItem key={'ch'} value={'ch'}>
                    {'Alege'}
                  </MenuItem>
                  {schoolDomains &&
                    Object.entries(schoolDomains).map(([key, value]) => (
                      <MenuItem key={key} value={key}>
                        {value}
                      </MenuItem>
                    ))}
                </CustomTextField>
              )}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <Controller
              name='schoolSpeciality'
              control={control}
              rules={{ required: true, minLength: 4, maxLength: 50 }}
              defaultValue={'ch'} // This sets the default value
              render={({ field: { value, onChange } }) => (
                <CustomTextField
                  select
                  fullWidth
                  onChange={e => {
                    onChange(e)
                  }}
                  value={value}
                  name='schoolSpeciality'
                  label='Specializarea'
                  error={Boolean(errors.schoolSpeciality)}
                  aria-describedby='validation-async-last-name'
                  {...(errors.schoolSpeciality && { helperText: 'Acest câmp este obligatoriu.' })}
                >
                  <MenuItem key={'ch'} value={'ch'}>
                    {'Alege'}
                  </MenuItem>
                  {schoolSpecialities &&
                    Object.entries(schoolSpecialities).map(([key, value]) => (
                      <MenuItem key={key} value={key}>
                        {value}
                      </MenuItem>
                    ))}
                </CustomTextField>
              )}
            />
          </Grid>

          <Grid item xs={12} sm={8}>
            <Controller
              name='school'
              control={control}
              rules={{ required: true, minLength: 3, maxLength: 100 }}
              render={({ field: { value, onChange } }) => (
                <CustomTextField
                  fullWidth
                  value={value}
                  label='Liceu'
                  onChange={onChange}
                  placeholder='Colegiul Național "Gheorghe Lazăr"'
                  error={Boolean(errors.school)}
                  aria-describedby='validation-async-first-name'
                  {...(errors.school && { helperText: 'Acest câmp este obligatoriu.' })}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Controller
              name='schoolGrade'
              control={control}
              rules={{
                required: true,
                pattern: {
                  value: /^\d([.,]\d{1,2})?$/,
                  message: 'Acest număr de telefonu este valid.'
                }
              }}
              render={({ field: { value, onChange } }) => (
                <CustomTextField
                  fullWidth
                  value={value}
                  label='Media generală / Nota de la BAC'
                  onChange={onChange}
                  placeholder='9.99'
                  error={Boolean(errors.schoolGrade)}
                  aria-describedby='validation-async-last-name'
                  {...(errors.schoolGrade && { helperText: 'Acest câmp este obligatoriu.' })}
                />
              )}
            />
          </Grid>
        </Grid>
      </form>
    </>
  )
}

export default forwardRef(PersonalInfoCard)
