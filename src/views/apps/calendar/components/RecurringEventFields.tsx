// ** React Imports
import React, { forwardRef } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'

// ** Third Party Imports
import DatePicker from 'react-datepicker'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

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

  const handleDurationChange =
    (field: 'durationHours' | 'durationMinutes') => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(e.target.value) || 0
      setValues({ ...values, [field]: value })
    }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Recurrence Pattern */}
      {(() => {
        const TextField = CustomTextField as any

        return (
          <TextField
            select
            fullWidth
            label='Recurrence Pattern'
            value={values.pattern}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValues({ ...values, pattern: e.target.value })}
            InputProps={{ readOnly: isReadOnly }}
          >
            {Object.entries(RECURRENCE_PATTERNS).map(([key, value]) => (
              <MenuItem key={key} value={value}>
                {value}
              </MenuItem>
            ))}
          </TextField>
        )
      })()}

      {/* Duration Fields */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        {(() => {
          const TextField = CustomTextField as any

          return (
            <>
              <TextField
                type='number'
                label='Hours'
                value={values.durationHours}
                onChange={handleDurationChange('durationHours')}
                InputProps={{
                  readOnly: isReadOnly,
                  inputProps: { min: 0, max: 23 }
                }}
                sx={{ flex: 1 }}
              />
              <TextField
                type='number'
                label='Minutes'
                value={values.durationMinutes}
                onChange={handleDurationChange('durationMinutes')}
                InputProps={{
                  readOnly: isReadOnly,
                  inputProps: { min: 0, max: 59 }
                }}
                sx={{ flex: 1 }}
              />
            </>
          )
        })()}
      </Box>

      {/* End Recurrence Date */}
      <Box>
        <DatePicker
          selected={values.endRecurrence}
          showTimeSelect={false}
          dateFormat='MM/dd/yyyy'
          onChange={(date: Date | null) => setValues({ ...values, endRecurrence: date })}
          placeholderText='End Recurrence (Optional)'
          customInput={<PickersComponent label='End Recurrence' />}
          disabled={isReadOnly}
          isClearable
        />
      </Box>
    </Box>
  )
}

export default React.memo(RecurringEventFields)
