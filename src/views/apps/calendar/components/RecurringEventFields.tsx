// ** React Imports
import React, { forwardRef } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'

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

  const handleAddAttendee = (studentId: string) => {
    if (!values.expectedAttendees.includes(studentId)) {
      setValues({
        ...values,
        expectedAttendees: [...values.expectedAttendees, studentId]
      })
    }
  }

  const handleRemoveAttendee = (studentId: string) => {
    setValues({
      ...values,
      expectedAttendees: values.expectedAttendees.filter((id: string) => id !== studentId)
    })
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

      {/* Expected Attendees */}
      <Box>
        <Typography variant='subtitle2' sx={{ mb: 2, fontWeight: 600 }}>
          Expected Attendees
        </Typography>

        {/* Selected Attendees */}
        {values.expectedAttendees.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {values.expectedAttendees
              .map((studentId: string) => {
                const student = students.find(s => s?.id === studentId || s?.userId === studentId)

                // Safety check: if student not found, skip rendering
                if (!student) {
                  console.warn('Student not found for ID:', studentId)

                  return null
                }

                const getStudentName = (student: any) => {
                  if (!student) return 'Unknown'

                  return (
                    student.name ||
                    student.firstName ||
                    `${student.firstName || ''} ${student.lastName || ''}`.trim() ||
                    student.email ||
                    'Unknown'
                  )
                }

                const getStudentInitial = (student: any) => {
                  if (!student) return '?'
                  const name = student.name || student.firstName || student.email || '?'

                  return name.charAt(0).toUpperCase()
                }

                return (
                  <Box
                    key={studentId}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      p: 1,
                      bgcolor: 'primary.light',
                      borderRadius: 1,
                      color: 'primary.contrastText'
                    }}
                  >
                    <Avatar sx={{ width: 24, height: 24 }}>{getStudentInitial(student)}</Avatar>
                    <Typography variant='body2'>{getStudentName(student)}</Typography>
                    {!isReadOnly && (
                      <Button
                        size='small'
                        onClick={() => handleRemoveAttendee(studentId)}
                        sx={{ minWidth: 'auto', p: 0.5 }}
                      >
                        <Icon icon='tabler:x' fontSize='0.875rem' />
                      </Button>
                    )}
                  </Box>
                )
              })
              .filter(Boolean)}
          </Box>
        )}

        {/* Available Students */}
        {!isReadOnly && (
          <Box sx={{ maxHeight: '200px', overflowY: 'auto' }}>
            {students
              .filter(
                student =>
                  student &&
                  (student.id || student.userId) &&
                  !values.expectedAttendees.includes(student.id || student.userId)
              )
              .map(student => {
                const studentId = student.id || student.userId

                const getStudentName = (student: any) => {
                  if (!student) return 'Unknown'

                  return (
                    student.name ||
                    student.firstName ||
                    `${student.firstName || ''} ${student.lastName || ''}`.trim() ||
                    student.email ||
                    'Unknown'
                  )
                }

                const getStudentInitial = (student: any) => {
                  if (!student) return '?'
                  const name = student.name || student.firstName || student.email || '?'

                  return name.charAt(0).toUpperCase()
                }

                return (
                  <Box
                    key={studentId}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      p: 1,
                      cursor: 'pointer',
                      borderRadius: 1,
                      '&:hover': {
                        bgcolor: 'action.hover'
                      }
                    }}
                    onClick={() => handleAddAttendee(studentId)}
                  >
                    <Avatar sx={{ width: 32, height: 32 }}>{getStudentInitial(student)}</Avatar>
                    <Typography variant='body2'>{getStudentName(student)}</Typography>
                    <Icon icon='tabler:plus' fontSize='1rem' />
                  </Box>
                )
              })}
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default React.memo(RecurringEventFields)
