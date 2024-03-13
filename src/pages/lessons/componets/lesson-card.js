// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/system'
import Chip from '@mui/material/Chip'

// ** Icon Imports
import BookIcon from '@mui/icons-material/Book'
import CustomChip from 'src/@core/components/mui/chip'
import { Icon } from '@iconify/react'
import { CalendarMonth } from '@mui/icons-material'

const LessonCard = props => {
  const { lesson, selected, gridProps, handleChange, color = 'primary' } = props
  let isVisible = false
  let isDisabled = false

  const getLessonVisibility = () => {
    isVisible = lesson.isVisible
    const startAfter = new Date(lesson.startAfter)
    const now = new Date()
    isDisabled = lesson && lesson.startAfter && now < startAfter
    if (lesson && lesson.startAfter && !isVisible) {
      isVisible = now > startAfter
    }
  }

  const getBoxShadow = theme => {
    let boxShadow = `0 4px 6px 0 ${alpha(theme.palette.common.black, 0.07)}, 0 5px 15px ${alpha(
      theme.palette.common.black,
      0.1
    )}`
    if (lesson.firstRead === null && !isDisabled) {
      boxShadow = '0 0 10px 5px rgba(0, 255, 0, 0.5)'
    }
    if (isDisabled) {
      boxShadow = 'none'
    }

    return boxShadow
  }

  const renderComponent = () => {
    getLessonVisibility()

    return lesson && isVisible ? (
      <Grid item {...gridProps}>
        <Box
          onClick={() => !isDisabled && handleChange(lesson.lessonId)}
          sx={theme => ({
            p: 4,
            height: '100%',
            display: 'flex',
            borderRadius: 1,
            cursor: isDisabled ? 'not-allowed' : 'pointer',
            position: 'relative',
            alignItems: 'center',
            flexDirection: 'column',
            border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
            backgroundColor: isDisabled
              ? alpha(theme.palette.grey[500], 0.7)
              : alpha(theme.palette.background.paper, 0.7),
            backdropFilter: 'blur(10px)',
            boxShadow: `0 4px 6px 0 ${alpha(theme.palette.common.black, 0.07)}, 0 5px 15px ${alpha(
              theme.palette.common.black,
              0.1
            )}`,
            ...(selected === lesson.lessonId
              ? {
                  borderColor: `${color}.main`,
                  '& svg': { color: `${theme.palette.primary.main} !important` }
                }
              : { '&:hover': { borderColor: `rgba(${theme.palette.customColors.main}, 0.25)` } }),
            background: isDisabled
              ? `repeating-linear-gradient(
                  45deg,
                  ${theme.palette.grey[300]},
                  ${theme.palette.grey[300]} 10px,
                  ${theme.palette.grey[400]} 10px,
                  ${theme.palette.grey[400]} 20px
                )`
              : 'none',
            boxShadow: getBoxShadow(theme)
          })}
        >
          {lesson.firstRead === null && !isDisabled && (
            <Chip
              label='Nou'
              color='error'
              sx={{
                position: 'absolute',
                top: -3,
                right: -12,
                zIndex: 1,
                transform: 'rotate(30deg)'
              }}
            />
          )}
          <BookIcon color='primary' />
          {lesson.title && (
            <Typography variant='h6' sx={{ mt: 2 }}>
              {lesson.title}
            </Typography>
          )}
          {lesson.chapterTitles && (
            <Typography variant='body2' sx={{ mt: 2, textAlign: 'center' }}>
              {lesson.chapterTitles}
            </Typography>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
            <Icon icon='tabler:user' fontSize={20} color='#28C76F' />
            <Typography sx={{ color: 'text.secondary', mr: 2 }}>Dr. Drd. Angie Enache</Typography>
            <CalendarMonth color='primary' />
            <Typography variant='body2' sx={{ ml: 2 }}>
              {new Date(lesson.startAfter).toLocaleString('ro-RO', {
                timeZone: 'UTC',
                day: '2-digit',
                month: '2-digit',
                year: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
            {lesson.firstRead && lesson.totalTime && lesson.timeToRead && lesson.totalTime > lesson.timeToRead ? (
              <CustomChip label='Citit' skin='light' color='info' />
            ) : (
              <CustomChip label='Necitit' skin='light' color='warning' />
            )}
          </Box>
        </Box>
      </Grid>
    ) : null
  }

  return lesson ? renderComponent() : null
}

export default LessonCard
