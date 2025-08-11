// ** Redux Imports
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ** Axios Imports
import {
  EventOccurrenceDTO,
  RecurringSeriesDTO,
  SingularEventDTO,
  UserDTO,
  EventsDTO,
  EventAttendeeDTO
} from 'src/generated/profile-service'

// ** EventAttendee Utils
import { extractAttendeePrices, eventAttendeeDTOsToStudentIds } from 'src/views/apps/calendar/utils/eventAttendeeUtils'

// ** Types
import { profileServiceClient } from 'src/services'

/**
 * ✅ CORRECT API USAGE:
 *
 * All event creation and updates should send complete DTO objects that include:
 * - Basic event info (title, description, startTime, duration, price, meetingLink)
 * - Complete attendee information with custom pricing (eventAttendees array)
 *
 * Use RecurringSeriesDTO or SingularEventDTO/EventOccurrenceDTO structures.
 * DO NOT make separate API calls to set individual attendee prices during creation/update.
 *
 * ❌ WRONG: Create event + separate pricing API calls
 * ✅ RIGHT: Send complete DTO with all attendee data including pricing
 *
 * NOTE: Individual pricing endpoints (setEventOccurrenceAttendeePrice, etc.)
 * are still used by AttendeePricingManager for managing existing events.
 */

// ** Types for the store
export interface CalendarState {
  events: EventOccurrenceDTO[]
  selectedEvent: EventOccurrenceDTO | null
  attendees: UserDTO[]
  myEvents: EventsDTO | null
  mySingularEvents: SingularEventDTO[]
  loading: boolean
  error: string | null
  periodStart: Date
  periodEnd: Date
  selectedCalendars: string[]
}

// ** Fetch Events
export const fetchEvents = createAsyncThunk<EventOccurrenceDTO[]>(
  'appCalendar/fetchEvents',
  async (_, { getState }) => {
    try {
      const state = getState() as any
      const { periodStart, periodEnd } = state.calendar

      const response = await profileServiceClient.events.getConsolidatedEvents({
        startDate: periodStart.toISOString(),
        endDate: periodEnd.toISOString()
      })

      return response.data
    } catch (error) {
      console.error('fetchEvents API error:', error)
      throw error
    }
  }
)

// ** Add Event
export const addEvent = createAsyncThunk<any, any>('appCalendar/addEvent', async (event: any, { dispatch }) => {
  console.log('Adding event:', event)

  if (event.isRecurring && event.recurringSeriesDTO) {
    // Create recurring series with complete attendee information
    const recurringSeriesDTO: RecurringSeriesDTO = {
      ...event.recurringSeriesDTO,
      // Ensure attendees are included with complete pricing information
      eventAttendees: event.attendees || event.extendedProps?.attendees || []
    }

    const response = await profileServiceClient.events.createRecurringSeries({
      recurringSeriesDTO
    })

    await dispatch(fetchEvents())
    return response.data
  } else {
    // Create singular event with complete attendee information
    // Calculate duration in ISO 8601 format to match recurring series format
    const durationSeconds = event.allDay
      ? 86400
      : Math.floor((new Date(event.end).getTime() - new Date(event.start).getTime()) / 1000)

    const durationHours = Math.floor(durationSeconds / 3600)
    const durationMinutes = Math.floor((durationSeconds % 3600) / 60)

    let durationISO8601 = 'PT'
    if (durationHours > 0) durationISO8601 += `${durationHours}H`
    if (durationMinutes > 0) durationISO8601 += `${durationMinutes}M`
    const finalDuration = durationISO8601 || 'PT0M'

    const singularEventDTO: SingularEventDTO = {
      title: event.title,
      description: event.extendedProps?.description,
      startTime: event.start instanceof Date ? event.start.toISOString() : event.start,
      duration: finalDuration as any, // Use ISO 8601 duration format like recurring series
      price: event.extendedProps?.price || 0,
      meetingLink: event.extendedProps?.meetingLink,
      // Include complete attendee information with pricing in the main payload
      eventAttendees: event.extendedProps?.attendees || event.attendees || []
    }

    const response = await profileServiceClient.events.createSingularEvent({
      singularEventDTO
    })

    await dispatch(fetchEvents())
    return response.data
  }
})

// ** Update Event
export const updateEvent = createAsyncThunk<any, any>(
  'appCalendar/updateEvent',
  async (event: any, { dispatch, getState }) => {
    console.log('🏪 Store updateEvent called with:', {
      event,
      eventId: event.id,
      isRecurring: event.isRecurring,
      hasRecurringSeriesDTO: !!event.recurringSeriesDTO,
      pathToTake: event.isRecurring && event.recurringSeriesDTO ? 'RECURRING_SERIES' : 'SINGULAR_EVENT'
    })

    if (event.isRecurring && event.recurringSeriesDTO) {
      // Update recurring series with complete attendee information
      const recurringSeriesDTO: RecurringSeriesDTO = {
        ...event.recurringSeriesDTO,
        // Ensure attendees are included with complete pricing information
        eventAttendees: event.attendees || event.extendedProps?.attendees || []
      }

      const response = await profileServiceClient.events.updateRecurringSeries({
        seriesId: event.id,
        recurringSeriesDTO
      })

      await dispatch(fetchEvents())
      return response.data
    } else {
      // Update singular event with complete attendee information
      // Calculate duration in ISO 8601 format to match recurring series format
      const durationSeconds = event.allDay
        ? 86400
        : Math.floor((new Date(event.end).getTime() - new Date(event.start).getTime()) / 1000)

      const durationHours = Math.floor(durationSeconds / 3600)
      const durationMinutes = Math.floor((durationSeconds % 3600) / 60)

      let durationISO8601 = 'PT'
      if (durationHours > 0) durationISO8601 += `${durationHours}H`
      if (durationMinutes > 0) durationISO8601 += `${durationMinutes}M`
      const finalDuration = durationISO8601 || 'PT0M'

      const singularEventDTO: SingularEventDTO = {
        title: event.title,
        description: event.extendedProps?.description,
        startTime: event.start instanceof Date ? event.start.toISOString() : event.start,
        duration: finalDuration as any, // Use ISO 8601 duration format like recurring series
        price: event.extendedProps?.price || 0,
        meetingLink: event.extendedProps?.meetingLink,
        // Include complete attendee information with pricing in the main payload
        eventAttendees: event.extendedProps?.attendees || event.attendees || []
      }

      // ⚠️ CRITICAL: For singular events, ALWAYS use Redux selectedEvent as single source of truth
      const state = getState() as any
      const selectedEvent = state.calendar?.selectedEvent

      // For singular events, prioritize the selectedEvent ID from Redux store
      let eventIdToUse: string | null = null

      if (selectedEvent && !selectedEvent.recurringSeriesId) {
        // This is a singular event - use the Redux store ID as single source of truth
        eventIdToUse = selectedEvent.id
        console.log('🏪 Using Redux selectedEvent.id as single source of truth:', selectedEvent.id)
      } else {
        // Fallback to event.id if provided
        eventIdToUse = event.id || null
        console.log('🏪 Using event.id as fallback:', event.id)
      }

      console.log('🏪 Store DETAILED ID ANALYSIS:', {
        'selectedEvent exists': !!selectedEvent,
        'selectedEvent.id': selectedEvent?.id,
        'selectedEvent.recurringSeriesId': selectedEvent?.recurringSeriesId,
        'event.id (raw)': event.id,
        'eventIdToUse (final)': eventIdToUse,
        decision: selectedEvent && !selectedEvent.recurringSeriesId ? 'USING_REDUX_STORE' : 'USING_EVENT_PAYLOAD'
      })

      const hasEventId = Boolean(eventIdToUse)

      console.log('🏪 Store singular event decision:', {
        eventId: eventIdToUse,
        hasEventId,
        action: hasEventId ? 'UPDATE (PUT /events/singular/{id})' : 'ERROR - NO ID AVAILABLE',
        singularEventDTO
      })

      if (hasEventId) {
        // UPDATE existing singular event
        console.log('📝 Store updating singular event:', {
          eventId: eventIdToUse,
          endpoint: 'PUT /events/singular/{eventId}',
          singularEventDTO
        })

        const response = await profileServiceClient.events.updateSingularEvent({
          eventId: eventIdToUse.toString(),
          singularEventDTO
        })

        await dispatch(fetchEvents())
        return response.data
      } else {
        // This should never happen for updateEvent
        throw new Error(
          '❌ CRITICAL ERROR: updateEvent called but no event ID found anywhere! Cannot update without ID.'
        )
      }
    }
  }
)

// ** Modify Event Occurrence
export const modifyEventOccurrence = createAsyncThunk<
  any,
  {
    seriesId: string
    originalStartTime: string
    newStartTime: string
    eventAttendeeDTO: EventAttendeeDTO[]
    duration?: string
    newPrice?: number
    newMeetingLink?: string
    title?: string
    description?: string
  }
>('appCalendar/modifyEventOccurrence', async (payload, { dispatch }) => {
  console.log('Redux modifyEventOccurrence action called with:', payload)

  const response = await profileServiceClient.events.modifyEventOccurrence({
    seriesId: payload.seriesId,
    originalStartTime: payload.originalStartTime,
    newStartTime: payload.newStartTime,
    eventAttendeeDTO: payload.eventAttendeeDTO,
    duration: payload.duration,
    newPrice: payload.newPrice,
    newMeetingLink: payload.newMeetingLink
  })

  console.log('Redux modifyEventOccurrence API response:', response.data)
  await dispatch(fetchEvents())

  return response.data
})

export const cancelEventOccurrence = createAsyncThunk<
  RecurringSeriesDTO,
  { seriesId: string | number; occurrenceStartTime: string }
>('appCalendar/cancelEventOccurrence', async ({ seriesId, occurrenceStartTime }, { dispatch }) => {
  const response = await profileServiceClient.events.cancelEventOccurrence({
    seriesId: seriesId.toString(),
    originalStartTime: occurrenceStartTime
  })
  await dispatch(fetchEvents())

  return response.data
})

// ** Delete Event
export const deleteEvent = createAsyncThunk<any, string | number>(
  'appCalendar/deleteEvent',
  async (id: string | number, { dispatch }) => {
    const response = await profileServiceClient.events.deleteSingularEvent({ eventId: id.toString() })
    await dispatch(fetchEvents())

    return response.data
  }
)

// ** Get Attendees - Get full user DTOs for expected attendees
export const getAttendees = createAsyncThunk<UserDTO[], { seriesId?: string; occurrenceId?: string }>(
  'appCalendar/getAttendees',
  async ({ seriesId, occurrenceId }) => {
    const response = await profileServiceClient.events.getAttendees({
      seriesId,
      occurrenceId
    })

    return response.data
  }
)

// ** Get Consolidated Events for Professor
export const getConsolidatedEventsForProfessor = createAsyncThunk<
  EventOccurrenceDTO[],
  { professorId: string; startDate: string; endDate: string }
>('appCalendar/getConsolidatedEventsForProfessor', async ({ professorId, startDate, endDate }) => {
  const response = await profileServiceClient.events.getConsolidatedEventsForProfessor({
    professorId,
    startDate,
    endDate
  })

  return response.data
})

// ** Get My Events
export const getMyEvents = createAsyncThunk<EventsDTO, { startDate: string; endDate: string }>(
  'appCalendar/getMyEvents',
  async ({ startDate, endDate }) => {
    const response = await profileServiceClient.events.getMyEvents({
      startDate,
      endDate
    })

    return response.data
  }
)

// ** Get My Singular Events
export const getMySingularEvents = createAsyncThunk<SingularEventDTO[], { startDate: string; endDate: string }>(
  'appCalendar/getMySingularEvents',
  async ({ startDate, endDate }) => {
    const response = await profileServiceClient.events.getMySingularEvents({
      startDate,
      endDate
    })

    return response.data
  }
)

// ** Get Singular Events for Professor
export const getSingularEventsForProfessor = createAsyncThunk<
  SingularEventDTO[],
  { professorId: string; startDate: string; endDate: string }
>('appCalendar/getSingularEventsForProfessor', async ({ professorId, startDate, endDate }) => {
  const response = await profileServiceClient.events.getSingularEventsForProfessor({
    professorId,
    startDate,
    endDate
  })

  return response.data
})

// ** Complete Event Occurrence with Attendance
export const completeEventOccurrence = createAsyncThunk<
  EventOccurrenceDTO,
  {
    seriesId: string
    originalStartTime: string
    actualStartTime: string
    actualEndTime: string
    eventAttendeeDTO: EventAttendeeDTO[]
    description?: string
  }
>(
  'appCalendar/completeEventOccurrence',
  async (
    { seriesId, originalStartTime, actualStartTime, actualEndTime, eventAttendeeDTO, description },
    { dispatch }
  ) => {
    const response = await profileServiceClient.events.completeEventOccurrence({
      seriesId,
      originalStartTime,
      actualStartTime,
      actualEndTime,
      eventAttendeeDTO,
      description
    })
    await dispatch(fetchEvents())

    return response.data
  }
)

// ** Set Individual Attendee Prices
export const setEventOccurrenceAttendeePrice = createAsyncThunk<
  void,
  { occurrenceId: string; attendeeId: string; price: number }
>('appCalendar/setEventOccurrenceAttendeePrice', async ({ occurrenceId, attendeeId, price }) => {
  await profileServiceClient.events.setEventOccurrenceAttendeePrice({
    occurrenceId,
    attendeeId,
    price
  })
})

export const setRecurringSeriesAttendeePrice = createAsyncThunk<
  void,
  { seriesId: string; attendeeId: string; price: number }
>('appCalendar/setRecurringSeriesAttendeePrice', async ({ seriesId, attendeeId, price }) => {
  await profileServiceClient.events.setRecurringSeriesAttendeePrice({
    seriesId,
    attendeeId,
    price
  })
})

export const setSingularEventAttendeePrice = createAsyncThunk<
  void,
  { eventId: string; attendeeId: string; price: number }
>('appCalendar/setSingularEventAttendeePrice', async ({ eventId, attendeeId, price }) => {
  await profileServiceClient.events.setSingularEventAttendeePrice({
    eventId,
    attendeeId,
    price
  })
})

const initialState: CalendarState = {
  events: [],
  selectedEvent: null,
  attendees: [],
  myEvents: null,
  mySingularEvents: [],
  loading: false,
  error: null,
  periodStart: new Date(),
  periodEnd: new Date(new Date().setMonth(new Date().getMonth() + 1)),
  selectedCalendars: []
}

export const selectCalendarEvents = (state: { calendar: CalendarState }) => state.calendar.events
export const selectSelectedEvent = (state: { calendar: CalendarState }) => state.calendar.selectedEvent
export const selectAttendees = (state: { calendar: CalendarState }) => state.calendar?.attendees || []
export const selectMyEvents = (state: { calendar: CalendarState }) => state.calendar.myEvents
export const selectMySingularEvents = (state: { calendar: CalendarState }) => state.calendar.mySingularEvents
export const selectCalendarLoading = (state: { calendar: CalendarState }) => state.calendar.loading
export const selectCalendarError = (state: { calendar: CalendarState }) => state.calendar.error

export const appCalendarSlice = createSlice({
  name: 'appCalendar',
  initialState,
  reducers: {
    handleSelectEvent: (state, action) => {
      state.selectedEvent = action.payload
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setError: (state, action) => {
      state.error = action.payload
    },
    clearError: state => {
      state.error = null
    },
    setPeriod: (state, action) => {
      const { startDate, endDate } = action.payload
      state.periodStart = new Date(startDate)
      state.periodEnd = new Date(endDate)
    },
    handleAllCalendars: (state, action) => {
      const { calendarsColor } = action.payload
      if (calendarsColor) {
        const calendarNames = Object.keys(calendarsColor)
        state.selectedCalendars = action.payload.value ? calendarNames : []
      }
    },
    handleCalendarsUpdate: (state, action) => {
      const calendarName = action.payload
      const index = state.selectedCalendars.indexOf(calendarName)
      if (index === -1) {
        state.selectedCalendars.push(calendarName)
      } else {
        state.selectedCalendars.splice(index, 1)
      }
    }
  },
  extraReducers: builder => {
    // Fetch Events
    builder.addCase(fetchEvents.pending, state => {
      state.loading = true
      state.error = null
    })
    builder.addCase(fetchEvents.fulfilled, (state, action) => {
      state.events = action.payload
      state.loading = false
    })
    builder.addCase(fetchEvents.rejected, (state, action) => {
      state.loading = false
      state.error = action.error.message || 'Failed to fetch events'
    })

    // Get Attendees
    builder.addCase(getAttendees.fulfilled, (state, action) => {
      state.attendees = action.payload
    })

    // Get My Events
    builder.addCase(getMyEvents.fulfilled, (state, action) => {
      state.myEvents = action.payload
    })

    // Get My Singular Events
    builder.addCase(getMySingularEvents.fulfilled, (state, action) => {
      state.mySingularEvents = action.payload
    })

    // Update Event - refresh selected event if it was updated
    builder.addCase(updateEvent.fulfilled, (state, action) => {
      // After an event is updated, if there's a selected event,
      // try to find the updated version in the refreshed events
      if (state.selectedEvent) {
        const updatedEvent = state.events.find(event => {
          // For recurring events, match by series ID and occurrence time
          if (state.selectedEvent.recurringSeriesId) {
            return (
              event.recurringSeriesId === state.selectedEvent.recurringSeriesId &&
              event.effectiveStartTime === state.selectedEvent.effectiveStartTime
            )
          }
          // For single events, match by ID
          return event.id === state.selectedEvent.id
        })

        if (updatedEvent) {
          console.log('Redux store - Updating selected event with fresh data:', {
            oldEvent: state.selectedEvent,
            newEvent: updatedEvent
          })
          state.selectedEvent = updatedEvent
        }
      }
    })

    // Handle loading states for async actions
    builder.addMatcher(
      action => action.type.endsWith('/pending'),
      state => {
        state.loading = true
        state.error = null
      }
    )
    builder.addMatcher(
      action => action.type.endsWith('/rejected'),
      (state, action) => {
        state.loading = false
        state.error = action.error?.message || 'An error occurred'
      }
    )
    builder.addMatcher(
      action => action.type.endsWith('/fulfilled'),
      state => {
        state.loading = false
      }
    )
  }
})

export const {
  handleSelectEvent,
  setLoading,
  setError,
  clearError,
  setPeriod,
  handleAllCalendars,
  handleCalendarsUpdate
} = appCalendarSlice.actions

// Export utility functions
export * from 'src/views/apps/calendar/utils'

export default appCalendarSlice.reducer
