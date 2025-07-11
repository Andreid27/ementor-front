/**
 * Event Type Detection and Management Utilities
 *
 * Handles the three types of events:
 * - SingularEvent: Standalone one-time events
 * - EventOccurrence: Single instance of a recurring series (with potential overrides)
 * - RecurringSeries: The recurring series template (editing affects all future events)
 */

import { EventOccurrenceDTO } from 'src/generated/profile-service'

export enum EventType {
  SINGULAR_EVENT = 'SINGULAR_EVENT',
  EVENT_OCCURRENCE = 'EVENT_OCCURRENCE',
  RECURRING_SERIES = 'RECURRING_SERIES'
}

export interface EventTypeInfo {
  type: EventType
  id: string
  recurringSeriesId?: string
  isEditable: boolean
  editScope: 'single' | 'series' | 'occurrence'
  displayName: string
  description: string
  isVirtual?: boolean // Indicates if this is a virtual recurring event
  canComplete?: boolean // Indicates if this occurrence can be completed
  allowsScopeToggle?: boolean // Indicates if user can toggle between occurrence and series editing
}

export type EditingScope = 'occurrence' | 'series'

export interface EditingScopeConfig {
  scope: EditingScope
  endpoint: string
  method: 'POST' | 'PUT'
  idField: string
  dtoType: string
  requiresOriginalStartTime?: boolean
}

/**
 * Determines the type of event based on its properties
 */
export const determineEventType = (event: any): EventTypeInfo => {
  // Check if this is a singular event (no recurring series)
  if (!event.recurringSeriesId && !event.seriesId && !event.seriesTitle && !event.virtual) {
    return {
      type: EventType.SINGULAR_EVENT,
      id: event.id || event.eventId,
      isEditable: true,
      editScope: 'single',
      displayName: 'One-time Event',
      description: 'This is a standalone event that occurs only once.'
    }
  }

  // Check if this is a virtual recurring series event (virtual: true)
  // These are recurring series templates that can be modified to create occurrences
  if (event.virtual === true) {
    return {
      type: EventType.RECURRING_SERIES,
      id: event.recurringSeriesId || event.seriesId || event.id,
      recurringSeriesId: event.recurringSeriesId || event.seriesId || event.id,
      isEditable: true,
      editScope: 'occurrence', // Default to occurrence scope
      displayName: 'Recurring Series (Virtual)',
      description: 'This is a virtual recurring event. Modifying it will create a specific occurrence.',
      isVirtual: true,
      canComplete: true,
      allowsScopeToggle: true // Allow user to toggle between occurrence and series editing
    }
  }

  // Check if this is a recurring series (editing the template)
  if (event.isRecurring || event.editingMode === 'series') {
    return {
      type: EventType.RECURRING_SERIES,
      id: event.recurringSeriesId || event.seriesId || event.id,
      recurringSeriesId: event.recurringSeriesId || event.seriesId,
      isEditable: true,
      editScope: 'occurrence', // Default to occurrence scope
      displayName: 'Recurring Series',
      description: 'Editing this will affect all future events in the series.',
      allowsScopeToggle: true // Allow user to toggle between occurrence and series editing
    }
  }

  // This is an occurrence of a recurring series (has an ID and belongs to a series)
  return {
    type: EventType.EVENT_OCCURRENCE,
    id: event.id,
    recurringSeriesId: event.recurringSeriesId || event.seriesId,
    isEditable: true,
    editScope: 'occurrence', // Default to occurrence scope
    displayName: 'Event Occurrence',
    description: 'This is a specific occurrence of a recurring series. Changes will only affect this occurrence.',
    isVirtual: false,
    canComplete: true
    // No allowsScopeToggle for individual occurrences
  }
}

/**
 * Gets the appropriate API endpoint and data structure for the event type
 */
export const getEventEditingConfig = (eventTypeInfo: EventTypeInfo, event?: any) => {
  switch (eventTypeInfo.type) {
    case EventType.SINGULAR_EVENT:
      return {
        updateEndpoint: 'updateSingularEvent',
        createEndpoint: 'createSingularEvent',
        deleteEndpoint: 'deleteSingularEvent',
        priceEndpoint: 'setSingularEventAttendeePrice',
        idField: 'eventId',
        dtoType: 'SingularEventDTO'
      }

    case EventType.RECURRING_SERIES:
      // If this is a virtual event, modifications create occurrences
      if (event?.virtual === true) {
        return {
          updateEndpoint: 'modifyEventOccurrence', // Creates occurrence when modifying virtual
          createEndpoint: null, // Virtual events are part of existing series
          deleteEndpoint: 'cancelEventOccurrence',
          completeEndpoint: 'completeEventOccurrence', // New endpoint for completing
          priceEndpoint: 'setEventOccurrenceAttendeePrice',
          idField: 'recurringSeriesId',
          dtoType: 'EventOccurrenceModification',
          isVirtual: true
        }
      }
      // Regular recurring series editing
      return {
        updateEndpoint: 'updateRecurringSeries',
        createEndpoint: 'createRecurringSeries',
        deleteEndpoint: 'deleteRecurringSeries',
        priceEndpoint: 'setRecurringSeriesAttendeePrice',
        idField: 'seriesId',
        dtoType: 'RecurringSeriesDTO'
      }

    case EventType.EVENT_OCCURRENCE:
      return {
        updateEndpoint: 'modifyEventOccurrence',
        createEndpoint: null, // Occurrences are created by modifying virtual or completing
        deleteEndpoint: 'cancelEventOccurrence',
        completeEndpoint: 'completeEventOccurrence',
        priceEndpoint: 'setEventOccurrenceAttendeePrice',
        idField: 'occurrenceId',
        dtoType: 'EventOccurrenceModification'
      }

    default:
      throw new Error(`Unknown event type: ${eventTypeInfo.type}`)
  }
}

/**
 * Determines if an event can be deleted based on its type
 */
export const canDeleteEvent = (eventTypeInfo: EventTypeInfo): boolean => {
  switch (eventTypeInfo.type) {
    case EventType.SINGULAR_EVENT:
      return true
    case EventType.RECURRING_SERIES:
      return true // Can delete the entire series
    case EventType.EVENT_OCCURRENCE:
      return true // Can cancel the occurrence
    default:
      return false
  }
}

/**
 * Gets user-friendly warning message for editing operations
 */
export const getEditWarningMessage = (eventTypeInfo: EventTypeInfo, event?: any): string | null => {
  switch (eventTypeInfo.type) {
    case EventType.RECURRING_SERIES:
      if (event?.virtual === true) {
        return 'Note: Modifying this virtual recurring event will create a specific occurrence for this date.'
      }
      return 'Warning: Changes will apply to all future events in this recurring series.'
    case EventType.EVENT_OCCURRENCE:
      return 'Note: Changes will only apply to this specific occurrence of the recurring series.'
    case EventType.SINGULAR_EVENT:
      return null // No warning needed
    default:
      return null
  }
}

/**
 * Gets the delete confirmation message
 */
export const getDeleteConfirmationMessage = (eventTypeInfo: EventTypeInfo): string => {
  switch (eventTypeInfo.type) {
    case EventType.SINGULAR_EVENT:
      return 'Are you sure you want to delete this event?'
    case EventType.RECURRING_SERIES:
      return 'Are you sure you want to delete this entire recurring series? This will remove all future events.'
    case EventType.EVENT_OCCURRENCE:
      return 'Are you sure you want to cancel this occurrence? The recurring series will remain active.'
    default:
      return 'Are you sure you want to delete this event?'
  }
}

/**
 * Formats the event title with type indicator
 */
export const formatEventTitle = (event: any, eventTypeInfo: EventTypeInfo): string => {
  const baseTitle = event.title || event.seriesTitle || 'Untitled Event'

  switch (eventTypeInfo.type) {
    case EventType.SINGULAR_EVENT:
      return baseTitle
    case EventType.RECURRING_SERIES:
      return `${baseTitle} (Series)`
    case EventType.EVENT_OCCURRENCE:
      return `${baseTitle} (${formatOccurrenceDate(event)})`
    default:
      return baseTitle
  }
}

/**
 * Formats the occurrence date for display
 */
const formatOccurrenceDate = (event: any): string => {
  const startTime = event.effectiveStartTime || event.actualStartTime || event.start
  if (startTime) {
    const date = new Date(startTime)
    return date.toLocaleDateString()
  }
  return 'Occurrence'
}

/**
 * Determines if we should show the recurring options in the form
 */
export const shouldShowRecurringOptions = (eventTypeInfo: EventTypeInfo): boolean => {
  return eventTypeInfo.type === EventType.RECURRING_SERIES
}

/**
 * Determines if we should show occurrence-specific options
 */
export const shouldShowOccurrenceOptions = (eventTypeInfo: EventTypeInfo): boolean => {
  return eventTypeInfo.type === EventType.EVENT_OCCURRENCE
}

/**
 * Determines if an event is virtual (part of recurring series but not yet an occurrence)
 */
export const isVirtualEvent = (event: any): boolean => {
  return event.virtual === true
}

/**
 * Determines if an event occurrence can be completed
 */
export const canCompleteOccurrence = (eventTypeInfo: EventTypeInfo, event?: any): boolean => {
  return (
    (eventTypeInfo.type === EventType.RECURRING_SERIES && event?.virtual === true) ||
    eventTypeInfo.type === EventType.EVENT_OCCURRENCE
  )
}

/**
 * Gets the appropriate button text for the event action
 */
export const getEventActionButtonText = (eventTypeInfo: EventTypeInfo, event?: any): string => {
  switch (eventTypeInfo.type) {
    case EventType.SINGULAR_EVENT:
      return 'Save Event'
    case EventType.RECURRING_SERIES:
      if (event?.virtual === true) {
        return 'Create Occurrence'
      }
      return 'Update Series'
    case EventType.EVENT_OCCURRENCE:
      return 'Update Occurrence'
    default:
      return 'Save'
  }
}

/**
 * Determines if we should show the complete occurrence button
 */
export const shouldShowCompleteButton = (eventTypeInfo: EventTypeInfo, event?: any): boolean => {
  return canCompleteOccurrence(eventTypeInfo, event)
}

/**
 * Determines if the scope toggle should be shown for this event
 */
export const shouldShowScopeToggle = (eventTypeInfo: EventTypeInfo): boolean => {
  // Only show scope toggle for recurring series, not for individual occurrences
  return eventTypeInfo.allowsScopeToggle === true && eventTypeInfo.type === EventType.RECURRING_SERIES
}

/**
 * Gets the editing scope configuration based on the selected scope
 */
export const getEditingScopeConfig = (
  eventTypeInfo: EventTypeInfo,
  selectedScope: EditingScope,
  event?: any
): EditingScopeConfig => {
  if (selectedScope === 'occurrence') {
    return {
      scope: 'occurrence',
      endpoint: '/events/occurrence/modify',
      method: 'POST',
      idField: 'seriesId',
      dtoType: 'EventOccurrenceModification',
      requiresOriginalStartTime: true
    }
  } else {
    // series scope
    return {
      scope: 'series',
      endpoint: `/events/series/${eventTypeInfo.recurringSeriesId}`,
      method: 'PUT',
      idField: 'seriesId',
      dtoType: 'RecurringSeriesDTO',
      requiresOriginalStartTime: false
    }
  }
}

/**
 * Gets the scope-specific warning message
 */
export const getScopeWarningMessage = (scope: EditingScope): string => {
  switch (scope) {
    case 'occurrence':
      return 'Changes will only apply to this specific occurrence.'
    case 'series':
      return 'Warning: Changes will apply to all future events in this recurring series.'
    default:
      return ''
  }
}

/**
 * Gets the scope-specific button text
 */
export const getScopeButtonText = (scope: EditingScope): string => {
  switch (scope) {
    case 'occurrence':
      return 'Update This Occurrence'
    case 'series':
      return 'Update Entire Series'
    default:
      return 'Update'
  }
}

/**
 * Determines the default editing scope for an event
 */
export const getDefaultEditingScope = (eventTypeInfo: EventTypeInfo): EditingScope => {
  // Always default to 'occurrence' as requested
  return 'occurrence'
}

/**
 * Validates if the selected scope is valid for the event type
 */
export const isValidScopeForEvent = (eventTypeInfo: EventTypeInfo, scope: EditingScope): boolean => {
  // Singular events don't support scope toggle
  if (eventTypeInfo.type === EventType.SINGULAR_EVENT) {
    return false
  }

  // Both occurrence and series scopes are valid for recurring events
  return scope === 'occurrence' || scope === 'series'
}
