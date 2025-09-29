// ** React Imports
import React, { useMemo } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'

// ** Icons
import PersonIcon from '@mui/icons-material/Person'
import EventAvailableIcon from '@mui/icons-material/EventAvailable'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import RepeatIcon from '@mui/icons-material/Repeat'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import EventIcon from '@mui/icons-material/Event'

// ** Components
import EventFormFields from './EventFormFields'
import RecurringEventFields from './RecurringEventFields'
import AttendeeManager from './AttendeeManager'
import EditingScopeToggle from './EditingScopeToggle'
import EventTypeSelector from './EventTypeSelector'

// ** Utils
import { shouldShowScopeToggle } from '../utils/eventTypeUtils'
import { calculateTotalRevenue, getExpectedCount } from '../utils/eventAttendeeUtils'

// ** Types
import { EventFormProps } from '../types'

interface FormSectionChip {
  label: string
  color: 'primary' | 'secondary' | 'default' | 'error' | 'info' | 'success' | 'warning'
  icon: React.ReactElement
}

interface FormSection {
  title: string
  component: React.ReactElement
  chips?: FormSectionChip[]
}

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
  const isNewEvent = !store.selectedEvent

  const showScopeToggle = eventTypeInfo && shouldShowScopeToggle(eventTypeInfo) && isEditMode

  // Handle event type change for new events
  const handleEventTypeChange = (type: 'singular' | 'recurring') => {
    setValues((prev: any) => ({
      ...prev,
      isRecurring: type === 'recurring'
    }))
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formSections = useMemo((): FormSection[] => {
    const sections: FormSection[] = [
      {
        title: 'Informații de Bază',
        component: (
          <EventFormFields
            values={values}
            setValues={setValues}
            control={control}
            errors={errors}
            isReadOnly={isReadOnly}
            editingScope={editingScope}
          />
        )
      }
    ]

    // Add attendees section - using AttendeeManager
    const isNewEvent = !store.selectedEvent
    // Ensure attendees is always an array to prevent undefined errors
    const attendees = values.attendees || []

    sections.push({
      title: 'Participanți și Prețuri',
      component: (
        <AttendeeManager
          eventType={values?.isRecurring ? 'recurring' : 'singular'}
          students={students}
          isReadOnly={isReadOnly}
          isNewEvent={!store.selectedEvent}
          attendees={values?.attendees || []}
          defaultPrice={values?.price || 0}
          onAttendeesChange={attendees => {
            setValues(prev => ({ ...prev, attendees }))
          }}
        />
      ),
      chips: [
        {
          label: `${attendees.length} Total`,
          color: 'primary' as const,
          icon: <PersonIcon fontSize='small' />
        },
        {
          label: `${getExpectedCount(attendees)} Așteptați`,
          color: 'default' as const,
          icon: <EventAvailableIcon fontSize='small' />
        },
        {
          label: formatCurrency(calculateTotalRevenue(attendees, values.price)),
          color: 'secondary' as const,
          icon: <AttachMoneyIcon fontSize='small' />
        }
      ]
    })

    // Add recurring settings if needed
    // Show recurring settings when: 1) It's a new recurring event, OR 2) Editing series scope of existing recurring event
    const shouldShowRecurringSettings = values.isRecurring && (isNewEvent || editingScope === 'series')

    if (shouldShowRecurringSettings) {
      sections.push({
        title: 'Setări Recurență',
        component: (
          <RecurringEventFields values={values} setValues={setValues} isReadOnly={isReadOnly} students={students} />
        ),
        chips: [
          {
            label: values.pattern || 'Nesetat',
            color: values.pattern ? 'primary' : ('default' as const),
            icon: <RepeatIcon fontSize='small' />
          },
          ...(values.endRecurrence
            ? [
                {
                  label: 'Are dată de sfârșit',
                  color: 'success' as const,
                  icon: <EventIcon fontSize='small' />
                }
              ]
            : [
                {
                  label: 'Nedefinit',
                  color: 'warning' as const,
                  icon: <EventIcon fontSize='small' />
                }
              ])
        ]
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
    onEditingScopeChange,
    formatCurrency,
    store.selectedEvent
  ])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, flex: 1 }}>
      {/* Event Type Selector - Only for new events */}
      {isNewEvent && (
        <Box
          sx={{
            mb: 1,
            p: 2,
            backgroundColor: 'background.paper',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <EventTypeSelector
            selectedType={values.isRecurring ? 'recurring' : 'singular'}
            onTypeChange={handleEventTypeChange}
            disabled={isReadOnly}
          />
        </Box>
      )}

      {/* Editing Scope Toggle - Only for recurring series */}
      {showScopeToggle && eventTypeInfo && onEditingScopeChange && (
        <Box
          sx={{
            mb: 1,
            p: 2,
            backgroundColor: 'action.hover',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <EditingScopeToggle
            eventTypeInfo={eventTypeInfo}
            selectedScope={editingScope}
            onScopeChange={onEditingScopeChange}
            disabled={isReadOnly}
          />
        </Box>
      )}

      {formSections.map((section, index) => (
        <Box
          key={index}
          sx={{
            backgroundColor: 'background.paper',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden'
          }}
        >
          <Box
            sx={{
              px: 3,
              py: 2,
              backgroundColor: 'grey.50',
              borderBottom: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 1
            }}
          >
            <Typography
              variant='subtitle1'
              sx={{
                fontWeight: 600,
                color: 'text.primary',
                mb: 0
              }}
            >
              {section.title}
            </Typography>
            {section.chips && (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {section.chips.map((chip, chipIndex) => (
                  <Chip
                    key={chipIndex}
                    label={chip.label}
                    color={chip.color}
                    icon={chip.icon}
                    size='small'
                    variant='outlined'
                  />
                ))}
              </Box>
            )}
          </Box>
          <Box sx={{ p: 3 }}>{section.component}</Box>
        </Box>
      ))}
    </Box>
  )
}

export default React.memo(EventForm)
