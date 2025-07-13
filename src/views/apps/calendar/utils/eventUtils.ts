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
 * @param duration Can be either SingularEventDTODuration object or ISO 8601 string
 */
export const calculateEventEndTime = (startTime: string, duration: SingularEventDTODuration | string): string => {
  const startDate = new Date(startTime)

  let durationSeconds: number
  if (typeof duration === 'string') {
    // Convert ISO 8601 to seconds
    const javaDuration = iso8601ToJavaDuration(duration)
    durationSeconds = javaDuration.seconds || 0
  } else {
    // Java Duration object format
    durationSeconds = duration.seconds || 0
  }

  const endDate = new Date(startDate.getTime() + durationSeconds * 1000)
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
 * @param duration Can be either SingularEventDTODuration object or ISO 8601 string
 */
export const formatEventDuration = (duration: SingularEventDTODuration | string): string => {
  let seconds: number

  if (typeof duration === 'string') {
    // Convert ISO 8601 to seconds
    const javaDuration = iso8601ToJavaDuration(duration)
    seconds = javaDuration.seconds || 0
  } else {
    // Java Duration object format
    seconds = duration.seconds || 0
  }

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
 * @param duration Can be either SingularEventDTODuration object or ISO 8601 string
 */
export const isAllDayEvent = (duration: SingularEventDTODuration | string): boolean => {
  let seconds: number

  if (typeof duration === 'string') {
    // Convert ISO 8601 to seconds
    const javaDuration = iso8601ToJavaDuration(duration)
    seconds = javaDuration.seconds || 0
  } else {
    // Java Duration object format
    seconds = duration.seconds || 0
  }

  return seconds >= 86400 // 24 hours
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

/**
 * Convert ISO 8601 duration string (e.g., "PT2H30M") to SingularEventDTODuration object
 */
export const iso8601ToJavaDuration = (iso8601Duration: string): SingularEventDTODuration => {
  // Parse ISO 8601 duration format like PT2H30M, PT1H, PT45M, etc.
  const match = iso8601Duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)

  if (!match) {
    return { seconds: 0 }
  }

  const hours = parseInt(match[1] || '0', 10)
  const minutes = parseInt(match[2] || '0', 10)
  const seconds = parseInt(match[3] || '0', 10)

  const totalSeconds = hours * 3600 + minutes * 60 + seconds

  return { seconds: totalSeconds }
}

/**
 * Convert SingularEventDTODuration object to ISO 8601 duration string
 */
export const javaDurationToIso8601 = (duration: SingularEventDTODuration): string => {
  const totalSeconds = duration.seconds || 0
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const remainingSeconds = totalSeconds % 60

  let result = 'PT'
  if (hours > 0) result += `${hours}H`
  if (minutes > 0) result += `${minutes}M`
  if (remainingSeconds > 0) result += `${remainingSeconds}S`

  return result || 'PT0M'
}

/**
 * Convert duration from hours and minutes to ISO 8601 format
 */
export const formatDurationToISO8601 = (hours: number, minutes: number): string => {
  let duration = 'PT'
  if (hours > 0) duration += `${hours}H`
  if (minutes > 0) duration += `${minutes}M`

  return duration || 'PT0M'
}
