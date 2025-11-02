// ** React Imports
import { Box, Button, Card, CardContent, Chip, Divider, Typography, alpha, useMediaQuery, Avatar } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useRouter } from 'next/router'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import PersonIcon from '@mui/icons-material/Person'
import CustomAvatar from 'src/@core/components/mui/avatar'

// ** Utils Import
import { getInitials } from 'src/@core/utils/get-initials'

const PreviousAttemptProfessor = props => {
  const router = useRouter()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const getScoreConfig = () => {
    const questions = props.questionsCount
    const score = (props.attempt.correctAnswers / questions) * 100

    if (score >= 80) {
      return {
        color: theme.palette.success.main,
        bgColor: alpha(theme.palette.success.main, 0.12),
        label: 'Excelent',
        icon: '✓'
      }
    }
    if (score >= 60) {
      return {
        color: theme.palette.warning.main,
        bgColor: alpha(theme.palette.warning.main, 0.12),
        label: 'Bine',
        icon: '⚠'
      }
    }

    return {
      color: theme.palette.error.main,
      bgColor: alpha(theme.palette.error.main, 0.12),
      label: 'Slab',
      icon: '✗'
    }
  }

  const renderClient = (attempt, user) => {
    const stateNum = Math.floor(Math.random() * 6)
    const states = ['success', 'error', 'warning', 'info', 'primary', 'secondary']
    const color = states[stateNum]

    if (attempt.avatar && attempt.avatar.length) {
      return (
        <CustomAvatar
          src={`/images/avatars/${attempt.avatar}`}
          sx={{
            width: 48,
            height: 48,
            border: `2px solid ${alpha(theme.palette.divider, 0.12)}`
          }}
        />
      )
    } else {
      return (
        <CustomAvatar
          skin='light'
          color={color}
          sx={{
            width: 48,
            height: 48,
            fontSize: '1rem',
            fontWeight: 600,
            border: `2px solid ${alpha(theme.palette.divider, 0.12)}`
          }}
        >
          {getInitials(user?.lastName ? `${user.firstName} ${user.lastName}` : 'John Doe')}
        </CustomAvatar>
      )
    }
  }

  const renderUser = attempt => {
    const user = props.users.find(user => user.id === attempt.userId)

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        {renderClient(attempt, user)}
        <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <Typography
            noWrap
            variant='body2'
            sx={{
              color: 'text.primary',
              fontWeight: 600,
              fontSize: '0.95rem'
            }}
          >
            {user?.firstName} {user?.lastName}
          </Typography>
          <Typography
            noWrap
            variant='caption'
            sx={{
              color: alpha(theme.palette.text.secondary, 0.8),
              fontSize: '0.75rem'
            }}
          >
            {user?.email}
          </Typography>
        </Box>
      </Box>
    )
  }

  const formatDate = dateString => {
    const options = { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' }

    return new Date(dateString).toLocaleDateString('ro-RO', options)
  }

  const calculateTime = () => {
    const start = new Date(props.attempt.startAt)
    const end = new Date(props.attempt.endedTime)
    const minutesDifference = (end - start) / (1000 * 60)

    return Math.round(minutesDifference * 10) / 10
  }

  const handleViewAttempt = event => {
    event.preventDefault()
    router.push(`/review-attempt/${props.attempt.id}`)
  }

  const scoreConfig = getScoreConfig()
  const scorePercentage = Math.round((props.attempt.correctAnswers / props.questionsCount) * 100)

  return (
    <Card
      sx={{
        mb: 2,
        backgroundColor: alpha(theme.palette.background.paper, 0.6),
        backdropFilter: 'blur(20px)',
        border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
        borderLeft: `4px solid ${scoreConfig.color}`,
        borderRadius: 3,
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.12)}`,
          backgroundColor: alpha(theme.palette.background.paper, 0.8)
        }
      }}
    >
      <CardContent sx={{ p: isMobile ? 2.5 : 3, '&:last-child': { pb: isMobile ? 2.5 : 3 } }}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            mb: 2,
            flexWrap: 'wrap',
            gap: 2
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, minWidth: 0 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                backgroundColor: alpha(scoreConfig.color, 0.12),
                border: `1px solid ${alpha(scoreConfig.color, 0.2)}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Typography
                variant='h6'
                sx={{
                  fontWeight: 700,
                  color: scoreConfig.color,
                  fontSize: '1.1rem'
                }}
              >
                {props.index + 1}
              </Typography>
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              {renderUser(props.attempt)}
            </Box>
          </Box>

          <Chip
            label={scoreConfig.label}
            sx={{
              backgroundColor: scoreConfig.bgColor,
              color: scoreConfig.color,
              border: `1px solid ${alpha(scoreConfig.color, 0.2)}`,
              fontWeight: 600,
              fontSize: '0.7rem',
              height: 'auto',
              py: 0.5,
              px: 0.5,
              flexShrink: 0,
              '& .MuiChip-label': {
                px: 1.5,
                py: 0.25
              }
            }}
          />
        </Box>

        {/* Date Info */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, ml: 7 }}>
          <CalendarMonthIcon
            sx={{
              fontSize: '0.95rem',
              color: alpha(theme.palette.text.secondary, 0.6)
            }}
          />
          <Typography
            variant='caption'
            sx={{
              color: alpha(theme.palette.text.secondary, 0.8),
              fontSize: '0.8rem',
              fontWeight: 500
            }}
          >
            {formatDate(props.attempt.startAt)}
          </Typography>
        </Box>

        <Divider sx={{ my: 2, opacity: 0.6 }} />

        {/* Stats Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
            gap: 3,
            mb: 2.5
          }}
        >
          {/* Score */}
          <Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mb: 0.75
              }}
            >
              <CheckCircleIcon
                sx={{
                  fontSize: '1.1rem',
                  color: alpha(theme.palette.text.secondary, 0.6)
                }}
              />
              <Typography
                variant='caption'
                sx={{
                  color: alpha(theme.palette.text.secondary, 0.7),
                  fontSize: '0.7rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontWeight: 600
                }}
              >
                Rezultat
              </Typography>
            </Box>
            <Typography
              variant='h6'
              sx={{
                fontWeight: 700,
                color: scoreConfig.color,
                fontSize: '1.5rem',
                lineHeight: 1
              }}
            >
              {scorePercentage}%
            </Typography>
            <Typography
              variant='caption'
              sx={{
                color: alpha(theme.palette.text.secondary, 0.7),
                fontSize: '0.75rem'
              }}
            >
              {props.attempt.correctAnswers}/{props.questionsCount} corecte
            </Typography>
          </Box>

          {/* Time */}
          <Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mb: 0.75
              }}
            >
              <AccessTimeIcon
                sx={{
                  fontSize: '1.1rem',
                  color: alpha(theme.palette.text.secondary, 0.6)
                }}
              />
              <Typography
                variant='caption'
                sx={{
                  color: alpha(theme.palette.text.secondary, 0.7),
                  fontSize: '0.7rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontWeight: 600
                }}
              >
                Timp
              </Typography>
            </Box>
            <Typography
              variant='h6'
              sx={{
                fontWeight: 700,
                color: 'text.primary',
                fontSize: '1.5rem',
                lineHeight: 1
              }}
            >
              {calculateTime()}
            </Typography>
            <Typography
              variant='caption'
              sx={{
                color: alpha(theme.palette.text.secondary, 0.7),
                fontSize: '0.75rem'
              }}
            >
              minute
            </Typography>
          </Box>

          {/* Action Button - Full width on mobile, inline on desktop */}
          <Box
            sx={{
              gridColumn: isMobile ? 'span 2' : 'span 1',
              display: 'flex',
              alignItems: isMobile ? 'stretch' : 'flex-end',
              justifyContent: isMobile ? 'center' : 'flex-end'
            }}
          >
            <Button
              variant='contained'
              onClick={handleViewAttempt}
              endIcon={<ArrowForwardIcon />}
              sx={{
                backgroundColor: alpha(theme.palette.primary.main, 0.12),
                color: theme.palette.primary.main,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                borderRadius: 2.5,
                px: 3,
                py: 1.25,
                fontWeight: 600,
                fontSize: '0.875rem',
                textTransform: 'none',
                width: isMobile ? '100%' : 'auto',
                boxShadow: 'none',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.18),
                  borderColor: alpha(theme.palette.primary.main, 0.3),
                  transform: 'translateY(-1px)',
                  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.25)}`
                },
                '&:active': {
                  transform: 'translateY(0)',
                  boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.2)}`
                }
              }}
            >
              Vezi răspunsurile
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

PreviousAttemptProfessor.acl = {
  action: 'read',
  subject: 'student-pages'
}

export default PreviousAttemptProfessor
