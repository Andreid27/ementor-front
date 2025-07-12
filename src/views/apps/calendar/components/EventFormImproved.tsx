// ** React Imports
import React, { useMemo } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

// ** Components
import EventFormFields from './EventFormFields'
import RecurringEventFields from './RecurringEventFields'
import EventAttendeeManagement from './EventAttendeeManagement'
import EditingScopeToggle from './EditingScopeToggle'

// ** Utils
import { shouldShowScopeToggle } from '../utils/eventTypeUtils'

// ** Types
import { EventFormProps } from '../types'

const EventForm: React.FC<EventFormProps> = ({
  values,
  setValues,
  isEditMode,
  selectedEvent,
  students,
  control,
  errors,
  store,
  eventTypeInfo,
  editingScope = 'occurrence',
  onEditingScopeChange
}) => {
  const isReadOnly = !isEditMode && selectedEvent !== null

  const showScopeToggle = eventTypeInfo && shouldShowScopeToggle(eventTypeInfo) && isEditMode

  const formSections = useMemo(() => {
    const sections = [
      {
        title: 'Basic Information',
        component: (
          <EventFormFields
            values={values}
            setValues={setValues}
            control={control}
            errors={errors}
            isReadOnly={isReadOnly}
          />
        )
      }
    ]

    // Add attendees section
    // Debug: Log what's being passed to EventAttendeeManagement
    const isNewEvent = !store.selectedEvent
    console.log('EventFormImproved passing to EventAttendeeManagement:', {
      initialAttendees: values.attendees,
      attendeesCount: values.attendees?.length || 0,
      isNewEvent,
      selectedEvent: store.selectedEvent,
      selectedEventId: store.selectedEvent?.eventId,
      selectedEventAttendees: store.selectedEvent?.eventAttendees
    })

    sections.push({
      title: 'Attendees & Pricing',
      component: (
        <EventAttendeeManagement
          eventType={values.isRecurring ? 'recurring' : 'singular'}
          students={students}
          isReadOnly={isReadOnly}
          isNewEvent={isNewEvent}
          initialAttendees={values.attendees}
          defaultPrice={values.price}
          onAttendeesChange={attendees => {
            console.log('EventFormImproved: Attendees changed:', attendees)
            setValues(prev => ({ ...prev, attendees }))
          }}
        />
      )
    })

    // Add recurring settings if needed
    if (values.isRecurring) {
      sections.push({
        title: 'Recurring Settings',
        component: (
          <RecurringEventFields values={values} setValues={setValues} isReadOnly={isReadOnly} students={students} />
        )
      })
    }

    return sections
  }, [
    values,
    setValues,
    control,
    errors,
    isReadOnly,
    students,
    showScopeToggle,
    eventTypeInfo,
    editingScope,
    onEditingScopeChange
  ])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Editing Scope Toggle - Only for recurring series */}
      {showScopeToggle && eventTypeInfo && onEditingScopeChange && (
        <EditingScopeToggle
          eventTypeInfo={eventTypeInfo}
          selectedScope={editingScope}
          onScopeChange={onEditingScopeChange}
          disabled={isReadOnly}
        />
      )}

      {formSections.map((section, index) => (
        <Box key={index}>
          <Typography
            variant='subtitle1'
            sx={{
              mb: 2,
              fontWeight: 600,
              color: 'text.primary',
              borderBottom: '1px solid',
              borderColor: 'divider',
              pb: 1
            }}
          >
            {section.title}
          </Typography>
          {section.component}
        </Box>
      ))}
    </Box>
  )
}

export default React.memo(EventForm)
