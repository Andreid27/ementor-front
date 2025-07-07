// ** Event data transformation utilities and hooks
import { useCallback } from 'react'

export const useEventTransform = () => {
  // ** Transform raw event data to sidebar format (matching Calendar.js eventClick)
  const transformEventForSidebar = useCallback((event: any) => {
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
  }, [])

  // ** Create blank event for new event creation
  const createBlankEvent = useCallback((date?: Date) => {
    const startDate = date || new Date()
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000) // +1 hour

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
  }, [])

  // ** Create day summary object
  const createDaySummary = useCallback((date: Date, events: any[]) => {
    return {
      isDaySummary: true,
      selectedDate: date,
      eventsForDay: events,
      title: `Events for ${date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}`,
      start: date,
      end: date
    }
  }, [])

  return {
    transformEventForSidebar,
    createBlankEvent,
    createDaySummary
  }
}
