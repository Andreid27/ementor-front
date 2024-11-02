// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import { useTheme } from '@mui/material/styles'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'

// ** Custom Components Imports
import Icon from 'src/@core/components/icon'
import OptionsMenu from 'src/@core/components/option-menu'
import CustomAvatar from 'src/@core/components/mui/avatar'
import ReactApexcharts from 'src/@core/components/react-apexcharts'

// ** Util Import
import { hexToRGBA } from 'src/@core/utils/hex-to-rgba'

const StudentStatsQuestions = props => {
  let data = [
    {
      subtitle: props.questions.correctQuestions,
      title: 'Întrebări corecte',
      avatarIcon: 'tabler:circle-check'
    },
    {
      subtitle: props.questions.totalQuestions - props.questions.correctQuestions,
      avatarColor: 'warning',
      title: 'Întrebări greșite',
      avatarIcon: 'tabler:circle-dashed-x'
    }
  ]
  let correctPercentage = ((props.questions.correctQuestions / props.questions.totalQuestions) * 100).toFixed(2)


  // ** Hook
  const theme = useTheme()

  const options = {
    chart: {
      sparkline: { enabled: true }
    },
    stroke: { dashArray: 10 },
    labels: ['Media răspunsurilor tale'],
    colors: [hexToRGBA(theme.palette.primary.main, 1)],
    states: {
      hover: {
        filter: { type: 'none' }
      },
      active: {
        filter: { type: 'none' }
      }
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'dark',
        opacityTo: 0.5,
        opacityFrom: 1,
        shadeIntensity: 0.5,
        stops: [30, 70, 100],
        inverseColors: false,
        gradientToColors: [theme.palette.primary.main]
      }
    },
    plotOptions: {
      radialBar: {
        endAngle: 130,
        startAngle: -140,
        hollow: { size: '60%' },
        track: { background: 'transparent' },
        dataLabels: {
          name: {
            offsetY: -15,
            color: theme.palette.text.disabled,
            fontFamily: theme.typography.fontFamily,
            fontSize: theme.typography.body2.fontSize
          },
          value: {
            offsetY: 15,
            fontWeight: 500,
            formatter: value => `${correctPercentage}%`,
            color: theme.palette.text.primary,
            fontFamily: theme.typography.fontFamily,
            fontSize: theme.typography.h1.fontSize
          }
        }
      }
    },
    grid: {
      padding: {
        top: -30,
        bottom: 12
      }
    },
    responsive: [
      {
        breakpoint: 1300,
        options: {
          grid: {
            padding: {
              left: 22
            }
          }
        }
      },
      {
        breakpoint: theme.breakpoints.values.md,
        options: {
          grid: {
            padding: {
              left: 0
            }
          }
        }
      }
    ]
  }

  function handleColorChange(options) {
    if (correctPercentage === 'NaN') return

    if (correctPercentage < 50) {
      options.colors = [hexToRGBA(theme.palette.error.main, 1)]
      options.fill.gradient.gradientToColors = [theme.palette.error.main]
    } else if (correctPercentage < 75) {
      options.colors = [hexToRGBA(theme.palette.warning.main, 1)]
      options.fill.gradient.gradientToColors = [theme.palette.warning.main]
    } else {
      options.colors = [hexToRGBA(theme.palette.primary.main, 1)]
      options.fill.gradient.gradientToColors = [theme.palette.primary.main]
    }

    return options
  }

  return (
    <Card>
      <CardHeader
        title='Evoluția ta per total'
        subheader='Aici poți vedea progresul tău de-a lungul tuturor testelor parcurse 😊'
      />
      <CardContent>
        <Grid container spacing={6}>
          <Grid item xs={12} sm={5}>
            <Typography variant='h1'>{props.questions.totalQuestions}</Typography>
            <Typography sx={{ mb: 6, color: 'text.secondary' }}>Total întrebări</Typography>
            {data.map((item, index) => (
              <Box
                key={index}
                sx={{ display: 'flex', alignItems: 'center', mb: index !== data.length - 1 ? 4 : undefined }}
              >
                <CustomAvatar
                  skin='light'
                  variant='rounded'
                  color={item.avatarColor}
                  sx={{ mr: 4, width: 34, height: 34 }}
                >
                  <Icon icon={item.avatarIcon} />
                </CustomAvatar>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <Typography variant='h6'>{item.title}</Typography>
                  <Typography variant='body2' sx={{ color: 'text.disabled' }}>
                    {item.subtitle}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Grid>
          <Grid item xs={12} sm={7} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {correctPercentage === 'NaN' ? <Typography variant='h2'>Nu există încă suficiente date.</Typography> :
              <ReactApexcharts type='radialBar' height={325} options={handleColorChange(options)} series={[correctPercentage]} />

            }
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default StudentStatsQuestions
