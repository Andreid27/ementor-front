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
    console.log('Calendar rendering with events:', store.events)

    // ** calendarOptions(Props)
    const calendarOptions = {
      events: store.events.length ? store.events : [],
      eventDataTransform: eventData => {
        // Transform EventOccurrenceDTO to FullCalendar event format
        // Create unique ID using recurringSeriesId + start time to avoid duplicates
        const uniqueId = eventData.recurringSeriesId
          ? `${eventData.recurringSeriesId}-${eventData.effectiveStartTime}`
          : eventData.id || `event-${eventData.effectiveStartTime}`

        const transformedEvent = {
          id: uniqueId,
          title: eventData.seriesTitle || 'Untitled Event',
          start: eventData.effectiveStartTime,
          end: eventData.effectiveEndTime,
          allDay: false,
          url: eventData.meetingLink || '',
          extendedProps: {
            calendar: 'Business',
            description: eventData.seriesDescription || '',
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
            recurringSeriesId: eventData.recurringSeriesId
          }
        }
        console.log('Transforming event:', eventData, 'to:', transformedEvent)

        //TODO continue transforming other fields as needed and ensure all necessary fields are included
        // ALSO edit recurringSeries
        // ALSO add single event and add
        // Also prevent event redirect on click of the link

        return transformedEvent
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
        const calendarType = calendarEvent._def.extendedProps.calendar || 'Business'
        const colorName = calendarsColor[calendarType] || 'primary'

        return [
          // Background Color
          `bg-${colorName}`
        ]
      },
      eventClick({ event: clickedEvent }) {
        dispatch(handleSelectEvent(clickedEvent))
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
        const ev = { ...blankEvent }
        ev.start = info.date
        ev.end = info.date
        ev.allDay = true

        // @ts-ignore
        dispatch(handleSelectEvent(ev))
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
        console.log('FullCalendar datesSet called with:', info)
        console.log('Date range:', {
          start: info.start,
          end: info.end,
          startStr: info.startStr,
          endStr: info.endStr
        })
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
