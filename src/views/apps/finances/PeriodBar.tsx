// ** React Imports
import { ChangeEvent, MouseEvent, useEffect, useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import CircularProgress from '@mui/material/CircularProgress'

// ** Custom Component Imports
import Icon from 'src/@core/components/icon'
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Utils
import {
  FinancePeriod,
  PERIOD_NAV,
  PeriodPreset,
  buildPeriod,
  formatTime,
  isCurrentPeriod,
  periodLabel,
  shiftPeriod,
  validateRange
} from './financeUtils'

interface PeriodBarProps {
  period: FinancePeriod
  onChange: (period: FinancePeriod) => void
  generatedAt?: string | null
  refreshing: boolean
  onRefresh: () => void
  exporting: boolean
  onExport: () => void
}

// Same words as the calendar's view switch (Lună, Săptămână, Zi)
const PRESETS: { value: PeriodPreset; label: string }[] = [
  { value: 'month', label: 'Lună' },
  { value: 'year', label: 'An' },
  { value: 'schoolYear', label: 'An Școlar' },
  { value: 'custom', label: 'Personalizat' }
]

const PeriodBar = ({ period, onChange, generatedAt, refreshing, onRefresh, exporting, onExport }: PeriodBarProps) => {
  // Custom range is edited as a draft and applied only once it is valid
  const [draft, setDraft] = useState({ from: period.from, to: period.to })

  useEffect(() => {
    setDraft({ from: period.from, to: period.to })
  }, [period.from, period.to])

  const rangeError = period.preset === 'custom' ? validateRange(draft.from, draft.to) : null
  const nav = period.preset === 'custom' ? null : PERIOD_NAV[period.preset]

  const handlePresetChange = (_event: MouseEvent<HTMLElement>, preset: PeriodPreset | null) => {
    if (!preset) return

    // Custom starts from whatever range is on screen, so the numbers don't change until the person edits it
    onChange(preset === 'custom' ? { ...period, preset } : buildPeriod(preset))
  }

  const handleDraftChange = (field: 'from' | 'to') => (event: ChangeEvent<HTMLInputElement>) => {
    const next = { ...draft, [field]: event.target.value }
    setDraft(next)

    if (!validateRange(next.from, next.to)) onChange({ preset: 'custom', ...next })
  }

  return (
    <Box
      sx={{ gap: 4, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}
      role='toolbar'
      aria-label='Perioada afișată'
    >
      <Box sx={{ gap: 3, display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
        <ToggleButtonGroup exclusive size='small' color='primary' value={period.preset} onChange={handlePresetChange}>
          {PRESETS.map(preset => (
            <ToggleButton key={preset.value} value={preset.value} sx={{ px: 3, textTransform: 'none' }}>
              {preset.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        {period.preset === 'custom' ? (
          <Box>
            <Box sx={{ gap: 3, display: 'flex', alignItems: 'flex-end' }}>
              <CustomTextField
                type='date'
                size='small'
                label='De la'
                value={draft.from}
                onChange={handleDraftChange('from')}
                error={Boolean(rangeError)}
                InputLabelProps={{ shrink: true }}
                inputProps={{ 'aria-describedby': 'finance-range-error' }}
                sx={{ width: 170 }}
              />
              <CustomTextField
                type='date'
                size='small'
                label='Până la'
                value={draft.to}
                onChange={handleDraftChange('to')}
                error={Boolean(rangeError)}
                InputLabelProps={{ shrink: true }}
                inputProps={{ 'aria-describedby': 'finance-range-error' }}
                sx={{ width: 170 }}
              />
            </Box>
            {/* The page keeps showing the last valid range until this one is fixed */}
            <Typography
              id='finance-range-error'
              role='alert'
              variant='body2'
              sx={{ mt: 1, gap: 1, minHeight: 20, display: 'flex', alignItems: 'center', color: 'text.primary' }}
            >
              {/* Red text on white is 3.6:1; the icon carries the color and the words stay readable */}
              {rangeError && (
                <Box component='span' aria-hidden sx={{ display: 'flex', color: 'error.main' }}>
                  <Icon icon='tabler:alert-circle' fontSize={16} />
                </Box>
              )}
              {rangeError}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ gap: 1, display: 'flex', alignItems: 'center' }}>
            <IconButton aria-label={nav?.previous} onClick={() => onChange(shiftPeriod(period, -1))}>
              <Icon icon='tabler:chevron-left' fontSize={20} />
            </IconButton>
            <Typography
              variant='h6'
              component='p'
              aria-live='polite'
              sx={{ minWidth: { xs: 'auto', sm: 190 }, textAlign: 'center' }}
            >
              {periodLabel(period)}
            </Typography>
            <IconButton aria-label={nav?.next} onClick={() => onChange(shiftPeriod(period, 1))}>
              <Icon icon='tabler:chevron-right' fontSize={20} />
            </IconButton>
            {!isCurrentPeriod(period) && (
              <Button
                size='small'
                onClick={() => onChange(buildPeriod(period.preset as Exclude<PeriodPreset, 'custom'>))}
              >
                {nav?.current}
              </Button>
            )}
          </Box>
        )}
      </Box>

      <Box sx={{ gap: 2, display: 'flex', alignItems: 'center' }}>
        {generatedAt && (
          <Typography variant='body2' sx={{ color: 'text.secondary' }}>
            {`Actualizat la ${formatTime(generatedAt)}`}
          </Typography>
        )}
        <Tooltip title='Reîmprospătează'>
          <span>
            <IconButton aria-label='Reîmprospătează' onClick={onRefresh} disabled={refreshing}>
              {refreshing ? <CircularProgress size={18} /> : <Icon icon='tabler:refresh' fontSize={20} />}
            </IconButton>
          </span>
        </Tooltip>
        <Button
          variant='tonal'
          color='primary'
          onClick={onExport}
          disabled={exporting}
          startIcon={exporting ? <CircularProgress size={16} color='inherit' /> : <Icon icon='tabler:download' />}
        >
          Exportă CSV
        </Button>
      </Box>
    </Box>
  )
}

export default PeriodBar
