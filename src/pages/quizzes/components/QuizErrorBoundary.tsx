// ** React Imports
import React, { Component, ErrorInfo, ReactNode } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

class QuizErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Quiz DataGrid Error:', error, errorInfo)
    this.setState({ error, errorInfo })
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <Card>
          <CardHeader title='Testele tale' />
          <Box sx={{ p: 4 }}>
            <Alert
              severity='error'
              sx={{
                mb: 3,
                '& .MuiAlert-icon': {
                  fontSize: '1.5rem'
                }
              }}
            >
              <AlertTitle sx={{ fontWeight: 600 }}>A apărut o eroare neașteptată</AlertTitle>
              Nu am putut încărca lista de teste. Te rugăm să încerci din nou.
            </Alert>

            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                py: 4
              }}
            >
              <Box
                sx={{
                  mb: 3,
                  p: 3,
                  borderRadius: '50%',
                  backgroundColor: 'error.light',
                  color: 'error.contrastText'
                }}
              >
                <Icon icon='tabler:alert-triangle' fontSize='3rem' />
              </Box>

              <Typography
                variant='h6'
                sx={{
                  mb: 2,
                  color: 'text.primary',
                  fontWeight: 600
                }}
              >
                Ceva nu a mers bine
              </Typography>

              <Typography
                variant='body2'
                sx={{
                  mb: 4,
                  color: 'text.secondary',
                  maxWidth: 400,
                  lineHeight: 1.6
                }}
              >
                {this.state.error?.message ||
                  'A apărut o eroare tehnică. Echipa noastră a fost notificată și lucrează la rezolvare.'}
              </Typography>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant='contained'
                  onClick={this.handleRetry}
                  startIcon={<Icon icon='tabler:refresh' />}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 500,
                    px: 4,
                    py: 1.5
                  }}
                >
                  Încearcă din nou
                </Button>

                <Button
                  variant='outlined'
                  onClick={() => window.location.reload()}
                  startIcon={<Icon icon='tabler:reload' />}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 500,
                    px: 4,
                    py: 1.5
                  }}
                >
                  Reîncarcă pagina
                </Button>
              </Box>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <Box
                  sx={{
                    mt: 4,
                    p: 2,
                    backgroundColor: 'grey.100',
                    borderRadius: 1,
                    maxWidth: '100%',
                    overflow: 'auto'
                  }}
                >
                  <Typography variant='caption' sx={{ fontFamily: 'monospace' }}>
                    {this.state.error.stack}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Card>
      )
    }

    return this.props.children
  }
}

export default QuizErrorBoundary
