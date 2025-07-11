import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { EventFormValues, FormData, defaultEventFormState } from '../types'
import { determineEventType, EventTypeInfo, EditingScope, getDefaultEditingScope } from '../utils/eventTypeUtils'

interface UseEventDataProps {
  selectedEvent: any
  addEventSidebarOpen: boolean
}

export const useEventData = ({ selectedEvent, addEventSidebarOpen }: UseEventDataProps) => {
  const [values, setValues] = useState<EventFormValues>(defaultEventFormState)
  const [isEditMode, setIsEditMode] = useState<boolean>(false)
  const [eventTypeInfo, setEventTypeInfo] = useState<EventTypeInfo | null>(null)
  const [editingScope, setEditingScope] = useState<EditingScope>('occurrence')

  const {
    control,
    setValue,
    clearErrors,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>({ defaultValues: { title: '' } })

  const resetToStoredValues = useCallback(() => {
    if (selectedEvent !== null) {
      const event = selectedEvent as any

      // Determine event type first
      const typeInfo = determineEventType(event)
      setEventTypeInfo(typeInfo)

      // Set default editing scope
      const defaultScope = getDefaultEditingScope(typeInfo)
      setEditingScope(defaultScope)

      setValue('title', event.title || event.seriesTitle || '')

      const startDate = event.start
        ? new Date(event.start)
        : event.effectiveStartTime
        ? new Date(event.effectiveStartTime)
        : event.actualStartTime
        ? new Date(event.actualStartTime)
        : new Date()

      const endDate = event.end
        ? new Date(event.end)
        : event.effectiveEndTime
        ? new Date(event.effectiveEndTime)
        : event.actualEndTime
        ? new Date(event.actualEndTime)
        : new Date(startDate.getTime() + 60 * 60 * 1000)

      // Use event type info to determine if this is recurring
      const isRecurringEvent = typeInfo.type === 'RECURRING_SERIES'

      console.log('Event data analysis:', {
        event,
        eventTypeInfo: typeInfo,
        isRecurringEvent,
        recurringSeriesId: event.recurringSeriesId,
        seriesId: event.seriesId,
        seriesTitle: event.seriesTitle,
        seriesDescription: event.seriesDescription,
        pattern: event.pattern
      })

      // Calculate duration from start and end times
      const durationMs = endDate.getTime() - startDate.getTime()
      const durationHours = Math.floor(durationMs / (1000 * 60 * 60))
      const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))

      setValues({
        isRecurring: isRecurringEvent,
        title: event.title || event.seriesTitle || '',
        description: event.description || event.seriesDescription || '',
        startDate: startDate,
        endDate: endDate,
        allDay: event.allDay || false,
        meetingLink: event.meetingLink || event.url || event.extendedProps?.meetingLink || '',
        price: event.price || event.extendedProps?.price || 0,
        pattern: event.pattern || 'WEEKLY',
        durationHours: Math.max(durationHours, 1),
        durationMinutes: Math.max(durationMinutes, 0),
        expectedAttendees: event.expectedAttendees || event.attendance || event.extendedProps?.expectedAttendees || [],
        attendeePrices: event.attendeePrices || event.extendedProps?.attendeePrices || {}
      })
    }
  }, [setValue, selectedEvent])

  const resetToEmptyValues = useCallback(() => {
    setValue('title', '')
    setValues(defaultEventFormState)
    setIsEditMode(false)
    setEventTypeInfo(null)
    setEditingScope('occurrence') // Reset to default scope
  }, [setValue])

  const resetForm = useCallback(() => {
    setValues(defaultEventFormState)
    setIsEditMode(false)
    setEventTypeInfo(null)
    setEditingScope('occurrence') // Reset to default scope
    clearErrors()
  }, [clearErrors])

  useEffect(() => {
    console.log('Event data effect triggered:', {
      selectedEvent,
      addEventSidebarOpen
    })

    if (selectedEvent !== null) {
      resetToStoredValues()
      setIsEditMode(false) // Show view mode for existing events
    } else {
      resetToEmptyValues()
      setIsEditMode(true) // Show form for new events
    }
  }, [addEventSidebarOpen, resetToStoredValues, resetToEmptyValues, selectedEvent])

  return {
    values,
    setValues,
    isEditMode,
    setIsEditMode,
    eventTypeInfo,
    editingScope,
    setEditingScope,
    control,
    setValue,
    clearErrors,
    handleSubmit,
    errors,
    resetToStoredValues,
    resetToEmptyValues,
    resetForm
  }
}
