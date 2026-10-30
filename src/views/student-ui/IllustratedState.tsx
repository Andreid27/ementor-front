// ** React Imports
import { ReactNode, useId } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

// ** Third Party Imports
import { MotionConfig, motion } from 'framer-motion'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Local Imports
import StageBackdrop, { stageBackground } from './StageBackdrop'
import { accentInk } from './readableAccent'

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1]

interface IllustratedStateProps {
  /** A character from STUDENT_ILLUSTRATIONS, for a page that has nothing in it yet. */
  illustration?: string

  /** An icon instead, for passing states such as an empty search or an error. */
  icon?: string
  tone?: 'neutral' | 'error'
  title: string
  description: ReactNode
  actions?: ReactNode
}

/**
 * What a student page shows in place of its list when the list is empty. With
 * an illustration it is the page's main content: the character stands on a
 * stage beside the message, the same way the dashboard's guide does. With an
 * icon it is a compact message for a state that will pass.
 *
 * It sits inside the page's own card and has no card of its own.
 */
const IllustratedState = ({
  illustration,
  icon,
  tone = 'neutral',
  title,
  description,
  actions
}: IllustratedStateProps) => {
  const theme = useTheme()
  const titleId = useId()

  const message = (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE_OUT, delay: illustration ? 0.12 : 0 }}
    >
      <Typography
        id={titleId}
        component='h2'
        sx={{
          color: 'text.primary',
          fontWeight: 700,
          fontSize: illustration ? { xs: '1.375rem', md: '1.625rem' } : '1.125rem',
          lineHeight: 1.25,
          letterSpacing: '-0.01em'
        }}
      >
        {title}
      </Typography>
      <Typography
        component='div'
        sx={{
          mt: 2,
          mx: { xs: 'auto', md: illustration ? 0 : 'auto' },
          maxWidth: '44ch',
          color: 'text.secondary',
          fontSize: illustration ? '1rem' : '0.9375rem',
          lineHeight: 1.6
        }}
      >
        {description}
      </Typography>
      {actions && (
        <Box
          sx={{
            mt: 5,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            justifyContent: { xs: 'center', md: illustration ? 'flex-start' : 'center' }
          }}
        >
          {actions}
        </Box>
      )}
    </motion.div>
  )

  if (!illustration) {
    const ink = tone === 'error' ? theme.palette.error.main : accentInk(theme)
    const wash = tone === 'error' ? theme.palette.error.main : theme.palette.primary.main

    return (
      <MotionConfig reducedMotion='user'>
        <Box
          component='section'
          aria-labelledby={titleId}
          sx={{ px: { xs: 5, sm: 8 }, py: { xs: 10, sm: 12 }, textAlign: 'center' }}
        >
          <Box
            aria-hidden
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 56,
              height: 56,
              mx: 'auto',
              mb: 4,
              borderRadius: '16px',
              color: ink,
              bgcolor: alpha(wash, theme.palette.mode === 'light' ? 0.1 : 0.16)
            }}
          >
            <Icon icon={icon ?? 'tabler:info-circle'} fontSize='1.75rem' />
          </Box>
          {message}
        </Box>
      </MotionConfig>
    )
  }

  return (
    <MotionConfig reducedMotion='user'>
      <Box
        component='section'
        aria-labelledby={titleId}
        sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 5fr) minmax(0, 7fr)' } }}
      >
        <Box
          aria-hidden
          sx={{
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            minHeight: { xs: 200, md: 340 },
            pt: 6,
            background: stageBackground
          }}
        >
          <StageBackdrop
            sx={{
              left: '50%',
              bottom: { xs: -90, md: -110 },
              width: { xs: 250, md: 320 },
              height: { xs: 250, md: 320 },
              transform: 'translateX(-50%)'
            }}
          />
          <Box sx={{ position: 'relative', height: { xs: 176, md: 270 } }}>
            <motion.img
              src={illustration}
              alt=''
              draggable={false}
              initial={{ opacity: 0, y: 28, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              style={{ display: 'block', height: '100%', width: 'auto', transformOrigin: 'bottom center' }}
            />
          </Box>
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            textAlign: { xs: 'center', md: 'left' },
            px: { xs: 5, sm: 8 },
            py: { xs: 7, md: 10 }
          }}
        >
          {message}
        </Box>
      </Box>
    </MotionConfig>
  )
}

export default IllustratedState
