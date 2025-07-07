// ** React Imports
import React from 'react'

// ** Components
import EventView from './EventView'
import EventFormContainer from './EventFormContainer'
import DaySummaryContainer from './DaySummaryContainer'

interface SidebarContentProps {
  // Sidebar state
  isDaySummary: boolean
  isViewMode: boolean
  isFormMode: boolean

  // Event data
  selectedEvent: any
  values: any

  // Form props
  setValues: any
  isEditMode: boolean
  students: any[]
  control: any
  errors: any
  handleSubmit: any
  onSubmit: any
  setIsEditMode: (value: boolean) => void

  // Event handlers
  dispatch: any
  handleSelectEvent: any
  onClose: () => void
  onCancel: () => void
  onReset: () => void
}

const SidebarContent: React.FC<SidebarContentProps> = ({
  isDaySummary,
  isViewMode,
  isFormMode,
  selectedEvent,
  values,
  setValues,
  isEditMode,
  students,
  control,
  errors,
  handleSubmit,
  onSubmit,
  setIsEditMode,
  dispatch,
  handleSelectEvent,
  onClose,
  onCancel,
  onReset
}) => {
  if (isDaySummary) {
    return (
      <DaySummaryContainer
        selectedEvent={selectedEvent}
        dispatch={dispatch}
        handleSelectEvent={handleSelectEvent}
        setIsEditMode={setIsEditMode}
        onClose={onClose}
      />
    )
  }

  if (isViewMode) {
    return <EventView selectedEvent={selectedEvent} values={values} onClose={onClose} />
  }

  if (isFormMode) {
    return (
      <EventFormContainer
        values={values}
        setValues={setValues}
        isEditMode={isEditMode}
        selectedEvent={selectedEvent}
        students={students}
        control={control}
        errors={errors}
        handleSubmit={handleSubmit}
        onSubmit={onSubmit}
        onClose={onClose}
        onCancel={onCancel}
        onReset={onReset}
      />
    )
  }

  return null
}

export default SidebarContent
