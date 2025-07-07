// ** React Imports
import React from 'react'

// ** Components
import DaySummaryView from './DaySummaryView'

// ** Hooks
import { useEventTransform } from '../hooks'

interface DaySummaryContainerProps {
  selectedEvent: any
  dispatch: any
  handleSelectEvent: any
  setIsEditMode: (value: boolean) => void
  onClose: () => void
}

const DaySummaryContainer: React.FC<DaySummaryContainerProps> = ({
  selectedEvent,
  dispatch,
  handleSelectEvent,
  setIsEditMode,
  onClose
}) => {
  const { transformEventForSidebar, createBlankEvent } = useEventTransform()

  const handleEventClick = (event: any) => {
    const convertedEvent = transformEventForSidebar(event)
    dispatch(handleSelectEvent(convertedEvent))
  }

  const handleAddNewEvent = () => {
    const selectedDate = selectedEvent.selectedDate
    const blankEvent = createBlankEvent(selectedDate)

    dispatch(handleSelectEvent(blankEvent as any))
    setIsEditMode(true)
  }

  return (
    <DaySummaryView
      selectedDate={selectedEvent.selectedDate}
      eventsForDay={selectedEvent.eventsForDay}
      onEventClick={handleEventClick}
      onAddNewEvent={handleAddNewEvent}
      onClose={onClose}
    />
  )
}

export default DaySummaryContainer
