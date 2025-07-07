/**
 * Utility functions for transforming event data
 */

export const transformEventForSidebar = (event: any) => {
  return {
    id: event.id || `event-${event.effectiveStartTime || Date.now()}`,
    title: event.title || event.seriesTitle || 'Untitled Event',
    seriesTitle: event.seriesTitle || event.title || 'Untitled Event',
    start: event.effectiveStartTime || event.start,
    end: event.effectiveEndTime || event.end,
    effectiveStartTime: event.effectiveStartTime || event.start,
    effectiveEndTime: event.effectiveEndTime || event.end,
    allDay: event.allDay || false,
    url: event.meetingLink || '',
    description: event.seriesDescription || event.description || '',
    seriesDescription: event.seriesDescription || event.description || '',
    extendedProps: {
      calendar: 'Business',
      description: event.seriesDescription || event.description || '',
      location: event.virtual ? 'Virtual Meeting' : '',
      guests: [],
      professorName: event.professorName,
      professorId: event.professorId,
      price: event.price,
      attendance: event.attendance,
      virtual: event.virtual,
      cancelled: event.cancelled,
      completed: event.completed,
      upcoming: event.upcoming,
      missed: event.missed,
      rescheduled: event.rescheduled,
      recurringSeriesId: event.recurringSeriesId,
      meetingLink: event.meetingLink
    },
    // Copy all original properties to top level for compatibility
    professorName: event.professorName,
    professorId: event.professorId,
    price: event.price,
    attendance: event.attendance,
    virtual: event.virtual,
    cancelled: event.cancelled,
    completed: event.completed,
    upcoming: event.upcoming,
    missed: event.missed,
    rescheduled: event.rescheduled,
    recurringSeriesId: event.recurringSeriesId,
    meetingLink: event.meetingLink
  }
}

export const createBlankEvent = (selectedDate?: Date) => {
  const startDate = selectedDate || new Date()
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000) // Add 1 hour

  return {
    title: '',
    start: startDate,
    end: endDate,
    allDay: false,
    url: '',
    extendedProps: {
      calendar: '',
      guests: [],
      location: '',
      description: ''
    }
  }
}

export const formatDurationToISO8601 = (hours: number, minutes: number): string => {
  let duration = 'PT'
  if (hours > 0) duration += `${hours}H`
  if (minutes > 0) duration += `${minutes}M`

  return duration || 'PT0M'
}
