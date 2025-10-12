// ** React Imports
import { useEffect, useState, useCallback } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import { Theme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

// ** Redux Imports
import { useDispatch, useSelector } from 'react-redux'

// ** Hooks
// @ts-ignore
import { useSettings } from 'src/@core/hooks/useSettings'

// ** FullCalendar & App Components Imports
// @ts-ignore
import Calendar from 'src/views/apps/calendar/Calendar'
// @ts-ignore
import SidebarLeft from 'src/views/apps/calendar/SidebarLeft'
// @ts-ignore
import CalendarWrapper from 'src/@core/styles/libs/fullcalendar'
// @ts-ignore
import AddEventSidebar from 'src/views/apps/calendar/AddEventSidebar'

// ** Actions
import {
  addEvent,
  fetchEvents,
  deleteEvent,
  updateEvent,
  handleSelectEvent,
  handleAllCalendars,
  handleCalendarsUpdate,
  setPeriod
  // @ts-ignore
} from 'src/store/apps/calendar'

// Import Redux for creating the action
import { createAsyncThunk } from '@reduxjs/toolkit'
import { EventAttendeeDTO } from 'src/generated/profile-service'

// ** Profile Picture Processing
import extractProfilePicture from 'src/@core/axios/profile-picture-extractor'
import profilePictureDownloader from 'src/@core/axios/profile-picture-downloader'

// ** Types
import { CalendarApi } from '@fullcalendar/core'
import { EventOccurrenceDTO, profileServiceClient } from 'src/services'
import { selectAllStudents } from 'src/store/apps/user'
import { ca } from 'date-fns/locale'

// ** Types
export interface CalendarEvent {
  id: number | string
  url: string
  title: string
  start: Date | string
  end: Date | string
  allDay: boolean
  extendedProps: {
    calendar: CalendarLabel
    guests?: string[]
    location?: string
    description?: string
  }
}

export type CalendarLabel = string // Make it dynamic instead of fixed types

export type CalendarColors = {
  [key: string]: 'error' | 'primary' | 'warning' | 'success' | 'info' | 'secondary'
}

export interface CalendarStore {
  events: EventOccurrenceDTO[]
  selectedEvent: CalendarEvent | null
  selectedCalendars: CalendarLabel[]
}

// ** Dynamic CalendarColors - will be populated based on actual event data
const calendarsColor: CalendarColors = {
  // All colors will be dynamically assigned based on series UUID
}

const AppCalendar = () => {
  // ** States
  const [calendarApi, setCalendarApi] = useState<CalendarApi | null>(null)
  const [leftSidebarOpen, setLeftSidebarOpen] = useState<boolean>(false)
  const [addEventSidebarOpen, setAddEventSidebarOpen] = useState<boolean>(false)
  const [studentAvatars, setStudentAvatars] = useState<any[]>([])
  const [dynamicCalendarsColor, setDynamicCalendarsColor] = useState<CalendarColors>(calendarsColor)

  // ** Hooks
  const { settings } = useSettings()
  const dispatch = useDispatch()
  const store = useSelector((state: any) => state.calendar) as CalendarStore
  const [calendarInfo, setCalendarInfo] = useState<any>(null)
  const students = useSelector(selectAllStudents)

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

      return response.data
    },
    [dispatch]
  )

  // ** Vars
  const leftSidebarWidth = 300
  const addEventSidebarWidth = 800
  const { skin, direction } = settings
  const mdAbove = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'))

  // ** Profile Picture Processing Function
  const processStudentAvatars = useCallback(async (events: EventOccurrenceDTO[], users: any[]) => {
    let uniqueStudents = Array.from(new Set(students))
    let processedUsersList: any[] = []

    // First, process all users to extract profile picture information
    for (const studentUser of uniqueStudents) {
      const user = users.find((user: any) => user.id === (studentUser as any).id)
      if (user) {
        const processedUser = extractProfilePicture(user)
        processedUsersList.push(processedUser)
      }
    }

    // Download/process the profile pictures from processedUsersList
    const usersWithProfilePictures = await Promise.all(
      processedUsersList.map(async (profilePicture: any) => {
        if (profilePicture.type === 'API') {
          const avatar = await profilePictureDownloader(profilePicture.url, profilePicture.userId)
          return { ...profilePicture, avatar: avatar || null }
        } else if (profilePicture.type === 'EXTERNAL') {
          return { ...profilePicture, avatar: profilePicture.url }
        } else {
          return { ...profilePicture, avatar: null }
        }
      })
    )

    // Map the processed users with profile pictures back to the student data
    // This ensures compatibility with all profile picture field formats
    const studentsWithAvatars = uniqueStudents.map((student: any) => {
      const userWithPicture = usersWithProfilePictures.find((u: any) => u.userId === student.id)

      return {
        ...student,
        avatar: userWithPicture?.avatar,
        picture: userWithPicture?.avatar, // Add UserDTO compatible field
        profilePicture: userWithPicture?.avatar // Add legacy compatible field
      }
    })

    return studentsWithAvatars
  }, [])

  // ** Function to dynamically generate calendar colors based on series UUID
  const generateDynamicCalendarColors = useCallback((events: EventOccurrenceDTO[]) => {
    const dynamicColors: CalendarColors = {
      ...calendarsColor,
      // Always include Personal category for singular events
      Personal: 'primary'
    }

    // 6 distinct MUI colors - we'll cycle through these
    const colorOptions: Array<'error' | 'primary' | 'warning' | 'success' | 'info' | 'secondary'> = [
      'secondary', // Purple/Gray (start with secondary since Personal uses primary)
      'success', // Green
      'info', // Light Blue
      'warning', // Orange/Yellow
      'error', // Red
      'primary' // Blue (will be used if we have more than 5 series)
    ]

    // Improved hash function with better distribution
    const hashWithSeed = (str: string, seed: number = 42): number => {
      let hash = seed
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i)
        hash = (hash << 5) - hash + char
        hash = Math.imul(hash, 0x5bd1e995) // Better mixing
        hash ^= hash >>> 15
      }
      return Math.abs(hash)
    }

    // Collect all unique series IDs
    const uniqueSeriesIds = Array.from(
      new Set(events.filter(event => event.recurringSeriesId).map(event => event.recurringSeriesId!))
    )

    // Assign colors using improved hash function for better distribution
    uniqueSeriesIds.forEach(seriesId => {
      const seriesCategory = `Series-${seriesId}`

      // Use hash of the series ID with seed for consistent color assignment
      const hash = hashWithSeed(seriesId, 42)
      const colorIndex = hash % colorOptions.length
      dynamicColors[seriesCategory] = colorOptions[colorIndex]

      const event = events.find(e => e.recurringSeriesId === seriesId)
      console.log(
        `Assigned color ${colorOptions[colorIndex]} (hash: ${hash}, index: ${colorIndex}) to series: ${event?.seriesTitle} (${seriesId})`
      )
    })

    return dynamicColors
  }, [])

  useEffect(() => {
    const fetchAndProcessEvents = async () => {
      if (calendarInfo) {
        // Step 1: Set the period and wait for completion
        await dispatch(setPeriod({ startDate: calendarInfo.start, endDate: calendarInfo.end }))

        // Step 2: Fetch events and wait for completion
        const fetchResult = await dispatch(fetchEvents())
        const response = fetchResult?.payload

        if (!response) {
          console.error('Failed to fetch events - no response payload', response)
          return
        }

        // Step 3: Process student avatars and wait for completion
        const studentsWithAvatars = await processStudentAvatars(response, students)
        setStudentAvatars(studentsWithAvatars)

        // Step 4: Generate dynamic calendar colors (synchronous)
        const newDynamicColors = generateDynamicCalendarColors(response)
        console.log('Generated dynamic colors:', newDynamicColors)
        setDynamicCalendarsColor(newDynamicColors)

        // Step 5: Initialize selected calendars with all available calendars (show all by default)
        const allCalendarNames = Object.keys(newDynamicColors)
        if (allCalendarNames.length > 0) {
          dispatch(handleAllCalendars({ calendarsColor: newDynamicColors, value: true }))
        }
      }
    }
    fetchAndProcessEvents()
  }, [calendarInfo, processStudentAvatars, students, generateDynamicCalendarColors])

  const handleLeftSidebarToggle = () => setLeftSidebarOpen(!leftSidebarOpen)
  const handleAddEventSidebarToggle = () => setAddEventSidebarOpen(!addEventSidebarOpen)

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

  return (
    <CalendarWrapper
      className='app-calendar'
      sx={{
        boxShadow: skin === 'bordered' ? 0 : 6,
        ...(skin === 'bordered' && { border: (theme: Theme) => `1px solid ${theme.palette.divider}` })
      }}
    >
      <SidebarLeft
        store={store}
        mdAbove={mdAbove}
        dispatch={dispatch}
        calendarsColor={dynamicCalendarsColor}
        leftSidebarOpen={leftSidebarOpen}
        leftSidebarWidth={leftSidebarWidth}
        handleSelectEvent={handleSelectEvent}
        handleAllCalendars={handleAllCalendars}
        handleCalendarsUpdate={handleCalendarsUpdate}
        handleLeftSidebarToggle={handleLeftSidebarToggle}
        handleAddEventSidebarToggle={handleAddEventSidebarToggle}
      />
      <Box
        sx={{
          p: 6,
          pb: 0,
          flexGrow: 1,
          borderRadius: 1,
          boxShadow: 'none',
          backgroundColor: 'background.paper',
          ...(mdAbove ? { borderTopLeftRadius: 0, borderBottomLeftRadius: 0 } : {})
        }}
      >
        {/* @ts-ignore */}
        <Calendar
          store={store}
          dispatch={dispatch}
          direction={direction}
          updateEvent={updateEvent}
          calendarApi={calendarApi}
          calendarsColor={dynamicCalendarsColor}
          setCalendarApi={setCalendarApi}
          handleSelectEvent={handleSelectEvent}
          handleLeftSidebarToggle={handleLeftSidebarToggle}
          handleAddEventSidebarToggle={handleAddEventSidebarToggle}
          // @ts-ignore
          studentAvatars={studentAvatars}
          // @ts-ignore
          onDatesSet={info => setCalendarInfo(info)}
        />
      </Box>
      <AddEventSidebar
        store={store}
        dispatch={dispatch}
        addEvent={addEvent}
        updateEvent={updateEvent}
        modifyEventOccurrence={modifyEventOccurrence}
        cancelEventOccurrence={cancelEventOccurrence}
        completeEventOccurrence={completeEventOccurrence}
        deleteEvent={deleteEvent}
        calendarApi={calendarApi}
        drawerWidth={addEventSidebarWidth}
        handleSelectEvent={handleSelectEvent}
        addEventSidebarOpen={addEventSidebarOpen}
        handleAddEventSidebarToggle={handleAddEventSidebarToggle}
        students={studentAvatars}
      />
    </CalendarWrapper>
  )
}

AppCalendar.acl = {
  action: 'read',
  subject: 'professor-pages'
}

export default AppCalendar
