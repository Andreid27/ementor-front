// ** React Imports
import { useState } from 'react'

// ** MUI Components
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components Imports
import CustomTextField from 'src/@core/components/mui/text-field'
import EmentorAvatar, { UserType } from 'src/@core/components/ementor-avatar'

// ** API Imports
import * as apiSpec from '../../../../apiSpec'
import apiClient from 'src/@core/axios/axiosEmentor'

const StepInvitationCode = ({ handleNext, invitationData, setInvitationData }) => {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [professorPreview, setProfessorPreview] = useState(null)

  const handleVerifyCode = async () => {
    if (!code.trim()) {
      setError('Vă rugăm să introduceți un cod de invitație')

      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await apiClient.get(`${apiSpec.PROFESSOR_PROFILE_CONTROLLER}/preview-by-code/${code.trim()}`)

      setProfessorPreview(response.data)
      setInvitationData({
        code: code.trim(),
        professorPreview: response.data
      })
      setError('')
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Cod invalid. Verificați codul și încercați din nou.')
      } else {
        setError('Eroare de conexiune. Încercați din nou.')
      }
      setProfessorPreview(null)
      setInvitationData({ code: null, professorPreview: null })
    } finally {
      setLoading(false)
    }
  }

  const handleSkip = () => {
    setInvitationData({ code: null, professorPreview: null })
    handleNext()
  }

  const handleContinue = () => {
    handleNext()
  }

  const handleCodeChange = e => {
    setCode(e.target.value)
    setError('')
    if (professorPreview) {
      setProfessorPreview(null)
      setInvitationData({ code: null, professorPreview: null })
    }
  }

  return (
    <Box>
      <Box sx={{ mb: 6 }}>
        <Typography variant='h3' sx={{ mb: 1.5 }}>
          Cod de invitație (opțional)
        </Typography>
        <Typography sx={{ color: 'text.secondary' }}>
          Dacă aveți un cod de invitație de la profesor, introduceți-l mai jos. Acest pas este opțional și poate fi
          completat mai târziu.
        </Typography>
      </Box>

      <Grid container spacing={5}>
        <Grid item xs={12}>
          <CustomTextField
            fullWidth
            value={code}
            label='Cod de invitație'
            onChange={handleCodeChange}
            placeholder='Introduceți codul de invitație'
            error={Boolean(error)}
            helperText={error}
            InputProps={{
              endAdornment: loading ? <CircularProgress size={20} /> : null
            }}
          />
        </Grid>

        {!professorPreview && (
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant='contained' onClick={handleVerifyCode} disabled={loading || !code.trim()}>
                {loading ? <CircularProgress size={20} sx={{ mr: 2 }} /> : null}
                Verifică codul
              </Button>
              <Button variant='outlined' color='secondary' onClick={handleSkip}>
                Săriți acest pas
              </Button>
            </Box>
          </Grid>
        )}

        {professorPreview && (
          <Grid item xs={12}>
            <Alert severity='success' sx={{ mb: 3 }}>
              Cod valid! Veți fi conectat la profesorul de mai jos.
            </Alert>

            <Card sx={{ border: theme => `1px solid ${theme.palette.primary.main}` }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 4 }}>
                  <EmentorAvatar
                    userId={professorPreview.id}
                    userType={UserType.PROFESSOR}
                    fullSize={true}
                    sx={{ width: 80, height: 80 }}
                    alt={professorPreview.fullName}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant='h5' sx={{ mb: 1 }}>
                      {professorPreview.fullName}
                    </Typography>
                    {professorPreview.university && (
                      <Typography variant='body2' sx={{ color: 'text.secondary', mb: 0.5 }}>
                        <Icon
                          icon='tabler:school'
                          fontSize='1rem'
                          style={{ verticalAlign: 'middle', marginRight: 4 }}
                        />
                        {professorPreview.university}
                      </Typography>
                    )}
                    {professorPreview.speciality && (
                      <Typography variant='body2' sx={{ color: 'text.secondary', mb: 2 }}>
                        <Icon icon='tabler:book' fontSize='1rem' style={{ verticalAlign: 'middle', marginRight: 4 }} />
                        {professorPreview.speciality}
                      </Typography>
                    )}
                    {professorPreview.about && (
                      <Typography variant='body2' sx={{ mt: 2 }}>
                        {professorPreview.about}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
              <Button
                variant='outlined'
                onClick={() => {
                  setProfessorPreview(null)
                  setCode('')
                  setInvitationData({ code: null, professorPreview: null })
                }}
              >
                Anulați
              </Button>
              <Button variant='contained' onClick={handleContinue}>
                Continuați cu acest profesor
                <Icon fontSize='1.125rem' icon='tabler:arrow-right' sx={{ ml: 1 }} />
              </Button>
            </Box>
          </Grid>
        )}
      </Grid>
    </Box>
  )
}

export default StepInvitationCode
