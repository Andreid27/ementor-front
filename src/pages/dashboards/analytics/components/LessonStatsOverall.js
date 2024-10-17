// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'

// ** Icons Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components Imports
import ReactApexcharts from 'src/@core/components/react-apexcharts'

// ** Util Import
import { hexToRGBA } from 'src/@core/utils/hex-to-rgba'


const LessonStatsOverall = props => {
  // ** Hook
  const theme = useTheme()

  const chapters = props.data.studentChaptersTime.map(item => ({ ...item })).sort((a, b) => b.time - a.time)
  const series = chapters.map(chapter => parseInt(chapter.time / 60))
  const labels = chapters.map(chapter => chapter.chapterTitle)
  const lastAccessedLessons = props.data.lastAccessedLessons.map(item => ({ ...item }))

  function getDoneLessons() {
    let doneLessons = 0
    lastAccessedLessons.forEach(lesson => {
      if (lesson.timeToRead <= lesson.totalTime) {
        doneLessons++
      }
    })

    return doneLessons
  }

  const doneLessons = getDoneLessons()
  const doneLessonsPercent = parseFloat(doneLessons / lastAccessedLessons.length * 100).toFixed(2)

  const options = {
    colors: [
      hexToRGBA(theme.palette.success.main, 0.9),  // Success - Strong
      hexToRGBA(theme.palette.success.main, 0.7),  // Success - Moderate
      hexToRGBA(theme.palette.success.main, 0.5),  // Success - Light
      hexToRGBA(theme.palette.success.main, 0.3),  // Success - Faint
      hexToRGBA(theme.palette.success.main, 0.1),  // Success - Very Faint
      hexToRGBA(theme.palette.info.main, 0.9),     // Info - Strong
      hexToRGBA(theme.palette.info.main, 0.7),     // Info - Moderate
      hexToRGBA(theme.palette.info.main, 0.5),     // Info - Light
      hexToRGBA(theme.palette.info.main, 0.3),     // Info - Faint
      hexToRGBA(theme.palette.info.main, 0.1),     // Info - Very Faint
      hexToRGBA("#a577ba", 0.9),  // Primary - Strong
      hexToRGBA("#a577ba", 0.7),  // Primary - Moderate
      hexToRGBA("#a577ba", 0.5),  // Primary - Light
      hexToRGBA("#a577ba", 0.3),  // Primary - Faint
      hexToRGBA("#a577ba", 0.1),  // Primary - Very Faint
    ],
    stroke: { width: 0 },
    legend: { show: false },
    tooltip: { enabled: false },
    dataLabels: { enabled: false },
    labels: labels,
    states: {
      hover: {
        filter: { type: 'none' }
      },
      active: {
        filter: { type: 'none' }
      }
    },
    grid: {
      padding: {
        top: -22,
        bottom: -18
      }
    },
    plotOptions: {
      pie: {
        customScale: 0.8,
        expandOnClick: false,
        donut: {
          size: '73%',
          labels: {
            show: true,
            name: {
              offsetY: 22,
              color: theme.palette.text.secondary,
              fontFamily: theme.typography.fontFamily
            },
            value: {
              offsetY: -17,
              fontWeight: 500,
              formatter: val => `${val}`,
              color: theme.palette.text.primary,
              fontFamily: theme.typography.fontFamily,
              fontSize: theme.typography.h2.fontSize
            },
            total: {
              show: true,
              label: 'Minute',
              color: theme.palette.text.secondary,
              fontFamily: theme.typography.fontFamily,
              fontSize: theme.typography.h5.fontSize
            }
          }
        }
      }
    },
    responsive: [
      {
        breakpoint: theme.breakpoints.values.lg,
        options: {
          chart: { width: 200, height: 249 }
        }
      },
      {
        breakpoint: theme.breakpoints.values.md,
        options: {
          chart: { width: 150, height: 199 }
        }
      }
    ]
  }

  function getTitle() {
    if ((doneLessons > 1)) {
      return `${doneLessons} lecții parcurse`
    } else if (doneLessons > 0) {
      return `O lecție parcursă`
    } else {
      return 'Nicio lecție parcursă încă'
    }
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ gap: 2, display: 'flex', alignItems: 'stretch', justifyContent: 'space-between' }}>
          <Box sx={{ gap: 1.75, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <Typography variant='h5' sx={{ mb: 0.5 }}>
                Timp de recapitulare lecții
              </Typography>
              <Typography variant='body2'>Timpul petrecut pentru fiecare lecție</Typography>
            </div>
            <div>
              <Typography variant='h3'>{getTitle()}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', '& svg': { mr: 1, color: 'success.main' } }}>
                <Typography variant='h6' sx={{ color: doneLessonsPercent >= 80 ? 'success.main' : 'error.main' }}>
                  ~{doneLessonsPercent > 0 ? doneLessonsPercent : 0}% din lecțiile asignate
                </Typography>
              </Box>
            </div>
          </Box>
          <ReactApexcharts type='donut' width={150} height={165} series={series} options={options} />
        </Box>
      </CardContent>
    </Card>
  )
}

export default LessonStatsOverall
