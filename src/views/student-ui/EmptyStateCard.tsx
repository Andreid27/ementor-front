// ** React Imports
import { ReactNode, useId } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Local Imports
import { accentInk } from './readableAccent'

interface EmptyStateCardProps {
  /** Card title, so the card still says what it is for while empty. */
  heading?: string
  icon: string
  title: string
  description: ReactNode
  action?: ReactNode
  tone?: 'neutral' | 'error'
}

/**
 * A card with nothing to show yet. It says what will appear here and offers the
 * next step, instead of a table of headers or a row of zeros.
 */
const EmptyStateCard = ({ heading, icon, title, description, action, tone = 'neutral' }: EmptyStateCardProps) => {
  const theme = useTheme()
  const headingId = useId()

  const ink = tone === 'error' ? theme.palette.error.main : accentInk(theme)
  const wash = tone === 'error' ? theme.palette.error.main : theme.palette.primary.main

  return (
    <Card
      component='section'
      aria-labelledby={heading ? headingId : undefined}
      sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      {heading && (
        <Typography
          id={headingId}
          component='h2'
          sx={{
            px: { xs: 5, sm: 6 },
            pt: { xs: 5, sm: 6 },
            fontWeight: 600,
            fontSize: '1.0625rem',
            color: 'text.primary'
          }}
        >
          {heading}
        </Typography>
      )}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          gap: 1.5,
          px: { xs: 5, sm: 8 },
          py: { xs: 7, sm: 9 }
        }}
      >
        <Box
          aria-hidden
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 56,
            height: 56,
            mb: 1.5,
            borderRadius: '16px',
            color: ink,
            bgcolor: alpha(wash, theme.palette.mode === 'light' ? 0.1 : 0.16)
          }}
        >
          <Icon icon={icon} fontSize='1.75rem' />
        </Box>
        <Typography component='p' sx={{ fontWeight: 600, fontSize: '1rem', color: 'text.primary' }}>
          {title}
        </Typography>
        <Typography
          component='div'
          variant='body2'
          sx={{ maxWidth: '36ch', color: 'text.secondary', lineHeight: 1.55 }}
        >
          {description}
        </Typography>
        {action && <Box sx={{ mt: 3 }}>{action}</Box>}
      </Box>
    </Card>
  )
}

export default EmptyStateCard
