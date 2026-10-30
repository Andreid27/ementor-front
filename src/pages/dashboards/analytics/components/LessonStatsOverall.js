// ** MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

// ** Third Party Imports
import { MotionConfig, motion } from 'framer-motion'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components Imports
import InsightCard from 'src/views/student-ui/InsightCard'
import { formatStudyTime } from 'src/views/student-ui/format'
import { countLabel } from 'src/views/student-ui/countLabel'
import { accentInk } from 'src/views/student-ui/readableAccent'

// Past this many chapters the rest are grouped, so the card keeps one size.
const SHOWN_CHAPTERS = 4

/**
 * Study time per chapter, as labelled bars rather than an unlabelled donut, and
 * how many of the opened lessons were read to the end. Written for both
 * readers: the student on their dashboard and the professor looking at one
 * student.
 */
const LessonStatsOverall = ({ data }) => {
  const theme = useTheme()

  const chapters = [...(data?.studentChaptersTime ?? [])].sort((a, b) => b.time - a.time)
  const shown = chapters.slice(0, SHOWN_CHAPTERS)
  const others = chapters.slice(SHOWN_CHAPTERS)
  if (others.length) {
    shown.push({
      chapterTitle: others.length === 1 ? 'Încă un capitol' : `Alte ${countLabel(others.length, '', 'capitole')}`,
      time: others.reduce((sum, chapter) => sum + chapter.time, 0)
    })
  }

  const totalSeconds = chapters.reduce((sum, chapter) => sum + chapter.time, 0)
  const longest = Math.max(...shown.map(chapter => chapter.time), 1)

  const opened = data?.lastAccessedLessons ?? []
  const readToEnd = opened.filter(lesson => lesson.timeToRead && lesson.totalTime >= lesson.timeToRead).length

  return (
    <MotionConfig reducedMotion='user'>
      <InsightCard
        title='Timp de studiu'
        subtitle='Pe capitole, din lecțiile deschise'
        aside={
          totalSeconds > 0 && (
            <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
              <Typography sx={{ fontWeight: 700, fontSize: '1.5rem', lineHeight: 1.1, color: 'text.primary' }}>
                {formatStudyTime(totalSeconds)}
              </Typography>
              <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                în total
              </Typography>
            </Box>
          )
        }
      >
        {totalSeconds === 0 ? (
          <Typography variant='body2' sx={{ color: 'text.secondary' }}>
            Încă nu există timp de studiu. Apare după prima lecție deschisă.
          </Typography>
        ) : (
          <>
            <Box component='ul' sx={{ listStyle: 'none', m: 0, p: 0 }}>
              {shown.map((chapter, index) => (
                <Box
                  component='li'
                  key={`${index}-${chapter.chapterTitle}`}
                  sx={{ mb: index === shown.length - 1 ? 0 : 4 }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 3, mb: 1.5 }}>
                    <Typography
                      variant='body2'
                      sx={{
                        color: 'text.primary',
                        fontWeight: 500,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {chapter.chapterTitle}
                    </Typography>
                    <Typography variant='body2' sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>
                      {formatStudyTime(chapter.time)}
                    </Typography>
                  </Box>
                  <Box
                    aria-hidden
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      overflow: 'hidden',
                      bgcolor: alpha(theme.palette.text.primary, 0.08)
                    }}
                  >
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: chapter.time / longest }}
                      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 + index * 0.06 }}
                      style={{
                        height: '100%',
                        borderRadius: 4,
                        transformOrigin: 'left',
                        background: theme.palette.primary.main
                      }}
                    />
                  </Box>
                </Box>
              ))}
            </Box>

            {opened.length > 0 && (
              <Box
                sx={{
                  mt: 'auto',
                  pt: 5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  color: 'text.secondary',
                  fontSize: '0.875rem'
                }}
              >
                <Icon icon='tabler:circle-check' fontSize='1.125rem' color={accentInk(theme)} aria-hidden />
                <span>
                  <Box component='strong' sx={{ color: 'text.primary', fontWeight: 600 }}>
                    {readToEnd} din {opened.length}
                  </Box>{' '}
                  {opened.length === 1 ? 'lecție deschisă, citită' : 'lecții deschise, citite'} până la capăt
                </span>
              </Box>
            )}
          </>
        )}
      </InsightCard>
    </MotionConfig>
  )
}

export default LessonStatsOverall
