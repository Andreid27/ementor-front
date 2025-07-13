// ** React Imports
import React, { useMemo } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

// ** Components
import EventFormFields from './EventFormFields'
import RecurringEventFields from './RecurringEventFields'
import AttendeeManager from './AttendeeManager'
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

    // Add attendees section - using AttendeeManager
    const isNewEvent = !store.selectedEvent
    // Ensure attendees is always an array to prevent undefined errors
    const attendees = values.attendees || []

    console.log('EventFormImproved passing to AttendeeManager:', {
      attendees: attendees,
      attendeesCount: attendees.length,
      isNewEvent,
      selectedEventId: store.selectedEvent?.eventId,
      valuesKeys: Object.keys(values),
      fullValues: values
    })

    sections.push({
      title: 'Attendees & Pricing',
      component: (
        <AttendeeManager
          students={students}
          attendees={attendees}
          onAttendeesChange={newAttendees => {
            console.log('EventFormImproved: Attendees changed:', newAttendees)
            setValues(prev => ({ ...prev, attendees: newAttendees }))
          }}
          defaultPrice={values.price}
          eventType={values.isRecurring ? 'recurring' : 'singular'}
          showPricing={true}
          showAttendanceTracking={false}
          showStatistics={true}
          isReadOnly={isReadOnly}
          isNewEvent={isNewEvent}
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
