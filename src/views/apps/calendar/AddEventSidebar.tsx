// ** React Imports
import { useState, useEffect, useCallback } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'

// ** Third Party Imports
import { useForm } from 'react-hook-form'

// ** Hook Imports
import { useAuth } from 'src/hooks/useAuth'

// ** Styled Components
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'

// ** Types
import { RecurringSeriesDTO } from 'src/generated/profile-service'
import { EventFormValues, FormData, defaultEventFormState, AddEventSidebarProps } from './types'

// ** Components
import { EventView, EventForm, SidebarHeader, SidebarFooter } from './components'

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
  const [values, setValues] = useState<EventFormValues>(defaultEventFormState)
  const [isEditMode, setIsEditMode] = useState<boolean>(false)

  // ** Hooks
  const auth = useAuth()

  //TODO: continue here to map the add event form to working with backend and the calendar API to add, update, and delete events, view events, and handle the sidebar functionality.

  const {
    control,
    setValue,
    clearErrors,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>({ defaultValues: { title: '' } })

  const handleSidebarClose = async () => {
    setValues(defaultEventFormState)
    setIsEditMode(false)
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

      if (
        store.selectedEvent === null ||
        (store.selectedEvent !== null && !(store.selectedEvent as any).seriesTitle?.length)
      ) {
        dispatch(addEvent(eventPayload))
      } else {
        dispatch(updateEvent({ id: (store.selectedEvent as any).recurringSeriesId, ...eventPayload }))
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

      if (
        store.selectedEvent === null ||
        (store.selectedEvent !== null && !(store.selectedEvent as any).seriesTitle?.length)
      ) {
        dispatch(addEvent(modifiedEvent))
      } else {
        dispatch(updateEvent({ id: (store.selectedEvent as any).recurringSeriesId, ...modifiedEvent }))
      }
    }

    calendarApi?.refetchEvents()
    handleSidebarClose()
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
        meetingLink: event.url || event.extendedProps?.meetingLink || '',
        price: event.extendedProps?.price || event.price || 0,
        pattern: 'WEEKLY',
        durationHours: 1,
        durationMinutes: 0,
        expectedAttendees: []
      })
    }
  }, [setValue, store.selectedEvent])

  const resetToEmptyValues = useCallback(() => {
    setValue('title', '')
    setValues(defaultEventFormState)
    setIsEditMode(false)
  }, [setValue])

  useEffect(() => {
    console.log('AddEventSidebar useEffect triggered:', {
      selectedEvent: store.selectedEvent,
      addEventSidebarOpen,
      isEditMode
    })

    if (store.selectedEvent !== null) {
      resetToStoredValues()
      // Set edit mode to false for existing events (view-only by default)
      setIsEditMode(false)
    } else {
      resetToEmptyValues()
      // Set edit mode to true for new events
      setIsEditMode(true)
    }
  }, [addEventSidebarOpen, resetToStoredValues, resetToEmptyValues, store.selectedEvent])

  // Helper functions for duration conversion
  const formatDurationToISO8601 = (hours: number, minutes: number): string => {
    let duration = 'PT'
    if (hours > 0) duration += `${hours}H`
    if (minutes > 0) duration += `${minutes}M`

    return duration || 'PT0M' // At least 0 minutes if no duration specified
  }

  const canEdit = auth?.user?.role === 'PROFESSOR' || auth?.user?.role === 'ADMIN'

  const handleEdit = () => setIsEditMode(true)

  const handleDelete = () => {
    if (store.selectedEvent) {
      dispatch(deleteEvent(store.selectedEvent.id))
    }
    handleSidebarClose()
  }

  const handleCancel = () => {
    setIsEditMode(false)
    resetToStoredValues()
  }

  return (
    <Drawer
      anchor='right'
      open={addEventSidebarOpen}
      onClose={handleSidebarClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        '& .MuiDrawer-paper': {
          width: ['100%', drawerWidth],
          background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
          borderLeft: '1px solid',
          borderColor: 'divider'
        }
      }}
    >
      <SidebarHeader
        isEditMode={isEditMode}
        selectedEvent={store.selectedEvent}
        canEdit={canEdit}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCancel={handleCancel}
        onClose={handleSidebarClose}
      />

      <Box className='sidebar-body' sx={{ p: (theme: any) => theme.spacing(0, 6, 6) }}>
        <DatePickerWrapper>
          {!isEditMode && store.selectedEvent !== null ? (
            // VIEW MODE - Show event details in readable format
            <EventView selectedEvent={store.selectedEvent} values={values} onClose={handleSidebarClose} />
          ) : (
            // EDIT MODE - Show form inputs
            <form onSubmit={handleSubmit(onSubmit)} autoComplete='off'>
              <EventForm
                values={values}
                setValues={setValues}
                isEditMode={isEditMode}
                selectedEvent={store.selectedEvent}
                students={students}
                control={control}
                errors={errors}
              />
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <SidebarFooter
                  isEditMode={isEditMode}
                  selectedEvent={store.selectedEvent}
                  onClose={handleSidebarClose}
                  onCancel={handleCancel}
                  onReset={resetToEmptyValues}
                />
              </Box>
            </form>
          )}
        </DatePickerWrapper>
      </Box>
    </Drawer>
  )
}

export default AddEventSidebar
