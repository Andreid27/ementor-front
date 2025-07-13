import { useCallback } from 'react'
import { useAuth } from 'src/hooks/useAuth'
import { useSelector } from 'react-redux'
import { RecurringSeriesDTO } from 'src/generated/profile-service'
import { EventFormValues, FormData } from '../types'
import { EventTypeInfo, EditingScope, getEditingScopeConfig } from '../utils/eventTypeUtils'

interface UseEventActionsProps {
  values: EventFormValues
  store: any
  dispatch: any
  addEvent: (event: any) => void
  updateEvent: (event: any) => void
  deleteEvent: (id: string | number) => void
  onClose: () => void
  eventTypeInfo?: EventTypeInfo | null
  editingScope?: EditingScope
}

export const useEventActions = ({
  values,
  store,
  dispatch,
  addEvent,
  updateEvent,
  deleteEvent,
  onClose,
  eventTypeInfo,
  editingScope = 'occurrence'
}: UseEventActionsProps) => {
  const auth = useAuth()

  const formatDurationToISO8601 = useCallback((hours: number, minutes: number): string => {
    let duration = 'PT'
    if (hours > 0) duration += `${hours}H`
    if (minutes > 0) duration += `${minutes}M`

    return duration || 'PT0M'
  }, [])

  const handleSubmit = useCallback(
    async (data: FormData) => {
      console.log('useEventActions - handleSubmit called with:', {
        formData: data,
        values: values,
        attendees: values.attendees,
        attendeesDetailed: values.attendees?.map(a => ({
          attendeeId: a.attendeeId,
          expected: a.expected,
          hasCustomPricing: a.hasCustomPricing,
          customPrice: a.customPrice
        }))
      })

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
          endRecurrence: values.endRecurrence?.toISOString()
          // Note: attendees will be handled separately via EventAttendeeDTO
        }

        // Clean up attendee data: remove customPrice if hasCustomPricing is false
        const cleanedAttendees = values.attendees?.map(attendee => {
          const { customPrice, ...baseAttendee } = attendee

          // Only include customPrice if hasCustomPricing is true
          if (attendee.hasCustomPricing) {
            return { ...baseAttendee, customPrice }
          }

          return baseAttendee
        })

        const eventPayload = {
          recurringSeriesDTO,
          isRecurring: true,
          // Use only EventAttendeeDTO format with cleaned data
          attendees: cleanedAttendees
        }

        console.log('useEventActions - About to dispatch recurring event:', {
          payload: eventPayload,
          attendeesWithPricing: values.attendees?.filter(a => a.hasCustomPricing),
          fullPayloadStructure: JSON.stringify(eventPayload, null, 2),
          attendeesInPayload: eventPayload.attendees?.map(a => ({
            attendeeId: a.attendeeId,
            expected: a.expected,
            hasCustomPricing: a.hasCustomPricing,
            customPrice: a.hasCustomPricing ? (a as any).customPrice : 'NOT_INCLUDED',
            constraintViolation: a.hasCustomPricing && !a.expected
          }))
        })

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

          await dispatch(updateEvent({ id: seriesId, ...eventPayload }))
          // Redux store automatically handles data refresh and selectedEvent update
        } else {
          // Creating new recurring series
          dispatch(addEvent(eventPayload))
        }
      } else {
        // Clean up attendee data: remove customPrice if hasCustomPricing is false
        const cleanedAttendees = values.attendees?.map(attendee => {
          const { customPrice, ...baseAttendee } = attendee

          // Only include customPrice if hasCustomPricing is true
          if (attendee.hasCustomPricing) {
            return { ...baseAttendee, customPrice }
          }

          return baseAttendee
        })

        const modifiedEvent = {
          display: 'block',
          title: data.title,
          end: values.endDate,
          allDay: values.allDay,
          start: values.startDate,
          extendedProps: {
            description: values.description.length ? values.description : undefined,
            meetingLink: values.meetingLink,
            price: values.price,
            // Use only EventAttendeeDTO format with cleaned data
            attendees: cleanedAttendees
          }
        }

        // Check if this is editing an existing single event
        const isEditingSingleEvent =
          store.selectedEvent !== null && !store.selectedEvent.recurringSeriesId && !store.selectedEvent.seriesTitle

        if (isEditingSingleEvent) {
          // Update existing single event
          await dispatch(updateEvent({ id: store.selectedEvent.id, ...modifiedEvent }))
          // Redux store automatically handles data refresh and selectedEvent update
        } else {
          // Create new single event
          dispatch(addEvent(modifiedEvent))
        }
      }

      onClose()
    },
    [values, store.selectedEvent, dispatch, addEvent, updateEvent, onClose, formatDurationToISO8601]
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
