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
import { CalendarEvent, CalendarLabel, CalendarStore } from 'src/pages/apps/calendar'
import { CalendarApi } from '@fullcalendar/core'
import { Dispatch } from '@reduxjs/toolkit'
import { RecurringSeriesDTO } from 'src/generated/profile-service'

const capitalize = (string: string) => string && string[0].toUpperCase() + string.slice(1)

interface EventFormValues {
  recurringSeriesDTO?: RecurringSeriesDTO
  isRecurring?: boolean
}

const defaultState: EventFormValues = {
  url: '',
  title: '',
  guests: [],
  allDay: true,
  description: '',
  endDate: new Date(),
  calendar: 'Business',
  startDate: new Date()
}

interface AddEventSidebarProps {
  store: CalendarStore
  dispatch: Dispatch<any>
  addEvent: (event: any) => void
  updateEvent: (event: any) => void
  drawerWidth: number
  calendarApi: CalendarApi | null
  deleteEvent: (id: string | number) => void
  handleSelectEvent: (event: CalendarEvent | null) => void
  addEventSidebarOpen: boolean
  handleAddEventSidebarToggle: () => void
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
    handleAddEventSidebarToggle
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
    const modifiedEvent = {
      url: values.url,
      display: 'block',
      title: data.title,
      end: values.endDate,
      allDay: values.allDay,
      start: values.startDate,
      extendedProps: {
        calendar: capitalize(values.calendar),
        guests: values.guests && values.guests.length ? values.guests : undefined,
        description: values.description.length ? values.description : undefined
      }
    }
    if (store.selectedEvent === null || (store.selectedEvent !== null && !store.selectedEvent.title.length)) {
      dispatch(addEvent(modifiedEvent))
    } else {
      dispatch(updateEvent({ id: store.selectedEvent.id, ...modifiedEvent }))
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
    if (date > values.endDate) {
      setValues({ ...values, startDate: new Date(date), endDate: new Date(date) })
    }
  }

  const resetToStoredValues = useCallback(() => {
    if (store.selectedEvent !== null) {
      const event = store.selectedEvent
      setValue('title', event.title || '')
      setValues({
        url: event.url || '',
        title: event.title || '',
        allDay: event.allDay,
        guests: event.extendedProps.guests || [],
        description: event.extendedProps.description || '',
        calendar: event.extendedProps.calendar || 'Business',
        endDate: event.end !== null ? new Date(event.end) : new Date(event.start),
        startDate: event.start !== null ? new Date(event.start) : new Date()
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
    if (store.selectedEvent === null || (store.selectedEvent !== null && !store.selectedEvent.title.length)) {
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
          {store.selectedEvent !== null && store.selectedEvent.title.length ? 'Update Event' : 'Add Event'}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {store.selectedEvent !== null && store.selectedEvent.title.length ? (
            <IconButton
              size='small'
              onClick={handleDeleteEvent}
              sx={{ color: 'text.primary', mr: store.selectedEvent !== null ? 1 : 0 }}
            >
              <Icon icon='tabler:trash' fontSize='1.25rem' />
            </IconButton>
          ) : null}
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
            {(() => {
              const TextField = CustomTextField as any

              return (
                <TextField
                  select
                  fullWidth
                  sx={{ mb: 4 }}
                  label='Calendar'
                  SelectProps={{
                    value: values.calendar,
                    onChange: (e: any) => setValues({ ...values, calendar: e.target.value as CalendarLabel })
                  }}
                >
                  <MenuItem value='Personal'>Personal</MenuItem>
                  <MenuItem value='Business'>Business</MenuItem>
                  <MenuItem value='Family'>Family</MenuItem>
                  <MenuItem value='Holiday'>Holiday</MenuItem>
                  <MenuItem value='ETC'>ETC</MenuItem>
                </TextField>
              )
            })()}
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
            <FormControl sx={{ mb: 4 }}>
              <FormControlLabel
                label='All Day'
                control={
                  <Switch
                    checked={values.allDay}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setValues({ ...values, allDay: e.target.checked })
                    }
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
                  id='event-url'
                  sx={{ mb: 4 }}
                  label='Event URL'
                  value={values.url}
                  placeholder='https://www.google.com'
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValues({ ...values, url: e.target.value })}
                />
              )
            })()}

            {(() => {
              const TextField = CustomTextField as any

              return (
                <TextField
                  select
                  fullWidth
                  label='Guests'
                  sx={{ mb: 4 }}
                  SelectProps={{
                    multiple: true,
                    value: values.guests,
                    onChange: (e: any) => setValues({ ...values, guests: e.target.value as string[] })
                  }}
                >
                  <MenuItem value='bruce'>Bruce</MenuItem>
                  <MenuItem value='clark'>Clark</MenuItem>
                  <MenuItem value='diana'>Diana</MenuItem>
                  <MenuItem value='john'>John</MenuItem>
                  <MenuItem value='barry'>Barry</MenuItem>
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
