// ** React Imports
import React from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import { Button } from '@mui/material'
import { alpha } from '@mui/material/styles'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Hooks
import { useResponsive } from 'src/pages/quizzes/hooks/useResponsive'

// ** Apple Design System
import { APPLE_SPACING, APPLE_BORDER_RADIUS } from 'src/@core/theme/apple-design-system'

/**
 * ErrorMessages - User-friendly error message components
 *
 * Requirements addressed:
 * - 9.3: Create user-friendly error messages for operation failures
 * - 9.4: Maintain functional state when individual components encounter errors
 */

interface ErrorMessageProps {
  title?: string
  message: string
  onRetry?: () => void
  onDismiss?: () => void
  severity?: 'error' | 'warning' | 'info'
  showIcon?: boolean
}

// ** Inline Error Alert
export const InlineErrorAlert: React.FC<ErrorMessageProps> = ({
  title = 'A apărut o eroare',
  message,
  onRetry,
  onDismiss,
  severity = 'error',
  showIcon = true
}) => {
  return (
    <Alert
      severity={severity}
      onClose={onDismiss}
      sx={{
        mb: 2,
        borderRadius: `${APPLE_BORDER_RADIUS.MEDIUM}px`,
        '& .MuiAlert-icon': {
          fontSize: showIcon ? '1.25rem' : 0
        }
      }}
    >
      <AlertTitle sx={{ fontWeight: 600, fontSize: '0.9rem' }}>{title}</AlertTitle>
      <Typography variant='body2' sx={{ fontSize: '0.85rem', mb: onRetry ? 1.5 : 0 }}>
        {message}
      </Typography>
      {onRetry && (
        <Button
          size='small'
          variant='outlined'
          onClick={onRetry}
          startIcon={<Icon icon='tabler:refresh' />}
          sx={{
            mt: 1,
            borderRadius: 1,
            textTransform: 'none',
            fontSize: '0.8rem'
          }}
        >
          Încearcă din nou
        </Button>
      )}
    </Alert>
  )
}

// ** Quiz Load Error - Full page error
export const QuizLoadError: React.FC<{
  message?: string
  onRetry?: () => void
  onGoBack?: () => void
}> = ({ message = 'Nu am putut încărca testul. Te rugăm să încerci din nou.', onRetry, onGoBack }) => {
  const { isMobile } = useResponsive()

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 1200,
        mx: 'auto',
        p: isMobile ? 2 : 3,
        mt: 2
      }}
    >
      <Card
        sx={{
          borderRadius: `${APPLE_BORDER_RADIUS.LARGE}px`,
          boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
        }}
      >
        <CardContent sx={{ p: isMobile ? 3 : 4 }}>
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
                backgroundColor: theme => alpha(theme.palette.error.main, 0.1),
                color: 'error.main'
              }}
            >
              <Icon icon='tabler:alert-circle' fontSize='3rem' />
            </Box>

            <Typography
              variant='h6'
              sx={{
                mb: 2,
                color: 'text.primary',
                fontWeight: 600,
                fontSize: isMobile ? '1.1rem' : '1.25rem'
              }}
            >
              Nu am putut încărca testul
            </Typography>

            <Typography
              variant='body2'
              sx={{
                mb: 4,
                color: 'text.secondary',
                maxWidth: 400,
                lineHeight: 1.6,
                fontSize: isMobile ? '0.85rem' : '0.9rem'
              }}
            >
              {message}
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
              {onRetry && (
                <Button
                  variant='contained'
                  onClick={onRetry}
                  startIcon={<Icon icon='tabler:refresh' />}
                  sx={{
                    borderRadius: `${APPLE_BORDER_RADIUS.MEDIUM}px`,
                    textTransform: 'none',
                    fontWeight: 500,
                    px: 3,
                    py: 1.25
                  }}
                >
                  Încearcă din nou
                </Button>
              )}

              {onGoBack && (
                <Button
                  variant='outlined'
                  onClick={onGoBack}
                  startIcon={<Icon icon='tabler:arrow-left' />}
                  sx={{
                    borderRadius: `${APPLE_BORDER_RADIUS.MEDIUM}px`,
                    textTransform: 'none',
                    fontWeight: 500,
                    px: 3,
                    py: 1.25
                  }}
                >
                  Înapoi la teste
                </Button>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}

// ** Submit Error
export const SubmitError: React.FC<{
  message?: string
  onRetry?: () => void
  onDismiss?: () => void
}> = ({ message = 'Nu am putut trimite testul. Te rugăm să încerci din nou.', onRetry, onDismiss }) => {
  return (
    <Alert
      severity='error'
      onClose={onDismiss}
      sx={{
        mb: 3,
        borderRadius: `${APPLE_BORDER_RADIUS.MEDIUM}px`,
        '& .MuiAlert-icon': {
          fontSize: '1.25rem'
        }
      }}
    >
      <AlertTitle sx={{ fontWeight: 600, fontSize: '0.9rem' }}>Eroare la trimiterea testului</AlertTitle>
      <Typography variant='body2' sx={{ fontSize: '0.85rem', mb: onRetry ? 1.5 : 0 }}>
        {message}
      </Typography>
      {onRetry && (
        <Button
          size='small'
          variant='contained'
          color='error'
          onClick={onRetry}
          startIcon={<Icon icon='tabler:refresh' />}
          sx={{
            mt: 1,
            borderRadius: 1,
            textTransform: 'none',
            fontSize: '0.8rem'
          }}
        >
          Încearcă din nou
        </Button>
      )}
    </Alert>
  )
}

// ** Network Error
export const NetworkError: React.FC<{
  onRetry?: () => void
  onDismiss?: () => void
}> = ({ onRetry, onDismiss }) => {
  return (
    <Alert
      severity='warning'
      onClose={onDismiss}
      icon={<Icon icon='tabler:wifi-off' />}
      sx={{
        mb: 2,
        borderRadius: `${APPLE_BORDER_RADIUS.MEDIUM}px`
      }}
    >
      <AlertTitle sx={{ fontWeight: 600, fontSize: '0.9rem' }}>Probleme de conexiune</AlertTitle>
      <Typography variant='body2' sx={{ fontSize: '0.85rem', mb: onRetry ? 1.5 : 0 }}>
        Verifică conexiunea la internet și încearcă din nou.
      </Typography>
      {onRetry && (
        <Button
          size='small'
          variant='outlined'
          onClick={onRetry}
          startIcon={<Icon icon='tabler:refresh' />}
          sx={{
            mt: 1,
            borderRadius: 1,
            textTransform: 'none',
            fontSize: '0.8rem'
          }}
        >
          Reîncearcă
        </Button>
      )}
    </Alert>
  )
}

// ** Validation Error
export const ValidationError: React.FC<{
  message: string
  onDismiss?: () => void
}> = ({ message, onDismiss }) => {
  return (
    <Alert
      severity='warning'
      onClose={onDismiss}
      sx={{
        mb: 2,
        borderRadius: `${APPLE_BORDER_RADIUS.MEDIUM}px`
      }}
    >
      <AlertTitle sx={{ fontWeight: 600, fontSize: '0.9rem' }}>Atenție</AlertTitle>
      <Typography variant='body2' sx={{ fontSize: '0.85rem' }}>
        {message}
      </Typography>
    </Alert>
  )
}

// ** Celebration Error Fallback
export const CelebrationErrorFallback: React.FC<{
  score: number
  totalQuestions: number
  onContinue: () => void
}> = ({ score, totalQuestions, onContinue }) => {
  const percentage = Math.round((score / totalQuestions) * 100)

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        p: 3
      }}
    >
      <Box
        sx={{
          textAlign: 'center',
          maxWidth: 500,
          backgroundColor: 'background.paper',
          borderRadius: `${APPLE_BORDER_RADIUS.LARGE}px`,
          p: 4
        }}
      >
        <Typography
          variant='h4'
          sx={{
            mb: 2,
            fontWeight: 700,
            color: 'text.primary'
          }}
        >
          Test completat!
        </Typography>

        <Typography
          variant='h2'
          sx={{
            mb: 1,
            fontWeight: 700,
            color: 'primary.main'
          }}
        >
          {score}/{totalQuestions}
        </Typography>

        <Typography
          variant='h6'
          sx={{
            mb: 4,
            color: 'text.secondary'
          }}
        >
          {percentage}% corect
        </Typography>

        <Button
          variant='contained'
          size='large'
          onClick={onContinue}
          sx={{
            borderRadius: `${APPLE_BORDER_RADIUS.MEDIUM}px`,
            textTransform: 'none',
            fontWeight: 600,
            px: 4,
            py: 1.5
          }}
        >
          Vezi rezultatele
        </Button>
      </Box>
    </Box>
  )
}

export default {
  InlineErrorAlert,
  QuizLoadError,
  SubmitError,
  NetworkError,
  ValidationError,
  CelebrationErrorFallback
}
