// Global type declarations for project-specific modules

declare module 'src/@core/hooks/useSettings' {
  export function useSettings(): {
    settings: any
    saveSettings: (values: any) => void
  }
}

declare module 'src/views/apps/calendar/Calendar' {
  import { ComponentType } from 'react'

  const Calendar: ComponentType<{
    store: any
    dispatch: any
    direction: string
    updateEvent: any
    calendarApi: any
    calendarsColor: any
    setCalendarApi: any
    handleSelectEvent: any
    handleLeftSidebarToggle: any
    handleAddEventSidebarToggle: any
  }>
  export default Calendar
}

declare module 'src/views/apps/calendar/SidebarLeft' {
  import { ComponentType } from 'react'

  const SidebarLeft: ComponentType<{
    store: any
    mdAbove: boolean
    dispatch: any
    calendarsColor: any
    leftSidebarOpen: boolean
    leftSidebarWidth: number
    handleSelectEvent: any
    handleAllCalendars: any
    handleCalendarsUpdate: any
    handleLeftSidebarToggle: any
    handleAddEventSidebarToggle: any
  }>
  export default SidebarLeft
}

declare module 'src/@core/styles/libs/fullcalendar' {
  import { ComponentType } from 'react'

  const CalendarWrapper: ComponentType<{
    className?: string
    sx?: any
    children: React.ReactNode
  }>
  export default CalendarWrapper
}

declare module 'src/store/apps/calendar' {
  export const addEvent: any
  export const fetchEvents: any
  export const deleteEvent: any
  export const updateEvent: any
  export const handleSelectEvent: any
  export const handleAllCalendars: any
  export const handleCalendarsUpdate: any
}
