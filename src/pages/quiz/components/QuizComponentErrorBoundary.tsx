// ** React Imports
import React, { Component, ErrorInfo, ReactNode } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  componentName?: string
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  showRetry?: boolean
  minimal?: boolean
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

/**
 * QuizComponentErrorBoundary - Component-level error boundary for quiz interface
 *
 * Requirements addressed:
 * - 9.5: Implement proper error boundaries to prevent complete interface failure
 * - 9.4: Maintain functional state when individual components encounter errors
 * - 9.3: Create user-friendly error messages for operation failures
 */
class QuizComponentErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details for debugging
    console.error(`Error in ${this.props.componentName || 'Quiz Component'}:`, error, errorInfo)

    // Store error info in state
    this.setState({ error, errorInfo })

    // Call optional error callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  handleRetry = () => {
    // Reset error state to retry rendering
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Minimal error display for non-critical components
      if (this.props.minimal) {
        return (
          <Alert
            severity='warning'
            sx={{
              my: 2,
              borderRadius: 2
            }}
          >
            <AlertTitle sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Componentă indisponibilă</AlertTitle>
            <Typography variant='body2' sx={{ fontSize: '0.8rem' }}>
              {this.props.componentName || 'Această componentă'} nu poate fi afișată momentan.
            </Typography>
          </Alert>
        )
      }

      // Full error display for critical components
      return (
        <Box
          sx={{
            p: 3,
            my: 2,
            borderRadius: 2,
            border: theme => `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
            backgroundColor: theme => alpha(theme.palette.error.main, 0.05)
          }}
        >
          <Alert
            severity='error'
            sx={{
              mb: 2,
              '& .MuiAlert-icon': {
                fontSize: '1.25rem'
              }
            }}
          >
            <AlertTitle sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
              Eroare în {this.props.componentName || 'componentă'}
            </AlertTitle>
            <Typography variant='body2' sx={{ fontSize: '0.8rem' }}>
              A apărut o problemă neașteptată. Poți continua cu restul testului.
            </Typography>
          </Alert>

          {this.props.showRetry !== false && (
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant='outlined'
                size='small'
                onClick={this.handleRetry}
                startIcon={<Icon icon='tabler:refresh' />}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '0.8rem'
                }}
              >
                Încearcă din nou
              </Button>
            </Box>
          )}

          {/* Show error details in development */}
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <Box
              sx={{
                mt: 2,
                p: 2,
                backgroundColor: 'grey.100',
                borderRadius: 1,
                maxWidth: '100%',
                overflow: 'auto'
              }}
            >
              <Typography variant='caption' sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>
                {this.state.error.message}
              </Typography>
            </Box>
          )}
        </Box>
      )
    }

    return this.props.children
  }
}

export default QuizComponentErrorBoundary
