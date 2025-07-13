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
  handleCalendarsUpdate
  // @ts-ignore
} from 'src/store/apps/calendar'

// ** Profile Picture Processing
import extractProfilePicture from 'src/@core/axios/profile-picture-extractor'
import profilePictureDownloader from 'src/@core/axios/profile-picture-downloader'

// ** Types
import { CalendarApi } from '@fullcalendar/core'
import { EventOccurrenceDTO, profileServiceClient } from 'src/services'
import { selectAllStudents } from 'src/store/apps/user'

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
  [key: string]: 'error' | 'primary' | 'warning' | 'success' | 'info'
}

export interface CalendarStore {
  events: EventOccurrenceDTO[]
  selectedEvent: CalendarEvent | null
  selectedCalendars: CalendarLabel[]
}

// ** Dynamic CalendarColors - will be populated based on actual event data
const calendarsColor: CalendarColors = {
  'Virtual-Meetings': 'success',
  'General-Events': 'primary'
  // Series and Professor colors will be added dynamically
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

  // ** Vars
  const leftSidebarWidth = 300
  const addEventSidebarWidth = 600
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

  // ** Function to dynamically generate calendar colors based on event data
  const generateDynamicCalendarColors = useCallback((events: EventOccurrenceDTO[]) => {
    const dynamicColors: CalendarColors = { ...calendarsColor }

    const colorOptions: Array<'error' | 'primary' | 'warning' | 'success' | 'info'> = [
      'primary',
      'info',
      'warning',
      'error',
      'success'
    ]

    let colorIndex = 0

    events.forEach(event => {
      // Generate category name
      const calendarCategory = event.recurringSeriesId
        ? `Series-${event.seriesTitle}`
        : event.virtual
        ? 'Virtual-Meetings'
        : event.professorName
        ? `Professor-${event.professorName.replace(/\s+/g, '-')}`
        : 'General-Events'

      // Assign color if not already assigned
      if (!dynamicColors[calendarCategory]) {
        if (calendarCategory.startsWith('Series-')) {
          dynamicColors[calendarCategory] = 'info'
        } else if (calendarCategory === 'Virtual-Meetings') {
          dynamicColors[calendarCategory] = 'success'
        } else if (calendarCategory.startsWith('Professor-')) {
          dynamicColors[calendarCategory] = 'warning'
        } else {
          dynamicColors[calendarCategory] = colorOptions[colorIndex % colorOptions.length]
          colorIndex++
        }
      }
    })

    return dynamicColors
  }, [])

  useEffect(() => {
    console.log('Calendar page useEffect - calling fetchEvents')
    // @ts-ignore
    dispatch(fetchEvents())
  }, [])

  useEffect(() => {
    console.log('Local store updated:', calendarInfo)
    if (calendarInfo) {
      profileServiceClient.events
        .getConsolidatedEvents({
          startDate: calendarInfo?.start?.toISOString() || new Date().toISOString(),
          endDate:
            calendarInfo?.end?.toISOString() || new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString()
        })
        .then(async response => {
          const studentsWithAvatars = await processStudentAvatars(response.data, students)
          setStudentAvatars(studentsWithAvatars)

          // Update Redux store instead of local state
          dispatch(fetchEvents())

          // Generate dynamic calendar colors based on event data
          const newDynamicColors = generateDynamicCalendarColors(response.data)
          setDynamicCalendarsColor(newDynamicColors)
        })
        .catch(error => {
          console.error('Error fetching events:', error)
        })
    }
  }, [calendarInfo, processStudentAvatars, students, generateDynamicCalendarColors])

  const handleLeftSidebarToggle = () => setLeftSidebarOpen(!leftSidebarOpen)
  const handleAddEventSidebarToggle = () => setAddEventSidebarOpen(!addEventSidebarOpen)
  console.log('Redux store:', store)

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
