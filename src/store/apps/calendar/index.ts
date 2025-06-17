// ** Redux Imports
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ** Axios Imports
import { EventOccurrenceDTO, RecurringSeriesDTO, SingularEventDTO } from 'src/generated/profile-service'

// ** Types
import { profileServiceClient } from 'src/services'

// ** Types for the store
export interface CalendarState {
  events: EventOccurrenceDTO[]
  selectedEvent: EventOccurrenceDTO | null
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
      meetingLink: event.extendedProps?.meetingLink
    }

    const response = await profileServiceClient.events.createSingularEvent({
      singularEventDTO
    })
    await dispatch(fetchEvents())

    return response.data
  }
})

// ** Update Event
export const updateEvent = createAsyncThunk<any, any>('appCalendar/updateEvent', async (event: any, { dispatch }) => {
  if (event.isRecurring && event.recurringSeriesDTO) {
    // For now, updating recurring series is complex - we'll handle individual occurrence modifications
    // This could be expanded to handle full series updates
    console.log('Updating recurring series not yet implemented')

    return event
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
      meetingLink: event.extendedProps?.meetingLink
    }

    const response = await profileServiceClient.events.updateSingularEvent({
      eventId: event.id,
      singularEventDTO
    })
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

const initialState: CalendarState = {
  events: [],
  selectedEvent: null
}

export const selectCalendarEvents = (state: { appCalendar: CalendarState }) => state.appCalendar.events

export const appCalendarSlice = createSlice({
  name: 'appCalendar',
  initialState,
  reducers: {
    handleSelectEvent: (state, action) => {
      state.selectedEvent = action.payload
    }
  },
  extraReducers: builder => {
    builder.addCase(fetchEvents.fulfilled, (state, action) => {
      state.events = action.payload
    })
  }
})

export const { handleSelectEvent } = appCalendarSlice.actions

export default appCalendarSlice.reducer
