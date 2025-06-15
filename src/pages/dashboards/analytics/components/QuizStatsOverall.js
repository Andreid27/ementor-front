// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'

const QuizStatsOverall = props => {
  // ** Hook
  const theme = useTheme()

  const quizData = props.data || {}
  const completedQuizzes = quizData.completedQuizzes || 0
  const totalQuestions = quizData.totalQuestions || 0
  const correctQuestions = quizData.correctQuestions || 0
  const lastMonthQuizTime = quizData.lastMonthQuizTime || 0

  const formatTime = (seconds) => {
    if (seconds < 60) return `${seconds} secunde`
    if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60)
      return `${minutes} minut${minutes === 1 ? '' : 'e'}`
    }
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours} or${hours === 1 ? 'ă' : 'e'} ${minutes} minut${minutes === 1 ? '' : 'e'}`
  }

  const StatRow = ({ label, value }) => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
      <Typography variant='body1' sx={{ color: 'text.primary', flex: 1, mr: 1 }}>
        {label}
      </Typography>
      <Typography 
        variant='body1' 
        sx={{ 
          fontWeight: 600, 
          color: 'text.primary',
          textAlign: 'right',
          flex: 1
        }}
      >
        {value}
      </Typography>
    </Box>
  )

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Header with title and completed count */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant='h6' sx={{ fontWeight: 600, color: 'primary.main', flex: 1 }}>
              Testele tale
            </Typography>
            <Chip
              label={`${completedQuizzes} completate`}
              size="small"
              sx={{
                backgroundColor: theme.palette.primary.main + '1A', // 10% opacity
                color: 'primary.main',
                fontWeight: 600,
                ml: 1
              }}
            />
          </Box>

          {/* Stats rows */}
          <Box sx={{ mt: 1 }}>
            <StatRow 
              label="Întrebări răspunse" 
              value={totalQuestions.toString()} 
            />
            <StatRow 
              label="Răspunsuri corecte" 
              value={correctQuestions.toString()} 
            />
            <StatRow 
              label="Timp petrecut (ultima lună)" 
              value={formatTime(lastMonthQuizTime)} 
            />
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

export default QuizStatsOverall
