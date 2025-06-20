// ** React Imports
import React, { forwardRef } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Switch from '@mui/material/Switch'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Third Party Imports
import DatePicker from 'react-datepicker'
import { Controller } from 'react-hook-form'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Types
import { EventFormProps, PickersComponentProps } from '../types'

const EventForm: React.FC<EventFormProps> = ({
  values,
  setValues,
  isEditMode,
  selectedEvent,
  students,
  control,
  errors
}) => {
  const PickersComponent = forwardRef<HTMLInputElement, PickersComponentProps>(({ ...props }, ref) => {
    const TextField = CustomTextField as any

    return <TextField inputRef={ref} fullWidth {...props} sx={{ width: '100%' }} />
  })

  PickersComponent.displayName = 'PickersComponent'

  const handleStartDate = (date: Date) => {
    // For recurring events, we don't need to update end date since it's determined by duration
    if (!values.isRecurring && date > values.endDate) {
      setValues({ ...values, startDate: new Date(date), endDate: new Date(date) })
    } else {
      setValues({ ...values, startDate: new Date(date) })
    }
  }

  return (
    <>
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
              sx={{ mb: 4 }}
              onChange={onChange}
              placeholder='Event Title'
              error={Boolean(errors.title)}
              InputProps={{
                readOnly: !isEditMode && selectedEvent !== null
              }}
              {...(errors.title && { helperText: 'This field is required' })}
            />
          )
        }}
      />

      {(() => {
        const isViewingEvent = selectedEvent !== null && (selectedEvent.title || selectedEvent.seriesTitle)?.length

        if (!isViewingEvent) return null

        return (
          <Box sx={{ mb: 4, p: 3, bgcolor: 'action.hover' }}>
            <Typography variant='h6' sx={{ mb: 2 }}>
              Event Details
            </Typography>

            {selectedEvent.extendedProps?.professorName && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Icon icon='tabler:user' fontSize='1.25rem' />
                <Typography variant='body2' sx={{ ml: 1 }}>
                  <strong>Professor:</strong> {selectedEvent.extendedProps.professorName}
                </Typography>
              </Box>
            )}

            {selectedEvent.extendedProps?.virtual && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Icon icon='tabler:video' fontSize='1.25rem' />
                <Typography variant='body2' sx={{ ml: 1 }}>
                  <strong>Type:</strong> Virtual Meeting
                </Typography>
              </Box>
            )}

            {selectedEvent.extendedProps?.price !== undefined && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Icon icon='tabler:currency-dollar' fontSize='1.25rem' />
                <Typography variant='body2' sx={{ ml: 1 }}>
                  <strong>Price:</strong>{' '}
                  {selectedEvent.extendedProps.price === 0 ? 'Free' : `$${selectedEvent.extendedProps.price}`}
                </Typography>
              </Box>
            )}

            {selectedEvent.start && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Icon icon='tabler:calendar' fontSize='1.25rem' />
                <Typography variant='body2' sx={{ ml: 1 }}>
                  <strong>Start:</strong> {new Date(selectedEvent.start).toLocaleString()}
                </Typography>
              </Box>
            )}

            {selectedEvent.end && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Icon icon='tabler:calendar-time' fontSize='1.25rem' />
                <Typography variant='body2' sx={{ ml: 1 }}>
                  <strong>End:</strong> {new Date(selectedEvent.end).toLocaleString()}
                </Typography>
              </Box>
            )}
          </Box>
        )
      })()}

      <FormControl sx={{ mb: 4 }}>
        <FormControlLabel
          label='Recurring Event'
          control={
            <Switch
              checked={values.isRecurring}
              disabled={!isEditMode && selectedEvent !== null}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setValues({ ...values, isRecurring: e.target.checked })
              }
            />
          }
        />
      </FormControl>

      {values.isRecurring && (
        <>
          <Typography variant='body2' sx={{ mb: 3, color: 'text.secondary' }}>
            For recurring events, specify the start time and duration. The end time will be calculated automatically.
          </Typography>

          {(() => {
            const TextField = CustomTextField as any

            return (
              <TextField
                select
                fullWidth
                sx={{ mb: 4 }}
                label='Recurrence Pattern'
                SelectProps={{
                  value: values.pattern,
                  onChange: (e: any) => setValues({ ...values, pattern: e.target.value })
                }}
              >
                <MenuItem value='DAILY'>Daily</MenuItem>
                <MenuItem value='WEEKLY'>Weekly</MenuItem>
                <MenuItem value='BIWEEKLY'>Bi-weekly</MenuItem>
                <MenuItem value='MONTHLY'>Monthly</MenuItem>
              </TextField>
            )
          })()}

          <Box sx={{ mb: 4 }}>
            <DatePicker
              id='event-end-recurrence'
              selected={values.endRecurrence}
              customInput={<PickersComponent label='End Recurrence (Optional)' />}
              onChange={(date: Date | null) => setValues({ ...values, endRecurrence: date || undefined })}
            />
          </Box>

          {(() => {
            const TextField = CustomTextField as any

            return (
              <TextField
                fullWidth
                type='number'
                sx={{ mb: 4 }}
                label='Price'
                value={values.price}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setValues({ ...values, price: parseFloat(e.target.value) || 0 })
                }
              />
            )
          })()}

          {(() => {
            const TextField = CustomTextField as any

            return (
              <TextField
                fullWidth
                type='number'
                sx={{ mb: 4 }}
                label='Duration (hours)'
                value={values.durationHours}
                inputProps={{ min: 0, step: 1 }}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const hours = parseInt(e.target.value) || 0
                  setValues({
                    ...values,
                    durationHours: hours
                  })
                }}
              />
            )
          })()}

          {(() => {
            const TextField = CustomTextField as any

            return (
              <TextField
                fullWidth
                type='number'
                sx={{ mb: 4 }}
                label='Duration (minutes)'
                value={values.durationMinutes}
                inputProps={{ min: 0, max: 59, step: 1 }}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const minutes = parseInt(e.target.value) || 0
                  setValues({
                    ...values,
                    durationMinutes: minutes
                  })
                }}
              />
            )
          })()}
        </>
      )}

      <Box sx={{ mb: 4 }}>
        <DatePicker
          selectsStart
          id='event-start-date'
          endDate={values.endDate}
          selected={values.startDate}
          startDate={values.startDate}
          showTimeSelect={!values.allDay}
          dateFormat={!values.allDay ? 'yyyy-MM-dd hh:mm' : 'yyyy-MM-dd'}
          customInput={<PickersComponent label='Start Date' />}
          onChange={(date: Date) => setValues({ ...values, startDate: new Date(date) })}
          onSelect={handleStartDate}
        />
      </Box>

      {!values.isRecurring && (
        <Box sx={{ mb: 4 }}>
          <DatePicker
            selectsEnd
            id='event-end-date'
            endDate={values.endDate}
            selected={values.endDate}
            minDate={values.startDate}
            startDate={values.startDate}
            showTimeSelect={!values.allDay}
            dateFormat={!values.allDay ? 'yyyy-MM-dd hh:mm' : 'yyyy-MM-dd'}
            customInput={<PickersComponent label='End Date' />}
            onChange={(date: Date) => setValues({ ...values, endDate: new Date(date) })}
          />
        </Box>
      )}

      <FormControl sx={{ mb: 4 }}>
        <FormControlLabel
          label='All Day'
          control={
            <Switch
              checked={values.allDay}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const isAllDay = e.target.checked
                setValues({
                  ...values,
                  allDay: isAllDay,
                  // For recurring all-day events, set duration to 24 hours
                  ...(values.isRecurring &&
                    isAllDay && {
                      durationHours: 24,
                      durationMinutes: 0
                    })
                })
              }}
            />
          }
        />
      </FormControl>

      {(() => {
        const TextField = CustomTextField as any
        const isViewingEvent = selectedEvent !== null && (selectedEvent.title || selectedEvent.seriesTitle)?.length
        const meetingLink = values.meetingLink || selectedEvent?.extendedProps?.meetingLink

        return (
          <Box sx={{ mb: 4 }}>
            {isViewingEvent && meetingLink ? (
              // Read-only view with Join Meeting button
              <Box>
                <TextField
                  fullWidth
                  type='url'
                  id='event-meeting-link'
                  label='Meeting Link'
                  value={meetingLink}
                  InputProps={{
                    readOnly: true
                  }}
                  sx={{ mb: 2 }}
                />
                <Button
                  fullWidth
                  variant='contained'
                  color='primary'
                  startIcon={<Icon icon='tabler:video' />}
                  onClick={() => window.open(meetingLink, '_blank')}
                  sx={{ mb: 2 }}
                >
                  Join Meeting
                </Button>
              </Box>
            ) : (
              // Editable field for creating/editing events
              <TextField
                fullWidth
                type='url'
                id='event-meeting-link'
                label='Meeting Link'
                value={values.meetingLink}
                placeholder='https://meet.google.com/abc-def-ghi'
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setValues({ ...values, meetingLink: e.target.value })
                }
              />
            )}
          </Box>
        )
      })()}

      {(() => {
        const TextField = CustomTextField as any

        return (
          <TextField
            select
            fullWidth
            label='Expected Attendees'
            sx={{ mb: 4 }}
            SelectProps={{
              multiple: true,
              value: values.expectedAttendees,
              onChange: (e: any) => setValues({ ...values, expectedAttendees: e.target.value as string[] }),
              renderValue: (selected: any) => (
                <Box>
                  {(selected as string[]).map((id, idx) => {
                    const student = students.find((s: any) => s.id === id)
                    if (!student) return null

                    return (
                      <Box
                        key={id}
                        sx={{ display: 'flex', alignItems: 'center', mb: idx < selected.length - 1 ? 0.5 : 0 }}
                      >
                        <Avatar
                          src={student.avatar || ''}
                          alt={`${student.firstName} ${student.lastName}`}
                          sx={{ width: 24, height: 24, mr: 3, mt: 1 }}
                        />
                        {student.lastName} {student.firstName}
                      </Box>
                    )
                  })}
                </Box>
              )
            }}
          >
            {students.map((student: any) => (
              <MenuItem key={student.id} value={student.id}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar
                    src={student.avatar || ''}
                    alt={`${student.firstName} ${student.lastName}`}
                    sx={{ width: 24, height: 24, mr: 2 }}
                  />
                  {student.lastName} {student.firstName}
                </Box>
              </MenuItem>
            ))}
          </TextField>
        )
      })()}

      {(() => {
        const TextField = CustomTextField as any

        return (
          <TextField
            rows={4}
            multiline
            fullWidth
            sx={{ mb: 6.5 }}
            label='Description'
            id='event-description'
            value={values.description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setValues({ ...values, description: e.target.value })
            }
            InputProps={{
              readOnly: !isEditMode && selectedEvent !== null
            }}
          />
        )
      })()}
    </>
  )
}

export default EventForm
