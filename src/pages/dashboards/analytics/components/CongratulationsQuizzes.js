// ** Next Import
import Link from 'next/link'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'

// ** Third Party Imports
import { MotionConfig, motion } from 'framer-motion'

// ** Custom Components Imports
import StageBackdrop, { stageBackground } from 'src/views/student-ui/StageBackdrop'
import { STUDENT_ILLUSTRATIONS } from 'src/views/student-ui/illustrations'
import { accentButtonSx, accentInk } from 'src/views/student-ui/readableAccent'
import { countLabel } from 'src/views/student-ui/countLabel'
import { formatStudyTime } from 'src/views/student-ui/format'

const today = () => {
  const label = new Date().toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'long' })

  return label.charAt(0).toUpperCase() + label.slice(1)
}

/**
 * The student's welcome once the first-steps guide is done: today's date, what
 * they have done so far in one sentence, and the two places they go next. The
 * test character stands on the same stage as in the guide.
 */
const CongratulationsQuizzes = ({ firstName, completedQuizzes = 0, studySeconds = 0 }) => {
  const theme = useTheme()

  const progress = [
    completedQuizzes > 0 && `ai rezolvat ${countLabel(completedQuizzes, 'un test', 'teste')}`,
    studySeconds >= 60 && `ai studiat ${formatStudyTime(studySeconds)}`
  ].filter(Boolean)

  const summary = progress.length
    ? `Până acum ${progress.join(' și ')}. Continuă de unde ai rămas.`
    : 'Testele și lecțiile primite te așteaptă.'

  return (
    <MotionConfig reducedMotion='user'>
      <Card
        sx={{
          position: 'relative',

          // Clip, not hide: the halo reaches past the edge, and a hidden-overflow card
          // would scroll its own content when a button inside takes focus.
          overflow: 'hidden',
          '@supports (overflow: clip)': { overflow: 'clip' },
          height: '100%',
          minHeight: { xs: 240, md: 260 },
          background: stageBackground
        }}
      >
        <StageBackdrop
          sx={{
            right: { xs: -70, sm: -20, md: 0 },
            bottom: { xs: -110, md: -120 },
            width: { xs: 240, md: 280 },
            height: { xs: 240, md: 280 }
          }}
        />
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            p: { xs: 5, sm: 6 },
            pr: { xs: '128px', sm: '200px', md: '230px' }
          }}
        >
          <Typography
            component='p'
            sx={{
              mb: 1.5,
              fontSize: '0.8125rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: accentInk(theme)
            }}
          >
            {today()}
          </Typography>
          <Typography
            component='h1'
            sx={{
              color: 'text.primary',
              fontWeight: 700,
              fontSize: { xs: '1.625rem', md: '1.875rem' },
              lineHeight: 1.15,
              letterSpacing: '-0.02em'
            }}
          >
            {firstName ? `Salut, ${firstName}!` : 'Salut!'}
          </Typography>
          <Typography sx={{ mt: 2, maxWidth: '36ch', color: 'text.secondary', lineHeight: 1.55 }}>{summary}</Typography>
          <Box sx={{ mt: 'auto', pt: 5, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Button variant='contained' component={Link} href='/quizzes' sx={accentButtonSx}>
              Continuă testele
            </Button>
            <Button
              variant='text'
              component={Link}
              href='/lessons'
              sx={{ minHeight: 44, px: 3, fontWeight: 600, color: accentInk, width: { xs: '100%', sm: 'auto' } }}
            >
              Deschide cursurile
            </Button>
          </Box>
        </Box>
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            right: { xs: 0, sm: 24, md: 32 },
            bottom: 0,
            height: { xs: 150, sm: 190, md: 210 }
          }}
        >
          <motion.img
            src={STUDENT_ILLUSTRATIONS.tests}
            alt=''
            draggable={false}
            initial={{ opacity: 0, y: 24, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22, delay: 0.1 }}
            style={{ display: 'block', height: '100%', width: 'auto', transformOrigin: 'bottom center' }}
          />
        </Box>
      </Card>
    </MotionConfig>
  )
}

export default CongratulationsQuizzes
