// ** React Imports
import React, { forwardRef } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'

// ** Third Party Imports
import DatePicker from 'react-datepicker'
import { Controller } from 'react-hook-form'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Types
import { PickersComponentProps } from '../types'

interface EventFormFieldsProps {
  values: any
  setValues: any
  control: any
  errors: any
  isReadOnly: boolean
}

const EventFormFields: React.FC<EventFormFieldsProps> = ({ values, setValues, control, errors, isReadOnly }) => {
  const PickersComponent = forwardRef<HTMLInputElement, PickersComponentProps>(({ ...props }, ref) => {
    const TextField = CustomTextField as any

    return <TextField inputRef={ref} fullWidth {...props} sx={{ width: '100%' }} />
  })

  PickersComponent.displayName = 'PickersComponent'

  const handleStartDate = (date: Date) => {
    if (!values.isRecurring && date > values.endDate) {
      setValues({ ...values, startDate: new Date(date), endDate: new Date(date) })
    } else {
      setValues({ ...values, startDate: new Date(date) })
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Title Field */}
      <Controller
        name='title'
        control={control}
        rules={{ required: true }}
        render={({ field: { value, onChange } }) => {
          const TextField = CustomTextField as any

          return (
            <TextField
              fullWidth
              label='Title'
              value={value}
              onChange={onChange}
              placeholder='Event Title'
              error={Boolean(errors.title)}
              InputProps={{ readOnly: isReadOnly }}
              {...(errors.title && { helperText: 'This field is required' })}
            />
          )
        }}
      />

      {/* Description Field */}
      {(() => {
        const TextField = CustomTextField as any

        return (
          <TextField
            fullWidth
            multiline
            rows={3}
            label='Description'
            value={values.description}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValues({ ...values, description: e.target.value })}
            placeholder='Event Description'
            InputProps={{ readOnly: isReadOnly }}
          />
        )
      })()}

      {/* Date and Time Fields */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {/* Start Date */}
        <Box sx={{ flex: 1, minWidth: '200px' }}>
          <DatePicker
            selected={values.startDate}
            showTimeSelect
            timeFormat='HH:mm'
            timeIntervals={15}
            dateFormat='MM/dd/yyyy h:mm aa'
            onChange={handleStartDate}
            placeholderText='Start Date'
            customInput={<PickersComponent label='Start Date' />}
            disabled={isReadOnly}
          />
        </Box>

        {/* End Date (only for non-recurring events) */}
        {!values.isRecurring && (
          <Box sx={{ flex: 1, minWidth: '200px' }}>
            <DatePicker
              selected={values.endDate}
              showTimeSelect
              timeFormat='HH:mm'
              timeIntervals={15}
              dateFormat='MM/dd/yyyy h:mm aa'
              onChange={(date: Date) => setValues({ ...values, endDate: new Date(date) })}
              placeholderText='End Date'
              customInput={<PickersComponent label='End Date' />}
              disabled={isReadOnly}
            />
          </Box>
        )}
      </Box>

      {/* All Day Toggle */}
      <FormControlLabel
        label='All Day'
        control={
          <Switch
            checked={values.allDay}
            onChange={e => setValues({ ...values, allDay: e.target.checked })}
            disabled={isReadOnly}
          />
        }
      />

      {/* Meeting Link */}
      {(() => {
        const TextField = CustomTextField as any

        return (
          <TextField
            fullWidth
            label='Meeting Link'
            value={values.meetingLink}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValues({ ...values, meetingLink: e.target.value })}
            placeholder='https://meet.google.com/...'
            InputProps={{ readOnly: isReadOnly }}
          />
        )
      })()}

      {/* Price */}
      {(() => {
        const TextField = CustomTextField as any

        return (
          <TextField
            fullWidth
            type='number'
            label='Price'
            value={values.price}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setValues({ ...values, price: parseFloat(e.target.value) || 0 })
            }
            placeholder='0'
            InputProps={{ readOnly: isReadOnly }}
          />
        )
      })()}
    </Box>
  )
}

export default React.memo(EventFormFields)
