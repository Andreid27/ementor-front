// ** React Imports
import { useState } from 'react'

// ** MUI Components
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { styled } from '@mui/material/styles'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components Imports
import CustomAvatar from 'src/@core/components/mui/avatar'

const RoleCard = styled(Card)(({ theme, selected }) => ({
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  border: selected ? `2px solid ${theme.palette.primary.main}` : `2px solid ${theme.palette.divider}`,
  boxShadow: selected ? theme.shadows[3] : theme.shadows[1],
  '&:hover': {
    boxShadow: theme.shadows[2],
    transform: 'translateY(-2px)'
  }
}))

const StepRoleSelection = ({ selectedRole, onSelectRole }) => {
  const [error, setError] = useState('')

  const handleRoleClick = role => {
    setError('')
    onSelectRole(role)
  }

  const handleNext = () => {
    if (!selectedRole) {
      setError('Vă rugăm să selectați un rol pentru a continua')

      return
    }
    // The role is already selected, parent will handle navigation
  }

  return (
    <Box>
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography variant='h3' sx={{ mb: 1.5 }}>
          Alegeți rolul dvs.
        </Typography>
        <Typography sx={{ color: 'text.secondary' }}>
          Selectați dacă doriți să vă înregistrați ca student sau profesor
        </Typography>
      </Box>

      <Grid container spacing={6} sx={{ mb: 8 }}>
        <Grid item xs={12} md={6}>
          <RoleCard selected={selectedRole === 'student'} onClick={() => handleRoleClick('student')}>
            <CardContent
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                py: theme => `${theme.spacing(8)} !important`,
                px: theme => `${theme.spacing(6)} !important`
              }}
            >
              <CustomAvatar
                skin='light'
                color='primary'
                variant='rounded'
                sx={{ width: 80, height: 80, mb: 4, ...(selectedRole === 'student' && { color: 'primary.main' }) }}
              >
                <Icon icon='tabler:school' fontSize='3rem' />
              </CustomAvatar>
              <Typography variant='h4' sx={{ mb: 2 }}>
                Student
              </Typography>
              <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                Înregistrați-vă ca student pentru a accesa cursuri și a vă conecta cu profesorii
              </Typography>
            </CardContent>
          </RoleCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <RoleCard selected={selectedRole === 'professor'} onClick={() => handleRoleClick('professor')}>
            <CardContent
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                py: theme => `${theme.spacing(8)} !important`,
                px: theme => `${theme.spacing(6)} !important`
              }}
            >
              <CustomAvatar
                skin='light'
                color='primary'
                variant='rounded'
                sx={{ width: 80, height: 80, mb: 4, ...(selectedRole === 'professor' && { color: 'primary.main' }) }}
              >
                <Icon icon='tabler:chalkboard' fontSize='3rem' />
              </CustomAvatar>
              <Typography variant='h4' sx={{ mb: 2 }}>
                Profesor
              </Typography>
              <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                Înregistrați-vă ca profesor pentru a crea cursuri și a gestiona studenții
              </Typography>
            </CardContent>
          </RoleCard>
        </Grid>
      </Grid>

      {error && (
        <Typography variant='body2' color='error' sx={{ mb: 4, textAlign: 'center' }}>
          {error}
        </Typography>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Button variant='contained' disabled={!selectedRole} onClick={handleNext} size='large'>
          Continuați
          <Icon fontSize='1.125rem' icon='tabler:arrow-right' sx={{ ml: 2 }} />
        </Button>
      </Box>
    </Box>
  )
}

export default StepRoleSelection
