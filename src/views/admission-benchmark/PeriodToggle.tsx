// ** MUI Imports
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import { alpha, useTheme } from '@mui/material/styles'

// ** Custom Components Imports
import { accentInk } from 'src/views/student-ui/readableAccent'

interface PeriodToggleProps {
  periods: { days: number; short: string }[]
  value: number
  onChange: (days: number) => void
}

/** The period switch of the results charts: full width on phones, compact beside other controls on wider screens. */
const PeriodToggle = ({ periods, value, onChange }: PeriodToggleProps) => {
  const theme = useTheme()

  return (
    <ToggleButtonGroup
      exclusive
      size='small'
      value={value}
      onChange={(_event, days) => days && onChange(days)}
      aria-label='Perioada'
      sx={{
        width: { xs: '100%', sm: 'auto' },
        '& .MuiToggleButton-root': {
          flex: { xs: 1, sm: 'none' },
          minHeight: 36,
          px: { xs: 1, sm: 3 },
          fontSize: '0.8125rem',
          fontWeight: 600,
          textTransform: 'none',
          color: 'text.secondary',
          '&.Mui-selected': {
            color: accentInk(theme),
            bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'light' ? 0.12 : 0.16)
          }
        }
      }}
    >
      {periods.map(item => (
        <ToggleButton key={item.days} value={item.days}>
          {item.short}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  )
}

export default PeriodToggle
