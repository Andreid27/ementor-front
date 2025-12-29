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
import { CircularProgress } from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { useAuth } from 'src/hooks/useAuth'

const StepProfessorBankInfo = ({ bankInfo, setBankInfo, handlePrev, handleNext }) => {
  const auth = useAuth()

  const [values, setValues] = useState(bankInfo)

  useEffect(() => {
    setValues(bankInfo)
  }, [])

  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues
  } = useForm({ defaultValues: bankInfo })

  const onSubmit = async data => {
    let newValues = getValues()
    setBankInfo(newValues)
    handleNext(newValues)
  }

  const goPreviousStep = () => {
    const newValues = getValues()

    for (let key in newValues) {
      if (newValues[key] !== undefined) {
        values[key] = newValues[key]
      }
    }

    setBankInfo(values)
    handlePrev()
  }

  const handleSkip = () => {
    setBankInfo(null)
    handleNext(null)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Box sx={{ mb: 6 }}>
        <Typography variant='h3' sx={{ mb: 1.5 }}>
          Informații bancare (opțional)
        </Typography>
        <Typography sx={{ color: 'text.secondary' }}>
          Aceste informații sunt necesare pentru a primi plăți de la studenți. Puteți completa aceste detalii mai
          târziu din profilul dvs.
        </Typography>
      </Box>

      <Grid container spacing={5}>
        <Grid item xs={12}>
          <Controller
            name='iban'
            control={control}
            rules={{
              minLength: { value: 15, message: 'IBAN-ul trebuie să aibă cel puțin 15 caractere' },
              maxLength: { value: 34, message: 'IBAN-ul nu poate depăși 34 de caractere' },
              pattern: {
                value: /^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/,
                message: 'IBAN invalid. Formatul corect: RO49AAAA1B31007593840000'
              }
            }}
            render={({ field: { value, onChange } }) => (
              <CustomTextField
                fullWidth
                value={value}
                label='IBAN'
                onChange={e => onChange(e.target.value.toUpperCase())}
                placeholder='RO49AAAA1B31007593840000'
                error={Boolean(errors.iban)}
                aria-describedby='validation-iban'
                {...(errors.iban && { helperText: errors.iban.message })}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name='bankName'
            control={control}
            rules={{ minLength: 2, maxLength: 100 }}
            render={({ field: { value, onChange } }) => (
              <CustomTextField
                fullWidth
                value={value}
                label='Nume bancă (opțional)'
                onChange={onChange}
                placeholder='Banca Transilvania'
                error={Boolean(errors.bankName)}
                aria-describedby='validation-bank-name'
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name='accountHolderName'
            control={control}
            rules={{ minLength: 3, maxLength: 100 }}
            render={({ field: { value, onChange } }) => (
              <CustomTextField
                fullWidth
                value={value}
                label='Titular cont (opțional)'
                onChange={onChange}
                placeholder='Numele Dvs. Complet'
                error={Boolean(errors.accountHolderName)}
                aria-describedby='validation-account-holder'
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name='swiftCode'
            control={control}
            rules={{
              minLength: { value: 8, message: 'Codul SWIFT trebuie să aibă 8 sau 11 caractere' },
              maxLength: { value: 11, message: 'Codul SWIFT trebuie să aibă 8 sau 11 caractere' },
              pattern: {
                value: /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/,
                message: 'Cod SWIFT invalid'
              }
            }}
            render={({ field: { value, onChange } }) => (
              <CustomTextField
                fullWidth
                value={value}
                label='Cod SWIFT/BIC (opțional)'
                onChange={e => onChange(e.target.value.toUpperCase())}
                placeholder='BTRLRO22'
                error={Boolean(errors.swiftCode)}
                aria-describedby='validation-swift'
                {...(errors.swiftCode && { helperText: errors.swiftCode.message })}
              />
            )}
          />
        </Grid>

        <Grid item xs={6}>
          <Button
            variant='text'
            sx={{ marginBottom: '30px' }}
            onClick={() => {
              auth.logout()
            }}
          >
            Sign Out
          </Button>
        </Grid>

        <Grid item xs={6}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
            <Button color='secondary' variant='tonal' onClick={goPreviousStep} sx={{ '& svg': { mr: 2 } }}>
              <Icon fontSize='1.125rem' icon='tabler:arrow-left' />
              Înapoi
            </Button>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant='outlined' onClick={handleSkip}>
                Săriți acest pas
              </Button>
              <Button variant='contained' type='submit'>
                Următorul pas
                <Icon fontSize='1.125rem' icon='tabler:arrow-right' sx={{ ml: 1 }} />
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </form>
  )
}

export default StepProfessorBankInfo
