// ** React Imports
import React from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'

// ** Components
import EventForm from './EventForm'
import SidebarFooter from './SidebarFooter'

interface EventFormContainerProps {
  values: any
  setValues: any
  isEditMode: boolean
  selectedEvent: any
  students: any[]
  control: any
  errors: any
  handleSubmit: any
  onSubmit: any
  onClose: () => void
  onCancel: () => void
  onReset: () => void
}

const EventFormContainer: React.FC<EventFormContainerProps> = ({
  values,
  setValues,
  isEditMode,
  selectedEvent,
  students,
  control,
  errors,
  handleSubmit,
  onSubmit,
  onClose,
  onCancel,
  onReset
}) => {
  return (
    <form onSubmit={handleSubmit(onSubmit)} autoComplete='off'>
      <EventForm
        values={values}
        setValues={setValues}
        isEditMode={isEditMode}
        selectedEvent={selectedEvent}
        students={students}
        control={control}
        errors={errors}
      />

      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <SidebarFooter
          isEditMode={isEditMode}
          selectedEvent={selectedEvent}
          onClose={onClose}
          onCancel={onCancel}
          onReset={onReset}
        />
      </Box>
    </form>
  )
}

export default EventFormContainer
