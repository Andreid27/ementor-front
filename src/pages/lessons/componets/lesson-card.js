// ** Next Import
import Link from 'next/link'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import CardActionArea from '@mui/material/CardActionArea'
import Skeleton from '@mui/material/Skeleton'
import LinearProgress from '@mui/material/LinearProgress'
import { alpha, useTheme } from '@mui/material/styles'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components Imports
import EmentorAvatar, { UserType } from 'src/@core/components/ementor-avatar'
import StatusPill from 'src/views/student-ui/StatusPill'
import { accentInk } from 'src/views/student-ui/readableAccent'

/**
 * A lesson is listed when the professor made it visible, or once its start
 * date has passed. A visible lesson whose start date is still ahead shows as
 * scheduled and cannot be opened yet.
 */
export const isLessonListed = (lesson, now = new Date()) =>
  Boolean(lesson.isVisible) || Boolean(lesson.startAfter && new Date(lesson.startAfter) <= now)

/** 'scheduled' | 'new' | 'reading' | 'read'. Read means the time spent reached the estimated reading time. */
export const getLessonState = (lesson, now = new Date()) => {
  if (lesson.startAfter && new Date(lesson.startAfter) > now) return 'scheduled'
  if (!lesson.firstRead) return 'new'
  if (lesson.timeToRead && lesson.totalTime >= lesson.timeToRead) return 'read'

  return 'reading'
}

export const readingProgress = lesson =>
  lesson.timeToRead ? Math.min(99, Math.round(((lesson.totalTime || 0) / lesson.timeToRead) * 100)) : 0

export const readingMinutes = lesson => (lesson.timeToRead ? Math.max(1, Math.round(lesson.timeToRead / 60)) : null)

export const formatLessonDate = iso =>
  new Date(iso).toLocaleString('ro-RO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

const STATES = {
  new: { tone: 'accent', icon: 'tabler:sparkles', label: 'Nouă', action: 'Începe lecția', tileIcon: 'tabler:book-2' },
  reading: { tone: 'info', icon: 'tabler:book', label: 'În curs', action: 'Continuă', tileIcon: 'tabler:book' },
  read: {
    tone: 'neutral',
    icon: 'tabler:circle-check',
    label: 'Citită',
    action: 'Recitește',
    tileIcon: 'tabler:book-2'
  },
  scheduled: { tone: 'neutral', icon: 'tabler:lock', label: 'Programată', action: null, tileIcon: 'tabler:lock' }
}

const LessonCard = ({ lesson, professor }) => {
  const theme = useTheme()
  const state = getLessonState(lesson)
  const config = STATES[state]
  const progress = readingProgress(lesson)
  const minutes = readingMinutes(lesson)
  const ink = accentInk(theme)
  const locked = state === 'scheduled'

  const content = (
    <Box sx={{ height: '100%', p: { xs: 5, sm: 6 }, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
        <Box
          aria-hidden
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 44,
            height: 44,
            borderRadius: '12px',
            flexShrink: 0,
            color: locked ? 'text.secondary' : ink,
            bgcolor: locked
              ? alpha(theme.palette.text.secondary, 0.08)
              : alpha(theme.palette.primary.main, theme.palette.mode === 'light' ? 0.1 : 0.16)
          }}
        >
          <Icon icon={config.tileIcon} fontSize='1.375rem' />
        </Box>
        <StatusPill tone={config.tone} icon={config.icon}>
          {state === 'reading' ? `${config.label} · ${progress}%` : config.label}
        </StatusPill>
      </Box>

      <Typography
        component='h2'
        sx={{ mt: 4, fontWeight: 600, fontSize: '1.0625rem', lineHeight: 1.35, color: 'text.primary' }}
      >
        {lesson.title || 'Lecție fără titlu'}
      </Typography>
      {lesson.chapterTitles && (
        <Typography variant='body2' sx={{ mt: 0.5, color: 'text.secondary' }}>
          {lesson.chapterTitles}
        </Typography>
      )}

      {state === 'reading' && (
        <LinearProgress
          variant='determinate'
          value={progress}
          aria-label={`Citită ${progress}%`}
          sx={{ mt: 4, height: 6, borderRadius: 3 }}
        />
      )}

      <Box
        sx={{
          mt: 'auto',
          pt: 4,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          columnGap: 4,
          rowGap: 1.5,
          color: 'text.secondary',
          fontSize: '0.875rem'
        }}
      >
        {minutes && (
          <Box component='span' sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.5 }}>
            <Icon icon='tabler:clock' fontSize='1rem' />
            {minutes} min de citit
          </Box>
        )}
        {professor && (
          <Box component='span' sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
            <EmentorAvatar
              userId={professor.id}
              userType={UserType.PROFESSOR}
              alt=''
              sx={{ width: 20, height: 20, fontSize: '0.6rem', flexShrink: 0 }}
            />
            <Box component='span' sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {professor.fullName}
            </Box>
          </Box>
        )}
      </Box>

      <Box
        sx={{
          mt: 4,
          pt: 4,
          borderTop: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          fontWeight: 600,
          fontSize: '0.9375rem',
          color: locked ? 'text.secondary' : ink
        }}
      >
        {locked ? (
          <>
            <Icon icon='tabler:calendar-event' fontSize='1.125rem' />
            Se deschide pe {formatLessonDate(lesson.startAfter)}
          </>
        ) : (
          <>
            {config.action}
            <Icon icon='tabler:arrow-right' fontSize='1.125rem' />
          </>
        )}
      </Box>
    </Box>
  )

  return (
    <Card
      component='article'
      sx={{
        height: '100%',
        boxShadow: 'none',
        border: `1px solid ${theme.palette.divider}`,
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
        ...(locked
          ? { bgcolor: alpha(theme.palette.text.secondary, 0.03) }
          : {
              '&:hover': {
                borderColor: alpha(theme.palette.primary.main, 0.6),
                boxShadow: `0 6px 20px ${alpha(theme.palette.common.black, 0.06)}`
              }
            })
      }}
    >
      {locked ? (
        content
      ) : (
        <CardActionArea
          component={Link}
          href={`/lesson/${lesson.lessonStudentId}`}
          sx={{ height: '100%', alignItems: 'stretch' }}
        >
          {content}
        </CardActionArea>
      )}
    </Card>
  )
}

/** The card's exact layout with placeholders, so the list does not shift when the lessons arrive. */
export const LessonCardSkeleton = () => {
  const theme = useTheme()

  return (
    <Card aria-hidden sx={{ height: '100%', boxShadow: 'none', border: `1px solid ${theme.palette.divider}` }}>
      <Box sx={{ height: '100%', p: { xs: 5, sm: 6 }, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
          <Skeleton variant='rounded' width={44} height={44} sx={{ borderRadius: '12px' }} />
          <Skeleton variant='rounded' width={72} height={23} sx={{ borderRadius: 999 }} />
        </Box>
        <Typography component='div' sx={{ mt: 4, fontSize: '1.0625rem', lineHeight: 1.35 }}>
          <Skeleton width='70%' />
        </Typography>
        <Typography component='div' variant='body2' sx={{ mt: 0.5 }}>
          <Skeleton width='45%' />
        </Typography>
        <Box sx={{ mt: 'auto', pt: 4, fontSize: '0.875rem', lineHeight: 1.5 }}>
          <Skeleton width='65%' />
        </Box>
        <Box
          sx={{
            mt: 4,
            pt: 4,
            borderTop: `1px solid ${theme.palette.divider}`,
            fontSize: '0.9375rem',
            lineHeight: 1.5,
            minHeight: 18
          }}
        >
          <Skeleton width={110} />
        </Box>
      </Box>
    </Card>
  )
}

export default LessonCard
