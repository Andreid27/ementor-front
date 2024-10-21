// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Avatar from '@mui/material/Avatar'
import { styled } from '@mui/material/styles'
import TimelineDot from '@mui/lab/TimelineDot'
import TimelineItem from '@mui/lab/TimelineItem'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import TimelineContent from '@mui/lab/TimelineContent'
import TimelineSeparator from '@mui/lab/TimelineSeparator'
import TimelineConnector from '@mui/lab/TimelineConnector'
import MuiTimeline from '@mui/lab/Timeline'
import MuiCardHeader from '@mui/material/CardHeader'

// ** Custom Components Imports
import Icon from 'src/@core/components/icon'
import OptionsMenu from 'src/@core/components/option-menu'
import timeAgo from 'src/@core/utils/time-ago'
import timeBetween from 'src/@core/utils/time-between'
import { CircularProgress } from '@mui/material'

// Styled Timeline component
const Timeline = styled(MuiTimeline)({
  '& .MuiTimelineItem-root': {
    width: '100%',
    '&:before': {
      display: 'none'
    }
  }
})

const CardHeader = styled(MuiCardHeader)(({ theme }) => ({
  '& .MuiTypography-root': {
    lineHeight: 1.6,
    fontWeight: 500,
    fontSize: '1.125rem',
    letterSpacing: '0.15px',
    [theme.breakpoints.up('sm')]: {
      fontSize: '1.25rem'
    }
  }
}))

const CardActivityTimeline = props => {

  function handleColorChange(correctPercentage) {
    let color = 'info'

    if (correctPercentage < 50) {
      color = 'error'
    } else if (correctPercentage < 80) {
      color = 'warning'
    } else if (correctPercentage >= 80) {
      color = 'success'
    }

    return color
  }

  const getStudentName = (quizStudent) => {
    const student = props.users.find(user => user.id === quizStudent.studentId)

    return `${student.firstName} ${student.lastName}`
  }

  return (
    <Card>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', '& svg': { mr: 3 } }}>
            <Icon fontSize='1.25rem' icon='tabler:list-details' />
            <Typography>Activitate recentă teste</Typography>
          </Box>
        }
        action={
          <OptionsMenu
            options={['Refresh List', 'Setări']}
            iconButtonProps={{ size: 'small', sx: { color: 'text.disabled' } }}
          />
        }
      />
      <CardContent
        sx={{
          maxHeight: '460px', // Adjust this height based on the height of 4 timeline items
          overflowY: 'auto',
          paddingRight: 2,

          /* Hide the scrollbar */
          '&::-webkit-scrollbar': {
            display: 'none', /* Chrome, Safari, and Opera */
          },
          msOverflowStyle: 'none',  /* Internet Explorer 10+ */
          scrollbarWidth: 'none'  /* Firefox */
        }}
      >
        {props.loading ? (<CircularProgress />) : (
          <Timeline>
            {props.quizzesData.map((quizStudent, index) => (
              <TimelineItem key={index}>
                <TimelineSeparator>
                  <TimelineDot
                    color={handleColorChange(quizStudent.correctAnswers / quizStudent.questionsCount * 100)}
                    sx={{ mt: 1.5 }}
                  />
                  <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent sx={{ pt: 0, mt: 0, mb: theme => `${theme.spacing(2)} !important` }}>
                  <Box
                    sx={{
                      mb: 0.5,
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <Typography variant='h6' sx={{ mr: 2 }}>
                      {quizStudent.title}
                    </Typography>
                    <Typography variant='caption' sx={{ color: 'text.disabled' }}>
                      {timeAgo(quizStudent.startedAt)}
                    </Typography>
                  </Box>
                  <Typography variant='body2' sx={{ mb: 2.5 }}>
                    {quizStudent.correctAnswers} / {quizStudent.questionsCount} întrebări corecte
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar src={quizStudent.avatar} sx={{ mr: 3, width: 38, height: 38 }} />
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                      <Typography variant='body2' sx={{ fontWeight: 500, color: 'text.primary', ml: 1 }}>
                        {getStudentName(quizStudent)}
                      </Typography>
                      <Typography variant='caption'>
                        {quizStudent.endedTime ? (
                          <Typography variant='body2' sx={{ mb: 2.5 }}>
                            <Icon fontSize='.65rem' icon='tabler:clock-hour-9' />
                            Rezolvat în {timeBetween(quizStudent.startedAt, quizStudent.endedTime)}
                          </Typography>) : `Testul este în desfășurare, au mai rămas ${timeBetween(quizStudent.startedAt, quizStudent.endTime)} `}
                      </Typography>
                    </Box>
                  </Box>
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        )}

      </CardContent>
    </Card>
  )

}

export default CardActivityTimeline
