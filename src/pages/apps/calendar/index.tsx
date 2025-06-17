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

export type CalendarLabel = 'Personal' | 'Business' | 'Family' | 'Holiday' | 'ETC'

export type CalendarColors = {
  [key in CalendarLabel]: 'error' | 'primary' | 'warning' | 'success' | 'info'
}

export interface CalendarStore {
  events: EventOccurrenceDTO[]
  selectedEvent: CalendarEvent | null
  selectedCalendars: CalendarLabel[]
}

// ** CalendarColors
const calendarsColor: CalendarColors = {
  Personal: 'error',
  Business: 'primary',
  Family: 'warning',
  Holiday: 'success',
  ETC: 'info'
}

const AppCalendar = () => {
  // ** States
  const [calendarApi, setCalendarApi] = useState<CalendarApi | null>(null)
  const [leftSidebarOpen, setLeftSidebarOpen] = useState<boolean>(false)
  const [addEventSidebarOpen, setAddEventSidebarOpen] = useState<boolean>(false)
  const [studentAvatars, setStudentAvatars] = useState<any[]>([])

  // ** Hooks
  const { settings } = useSettings()
  const dispatch = useDispatch()
  const store = useSelector((state: any) => state.calendar) as CalendarStore
  const [localStore, setLocalStore] = useState<CalendarStore>(store)
  const [calendarInfo, setCalendarInfo] = useState<any>(null)
  const students = useSelector(selectAllStudents)

  // ** Vars
  const leftSidebarWidth = 300
  const addEventSidebarWidth = 400
  const { skin, direction } = settings
  const mdAbove = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'))

  // ** Profile Picture Processing Function
  const processStudentAvatars = useCallback(async (events: EventOccurrenceDTO[], users: any[]) => {
    let uniqueStudents = Array.from(new Set(students))
    let processedUsersList = []

    for (const studentUser of uniqueStudents) {
      const user = users.find(user => user.id === studentUser.id)
      if (user) {
        const processedUser = extractProfilePicture(user)
        processedUsersList.push(processedUser)
      }
    }

    const result = await Promise.all(
      processedUsersList.map(async profilePicture => {
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

    const studentsWithAvatars = uniqueStudents.map((row: any) => {
      const user = result.find(u => u.userId === row.id)

      return { ...row, avatar: user?.avatar }
    })

    return studentsWithAvatars
  }, [])

  useEffect(() => {
    // @ts-ignore
    dispatch(fetchEvents())
    setLocalStore(store)
  }, [])

  useEffect(() => {
    console.log('Calendar info updated:', calendarInfo)
    if (calendarInfo) {
      const startDate = calendarInfo?.start?.toISOString() || new Date().toISOString()
      const endDate =
        calendarInfo?.end?.toISOString() || new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString()

      console.log('Fetching events for date range:', { startDate, endDate })

      profileServiceClient.events
        .getConsolidatedEvents({
          startDate,
          endDate
        })
        .then(async response => {
          console.log('Fetched events:', response.data)
          const studentsWithAvatars = await processStudentAvatars(response.data, students)
          setStudentAvatars(studentsWithAvatars)
          setLocalStore(prevStore => ({ ...prevStore, events: response.data }))
        })
        .catch(error => {
          console.error('Error fetching events:', error)
        })
    }
  }, [calendarInfo, processStudentAvatars, students])

  const handleLeftSidebarToggle = () => setLeftSidebarOpen(!leftSidebarOpen)
  const handleAddEventSidebarToggle = () => setAddEventSidebarOpen(!addEventSidebarOpen)
  console.log(localStore)

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
        calendarsColor={calendarsColor}
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
          store={localStore}
          dispatch={dispatch}
          direction={direction}
          updateEvent={updateEvent}
          calendarApi={calendarApi}
          calendarsColor={calendarsColor}
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
        store={localStore}
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
