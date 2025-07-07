// ** React Imports
import React, { useMemo, useCallback } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import Typography from '@mui/material/Typography'

// ** Components
import EventFormFields from './EventFormFields'
import RecurringEventFields from './RecurringEventFields'

// ** Types
import { EventFormProps } from '../types'

const EventForm: React.FC<EventFormProps> = ({
  values,
  setValues,
  isEditMode,
  selectedEvent,
  students,
  control,
  errors
}) => {
  const isReadOnly = !isEditMode && selectedEvent !== null

  const handleRecurringToggle = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const isRecurring = event.target.checked
      setValues(prev => ({
        ...prev,
        isRecurring,
        // Reset duration fields when switching modes
        durationHours: isRecurring ? Math.max(prev.durationHours, 1) : 1,
        durationMinutes: isRecurring ? prev.durationMinutes : 0,
        // Reset pattern if switching to recurring
        pattern: isRecurring ? prev.pattern || 'WEEKLY' : prev.pattern
      }))
    },
    [setValues]
  )

  const formSections = useMemo(() => {
    return [
      {
        title: 'Basic Information',
        component: (
          <EventFormFields
            values={values}
            setValues={setValues}
            control={control}
            errors={errors}
            isReadOnly={isReadOnly}
          />
        )
      },
      {
        title: 'Event Type',
        component: (
          <Box sx={{ mb: 4 }}>
            <FormControlLabel
              label='Recurring Event'
              control={<Switch checked={values.isRecurring} onChange={handleRecurringToggle} disabled={isReadOnly} />}
              sx={{
                '& .MuiFormControlLabel-label': {
                  fontSize: '0.875rem',
                  fontWeight: 500
                }
              }}
            />
          </Box>
        )
      },
      ...(values.isRecurring
        ? [
            {
              title: 'Recurring Settings',
              component: (
                <RecurringEventFields
                  values={values}
                  setValues={setValues}
                  isReadOnly={isReadOnly}
                  students={students}
                />
              )
            }
          ]
        : [])
    ]
  }, [values, setValues, control, errors, isReadOnly, students, handleRecurringToggle])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {formSections.map((section, index) => (
        <Box key={index}>
          <Typography
            variant='subtitle1'
            sx={{
              mb: 2,
              fontWeight: 600,
              color: 'text.primary',
              borderBottom: '1px solid',
              borderColor: 'divider',
              pb: 1
            }}
          >
            {section.title}
          </Typography>
          {section.component}
        </Box>
      ))}
    </Box>
  )
}

export default React.memo(EventForm)
