import {
  EventOccurrenceDTO,
  RecurringSeriesDTO,
  SingularEventDTO,
  SingularEventDTODuration,
  EventsDTO
} from 'src/generated/profile-service'

/**
 * Utility functions for event management and operations
 */

export interface EventIdentifier {
  eventId?: string
  seriesId?: string
  occurrenceId?: string
  type: 'singular' | 'recurring' | 'occurrence'
}

export interface EventTimeSlot {
  startTime: string
  endTime: string
  duration?: { seconds: number }
}

/**
 * Extract event identifier from event object
 */
export const getEventIdentifier = (event: any): EventIdentifier => {
  if (event.eventId) {
    return { eventId: event.eventId, type: 'singular' }
  } else if (event.seriesId) {
    return { seriesId: event.seriesId, type: 'recurring' }
  } else if (event.occurrenceId) {
    return { occurrenceId: event.occurrenceId, type: 'occurrence' }
  }

  // Fallback - try to determine from other properties
  if (event.id) {
    return { eventId: event.id, type: 'singular' }
  }

  throw new Error('Cannot determine event identifier')
}

/**
 * Calculate event end time from start time and duration
 */
export const calculateEventEndTime = (startTime: string, duration: SingularEventDTODuration): string => {
  const startDate = new Date(startTime)
  const endDate = new Date(startDate.getTime() + (duration.seconds || 0) * 1000)
  return endDate.toISOString()
}

/**
 * Calculate duration from start and end time
 */
export const calculateEventDuration = (startTime: string, endTime: string): SingularEventDTODuration => {
  const startDate = new Date(startTime)
  const endDate = new Date(endTime)
  const durationMs = endDate.getTime() - startDate.getTime()
  return { seconds: Math.floor(durationMs / 1000) }
}

/**
 * Format event duration for display
 */
export const formatEventDuration = (duration: SingularEventDTODuration): string => {
  const seconds = duration.seconds || 0
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else {
    return `${minutes}m`
  }
}

/**
 * Check if event is all-day
 */
export const isAllDayEvent = (duration: SingularEventDTODuration): boolean => {
  return (duration.seconds || 0) >= 86400 // 24 hours
}

/**
 * Get event status based on times
 */
export const getEventStatus = (
  startTime: string,
  endTime: string,
  isCompleted?: boolean,
  isCancelled?: boolean
): 'upcoming' | 'ongoing' | 'completed' | 'cancelled' => {
  if (isCancelled) return 'cancelled'
  if (isCompleted) return 'completed'

  const now = new Date()
  const start = new Date(startTime)
  const end = new Date(endTime)

  if (now < start) return 'upcoming'
  if (now > end) return 'completed'
  return 'ongoing'
}

/**
 * Sort events by start time
 */
export const sortEventsByStartTime = <T extends { startTime: string }>(events: T[]): T[] => {
  return [...events].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
}

/**
 * Filter events by date range
 */
export const filterEventsByDateRange = <T extends { startTime: string }>(
  events: T[],
  startDate: string,
  endDate: string
): T[] => {
  const start = new Date(startDate)
  const end = new Date(endDate)

  return events.filter(event => {
    const eventStart = new Date(event.startTime)
    return eventStart >= start && eventStart <= end
  })
}

/**
 * Group events by date
 */
export const groupEventsByDate = <T extends { startTime: string }>(events: T[]): Record<string, T[]> => {
  const grouped: Record<string, T[]> = {}

  events.forEach(event => {
    const date = new Date(event.startTime).toISOString().split('T')[0]
    if (!grouped[date]) {
      grouped[date] = []
    }
    grouped[date].push(event)
  })

  return grouped
}

/**
 * Check if two events overlap
 */
export const doEventsOverlap = (event1: EventTimeSlot, event2: EventTimeSlot): boolean => {
  const start1 = new Date(event1.startTime)
  const end1 = new Date(event1.endTime)
  const start2 = new Date(event2.startTime)
  const end2 = new Date(event2.endTime)

  return start1 < end2 && start2 < end1
}

/**
 * Find conflicting events
 */
export const findConflictingEvents = <T extends { startTime: string } & EventTimeSlot>(
  events: T[],
  targetEvent: EventTimeSlot
): T[] => {
  return events.filter(event => doEventsOverlap(event, targetEvent))
}

/**
 * Convert singular event to calendar event format
 */
export const singularEventToCalendarEvent = (event: SingularEventDTO) => {
  const endTime = event.duration ? calculateEventEndTime(event.startTime!, event.duration) : event.startTime

  return {
    id: event.id,
    title: event.title,
    start: event.startTime,
    end: endTime,
    allDay: event.duration ? isAllDayEvent(event.duration) : false,
    extendedProps: {
      description: event.description,
      price: event.price,
      meetingLink: event.meetingLink,
      expectedAttendees: event.expectedAttendees,
      professorId: event.professorId,
      professorName: event.professorName,
      type: 'singular'
    }
  }
}

/**
 * Convert recurring series to calendar event format
 */
export const recurringSeriesEventToCalendarEvent = (event: RecurringSeriesDTO) => {
  const endTime = event.duration ? calculateEventEndTime(event.startTime!, event.duration) : event.startTime

  return {
    id: event.id,
    title: event.title,
    start: event.startTime,
    end: endTime,
    allDay: event.duration ? isAllDayEvent(event.duration) : false,
    extendedProps: {
      description: event.description,
      price: event.price,
      meetingLink: event.meetingLink,
      expectedAttendees: event.expectedAttendees,
      professorId: event.professorId,
      professorName: event.professorName,
      type: 'recurring',
      pattern: event.pattern,
      endRecurrence: event.endRecurrence
    }
  }
}

/**
 * Convert event occurrence to calendar event format
 */
export const eventOccurrenceToCalendarEvent = (event: EventOccurrenceDTO) => {
  const startTime = event.actualStartTime || event.effectiveStartTime || event.originalStartTime
  const endTime =
    event.duration && startTime ? calculateEventEndTime(startTime, event.duration) : event.actualEndTime || startTime

  return {
    id: event.id,
    title: event.seriesTitle,
    start: startTime,
    end: endTime,
    allDay: event.duration ? isAllDayEvent(event.duration) : false,
    extendedProps: {
      description: event.seriesDescription,
      price: event.price,
      meetingLink: event.meetingLink,
      expectedAttendees: event.expectedAttendeeIds,
      professorId: event.professorId,
      professorName: event.professorName,
      type: 'occurrence',
      seriesId: event.recurringSeriesId,
      originalStartTime: event.originalStartTime,
      actualStartTime: event.actualStartTime,
      actualEndTime: event.actualEndTime,
      isModified: !!event.modified,
      isCancelled: event.cancelled,
      isCompleted: event.completed,
      attendance: event.attendance,
      attendeePrices: event.attendeePrices,
      virtual: event.virtual,
      upcoming: event.upcoming,
      missed: event.missed
    }
  }
}
