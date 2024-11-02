// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'

// ** Third Party Imports
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components Imports
import CustomChip from 'src/@core/components/mui/chip'
import { useTheme } from '@emotion/react'


const CustomTooltip = props => {
  // ** Props
  const { active, payload } = props
  if (active && payload) {
    return (
      <div className='recharts-custom-tooltip'>
        <Typography sx={{ fontSize: theme => theme.typography.body2.fontSize }}>{`${payload[0].payload.correctAnswers}/${payload[0].payload.totalQuestions} = ${payload[0].value}%`}</Typography>
      </div>
    )
  }

  return null
}

const LastTestResults = ({ direction, data }) => {
  const theme = useTheme()
  const graphDataSort = data.lastMonthQuizzesResults.map(item => ({ ...item }))
  graphDataSort.sort((a, b) => new Date(a.date) - new Date(b.date))

  let correctAnswers = 0
  let totalQuestions = 0


  graphDataSort.forEach(item => {
    const date = new Date(item.date)
    item.date = `${date.getDate()}/${date.getMonth() + 1}`
    correctAnswers += item.correctAnswers
    totalQuestions += item.totalQuestions
    item.result = parseFloat(item.result).toFixed(2)
  })
  const graphData = graphDataSort
  let monthAverage = parseFloat(correctAnswers * 100 / totalQuestions).toFixed(2)
  function getMonthDelta(data) {
    if (data && data.questions && data.questions.totalQuestions === 0) {
      return [0, 'info']
    }
    let totalAvarage = data.questions.correctQuestions * 100 / data.questions.totalQuestions
    let delta = parseFloat(monthAverage - totalAvarage).toFixed(2)
    if (delta < 0) {
      return [Math.abs(delta), 'error']
    } else if (delta == 0) {
      return [delta, 'info']
    } else {
      return [delta, 'success']
    }
  }
  let [monthDelta, monthDeltaStatus] = getMonthDelta(data)

  function getChipContent(monthDeltaStatus) {

    if (monthDeltaStatus === 'error') {
      return (
        <>
          <Icon icon='tabler:arrow-down' fontSize='1rem' />
          <span>{monthDelta}%</span>
        </>
      )
    } else if (monthDeltaStatus === 'success') {
      return (
        <>
          <Icon icon='tabler:arrow-up' fontSize='1rem' />
          <span>{monthDelta}%</span>
        </>
      )
    } else {
      return (
        <>
          <Icon icon='tabler:point' fontSize='1rem' />
          <span>{monthDelta}%</span>
        </>
      )
    }
  }

  function getMonthAverageColor(monthAverage) {
    if (monthAverage >= 80) {
      return theme.palette.success.main
    } else if (monthAverage > 50) {
      return theme.palette.warning.main
    } else {
      return theme.palette.error.main
    }
  }


  return (
    <Card>
      {graphData.length ? (
        <>
          <CardHeader
            title='Rezultate teste lunare'
            subheader='Rezultatele tale din ultimile 30 de zile.'
            subheaderTypographyProps={{ sx: { color: theme => `${theme.palette.text.disabled} !important` } }}
            sx={{
              flexDirection: ['column', 'row'],
              alignItems: ['flex-start', 'center'],
              '& .MuiCardHeader-action': { mb: 0 },
              '& .MuiCardHeader-content': { mb: [2, 0] }
            }}
            action={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant='h6' color={getMonthAverageColor(monthAverage)} sx={{ mr: 5, fontWeight: 1000 }}>
                  %{monthAverage}
                </Typography>
                <CustomChip
                  skin='light'
                  color={monthDeltaStatus}
                  sx={{ fontWeight: 500, borderRadius: 1, fontSize: theme => theme.typography.body2.fontSize }}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', '& svg': { mr: 1 } }}>
                      {getChipContent(monthDeltaStatus)}
                    </Box>
                  }
                />
              </Box>
            }
          />
          <CardContent>
            <Box sx={{ height: 350 }}>

              <ResponsiveContainer>
                <LineChart height={350} data={graphData} style={{ direction }} margin={{ left: -20 }}>
                  <CartesianGrid />
                  <XAxis dataKey='date' reversed={direction === 'rtl'} />
                  <YAxis orientation={direction === 'rtl' ? 'right' : 'left'} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line dataKey='result' stroke={getMonthAverageColor(monthAverage)} strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </>
      ) : (
        <>
          <CardHeader
            title='Rezultate teste lunare'
            subheader='Rezultatele tale din ultimile 30 de zile.'
            subheaderTypographyProps={{ sx: { color: theme => `${theme.palette.text.disabled} !important` } }}
            sx={{
              flexDirection: ['column', 'row'],
              alignItems: ['flex-start', 'center'],
              '& .MuiCardHeader-action': { mb: 0 },
              '& .MuiCardHeader-content': { mb: [2, 0] }
            }}
          />
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <Typography variant='h6'>Nu ai susținut niciun test în ultimele 30 de zile</Typography>
            </Box>
          </CardContent>
        </>
      )}

    </Card>
  )
}

export default LastTestResults
