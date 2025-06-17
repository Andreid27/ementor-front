// ** React Imports
import { useState, useEffect, forwardRef, useCallback, Fragment } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import Switch from '@mui/material/Switch'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Third Party Imports
import DatePicker from 'react-datepicker'
import { useForm, Controller } from 'react-hook-form'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Styled Components
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'

// ** Types
import { CalendarStore } from 'src/pages/apps/calendar'
import { EventOccurrenceDTO } from 'src/generated/profile-service'
import { CalendarApi } from '@fullcalendar/core'
import { Dispatch } from '@reduxjs/toolkit'
import { RecurringSeriesDTO } from 'src/generated/profile-service'
import { Avatar } from '@mui/material'

interface EventFormValues {
  recurringSeriesDTO?: RecurringSeriesDTO
  isRecurring?: boolean
  // Individual event fields
  title: string
  description: string
  startDate: Date
  endDate: Date
  allDay: boolean
  meetingLink: string
  price: number
  pattern: 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY'
  // Duration fields for easier form handling
  durationHours: number
  durationMinutes: number
  endRecurrence?: Date
  expectedAttendees: string[]
}

const defaultState: EventFormValues = {
  isRecurring: false,
  title: '',
  description: '',
  startDate: new Date(),
  endDate: new Date(),
  allDay: true,
  meetingLink: '',
  price: 0,
  pattern: 'WEEKLY',
  durationHours: 1,
  durationMinutes: 0,
  expectedAttendees: []
}

interface AddEventSidebarProps {
  store: CalendarStore
  dispatch: Dispatch<any>
  addEvent: (event: any) => void
  updateEvent: (event: any) => void
  drawerWidth: number
  calendarApi: CalendarApi | null
  deleteEvent: (id: string | number) => void
  handleSelectEvent: (event: EventOccurrenceDTO | null) => void
  addEventSidebarOpen: boolean
  handleAddEventSidebarToggle: () => void
  students: any[]
}

interface FormData {
  title: string
}

interface PickersComponentProps {
  label?: string
  error?: boolean
  value?: any
  onChange?: (event: any) => void
  [key: string]: any
}

const AddEventSidebar = (props: AddEventSidebarProps) => {
  // ** Props
  const {
    store,
    dispatch,
    addEvent,
    updateEvent,
    drawerWidth,
    calendarApi,
    deleteEvent,
    handleSelectEvent,
    addEventSidebarOpen,
    handleAddEventSidebarToggle,
    students
  } = props

  // ** States
  const [values, setValues] = useState<EventFormValues>(defaultState)

  //TODO: continue here to map the add event form to working with backend and the calendar API to add, update, and delete events, view events, and handle the sidebar functionality.

  const {
    control,
    setValue,
    clearErrors,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>({ defaultValues: { title: '' } })

  const handleSidebarClose = async () => {
    setValues(defaultState)
    clearErrors()
    dispatch(handleSelectEvent(null))
    handleAddEventSidebarToggle()
  }

  const onSubmit = (data: FormData) => {
    if (values.isRecurring) {
      // Create recurring series
      const durationISO8601 = formatDurationToISO8601(values.durationHours, values.durationMinutes)

      const recurringSeriesDTO: RecurringSeriesDTO = {
        title: data.title,
        description: values.description,
        startTime: values.startDate.toISOString(),
        duration: durationISO8601 as any, // Backend expects ISO 8601 duration string
        pattern: values.pattern,
        price: values.price,
        meetingLink: values.meetingLink,
        endRecurrence: values.endRecurrence?.toISOString(),
        expectedAttendees: values.expectedAttendees
      }

      const eventPayload = {
        recurringSeriesDTO,
        isRecurring: true
      }

      if (store.selectedEvent === null || (store.selectedEvent !== null && !store.selectedEvent.seriesTitle?.length)) {
        dispatch(addEvent(eventPayload))
      } else {
        dispatch(updateEvent({ id: store.selectedEvent.recurringSeriesId, ...eventPayload }))
      }
    } else {
      // Create singular event - maintaining compatibility with existing calendar format
      const modifiedEvent = {
        display: 'block',
        title: data.title,
        end: values.endDate,
        allDay: values.allDay,
        start: values.startDate,
        extendedProps: {
          description: values.description.length ? values.description : undefined,
          meetingLink: values.meetingLink,
          price: values.price
        }
      }

      if (store.selectedEvent === null || (store.selectedEvent !== null && !store.selectedEvent.seriesTitle?.length)) {
        dispatch(addEvent(modifiedEvent))
      } else {
        dispatch(updateEvent({ id: store.selectedEvent.recurringSeriesId, ...modifiedEvent }))
      }
    }

    calendarApi?.refetchEvents()
    handleSidebarClose()
  }

  const handleDeleteEvent = () => {
    if (store.selectedEvent) {
      dispatch(deleteEvent(store.selectedEvent.id))
    }

    // calendarApi.getEventById(store.selectedEvent.id).remove()
    handleSidebarClose()
  }

  const handleStartDate = (date: Date) => {
    // For recurring events, we don't need to update end date since it's determined by duration
    if (!values.isRecurring && date > values.endDate) {
      setValues({ ...values, startDate: new Date(date), endDate: new Date(date) })
    } else {
      setValues({ ...values, startDate: new Date(date) })
    }
  }

  const resetToStoredValues = useCallback(() => {
    if (store.selectedEvent !== null) {
      const event = store.selectedEvent as any // Type assertion since we know it's EventOccurrenceDTO
      setValue('title', event.title || event.seriesTitle || '')

      // Safe date parsing with fallbacks
      const startDate = event.start
        ? new Date(event.start)
        : event.effectiveStartTime
        ? new Date(event.effectiveStartTime)
        : new Date()

      const endDate = event.end
        ? new Date(event.end)
        : event.effectiveEndTime
        ? new Date(event.effectiveEndTime)
        : new Date(startDate.getTime() + 60 * 60 * 1000) // Add 1 hour if no end date

      setValues({
        isRecurring: false, // Default to non-recurring when editing
        title: event.title || event.seriesTitle || '',
        description: event.description || event.seriesDescription || '',
        startDate: startDate,
        endDate: endDate,
        allDay: event.allDay || false,
        meetingLink: event.url || event.meetingLink || '',
        price: event.extendedProps?.price || event.price || 0,
        pattern: 'WEEKLY',
        durationHours: 1,
        durationMinutes: 0,
        expectedAttendees: []
      })
    }
  }, [setValue, store])

  const resetToEmptyValues = useCallback(() => {
    setValue('title', '')
    setValues(defaultState)
  }, [setValue])

  useEffect(() => {
    if (store !== null) {
      resetToStoredValues()
    } else {
      resetToEmptyValues()
    }
  }, [addEventSidebarOpen, resetToStoredValues, resetToEmptyValues, store])

  const PickersComponent = forwardRef<HTMLInputElement, PickersComponentProps>(({ ...props }, ref) => {
    const TextField = CustomTextField as any

    return <TextField inputRef={ref} fullWidth {...props} sx={{ width: '100%' }} />
  })

  PickersComponent.displayName = 'PickersComponent'

  const RenderSidebarFooter = () => {
    const selectedEvent = store.selectedEvent as any
    if (
      store.selectedEvent === null ||
      (store.selectedEvent !== null && !(selectedEvent.title || selectedEvent.seriesTitle)?.length)
    ) {
      return (
        <Fragment>
          <Button type='submit' variant='contained' sx={{ mr: 4 }}>
            Add
          </Button>
          <Button variant='outlined' color='secondary' onClick={resetToEmptyValues}>
            Reset
          </Button>
        </Fragment>
      )
    } else {
      return (
        <Fragment>
          <Button type='submit' variant='contained' sx={{ mr: 4 }}>
            Update
          </Button>
          <Button variant='outlined' color='secondary' onClick={resetToStoredValues}>
            Reset
          </Button>
        </Fragment>
      )
    }
  }

  // Helper functions for duration conversion
  const formatDurationToISO8601 = (hours: number, minutes: number): string => {
    let duration = 'PT'
    if (hours > 0) duration += `${hours}H`
    if (minutes > 0) duration += `${minutes}M`

    return duration || 'PT0M' // At least 0 minutes if no duration specified
  }

  return (
    <Drawer
      anchor='right'
      open={addEventSidebarOpen}
      onClose={handleSidebarClose}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: ['100%', drawerWidth] } }}
    >
      <Box
        className='sidebar-header'
        sx={{
          p: 6,
          display: 'flex',
          justifyContent: 'space-between'
        }}
      >
        <Typography variant='h5'>
          {(() => {
            const selectedEvent = store.selectedEvent as any

            return store.selectedEvent !== null && (selectedEvent.title || selectedEvent.seriesTitle)?.length
              ? 'Update Event'
              : 'Add Event'
          })()}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {(() => {
            const selectedEvent = store.selectedEvent as any

            return store.selectedEvent !== null && (selectedEvent.title || selectedEvent.seriesTitle)?.length ? (
              <IconButton
                size='small'
                onClick={handleDeleteEvent}
                sx={{ color: 'text.primary', mr: store.selectedEvent !== null ? 1 : 0 }}
              >
                <Icon icon='tabler:trash' fontSize='1.25rem' />
              </IconButton>
            ) : null
          })()}
          <IconButton
            size='small'
            onClick={handleSidebarClose}
            sx={{
              p: '0.375rem',
              borderRadius: 1,
              color: 'text.primary',
              backgroundColor: 'action.selected',
              '&:hover': {
                backgroundColor: (theme: any) => `rgba(${theme.palette.customColors.main}, 0.16)`
              }
            }}
          >
            <Icon icon='tabler:x' fontSize='1.25rem' />
          </IconButton>
        </Box>
      </Box>
      <Box className='sidebar-body' sx={{ p: (theme: any) => theme.spacing(0, 6, 6) }}>
        <DatePickerWrapper>
          <form onSubmit={handleSubmit(onSubmit)} autoComplete='off'>
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
                    {...(errors.title && { helperText: 'This field is required' })}
                  />
                )
              }}
            />

            <FormControl sx={{ mb: 4 }}>
              <FormControlLabel
                label='Recurring Event'
                control={
                  <Switch
                    checked={values.isRecurring}
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
                  For recurring events, specify the start time and duration. The end time will be calculated
                  automatically.
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

              return (
                <TextField
                  fullWidth
                  type='url'
                  id='event-meeting-link'
                  sx={{ mb: 4 }}
                  label='Meeting Link'
                  value={values.meetingLink}
                  placeholder='https://meet.google.com/abc-def-ghi'
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setValues({ ...values, meetingLink: e.target.value })
                  }
                />
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
                />
              )
            })()}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <RenderSidebarFooter />
            </Box>
          </form>
        </DatePickerWrapper>
      </Box>
    </Drawer>
  )
}

export default AddEventSidebar
