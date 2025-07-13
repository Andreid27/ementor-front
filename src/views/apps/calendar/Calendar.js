// ** React Import
import { useEffect, useRef, useMemo } from 'react'

// ** Full Calendar & it's Plugins
import FullCalendar from '@fullcalendar/react'
import listPlugin from '@fullcalendar/list'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import bootstrap5Plugin from '@fullcalendar/bootstrap5'
import interactionPlugin from '@fullcalendar/interaction'

// ** Third Party Style Import
import 'bootstrap-icons/font/bootstrap-icons.css'

const blankEvent = {
  title: '',
  start: '',
  end: '',
  allDay: false,
  url: '',
  extendedProps: {
    calendar: '',
    guests: [],
    location: '',
    description: ''
  }
}

const Calendar = props => {
  // ** Props
  const {
    store,
    dispatch,
    direction,
    updateEvent,
    calendarApi,
    calendarsColor,
    setCalendarApi,
    handleSelectEvent,
    handleLeftSidebarToggle,
    handleAddEventSidebarToggle,
    onDatesSet
  } = props

  // ** Refs
  const calendarRef = useRef()
  useEffect(() => {
    if (calendarApi === null) {
      // @ts-ignore
      setCalendarApi(calendarRef.current?.getApi())
    }
  }, [calendarApi, setCalendarApi])

  // Memoize transformed events - single source of truth from Redux store
  const transformedEvents = useMemo(() => {
    console.log('Calendar.js - Raw store.events:', {
      eventsLength: store.events?.length || 0,
      firstEvent: store.events?.[0],
      allEvents: store.events,
      storeEventsIsArray: Array.isArray(store.events)
    })

    // Handle case where store.events might be undefined or not an array
    if (!store.events || !Array.isArray(store.events)) {
      console.warn('Calendar.js - store.events is not a valid array:', store.events)

      return []
    }

    const transformed = store.events.map(eventData => {
      const calendarCategory = eventData.recurringSeriesId ? `Series-${eventData.recurringSeriesId}` : 'Standalone'

      // Debug: Check what ID properties are available
      console.log('Calendar.js - Event ID debugging:', {
        eventId: eventData.eventId,
        id: eventData.id,
        recurringSeriesId: eventData.recurringSeriesId,
        effectiveStartTime: eventData.effectiveStartTime,
        allKeys: Object.keys(eventData),
        eventData: eventData
      })

      // Create unique ID for each event occurrence
      // First check if event has its own unique ID
      let eventId
      if (eventData.eventId || eventData.id) {
        // Use existing unique ID if available
        eventId = eventData.eventId || eventData.id
      } else if (eventData.recurringSeriesId && eventData.effectiveStartTime) {
        // For virtual recurring occurrences, create unique ID: seriesId-startTime
        eventId = `${eventData.recurringSeriesId}-${eventData.effectiveStartTime}`
      } else {
        // Fallback: generate a unique ID
        eventId = eventData.recurringSeriesId || `event-${Date.now()}-${Math.random()}`
      }

      console.log('Calendar.js - Generated unique eventId:', eventId)

      const transformedEvent = {
        id: eventId, // Use the actual event ID
        title: eventData.seriesTitle || eventData.title || 'Untitled Event',
        start: eventData.effectiveStartTime || eventData.start,
        end: eventData.effectiveEndTime || eventData.end,
        allDay: eventData.allDay || false,
        url: '', // Prevent automatic navigation
        extendedProps: {
          calendar: calendarCategory,
          description: eventData.seriesDescription || eventData.description || '',
          location: eventData.virtual ? 'Virtual Meeting' : '',
          guests: [],
          professorName: eventData.professorName,
          professorId: eventData.professorId,
          price: eventData.price,
          attendance: eventData.attendance,
          virtual: eventData.virtual,
          cancelled: eventData.cancelled,
          completed: eventData.completed,
          upcoming: eventData.upcoming,
          missed: eventData.missed,
          rescheduled: eventData.rescheduled,
          recurringSeriesId: eventData.recurringSeriesId,
          meetingLink: eventData.meetingLink,

          // Store the original event data for lookup
          eventId: eventId,
          originalEventId: eventData.eventId,
          originalId: eventData.id,
          originalRecurringSeriesId: eventData.recurringSeriesId,
          originalEffectiveStartTime: eventData.effectiveStartTime
        }
      }

      // Debug: Check if dates are valid
      console.log('Calendar.js - Event date validation:', {
        eventId: eventId,
        title: transformedEvent.title,
        start: transformedEvent.start,
        startType: typeof transformedEvent.start,
        startValid: transformedEvent.start && !isNaN(new Date(transformedEvent.start)),
        end: transformedEvent.end,
        endType: typeof transformedEvent.end,
        endValid: transformedEvent.end && !isNaN(new Date(transformedEvent.end)),
        originalStart: eventData.effectiveStartTime,
        originalEnd: eventData.effectiveEndTime
      })

      // Check for common FullCalendar issues
      if (!transformedEvent.start) {
        console.error('Calendar.js - Event missing start time:', eventData)

        return null // Skip invalid events
      }

      // Ensure dates are valid Date objects or ISO strings
      const startDateCheck = new Date(transformedEvent.start)
      const endDateCheck = new Date(transformedEvent.end)

      if (isNaN(startDateCheck.getTime())) {
        console.error('Calendar.js - Invalid start date:', {
          eventId: eventId,
          start: transformedEvent.start,
          originalStart: eventData.effectiveStartTime || eventData.start
        })

        return null // Skip events with invalid dates
      }

      if (transformedEvent.end && isNaN(endDateCheck.getTime())) {
        console.error('Calendar.js - Invalid end date:', {
          eventId: eventId,
          end: transformedEvent.end,
          originalEnd: eventData.effectiveEndTime || eventData.end
        })

        // Use start + 1 hour as fallback
        transformedEvent.end = new Date(startDateCheck.getTime() + 60 * 60 * 1000).toISOString()
      }

      // Debug: Check for date formatting issues
      const startDate = new Date(transformedEvent.start)
      const endDate = new Date(transformedEvent.end)
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.error('Calendar.js - Invalid date format detected:', {
          eventId: eventId,
          originalStart: eventData.effectiveStartTime || eventData.start,
          originalEnd: eventData.effectiveEndTime || eventData.end,
          transformedStart: transformedEvent.start,
          transformedEnd: transformedEvent.end,
          startValid: !isNaN(startDate.getTime()),
          endValid: !isNaN(endDate.getTime())
        })
      }

      console.log('Calendar.js - Transformed event:', {
        original: eventData,
        transformed: transformedEvent,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      })

      return transformedEvent
    })

    console.log('Calendar.js - All transformed events:', transformed)

    // Filter out any null events (from invalid dates)
    const validEvents = transformed.filter(event => event !== null)

    console.log('Calendar.js - Valid events after filtering:', {
      totalTransformed: transformed.length,
      validEvents: validEvents.length,
      filteredOut: transformed.length - validEvents.length,
      events: validEvents
    })

    return validEvents
  }, [store.events])
  if (store) {
    console.log('Calendar.js - About to create calendarOptions with transformedEvents:', {
      transformedEventsLength: transformedEvents?.length || 0,
      transformedEvents: transformedEvents
    })

    // ** calendarOptions(Props)
    const calendarOptions = {
      events: transformedEvents,

      // Debug FullCalendar event loading
      eventDidMount(info) {
        console.log('FullCalendar - Event mounted:', {
          event: info.event,
          id: info.event.id,
          title: info.event.title,
          start: info.event.start,
          end: info.event.end
        })
      },

      eventWillUnmount(info) {
        console.log('FullCalendar - Event will unmount:', {
          event: info.event,
          id: info.event.id,
          title: info.event.title
        })
      },

      plugins: [interactionPlugin, dayGridPlugin, timeGridPlugin, listPlugin, bootstrap5Plugin],
      initialView: 'dayGridMonth',
      headerToolbar: {
        start: 'sidebarToggle, prev, next, title',
        end: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth'
      },
      views: {
        week: {
          titleFormat: { year: 'numeric', month: 'long', day: 'numeric' }
        }
      },

      /*
            Enable dragging and resizing event
            ? Docs: https://fullcalendar.io/docs/editable
          */
      editable: true,

      /*
            Enable resizing event from start
            ? Docs: https://fullcalendar.io/docs/eventResizableFromStart
          */
      eventResizableFromStart: true,

      /*
              Automatically scroll the scroll-containers during event drag-and-drop and date selecting
              ? Docs: https://fullcalendar.io/docs/dragScroll
            */
      dragScroll: true,

      /*
              Max number of events within a given day
              ? Docs: https://fullcalendar.io/docs/dayMaxEvents
            */
      dayMaxEvents: 2,

      /*
              Determines if day names and week names are clickable
              ? Docs: https://fullcalendar.io/docs/navLinks
            */
      navLinks: true,
      eventClassNames({ event: calendarEvent }) {
        // @ts-ignore
        const calendarType = calendarEvent._def.extendedProps.calendar || 'General-Events'

        // Determine color based on calendar type
        let colorName = 'primary'
        if (calendarType.startsWith('Series-')) {
          colorName = 'info'
        } else if (calendarType === 'Virtual-Meetings') {
          colorName = 'success'
        } else if (calendarType.startsWith('Professor-')) {
          colorName = 'warning'
        } else {
          colorName = calendarsColor[calendarType] || 'primary'
        }

        return [
          // Background Color
          `bg-${colorName}`
        ]
      },
      eventClick({ event: clickedEvent, jsEvent }) {
        // Prevent default URL navigation
        jsEvent.preventDefault()

        console.log('Calendar.js - Event clicked:', {
          clickedEventId: clickedEvent.id,
          extendedProps: clickedEvent.extendedProps,
          allStoreEvents: store.events.map(e => ({
            eventId: e.eventId,
            id: e.id,
            recurringSeriesId: e.recurringSeriesId,
            effectiveStartTime: e.effectiveStartTime,
            seriesTitle: e.seriesTitle,
            title: e.title
          }))
        })

        // Get the original EventOccurrenceDTO from Redux store
        // For events with unique IDs, use direct lookup
        // For virtual recurring occurrences, match by generated ID or find by other properties
        let originalEvent = null

        // First try to find by actual eventId stored in extendedProps (for events with real IDs)
        if (clickedEvent.extendedProps?.eventId) {
          console.log('Calendar.js - Searching by extendedProps.eventId:', clickedEvent.extendedProps.eventId)
          originalEvent = store.events.find(
            event =>
              event.eventId === clickedEvent.extendedProps.eventId || event.id === clickedEvent.extendedProps.eventId
          )
          console.log('Calendar.js - Found by eventId:', originalEvent)
        }

        // If not found and this is a generated ID (format: seriesId-timestamp), parse and find
        if (!originalEvent && clickedEvent.id.includes('-')) {
          // Parse the generated ID: recurringSeriesId-effectiveStartTime
          const idParts = clickedEvent.id.split('-')
          console.log('Calendar.js - Parsing generated ID parts:', idParts)

          // For UUIDs, the series ID is the first 5 parts joined by '-'
          // e.g., "1ccededd-1555-461d-9970-59666ae099b5-2025-07-15T14:15:00Z"
          // Split at the last '-' that starts with a year (2025)
          const lastDashIndex = clickedEvent.id.lastIndexOf('-2025')
          if (lastDashIndex !== -1) {
            const possibleSeriesId = clickedEvent.id.substring(0, lastDashIndex)
            const timestampPart = clickedEvent.id.substring(lastDashIndex + 1)

            console.log('Calendar.js - Parsed UUID format:', {
              possibleSeriesId,
              timestampPart,
              clickedStart: clickedEvent.start?.toISOString()
            })

            originalEvent = store.events.find(event => {
              const eventStart = event.effectiveStartTime || event.start
              console.log('Calendar.js - Comparing event:', {
                eventSeriesId: event.recurringSeriesId,
                eventStart,
                matches: event.recurringSeriesId === possibleSeriesId && eventStart === timestampPart
              })

              return event.recurringSeriesId === possibleSeriesId && eventStart === timestampPart
            })
          }

          if (!originalEvent) {
            // Fallback: try first part as series ID
            const possibleSeriesId = idParts[0]
            const clickedStart = clickedEvent.start?.toISOString()

            console.log('Calendar.js - Fallback search:', {
              possibleSeriesId,
              clickedStart,
              clickedTitle: clickedEvent.title
            })

            originalEvent = store.events.find(event => {
              const eventStart = event.effectiveStartTime || event.start

              return (
                (event.recurringSeriesId === possibleSeriesId && eventStart === clickedStart) ||
                // Fallback: match by start time and title
                (eventStart === clickedStart && (event.seriesTitle || event.title) === clickedEvent.title)
              )
            })
          }
        }

        // Final fallback: find by start time and title
        if (!originalEvent) {
          const clickedStart = clickedEvent.start?.toISOString()
          console.log('Calendar.js - Final fallback search by time and title:', {
            clickedStart,
            clickedTitle: clickedEvent.title
          })

          originalEvent = store.events.find(event => {
            const eventStart = event.effectiveStartTime || event.start

            return eventStart === clickedStart && (event.seriesTitle || event.title) === clickedEvent.title
          })
        }

        console.log('Calendar.js - Found original event:', {
          clickedEventId: clickedEvent.id,
          foundEvent: originalEvent,
          searchCriteria: {
            extendedPropsEventId: clickedEvent.extendedProps?.eventId,
            clickedStart: clickedEvent.start?.toISOString(),
            clickedTitle: clickedEvent.title
          }
        })

        if (originalEvent) {
          // Use the original DTO directly from Redux store
          dispatch(handleSelectEvent(originalEvent))
          handleAddEventSidebarToggle()
        } else {
          console.error('Calendar.js - Could not find original event for clicked event:', clickedEvent)
        }
      },
      customButtons: {
        sidebarToggle: {
          icon: 'bi bi-list',
          click() {
            handleLeftSidebarToggle()
          }
        }
      },
      dateClick(info) {
        // Find all events for the clicked date
        const clickedDate = new Date(info.date)

        const eventsForDay = store.events.filter(event => {
          const eventStart = new Date(event.effectiveStartTime || event.start)

          return eventStart.toDateString() === clickedDate.toDateString()
        })

        if (eventsForDay.length > 0) {
          // If there are events for this day, show day summary
          const daySummary = {
            isDaySummary: true,
            selectedDate: clickedDate,
            eventsForDay: eventsForDay,
            title: `Events for ${clickedDate.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}`,
            start: clickedDate,
            end: clickedDate
          }
          dispatch(handleSelectEvent(daySummary))
        } else {
          // If no events, create new event for that day
          const ev = { ...blankEvent }
          ev.start = info.date

          // Set end time to 1 hour after start for new events
          const endDate = new Date(info.date)
          endDate.setHours(endDate.getHours() + 1)
          ev.end = endDate
          ev.allDay = false // Default to timed events, not all-day

          dispatch(handleSelectEvent(ev))
        }

        handleAddEventSidebarToggle()
      },

      /*
              Handle event drop (Also include dragged event)
              ? Docs: https://fullcalendar.io/docs/eventDrop
              ? We can use `eventDragStop` but it doesn't return updated event so we have to use `eventDrop` which returns updated event
            */
      eventDrop({ event: droppedEvent }) {
        dispatch(updateEvent(droppedEvent))
      },

      /*
              Handle event resize
              ? Docs: https://fullcalendar.io/docs/eventResize
            */
      eventResize({ event: resizedEvent }) {
        dispatch(updateEvent(resizedEvent))
      },
      ref: calendarRef,
      datesSet(info) {
        if (onDatesSet) onDatesSet(info)
      },

      // Get direction from app state (store)
      direction
    }

    // @ts-ignore
    return <FullCalendar {...calendarOptions} />
  } else {
    return null
  }
}

export default Calendar
