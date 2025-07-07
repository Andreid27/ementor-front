// ** React Imports
import React, { useMemo } from 'react'

// ** Components
import EventViewImproved from './EventViewImproved'
import EventFormImproved from './EventFormImproved'
import DaySummaryView from './DaySummaryView'

// ** Utils
import { transformEventForSidebar, createBlankEvent } from '../utils/eventTransforms'

// ** Types
interface SidebarContentContainerProps {
  store: any
  dispatch: any
  addEvent: (event: any) => void
  updateEvent: (event: any) => void
  deleteEvent: (id: string | number) => void
  calendarApi: any
  handleSelectEvent: (event: any) => void
  addEventSidebarOpen: boolean
  students: any[]
  onClose: () => void
  // Edit mode state passed from parent
  isEditMode: boolean
  setIsEditMode: (mode: boolean) => void
  values: any
  setValues: (values: any) => void
  control: any
  handleSubmit: any
  errors: any
}

enum SidebarMode {
  DAY_SUMMARY = 'DAY_SUMMARY',
  EVENT_VIEW = 'EVENT_VIEW',
  EVENT_FORM = 'EVENT_FORM'
}

const SidebarContentContainer: React.FC<SidebarContentContainerProps> = ({
  store,
  dispatch,
  addEvent,
  updateEvent,
  deleteEvent,
  calendarApi,
  handleSelectEvent,
  addEventSidebarOpen,
  students,
  onClose,
  // Receive state from parent instead of creating duplicate hooks
  isEditMode,
  setIsEditMode,
  values,
  setValues,
  control,
  handleSubmit,
  errors
}) => {
  // Determine the current sidebar mode
  const sidebarMode = useMemo((): SidebarMode => {
    const isDaySummary = (store.selectedEvent as any)?.isDaySummary

    if (isDaySummary) {
      return SidebarMode.DAY_SUMMARY
    }

    if (isEditMode || store.selectedEvent === null) {
      return SidebarMode.EVENT_FORM
    }

    return SidebarMode.EVENT_VIEW
  }, [store.selectedEvent, isEditMode])

  // Event handlers
  const handleDaySummaryEventClick = (event: any) => {
    const convertedEvent = transformEventForSidebar(event)
    dispatch(handleSelectEvent(convertedEvent))
  }

  const handleAddNewEventForDay = () => {
    const selectedDate = (store.selectedEvent as any).selectedDate
    const newEvent = createBlankEvent(selectedDate)
    dispatch(handleSelectEvent(newEvent as any))
    setIsEditMode(true)
  }

  // Render content based on mode
  switch (sidebarMode) {
    case SidebarMode.DAY_SUMMARY:
      return (
        <DaySummaryView
          selectedDate={(store.selectedEvent as any).selectedDate}
          eventsForDay={(store.selectedEvent as any).eventsForDay}
          onEventClick={handleDaySummaryEventClick}
          onAddNewEvent={handleAddNewEventForDay}
          onClose={onClose}
        />
      )

    case SidebarMode.EVENT_VIEW:
      return <EventViewImproved selectedEvent={store.selectedEvent} values={values} onClose={onClose} />

    case SidebarMode.EVENT_FORM:
      return (
        <EventFormImproved
          values={values}
          setValues={setValues}
          isEditMode={isEditMode}
          selectedEvent={store.selectedEvent}
          students={students}
          control={control}
          errors={errors}
        />
      )

    default:
      return null
  }
}

export default React.memo(SidebarContentContainer)
