// ** React Import
import { useEffect, useRef } from 'react'

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
  if (store) {
    // ** calendarOptions(Props)
    const calendarOptions = {
      events: store.events.length ? store.events : [],
      eventDataTransform: eventData => {
        // Transform EventOccurrenceDTO to FullCalendar event format
        // Create unique ID using recurringSeriesId + start time to avoid duplicates
        const uniqueId = eventData.recurringSeriesId
          ? `${eventData.recurringSeriesId}-${eventData.effectiveStartTime}`
          : eventData.id || `event-${eventData.effectiveStartTime || Date.now()}`

        // Determine calendar category based on event data
        const calendarCategory = eventData.recurringSeriesId
          ? `Series-${eventData.recurringSeriesId}`
          : eventData.virtual
          ? 'Virtual-Meetings'
          : eventData.professorName
          ? `Professor-${eventData.professorName.replace(/\s+/g, '-')}`
          : 'General-Events'

        const transformedEvent = {
          id: uniqueId,
          title: eventData.seriesTitle || eventData.title || 'Untitled Event',
          start: eventData.effectiveStartTime || eventData.start,
          end: eventData.effectiveEndTime || eventData.end,
          allDay: eventData.allDay || false,
          url: '', // Remove direct URL to prevent automatic redirection
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
            meetingLink: eventData.meetingLink // Store meeting link in extendedProps instead of url
          }
        }

        return transformedEvent // This was missing!
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

        // Convert FullCalendar event back to expected format for the sidebar
        const convertedEvent = {
          id: clickedEvent.id,
          title: clickedEvent.title,
          seriesTitle: clickedEvent.title,
          start: clickedEvent.start,
          end: clickedEvent.end,
          effectiveStartTime: clickedEvent.start,
          effectiveEndTime: clickedEvent.end,
          allDay: clickedEvent.allDay,
          url: clickedEvent.extendedProps?.meetingLink || '',
          description: clickedEvent.extendedProps?.description || '',
          seriesDescription: clickedEvent.extendedProps?.description || '',
          extendedProps: {
            ...clickedEvent.extendedProps,
            meetingLink: clickedEvent.extendedProps?.meetingLink
          },

          // Copy all extendedProps to top level for compatibility
          ...clickedEvent.extendedProps
        }

        dispatch(handleSelectEvent(convertedEvent))
        handleAddEventSidebarToggle()

        // * Only grab required field otherwise it goes in infinity loop
        // ! Always grab all fields rendered by form (even if it get `undefined`) otherwise due to Vue3/Composition API you might get: "object is not extensible"
        // event.value = grabEventDataFromEventApi(clickedEvent)
        // isAddNewEventSidebarActive.value = true
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
