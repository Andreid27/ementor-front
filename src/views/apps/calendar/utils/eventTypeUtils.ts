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
 * Utility functions for event type classification based on EventOccurrenceDTO properties
 */

/**
 * Determines if an event is a singular event (standalone, not part of any recurring series)
 * Rule: EventOccurrenceDTO.recurringSeriesId is null AND virtual == false
 */
export const isSingularEvent = (event: any): boolean => {
  return !event.recurringSeriesId && !event.seriesId && event.virtual === false
}

/**
 * Determines if an event is an occurrence of a recurring series
 * Rule: EventOccurrenceDTO.recurringSeriesId is not null AND virtual == false
 */
export const isRecurringSeriesOccurrence = (event: any): boolean => {
  return !!(event.recurringSeriesId || event.seriesId) && event.virtual === false
}

/**
 * Determines if an event is a virtual recurring series template
 * Rule: virtual == true (regardless of recurringSeriesId)
 */
export const isVirtualRecurringSeries = (event: any): boolean => {
  return event.virtual === true
}

/**
 * Gets a human-readable classification of the event type
 */
export const getEventClassification = (event: any): string => {
  if (isSingularEvent(event)) {
    return 'Eveniment Singular'
  } else if (isRecurringSeriesOccurrence(event)) {
    return 'Apariție Serie Recurentă'
  } else if (isVirtualRecurringSeries(event)) {
    return 'Serie Recurentă Virtuală'
  } else {
    return 'Tip Eveniment Necunoscut'
  }
}

/**
 * Determines the type of event based on its properties
 *
 * Key distinction rules:
 * - Singular Event: recurringSeriesId is null AND virtual == false
 * - Event Occurrence: recurringSeriesId is not null AND virtual == false
 * - Virtual Recurring Series: virtual == true (templates for future occurrences)
 */
export const determineEventType = (event: any): EventTypeInfo => {
  // Use utility functions for clear event classification
  if (isSingularEvent(event)) {
    return {
      type: EventType.SINGULAR_EVENT,
      id: event.id || event.eventId,
      isEditable: true,
      editScope: 'single',
      displayName: 'Eveniment Unic',
      description: 'Acesta este un eveniment de sine stătător care are loc o singură dată.'
    }
  }

  // Check if this is an actual occurrence of a recurring series
  if (isRecurringSeriesOccurrence(event)) {
    return {
      type: EventType.EVENT_OCCURRENCE,
      id: event.id,
      recurringSeriesId: event.recurringSeriesId || event.seriesId,
      isEditable: true,
      editScope: 'occurrence',
      displayName: 'Apariție Eveniment',
      description:
        'Aceasta este o apariție specifică a unei serii recurente. Modificările vor afecta doar această apariție.',
      isVirtual: false,
      canComplete: true,
      allowsScopeToggle: true // Allow user to choose between editing this occurrence or the entire series
    }
  }

  // Check if this is a virtual recurring series event
  if (isVirtualRecurringSeries(event)) {
    return {
      type: EventType.RECURRING_SERIES,
      id: event.recurringSeriesId || event.seriesId || event.id,
      recurringSeriesId: event.recurringSeriesId || event.seriesId || event.id,
      isEditable: true,
      editScope: 'occurrence', // Default to occurrence scope
      displayName: 'Serie Recurentă (Virtuală)',
      description: 'Acesta este un eveniment recurent virtual. Modificarea acestuia va crea o apariție specifică.',
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
      displayName: 'Serie Recurentă',
      description: 'Editarea acesteia va afecta toate evenimentele viitoare din serie.',
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
    displayName: 'Apariție Eveniment',
    description:
      'Aceasta este o apariție specifică a unei serii recurente. Modificările vor afecta doar această apariție.',
    isVirtual: false,
    canComplete: true,
    allowsScopeToggle: false // Event occurrences can only be edited as occurrences, not as series
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
        return 'Notă: Modificarea acestui eveniment recurent virtual va crea o apariție specifică pentru această dată.'
      }
      return 'Avertisment: Modificările se vor aplica tuturor evenimentelor viitoare din această serie recurentă.'
    case EventType.EVENT_OCCURRENCE:
      return 'Notă: Modificările se vor aplica doar acestei apariții specifice a seriei recurente.'
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
      return 'Ești sigur că vrei să ștergi acest eveniment?'
    case EventType.RECURRING_SERIES:
      return 'Ești sigur că vrei să ștergi întreaga serie recurentă? Aceasta va elimina toate evenimentele viitoare.'
    case EventType.EVENT_OCCURRENCE:
      return 'Ești sigur că vrei să anulezi această apariție? Seria recurentă va rămâne activă.'
    default:
      return 'Ești sigur că vrei să ștergi acest eveniment?'
  }
}

/**
 * Formats the event title with type indicator
 */
export const formatEventTitle = (event: any, eventTypeInfo: EventTypeInfo): string => {
  const baseTitle = event.title || event.seriesTitle || 'Eveniment fără titlu'

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
  return 'Apariție'
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
      return 'Salvează Eveniment'
    case EventType.RECURRING_SERIES:
      if (event?.virtual === true) {
        return 'Creează Apariție'
      }
      return 'Actualizează Serie'
    case EventType.EVENT_OCCURRENCE:
      return 'Actualizează Apariție'
    default:
      return 'Salvează'
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
  // Show scope toggle for recurring series and for event occurrences that are part of a recurring series
  return (
    eventTypeInfo.allowsScopeToggle === true &&
    (eventTypeInfo.type === EventType.RECURRING_SERIES || eventTypeInfo.type === EventType.EVENT_OCCURRENCE)
  )
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
export const getScopeWarningMessage = (scope: EditingScope, eventTypeInfo?: EventTypeInfo): string => {
  // For event occurrences, provide scope-specific guidance
  if (eventTypeInfo?.type === EventType.EVENT_OCCURRENCE) {
    switch (scope) {
      case 'occurrence':
        return 'Modificările vor afecta doar această apariție specifică din serie.'
      case 'series':
        return 'Modificările vor afecta această apariție și toate evenimentele viitoare din seria recurentă.'
      default:
        return ''
    }
  }

  switch (scope) {
    case 'occurrence':
      return 'Modificările se vor aplica doar acestei apariții specifice.'
    case 'series':
      return 'Avertisment: Modificările se vor aplica tuturor evenimentelor viitoare din această serie recurentă.'
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
      return 'Actualizează Această Apariție'
    case 'series':
      return 'Actualizează Întreaga Serie'
    default:
      return 'Actualizează'
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
