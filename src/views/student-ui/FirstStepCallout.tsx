// ** React Imports
import { ReactNode, useId } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'

// ** Third Party Imports
import { MotionConfig, motion } from 'framer-motion'

// ** Local Imports
import StageBackdrop, { stageBackground } from './StageBackdrop'
import { accentInk } from './readableAccent'

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1]

interface FirstStepCalloutProps {
  /** A character from STUDENT_ILLUSTRATIONS, the same one the dashboard guide uses for this step. */
  illustration: string
  eyebrow: string
  title: string
  description: ReactNode
  action: ReactNode
}

/**
 * Points a student who has not started yet at one concrete item: the lesson
 * or test to begin with. It continues the dashboard guide's step on the page
 * where that step happens, and goes away once the student has done it.
 */
const FirstStepCallout = ({ illustration, eyebrow, title, description, action }: FirstStepCalloutProps) => {
  const theme = useTheme()
  const titleId = useId()

  return (
    <MotionConfig reducedMotion='user'>
      <motion.section
        aria-labelledby={titleId}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: EASE_OUT }}
        style={{ position: 'relative' }}
      >
        <Box
          sx={{
            position: 'relative',

            // Clip, not hide: the halo reaches past the edge, and a hidden-overflow box
            // would scroll its own content when the button inside takes focus.
            overflow: 'hidden',
            '@supports (overflow: clip)': { overflow: 'clip' },
            borderRadius: '16px',
            minHeight: { xs: 184, md: 200 },
            background: stageBackground
          }}
        >
          <StageBackdrop
            sx={{
              right: { xs: -60, sm: -20, md: 48 },
              bottom: { xs: -100, md: -120 },
              width: { xs: 220, md: 270 },
              height: { xs: 220, md: 270 }
            }}
          />
          <Box
            sx={{
              position: 'relative',
              zIndex: 1,
              px: { xs: 5, md: 7 },
              py: { xs: 5, md: 6 },
              pr: { xs: '124px', sm: '180px', md: '320px' }
            }}
          >
            <Typography
              component='p'
              sx={{
                mb: 1,
                fontSize: '0.8125rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: accentInk(theme)
              }}
            >
              {eyebrow}
            </Typography>
            <Typography
              id={titleId}
              component='h2'
              sx={{
                color: 'text.primary',
                fontWeight: 700,
                fontSize: { xs: '1.25rem', md: '1.5rem' },
                lineHeight: 1.25,
                letterSpacing: '-0.01em',
                overflowWrap: 'anywhere'
              }}
            >
              {title}
            </Typography>
            <Typography
              component='div'
              variant='body2'
              sx={{ mt: 1.5, maxWidth: '52ch', color: 'text.secondary', lineHeight: 1.6 }}
            >
              {description}
            </Typography>
            <Box sx={{ mt: 4 }}>{action}</Box>
          </Box>
          <Box
            aria-hidden
            sx={{
              position: 'absolute',
              right: { xs: 0, sm: 16, md: 96 },
              bottom: 0,
              height: { xs: 136, sm: 160, md: 190 },

              // Wide characters shrink to fit instead of reaching the text.
              width: { xs: 124, sm: 180, md: 260 },
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'flex-end'
            }}
          >
            <motion.img
              src={illustration}
              alt=''
              draggable={false}
              initial={{ opacity: 0, y: 24, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22, delay: 0.15 }}
              style={{
                display: 'block',
                height: '100%',
                width: 'auto',
                maxWidth: '100%',
                objectFit: 'contain',
                objectPosition: 'bottom',
                transformOrigin: 'bottom center'
              }}
            />
          </Box>
        </Box>
      </motion.section>
    </MotionConfig>
  )
}

export default FirstStepCallout
