// ** React Imports
import React, { forwardRef } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import InputAdornment from '@mui/material/InputAdornment'

// ** Icon Imports
import RepeatIcon from '@mui/icons-material/Repeat'
import EventIcon from '@mui/icons-material/Event'
import ScheduleIcon from '@mui/icons-material/Schedule'

// ** Third Party Imports
import DatePicker, { registerLocale } from 'react-datepicker'
import ro from 'date-fns/locale/ro'

// Register Romanian locale for DatePicker
registerLocale('ro', ro)

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Types
import { PickersComponentProps } from '../types'

// ** Constants
import { RECURRENCE_PATTERNS } from '../constants'

interface RecurringEventFieldsProps {
  values: any
  setValues: any
  isReadOnly: boolean
  students: any[]
}

const RecurringEventFields: React.FC<RecurringEventFieldsProps> = ({ values, setValues, isReadOnly, students }) => {
  const PickersComponent = forwardRef<HTMLInputElement, PickersComponentProps>(({ ...props }, ref) => {
    const TextField = CustomTextField as any

    return <TextField inputRef={ref} fullWidth {...props} sx={{ width: '100%' }} />
  })

  PickersComponent.displayName = 'PickersComponent'

  const getPatternDescription = (pattern: string) => {
    switch (pattern) {
      case 'DAILY':
        return 'Evenimentul se repetă în fiecare zi'
      case 'WEEKLY':
        return 'Evenimentul se repetă în fiecare săptămână'
      case 'BIWEEKLY':
        return 'Evenimentul se repetă la fiecare 2 săptămâni'
      case 'MONTHLY':
        return 'Evenimentul se repetă în fiecare lună'
      default:
        return 'Selectați un model de recurență'
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Recurrence Pattern Card */}
      <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <RepeatIcon color='primary' fontSize='small' />
            <Typography variant='subtitle2' sx={{ fontWeight: 600, color: 'text.primary' }}>
              Model de Recurență
            </Typography>
          </Box>

          {(() => {
            const TextField = CustomTextField as any

            return (
              <TextField
                select
                fullWidth
                label='Model'
                value={values.pattern}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValues({ ...values, pattern: e.target.value })}
                InputProps={{
                  readOnly: isReadOnly,
                  startAdornment: (
                    <InputAdornment position='start'>
                      <ScheduleIcon fontSize='small' color='action' />
                    </InputAdornment>
                  )
                }}
                helperText={getPatternDescription(values.pattern)}
                size='small'
              >
                {Object.entries(RECURRENCE_PATTERNS).map(([key, value]) => (
                  <MenuItem key={key} value={value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <RepeatIcon fontSize='small' color='action' />
                      {value}
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
            )
          })()}
        </CardContent>
      </Card>

      {/* End Date Card */}
      <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <EventIcon color='primary' fontSize='small' />
            <Typography variant='subtitle2' sx={{ fontWeight: 600, color: 'text.primary' }}>
              Sfârșitul Recurenței
            </Typography>
            <Chip label='Opțional' size='small' variant='outlined' color='default' sx={{ ml: 'auto' }} />
          </Box>

          <DatePicker
            selected={values.endRecurrence}
            showTimeSelect={false}
            dateFormat='dd/MM/yyyy'
            onChange={(date: Date | null) => setValues({ ...values, endRecurrence: date })}
            placeholderText='Selectați data de sfârșit (lăsați gol pentru nedefinit)'
            locale='ro'
            customInput={<PickersComponent label='Data de Sfârșit' />}
            disabled={isReadOnly}
            isClearable
            minDate={new Date()}
          />

          <Typography variant='caption' color='text.secondary' sx={{ mt: 1, display: 'block' }}>
            {values.endRecurrence
              ? `Evenimentele recurente se vor termina pe ${values.endRecurrence.toLocaleDateString('ro-RO')}`
              : 'Dacă nu este setată o dată de sfârșit, evenimentele vor continua la nesfârșit'}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}

export default React.memo(RecurringEventFields)
