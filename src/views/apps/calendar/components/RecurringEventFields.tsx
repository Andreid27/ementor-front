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
import DatePicker from 'react-datepicker'

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
        return 'Event repeats every day'
      case 'WEEKLY':
        return 'Event repeats every week'
      case 'BIWEEKLY':
        return 'Event repeats every 2 weeks'
      case 'MONTHLY':
        return 'Event repeats every month'
      default:
        return 'Select a recurrence pattern'
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
              Recurrence Pattern
            </Typography>
          </Box>

          {(() => {
            const TextField = CustomTextField as any

            return (
              <TextField
                select
                fullWidth
                label='Pattern'
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
              End Recurrence
            </Typography>
            <Chip label='Optional' size='small' variant='outlined' color='default' sx={{ ml: 'auto' }} />
          </Box>

          <DatePicker
            selected={values.endRecurrence}
            showTimeSelect={false}
            dateFormat='MM/dd/yyyy'
            onChange={(date: Date | null) => setValues({ ...values, endRecurrence: date })}
            placeholderText='Select end date (leave empty for indefinite)'
            customInput={<PickersComponent label='End Date' />}
            disabled={isReadOnly}
            isClearable
            minDate={new Date()}
          />

          <Typography variant='caption' color='text.secondary' sx={{ mt: 1, display: 'block' }}>
            {values.endRecurrence
              ? `Recurring events will end on ${values.endRecurrence.toLocaleDateString()}`
              : 'If no end date is set, events will continue indefinitely'}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}

export default React.memo(RecurringEventFields)
