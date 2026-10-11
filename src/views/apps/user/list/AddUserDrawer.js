// ** React Imports
import { useState, useMemo } from 'react'

// ** MUI Imports
import Drawer from '@mui/material/Drawer'
import Button from '@mui/material/Button'
import { styled } from '@mui/material/styles'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import MenuItem from '@mui/material/MenuItem'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Third Party Imports
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm, Controller } from 'react-hook-form'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Store Imports
import { useDispatch, useSelector } from 'react-redux'

// ** Actions Imports
import { addStudentByEmail } from 'src/store/apps/user'

// ** Utils
import { generateSchoolYearOptions } from 'src/pages/apps/user/list/utils'

// ** Toast
import toast from 'react-hot-toast'

const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(6),
  justifyContent: 'space-between'
}))

const schema = yup.object().shape({
  studentEmail: yup.string().email('Adresa de email nu este validă').required('Emailul este obligatoriu'),
  defaultPricePerSession: yup
    .number()
    .typeError('Prețul trebuie să fie un număr')
    .min(0, 'Prețul nu poate fi negativ')
    .nullable()
    .transform((value, originalValue) => (originalValue === '' ? null : value)),
  generation: yup
    .string()
    .nullable()
    .test('valid-format', 'Generația trebuie să fie în formatul AAAA-AAAA (ex. 2024-2025)', value => {
      if (!value) return true // Allow empty
      return /^\d{4}-\d{4}$/.test(value)
    })
})

const defaultValues = {
  studentEmail: '',
  defaultPricePerSession: '',
  generation: ''
}

const AddUserDrawer = props => {
  // ** Props
  const { open, toggle } = props

  // ** State
  const [loading, setLoading] = useState(false)
  const [isCustomGeneration, setIsCustomGeneration] = useState(false)

  // ** Hooks
  const dispatch = useDispatch()
  const store = useSelector(state => state.user)

  // ** Generate school year options
  const schoolYearOptions = useMemo(() => generateSchoolYearOptions(), [])

  const {
    reset,
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues,
    mode: 'onChange',
    resolver: yupResolver(schema)
  })

  const onSubmit = async data => {
    try {
      setLoading(true)

      // Prepare the request data
      const requestData = {
        studentEmail: data.studentEmail,
        ...(data.defaultPricePerSession && { defaultPricePerSession: Number(data.defaultPricePerSession) }),
        ...(data.generation && { generation: data.generation })
      }

      await dispatch(addStudentByEmail(requestData)).unwrap()

      toast.success('Elevul a fost adăugat.')
      handleClose()
    } catch (error) {
      // Error handling based on API response
      const errorMessage = error?.message || error?.toString() || 'Elevul nu a putut fi adăugat'

      if (error?.status === 409 || errorMessage.includes('already exists')) {
        toast.error('Elevul este deja în lista ta.')
      } else if (error?.status === 404 || errorMessage.includes('not found')) {
        toast.error('Nu există niciun utilizator cu acest email.')
      } else if (error?.status === 400 || errorMessage.includes('negative')) {
        toast.error('Prețul nu poate fi negativ.')
      } else if (errorMessage.includes('incomplete profile')) {
        toast.error('Profilul elevului este incomplet.')
      } else {
        toast.error(errorMessage)
      }

      console.error('Failed to add student:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    reset()
    setIsCustomGeneration(false)
    toggle()
  }

  return (
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={handleClose}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
    >
      <Header>
        <Typography variant='h5'>Adaugă Elev</Typography>
        <IconButton
          size='small'
          onClick={handleClose}
          sx={{
            p: '0.438rem',
            borderRadius: 1,
            color: 'text.primary',
            backgroundColor: 'action.selected',
            '&:hover': {
              backgroundColor: theme => `rgba(${theme.palette.customColors.main}, 0.16)`
            }
          }}
        >
          <Icon icon='tabler:x' fontSize='1.125rem' />
        </IconButton>
      </Header>
      <Box sx={{ p: theme => theme.spacing(0, 6, 6) }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name='studentEmail'
            control={control}
            rules={{ required: true }}
            render={({ field: { value, onChange } }) => (
              <CustomTextField
                fullWidth
                type='email'
                label='Emailul Elevului'
                value={value}
                sx={{ mb: 4 }}
                onChange={onChange}
                error={Boolean(errors.studentEmail)}
                placeholder='elev@exemplu.ro'
                helperText={errors.studentEmail?.message || 'Emailul elevului pe care vrei să-l adaugi'}
                disabled={loading}
              />
            )}
          />
          <Controller
            name='defaultPricePerSession'
            control={control}
            render={({ field: { value, onChange } }) => (
              <CustomTextField
                fullWidth
                type='number'
                label='Preț Implicit pe Ședință'
                value={value}
                sx={{ mb: 4 }}
                onChange={onChange}
                error={Boolean(errors.defaultPricePerSession)}
                placeholder='0.00'
                helperText={errors.defaultPricePerSession?.message || 'Opțional: prețul implicit pentru ședințe'}
                disabled={loading}
                InputProps={{
                  endAdornment: <Typography sx={{ ml: 1, color: 'text.secondary' }}>RON</Typography>
                }}
              />
            )}
          />
          <Controller
            name='generation'
            control={control}
            render={({ field: { value, onChange } }) => (
              <>
                {!isCustomGeneration ? (
                  <CustomTextField
                    select
                    fullWidth
                    label='Generație'
                    value={value}
                    sx={{ mb: 4 }}
                    onChange={e => {
                      if (e.target.value === 'custom') {
                        setIsCustomGeneration(true)
                        onChange('')
                      } else {
                        onChange(e.target.value)
                      }
                    }}
                    error={Boolean(errors.generation)}
                    helperText={errors.generation?.message || 'Opțional: generația (anul școlar)'}
                    disabled={loading}
                  >
                    <MenuItem value=''>Niciuna</MenuItem>
                    {schoolYearOptions.map(year => (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    ))}
                    <MenuItem value='custom' sx={{ fontStyle: 'italic', color: 'primary.main' }}>
                      Interval Personalizat...
                    </MenuItem>
                  </CustomTextField>
                ) : (
                  <Box sx={{ mb: 4 }}>
                    <CustomTextField
                      fullWidth
                      label='Generație Personalizată'
                      value={value}
                      onChange={e => {
                        let input = e.target.value
                        // Remove any non-digit characters except hyphen
                        input = input.replace(/[^\d-]/g, '')

                        // Auto-format: when user types 4 digits, add hyphen
                        if (input.length === 4 && !input.includes('-')) {
                          input = input + '-'
                        }

                        // Limit to YYYY-YYYY format (9 characters max)
                        if (input.length <= 9) {
                          onChange(input)
                        }
                      }}
                      error={Boolean(errors.generation)}
                      placeholder='AAAA-AAAA (ex. 2025-2027)'
                      helperText={
                        errors.generation?.message ||
                        'Scrie anul de început; cratima se adaugă automat'
                      }
                      disabled={loading}
                      inputProps={{ maxLength: 9 }}
                    />
                    <Button
                      size='small'
                      variant='text'
                      onClick={() => {
                        setIsCustomGeneration(false)
                        onChange('')
                      }}
                      sx={{ mt: 1 }}
                    >
                      Înapoi la opțiunile standard
                    </Button>
                  </Box>
                )}
              </>
            )}
          />
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button type='submit' variant='contained' sx={{ mr: 3 }} disabled={loading}>
              {loading ? <CircularProgress size={20} sx={{ mr: 2 }} /> : null}
              {loading ? 'Se adaugă...' : 'Adaugă Elev'}
            </Button>
            <Button variant='tonal' color='secondary' onClick={handleClose} disabled={loading}>
              Anulează
            </Button>
          </Box>
        </form>
      </Box>
    </Drawer>
  )
}

export default AddUserDrawer
