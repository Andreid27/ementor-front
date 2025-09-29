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

// ** MUI Module Augmentation for custom variants
declare module '@mui/material/Button' {
  interface ButtonPropsVariantOverrides {
    tonal: true
  }
}

declare module 'src/@core/components/mui/text-field' {
  import { TextFieldProps } from '@mui/material/TextField'
  import { ForwardRefExoticComponent, RefAttributes } from 'react'

  interface CustomTextFieldProps extends Omit<TextFieldProps, 'variant'> {
    variant?: 'filled' | 'outlined' | 'standard'
  }

  const CustomTextField: ForwardRefExoticComponent<CustomTextFieldProps & RefAttributes<HTMLDivElement>>
  export default CustomTextField
}

// ** Component ACL types
declare namespace React {
  interface FunctionComponent<P = {}> {
    acl?: {
      action: string
      subject: string
    }
  }
}

// ** Next.js page types with ACL
declare module 'next' {
  interface NextPage {
    acl?: {
      action: string
      subject: string
    }
  }
}
