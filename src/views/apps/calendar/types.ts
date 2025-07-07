// ** Types
import { CalendarStore } from 'src/pages/apps/calendar'
import { EventOccurrenceDTO, RecurringSeriesDTO } from 'src/generated/profile-service'
import { CalendarApi } from '@fullcalendar/core'
import { Dispatch } from '@reduxjs/toolkit'

export interface EventFormValues {
  recurringSeriesDTO?: RecurringSeriesDTO
  isRecurring?: boolean
  // Individual event fields
  title: string
  description: string
  startDate: Date
  endDate: Date
  allDay: boolean
  meetingLink: string
  price: number
  pattern: 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY'
  // Duration fields for easier form handling
  durationHours: number
  durationMinutes: number
  endRecurrence?: Date
  expectedAttendees: string[]
  // Per-student pricing
  attendeePrices: { [key: string]: number }
}

export const defaultEventFormState: EventFormValues = {
  isRecurring: false,
  title: '',
  description: '',
  startDate: new Date(),
  endDate: new Date(new Date().getTime() + 60 * 60 * 1000), // Default to 1 hour from now
  allDay: false, // Default to timed events
  meetingLink: '',
  price: 0,
  pattern: 'WEEKLY',
  durationHours: 1,
  durationMinutes: 0,
  expectedAttendees: [],
  attendeePrices: {}
}

export interface AddEventSidebarProps {
  store: CalendarStore
  dispatch: Dispatch<any>
  addEvent: (event: any) => void
  updateEvent: (event: any) => void
  drawerWidth: number
  calendarApi: CalendarApi | null
  deleteEvent: (id: string | number) => void
  handleSelectEvent: (event: EventOccurrenceDTO | null) => void
  addEventSidebarOpen: boolean
  handleAddEventSidebarToggle: () => void
  students: any[]
}

export interface FormData {
  title: string
}

export interface PickersComponentProps {
  label?: string
  error?: boolean
  value?: any
  onChange?: (event: any) => void
  [key: string]: any
}

export interface EventViewProps {
  selectedEvent: any
  values: EventFormValues
  onClose: () => void
}

export interface EventFormProps {
  values: EventFormValues
  setValues: React.Dispatch<React.SetStateAction<EventFormValues>>
  isEditMode: boolean
  selectedEvent: any
  students: any[]
  control: any
  errors: any
  store: any
}

export interface SidebarHeaderProps {
  isEditMode: boolean
  selectedEvent: any
  canEdit: boolean
  onEdit: () => void
  onDelete: () => void
  onCancel: () => void
  onClose: () => void
  isDaySummary?: boolean
}

export interface SidebarFooterProps {
  isEditMode: boolean
  selectedEvent: any
  onClose: () => void
  onCancel: () => void
  onReset: () => void
}
