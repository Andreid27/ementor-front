import { useCallback } from 'react'
import { useAuth } from 'src/hooks/useAuth'
import { RecurringSeriesDTO } from 'src/generated/profile-service'
import { EventFormValues, FormData } from '../types'

interface UseEventActionsProps {
  values: EventFormValues
  store: any
  dispatch: any
  addEvent: (event: any) => void
  updateEvent: (event: any) => void
  deleteEvent: (id: string | number) => void
  calendarApi: any
  onClose: () => void
}

export const useEventActions = ({
  values,
  store,
  dispatch,
  addEvent,
  updateEvent,
  deleteEvent,
  calendarApi,
  onClose
}: UseEventActionsProps) => {
  const auth = useAuth()

  const formatDurationToISO8601 = useCallback((hours: number, minutes: number): string => {
    let duration = 'PT'
    if (hours > 0) duration += `${hours}H`
    if (minutes > 0) duration += `${minutes}M`

    return duration || 'PT0M'
  }, [])

  const handleSubmit = useCallback(
    (data: FormData) => {
      if (values.isRecurring) {
        const durationISO8601 = formatDurationToISO8601(values.durationHours, values.durationMinutes)

        const recurringSeriesDTO: RecurringSeriesDTO = {
          title: data.title,
          description: values.description,
          startTime: values.startDate.toISOString(),
          duration: durationISO8601 as any,
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

        // Check if this is editing an existing recurring series
        const isEditingRecurring =
          store.selectedEvent !== null &&
          (store.selectedEvent.recurringSeriesId ||
            store.selectedEvent.seriesTitle ||
            store.selectedEvent.seriesDescription ||
            (store.selectedEvent.extendedProps && store.selectedEvent.extendedProps.recurringSeriesId))

        if (isEditingRecurring) {
          // Use the correct ID for updating recurring series
          const seriesId =
            store.selectedEvent.recurringSeriesId ||
            store.selectedEvent.extendedProps?.recurringSeriesId ||
            store.selectedEvent.id
          dispatch(updateEvent({ id: seriesId, ...eventPayload }))
        } else {
          // Creating new recurring series
          dispatch(addEvent(eventPayload))
        }
      } else {
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

        // Check if this is editing an existing single event
        const isEditingSingleEvent =
          store.selectedEvent !== null && !store.selectedEvent.recurringSeriesId && !store.selectedEvent.seriesTitle

        if (isEditingSingleEvent) {
          // Update existing single event
          dispatch(updateEvent({ id: store.selectedEvent.id, ...modifiedEvent }))
        } else {
          // Create new single event
          dispatch(addEvent(modifiedEvent))
        }
      }

      calendarApi?.refetchEvents()
      onClose()
    },
    [values, store.selectedEvent, dispatch, addEvent, updateEvent, calendarApi, onClose, formatDurationToISO8601]
  )

  const handleDelete = useCallback(() => {
    if (store.selectedEvent) {
      dispatch(deleteEvent(store.selectedEvent.id))
    }
    onClose()
  }, [store.selectedEvent, dispatch, deleteEvent, onClose])

  const canEdit = auth?.user?.role === 'PROFESSOR' || auth?.user?.role === 'ADMIN'

  return {
    handleSubmit,
    handleDelete,
    canEdit,
    formatDurationToISO8601
  }
}
