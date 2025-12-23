// ** React Imports
import { useState } from 'react'

// ** MUI Imports
import Drawer from '@mui/material/Drawer'
import Button from '@mui/material/Button'
import { styled } from '@mui/material/styles'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Third Party Imports
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm, Controller } from 'react-hook-form'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Store Imports
import { useDispatch } from 'react-redux'

// ** Actions Imports
import { addStudentByEmail } from 'src/store/apps/user'

// ** Toast
import toast from 'react-hot-toast'

const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(6),
  justifyContent: 'space-between'
}))

const schema = yup.object().shape({
  studentEmail: yup.string().email('Invalid email format').required('Email is required'),
  defaultPricePerSession: yup
    .number()
    .typeError('Price must be a number')
    .min(0, 'Price cannot be negative')
    .nullable()
    .transform((value, originalValue) => (originalValue === '' ? null : value)),
  generation: yup.string().nullable()
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

  // ** Hooks
  const dispatch = useDispatch()

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

      toast.success('Student added successfully!')
      handleClose()
    } catch (error) {
      // Error handling based on API response
      const errorMessage = error?.message || error?.toString() || 'Failed to add student'

      if (error?.status === 409 || errorMessage.includes('already exists')) {
        toast.error('Student relationship already exists!')
      } else if (error?.status === 404 || errorMessage.includes('not found')) {
        toast.error('User not found with the provided email!')
      } else if (error?.status === 400 || errorMessage.includes('negative')) {
        toast.error('Invalid request: Price cannot be negative!')
      } else if (errorMessage.includes('incomplete profile')) {
        toast.error('Student has an incomplete profile!')
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
        <Typography variant='h5'>Add Student</Typography>
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
                label='Student Email'
                value={value}
                sx={{ mb: 4 }}
                onChange={onChange}
                error={Boolean(errors.studentEmail)}
                placeholder='student@example.com'
                helperText={errors.studentEmail?.message || 'Enter the email of the student you want to add'}
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
                label='Default Price Per Session'
                value={value}
                sx={{ mb: 4 }}
                onChange={onChange}
                error={Boolean(errors.defaultPricePerSession)}
                placeholder='0.00'
                helperText={errors.defaultPricePerSession?.message || 'Optional: Set a default price for sessions'}
                disabled={loading}
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1, color: 'text.secondary' }}>$</Typography>
                }}
              />
            )}
          />
          <Controller
            name='generation'
            control={control}
            render={({ field: { value, onChange } }) => (
              <CustomTextField
                fullWidth
                label='Generation'
                value={value}
                sx={{ mb: 6 }}
                onChange={onChange}
                error={Boolean(errors.generation)}
                placeholder='e.g., 2024-2025'
                helperText={errors.generation?.message || 'Optional: Academic year generation'}
                disabled={loading}
              />
            )}
          />
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button type='submit' variant='contained' sx={{ mr: 3 }} disabled={loading}>
              {loading ? <CircularProgress size={20} sx={{ mr: 2 }} /> : null}
              {loading ? 'Adding...' : 'Add Student'}
            </Button>
            <Button variant='tonal' color='secondary' onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
          </Box>
        </form>
      </Box>
    </Drawer>
  )
}

export default AddUserDrawer
