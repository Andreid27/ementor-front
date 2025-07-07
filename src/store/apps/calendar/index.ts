// ** Redux Imports
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ** Axios Imports
import {
  EventOccurrenceDTO,
  RecurringSeriesDTO,
  SingularEventDTO,
  UserDTO,
  EventsDTO
} from 'src/generated/profile-service'

// ** Types
import { profileServiceClient } from 'src/services'

// ** Types for the store
export interface CalendarState {
  events: EventOccurrenceDTO[]
  selectedEvent: EventOccurrenceDTO | null
  attendees: UserDTO[]
  myEvents: EventsDTO | null
  mySingularEvents: SingularEventDTO[]
  loading: boolean
  error: string | null
}

// ** Helper functions for setting attendee prices
const setAttendeePricesForSeries = async (seriesId: string, attendeePrices: { [key: string]: number }) => {
  const promises = Object.entries(attendeePrices).map(([attendeeId, price]) =>
    profileServiceClient.events.setRecurringSeriesAttendeePrice({
      seriesId,
      attendeeId,
      price
    })
  )
  await Promise.all(promises)
}

const setAttendeePricesForSingularEvent = async (eventId: string, attendeePrices: { [key: string]: number }) => {
  const promises = Object.entries(attendeePrices).map(([attendeeId, price]) =>
    profileServiceClient.events.setSingularEventAttendeePrice({
      eventId,
      attendeeId,
      price
    })
  )
  await Promise.all(promises)
}

const setAttendeePricesForOccurrence = async (occurrenceId: string, attendeePrices: { [key: string]: number }) => {
  const promises = Object.entries(attendeePrices).map(([attendeeId, price]) =>
    profileServiceClient.events.setEventOccurrenceAttendeePrice({
      occurrenceId,
      attendeeId,
      price
    })
  )
  await Promise.all(promises)
}

// ** Fetch Events
export const fetchEvents = createAsyncThunk<EventOccurrenceDTO[]>('appCalendar/fetchEvents', async () => {
  const response = await profileServiceClient.events.getConsolidatedEvents({
    startDate: new Date().toISOString(),
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString()
  })

  return response.data
})

// ** Add Event
export const addEvent = createAsyncThunk<any, any>('appCalendar/addEvent', async (event: any, { dispatch }) => {
  console.log('Adding event:', event)

  if (event.isRecurring && event.recurringSeriesDTO) {
    // Create recurring series
    const response = await profileServiceClient.events.createRecurringSeries({
      recurringSeriesDTO: event.recurringSeriesDTO
    })

    // If attendee prices are provided, set them after creation
    if (event.attendeePrices && Object.keys(event.attendeePrices).length > 0) {
      const seriesId = response.data.id
      if (seriesId) {
        await setAttendeePricesForSeries(seriesId, event.attendeePrices)
      }
    }

    await dispatch(fetchEvents())
    return response.data
  } else {
    // Create singular event - convert to SingularEventDTO format
    const singularEventDTO: SingularEventDTO = {
      title: event.title,
      description: event.extendedProps?.description,
      startTime: event.start instanceof Date ? event.start.toISOString() : event.start,
      duration: {
        seconds: event.allDay
          ? 86400
          : Math.floor((new Date(event.end).getTime() - new Date(event.start).getTime()) / 1000)
      },
      price: event.extendedProps?.price || 0,
      meetingLink: event.extendedProps?.meetingLink,
      expectedAttendees: event.extendedProps?.expectedAttendees || []
    }

    const response = await profileServiceClient.events.createSingularEvent({
      singularEventDTO
    })

    // If attendee prices are provided, set them after creation
    if (event.extendedProps?.attendeePrices && Object.keys(event.extendedProps.attendeePrices).length > 0) {
      const eventId = response.data.id
      if (eventId) {
        await setAttendeePricesForSingularEvent(eventId, event.extendedProps.attendeePrices)
      }
    }

    await dispatch(fetchEvents())
    return response.data
  }
})

// ** Update Event
export const updateEvent = createAsyncThunk<any, any>('appCalendar/updateEvent', async (event: any, { dispatch }) => {
  if (event.isRecurring && event.recurringSeriesDTO) {
    // Update recurring series using the new endpoint
    const response = await profileServiceClient.events.updateRecurringSeries({
      seriesId: event.id,
      recurringSeriesDTO: event.recurringSeriesDTO
    })

    // Update attendee prices if provided
    if (event.attendeePrices && Object.keys(event.attendeePrices).length > 0) {
      await setAttendeePricesForSeries(event.id, event.attendeePrices)
    }

    await dispatch(fetchEvents())
    return response.data
  } else {
    // Update singular event
    const singularEventDTO: SingularEventDTO = {
      title: event.title,
      description: event.extendedProps?.description,
      startTime: event.start instanceof Date ? event.start.toISOString() : event.start,
      duration: {
        seconds: event.allDay
          ? 86400
          : Math.floor((new Date(event.end).getTime() - new Date(event.start).getTime()) / 1000)
      },
      price: event.extendedProps?.price || 0,
      meetingLink: event.extendedProps?.meetingLink,
      expectedAttendees: event.extendedProps?.expectedAttendees || []
    }

    const response = await profileServiceClient.events.updateSingularEvent({
      eventId: event.id,
      singularEventDTO
    })

    // Update attendee prices if provided
    if (event.extendedProps?.attendeePrices && Object.keys(event.extendedProps.attendeePrices).length > 0) {
      await setAttendeePricesForSingularEvent(event.id, event.extendedProps.attendeePrices)
    }

    await dispatch(fetchEvents())
    return response.data
  }
})

// ** Update Recurring Series
export const modifyEventOccurrence = createAsyncThunk<
  RecurringSeriesDTO,
  Partial<RecurringSeriesDTO> & {
    id: string | number
    newStartTime?: string
    newEndTime?: string
    newPrice?: number
    newMeetingLink?: string
  }
>(
  'appCalendar/modifyEventOccurrence',
  async (
    event: Partial<RecurringSeriesDTO> & {
      id: string | number
      newStartTime?: string
      newEndTime?: string
      newPrice?: number
      newMeetingLink?: string
    },
    { dispatch }
  ) => {
    const response = await profileServiceClient.events.modifyEventOccurrence({
      seriesId: event.id,
      originalStartTime: event.startTime,
      newStartTime: event.newStartTime,
      newEndTime: event.newEndTime,
      newPrice: event.newPrice,
      newMeetingLink: event.newMeetingLink
    })
    await dispatch(fetchEvents())

    return response.data
  }
)

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
    attendeeIds: string[]
  }
>(
  'appCalendar/completeEventOccurrence',
  async ({ seriesId, originalStartTime, actualStartTime, actualEndTime, attendeeIds }, { dispatch }) => {
    const response = await profileServiceClient.events.completeEventOccurrence({
      requestBody: attendeeIds,
      seriesId,
      originalStartTime,
      actualStartTime,
      actualEndTime
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
  error: null
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

export const { handleSelectEvent, setLoading, setError, clearError } = appCalendarSlice.actions

// Export utility functions
export * from 'src/views/apps/calendar/utils'

export default appCalendarSlice.reducer
