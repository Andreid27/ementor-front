// ** React Imports
import { useState, useRef, useCallback } from 'react'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import { Theme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

// ** Redux Imports
import { useDispatch, useSelector } from 'react-redux'

// @ts-ignore
import AddEventSidebar from 'src/views/apps/calendar/AddEventSidebar'

// ** Actions
import {
  addEvent,
  updateEvent,
  deleteEvent,
  handleSelectEvent,
  fetchEvents
  // @ts-ignore
} from 'src/store/apps/calendar'

// ** Types
import { EventOccurrenceDTO, profileServiceClient } from 'src/services'
import { EventAttendeeDTO } from 'src/generated/profile-service'
import { selectAllStudents } from 'src/store/apps/user'
import { EventsWidgetRef } from '../acl/components/EventsWidget'

const EventsPage = () => {
  // ** States
  const [addEventSidebarOpen, setAddEventSidebarOpen] = useState<boolean>(false)
  const eventsWidgetRef = useRef<EventsWidgetRef>(null)

  // ** Hooks
  const dispatch = useDispatch()
  const store = useSelector((state: any) => state.calendar)
  const students = useSelector(selectAllStudents)
  const mdAbove = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'))

  // ** Sidebar width
  const addEventSidebarWidth = 800

  // ** Handler for opening complete event from Events Widget
  const handleCompleteEventFromWidget = useCallback(
    (event: EventOccurrenceDTO) => {
      // Set the selected event in Redux
      dispatch(handleSelectEvent(event))
      // Open the sidebar
      setAddEventSidebarOpen(true)
    },
    [dispatch]
  )

  const handleAddEventSidebarToggle = () => setAddEventSidebarOpen(!addEventSidebarOpen)

  // ** Create modifyEventOccurrence action locally to match API signature
  const modifyEventOccurrence = useCallback(
    async (payload: {
      seriesId: string
      originalStartTime: string
      newStartTime: string
      eventAttendeeDTO: EventAttendeeDTO[]
      duration?: string
      newPrice?: number
      newMeetingLink?: string
    }) => {
      console.log('Local modifyEventOccurrence action called with:', payload)

      const response = await profileServiceClient.events.modifyEventOccurrence({
        seriesId: payload.seriesId,
        originalStartTime: payload.originalStartTime,
        newStartTime: payload.newStartTime,
        eventAttendeeDTO: payload.eventAttendeeDTO,
        duration: payload.duration,
        newPrice: payload.newPrice,
        newMeetingLink: payload.newMeetingLink
      })

      console.log('Local modifyEventOccurrence API response:', response.data)
      await dispatch(fetchEvents())

      // Refresh the events widget
      if (eventsWidgetRef.current) {
        eventsWidgetRef.current.refresh()
      }

      return response.data
    },
    [dispatch]
  )

  // ** Create cancelEventOccurrence action locally
  const cancelEventOccurrence = useCallback(
    async (payload: { seriesId: string | number; occurrenceStartTime: string }) => {
      console.log('Local cancelEventOccurrence action called with:', payload)

      const response = await profileServiceClient.events.cancelEventOccurrence({
        seriesId: payload.seriesId.toString(),
        originalStartTime: payload.occurrenceStartTime
      })

      console.log('Local cancelEventOccurrence API response:', response.data)
      await dispatch(fetchEvents())

      // Refresh the events widget
      if (eventsWidgetRef.current) {
        eventsWidgetRef.current.refresh()
      }

      return response.data
    },
    [dispatch]
  )

  // ** Create completeEventOccurrence action locally
  const completeEventOccurrence = useCallback(
    async (payload: {
      singularEventId: string
      seriesId: string
      originalStartTime: string
      actualStartTime: string
      actualEndTime: string
      eventAttendeeDTO?: EventAttendeeDTO[]
      attendeeIds?: string[]
      description?: string
    }) => {
      console.log('Local completeEventOccurrence action called with:', payload)

      let eventAttendeeDTO: EventAttendeeDTO[]

      if (payload.eventAttendeeDTO) {
        // New format: EventAttendeeDTO objects already provided (from wizard)
        eventAttendeeDTO = payload.eventAttendeeDTO
      } else if (payload.attendeeIds) {
        // Legacy format: Convert attendeeIds to EventAttendeeDTO format
        eventAttendeeDTO = payload.attendeeIds.map(attendeeId => ({
          attendeeId,
          hasCustomPricing: false,
          customPrice: 0,
          expected: true,
          attended: true // Mark as attended since we're completing the event
        }))
      } else {
        console.error('completeEventOccurrence: No attendee data provided')
        return
      }

      const response = await profileServiceClient.events.completeEventOccurrence({
        singularEventId: payload.singularEventId,
        seriesId: payload.seriesId,
        originalStartTime: payload.originalStartTime,
        actualStartTime: payload.actualStartTime,
        actualEndTime: payload.actualEndTime,
        eventAttendeeDTO,
        description: payload.description
      })

      console.log('Local completeEventOccurrence API response:', response.data)

      // Update the selected event in Redux store immediately with the completed event
      if (response.data) {
        dispatch(handleSelectEvent(response.data))
      }

      // Then refresh all events to keep the list in sync
      await dispatch(fetchEvents())

      // Refresh the events widget
      if (eventsWidgetRef.current) {
        eventsWidgetRef.current.refresh()
      }

      return response.data
    },
    [dispatch]
  )

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <EventsWidget ref={eventsWidgetRef} onCompleteEvent={handleCompleteEventFromWidget} users={students} />
      </Grid>

      {/* Add Event Sidebar for completing events */}
      <AddEventSidebar
        store={store}
        dispatch={dispatch}
        addEvent={addEvent}
        updateEvent={updateEvent}
        modifyEventOccurrence={modifyEventOccurrence}
        cancelEventOccurrence={cancelEventOccurrence}
        completeEventOccurrence={completeEventOccurrence}
        deleteEvent={deleteEvent}
        calendarApi={null}
        drawerWidth={addEventSidebarWidth}
        handleSelectEvent={handleSelectEvent}
        addEventSidebarOpen={addEventSidebarOpen}
        handleAddEventSidebarToggle={handleAddEventSidebarToggle}
        students={students}
      />
    </Grid>
  )
}

EventsPage.acl = {
  action: 'read',
  subject: 'professor-pages'
}

export default EventsPage
