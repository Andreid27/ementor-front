// ** React Imports
import { useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'

// ** Types
import { CalendarApi } from '@fullcalendar/core'
import { RecurringSeriesDTO } from 'src/generated/profile-service'
import { EventFormValues, FormData, defaultEventFormState } from '../types'

// ** Hooks
import { useAuth } from 'src/hooks/useAuth'

interface UseEventFormProps {
  store: any
  dispatch: any
  addEvent: any
  updateEvent: any
  calendarApi: CalendarApi | null
  handleSelectEvent: any
  onClose: () => void
}

export const useEventForm = ({
  store,
  dispatch,
  addEvent,
  updateEvent,
  calendarApi,
  handleSelectEvent,
  onClose
}: UseEventFormProps) => {
  // ** States
  const [values, setValues] = useState<EventFormValues>(defaultEventFormState)
  const [isEditMode, setIsEditMode] = useState<boolean>(false)

  // ** Hooks
  const auth = useAuth()

  const {
    control,
    setValue,
    clearErrors,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>({ defaultValues: { title: '' } })

  // ** Helper function for duration conversion
  const formatDurationToISO8601 = (hours: number, minutes: number): string => {
    let duration = 'PT'
    if (hours > 0) duration += `${hours}H`
    if (minutes > 0) duration += `${minutes}M`

    return duration || 'PT0M' // At least 0 minutes if no duration specified
  }

  // ** Form submission handler
  const onSubmit = useCallback(
    (data: FormData) => {
      if (values.isRecurring) {
        // Create recurring series
        const durationISO8601 = formatDurationToISO8601(values.durationHours, values.durationMinutes)

        const recurringSeriesDTO: RecurringSeriesDTO = {
          title: data.title,
          description: values.description,
          startTime: values.startDate.toISOString(),
          duration: durationISO8601 as any,
          pattern: values.pattern,
          price: values.price,
          meetingLink: values.meetingLink,
          endRecurrence: values.endRecurrence?.toISOString()
          // Note: attendees will be handled separately via EventAttendeeDTO
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
        // Create singular event
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
      onClose()
    },
    [values, store.selectedEvent, dispatch, addEvent, updateEvent, calendarApi, onClose]
  )

  // ** Reset form to stored values
  const resetToStoredValues = useCallback(() => {
    if (store.selectedEvent !== null) {
      const event = store.selectedEvent as any
      setValue('title', event.title || event.seriesTitle || '')

      const startDate = event.start
        ? new Date(event.start)
        : event.effectiveStartTime
        ? new Date(event.effectiveStartTime)
        : new Date()

      const endDate = event.end
        ? new Date(event.end)
        : event.effectiveEndTime
        ? new Date(event.effectiveEndTime)
        : new Date(startDate.getTime() + 60 * 60 * 1000)

      setValues({
        isRecurring: false,
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
        attendees: [] // Use EventAttendeeDTO array instead of expectedAttendees
      })
    }
  }, [setValue, store.selectedEvent])

  // ** Reset form to empty values
  const resetToEmptyValues = useCallback(() => {
    setValue('title', '')
    setValues(defaultEventFormState)
    setIsEditMode(false)
  }, [setValue])

  // ** Form reset handler
  const handleReset = useCallback(() => {
    setValues(defaultEventFormState)
    setIsEditMode(false)
    clearErrors()
    dispatch(handleSelectEvent(null))
  }, [clearErrors, dispatch, handleSelectEvent])

  // ** Permission check
  const canEdit = auth?.user?.role === 'PROFESSOR' || auth?.user?.role === 'ADMIN'

  return {
    // States
    values,
    setValues,
    isEditMode,
    setIsEditMode,

    // Form
    control,
    setValue,
    clearErrors,
    handleSubmit,
    errors,

    // Handlers
    onSubmit,
    resetToStoredValues,
    resetToEmptyValues,
    handleReset,

    // Permissions
    canEdit
  }
}
