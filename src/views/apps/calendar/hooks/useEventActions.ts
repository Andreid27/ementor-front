import { useCallback } from 'react'
import { useAuth } from 'src/hooks/useAuth'
import { useSelector } from 'react-redux'
import { RecurringSeriesDTO } from 'src/generated/profile-service'
import { EventFormValues, FormData } from '../types'
import {
  EventTypeInfo,
  EditingScope,
  getEditingScopeConfig,
  getEventClassification,
  isSingularEvent,
  isRecurringSeriesOccurrence,
  isVirtualRecurringSeries
} from '../utils/eventTypeUtils'

interface UseEventActionsProps {
  values: EventFormValues
  store: any
  dispatch: any
  addEvent: (event: any) => void
  updateEvent: (event: any) => void
  modifyEventOccurrence: (payload: {
    seriesId: string
    originalStartTime: string
    newStartTime: string
    eventAttendeeDTO: any[]
    duration?: string
    newPrice?: number
    newMeetingLink?: string
  }) => Promise<any>
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
  modifyEventOccurrence,
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
          customPrice: a.customPrice,
          hasCustomPriceProperty: 'customPrice' in a,
          allProperties: Object.keys(a)
        }))
      })

      if (values.isRecurring) {
        const durationISO8601 = formatDurationToISO8601(values.durationHours, values.durationMinutes)

        // Clean up attendee data: remove customPrice if hasCustomPricing is false
        const cleanedAttendees = values.attendees?.map(attendee => {
          // Create base attendee object with only the required fields
          const baseAttendee = {
            attendeeId: attendee.attendeeId,
            expected: attendee.expected,
            hasCustomPricing: attendee.hasCustomPricing,
            attended: attendee.attended
          }

          // Only include customPrice if hasCustomPricing is true
          if (attendee.hasCustomPricing && attendee.customPrice !== undefined) {
            return { ...baseAttendee, customPrice: attendee.customPrice }
          }

          return baseAttendee
        })

        // Check if this is editing an existing recurring series/occurrence
        const isEditingRecurring =
          store.selectedEvent !== null &&
          (store.selectedEvent.recurringSeriesId ||
            store.selectedEvent.seriesTitle ||
            store.selectedEvent.seriesDescription ||
            (store.selectedEvent.extendedProps && store.selectedEvent.extendedProps.recurringSeriesId))

        if (isEditingRecurring) {
          // Log event type distinction details
          console.log('useEventActions - Event type distinction analysis:', {
            eventTypeInfo,
            selectedEvent: store.selectedEvent,
            eventClassification: {
              classification: getEventClassification(store.selectedEvent),
              recurringSeriesId: store.selectedEvent?.recurringSeriesId,
              virtual: store.selectedEvent?.virtual,
              isSingularEvent: isSingularEvent(store.selectedEvent),
              isEventOccurrence: isRecurringSeriesOccurrence(store.selectedEvent),
              isVirtualSeries: isVirtualRecurringSeries(store.selectedEvent)
            }
          })

          // Determine if we're modifying occurrence vs. series based on editingScope
          if (editingScope === 'occurrence' && eventTypeInfo) {
            console.log('useEventActions - Modifying event occurrence:', {
              editingScope,
              eventTypeInfo,
              selectedEvent: store.selectedEvent,
              selectedEventStart: store.selectedEvent.start,
              selectedEventStartStr: store.selectedEvent.startStr,
              extendedProps: store.selectedEvent.extendedProps,
              newStartTime: values.startDate.toISOString()
            })

            // Use modifyEventOccurrence for occurrence-specific changes
            const seriesId =
              store.selectedEvent.recurringSeriesId ||
              store.selectedEvent.extendedProps?.recurringSeriesId ||
              eventTypeInfo.recurringSeriesId

            // Get originalStartTime from EventOccurrenceDTO
            const originalStartTime = store.selectedEvent.originalStartTime

            console.log('useEventActions - originalStartTime determination:', {
              selectedEventOriginalStartTime: store.selectedEvent.originalStartTime,
              extractedOriginalStartTime: originalStartTime,
              seriesId,
              durationCalculation: {
                isAllDay: values.allDay,
                durationHours: values.durationHours,
                durationMinutes: values.durationMinutes,
                durationISO8601: durationISO8601,
                finalDuration: values.allDay ? undefined : durationISO8601
              }
            })

            const occurrencePayload = {
              seriesId: seriesId,
              originalStartTime,
              newStartTime: values.startDate.toISOString(),
              eventAttendeeDTO: cleanedAttendees,
              duration: values.allDay ? undefined : durationISO8601,
              newPrice: values.price,
              newMeetingLink: values.meetingLink
              // Note: title and description are not supported by modifyEventOccurrence API
            }

            console.log('useEventActions - About to call modify occurrence:', {
              payload: occurrencePayload,
              cleanedAttendeesDebug: cleanedAttendees?.map(a => ({
                attendeeId: a.attendeeId,
                expected: a.expected,
                hasCustomPricing: a.hasCustomPricing,
                customPrice: (a as any).customPrice || 'NOT_INCLUDED',
                hasCustomPriceField: 'customPrice' in a
              }))
            })

            await modifyEventOccurrence(occurrencePayload)
          } else {
            // Use updateEvent for series-wide changes (editingScope === 'series')
            console.log('useEventActions - Updating recurring series:', {
              editingScope,
              eventTypeInfo
            })

            const recurringSeriesDTO: RecurringSeriesDTO = {
              title: data.title,
              description: values.description,
              startTime: values.startDate.toISOString(),
              duration: durationISO8601 as any,
              pattern: values.pattern,
              price: values.price,
              meetingLink: values.meetingLink,
              endRecurrence: values.endRecurrence?.toISOString()
            }

            const seriesPayload = {
              recurringSeriesDTO,
              isRecurring: true,
              attendees: cleanedAttendees,
              id:
                store.selectedEvent.recurringSeriesId ||
                store.selectedEvent.extendedProps?.recurringSeriesId ||
                store.selectedEvent.id
            }

            console.log('useEventActions - About to dispatch update series:', {
              payload: seriesPayload,
              cleanedAttendeesDebug: cleanedAttendees?.map(a => ({
                attendeeId: a.attendeeId,
                expected: a.expected,
                hasCustomPricing: a.hasCustomPricing,
                customPrice: (a as any).customPrice || 'NOT_INCLUDED',
                hasCustomPriceField: 'customPrice' in a
              }))
            })

            await dispatch(updateEvent(seriesPayload))
          }
        } else {
          // Creating new recurring series
          const recurringSeriesDTO: RecurringSeriesDTO = {
            title: data.title,
            description: values.description,
            startTime: values.startDate.toISOString(),
            duration: durationISO8601 as any,
            pattern: values.pattern,
            price: values.price,
            meetingLink: values.meetingLink,
            endRecurrence: values.endRecurrence?.toISOString()
          }

          const eventPayload = {
            recurringSeriesDTO,
            isRecurring: true,
            attendees: cleanedAttendees
          }

          console.log('useEventActions - Creating new recurring series:', {
            payload: eventPayload
          })

          dispatch(addEvent(eventPayload))
        }
      } else {
        // Clean up attendee data: remove customPrice if hasCustomPricing is false
        const cleanedAttendees = values.attendees?.map(attendee => {
          // Create base attendee object with only the required fields
          const baseAttendee = {
            attendeeId: attendee.attendeeId,
            expected: attendee.expected,
            hasCustomPricing: attendee.hasCustomPricing,
            attended: attendee.attended
          }

          // Only include customPrice if hasCustomPricing is true
          if (attendee.hasCustomPricing && attendee.customPrice !== undefined) {
            return { ...baseAttendee, customPrice: attendee.customPrice }
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
