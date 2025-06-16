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
export const addEvent = createAsyncThunk<RecurringSeriesDTO, Partial<RecurringSeriesDTO>>(
  'appCalendar/addEvent',
  async (event: Partial<RecurringSeriesDTO>, { dispatch }) => {
    console.log('Adding event:', event)

    const response = await profileServiceClient.events.createRecurringSeries({ recurringSeriesDTO: event })
    await dispatch(fetchEvents())

    return response.data
  }
)

// ** Update Event
export const updateEvent = createAsyncThunk<SingularEventDTO, Partial<SingularEventDTO> & { id: string | number }>(
  'appCalendar/updateEvent',
  async (event: Partial<SingularEventDTO> & { id: string | number }, { dispatch }) => {
    const response = await profileServiceClient.events.updateSingularEvent({
      eventId: event.id,
      singularEventDTO: event
    })
    await dispatch(fetchEvents())

    return response.data
  }
)

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
