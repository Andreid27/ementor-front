// ** Example Usage of Refactored Calendar Sidebar Components

// ** Main Sidebar Component (Drop-in replacement)
import AddEventSidebarRefactored from './AddEventSidebarRefactored'

// ** Individual Improved Components
import {
  SidebarHeaderImproved,
  EventViewImproved,
  EventFormImproved,
  EventFormFields,
  RecurringEventFields,
  SidebarContentContainer
} from './components'

// ** Custom Hooks for Business Logic
import { useEventData, useEventActions, useEventForm, useEventTransform, useSidebarState } from './hooks'

// ** Utilities for Data Transformation
import { transformEventForSidebar, createBlankEvent, formatDurationToISO8601 } from './utils/eventTransforms'

// ** Constants for Consistent Styling and Behavior
import {
  BLANK_EVENT,
  DRAWER_STYLES,
  SIDEBAR_BODY_STYLES,
  USER_ROLES,
  RECURRENCE_PATTERNS,
  EVENT_DISPLAY_MODES
} from './constants'

/**
 * USAGE EXAMPLES:
 *
 * 1. Drop-in replacement for existing sidebar:
 *    Replace AddEventSidebar with AddEventSidebarRefactored
 *
 * 2. Use individual components for custom implementations:
 *    - EventViewImproved for enhanced event display
 *    - EventFormImproved for better form UX
 *    - SidebarHeaderImproved for advanced header functionality
 *
 * 3. Leverage custom hooks in other components:
 *    - useEventData for form state management
 *    - useEventActions for event operations
 *
 * 4. Use utilities for data manipulation:
 *    - transformEventForSidebar for consistent event formatting
 *    - createBlankEvent for new event initialization
 *
 * 5. Apply constants for consistent behavior:
 *    - USER_ROLES for permission checks
 *    - EVENT_DISPLAY_MODES for UI state management
 */

export {
  // Main component
  AddEventSidebarRefactored,

  // Improved components
  SidebarHeaderImproved,
  EventViewImproved,
  EventFormImproved,
  EventFormFields,
  RecurringEventFields,
  SidebarContentContainer,

  // Custom hooks
  useEventData,
  useEventActions,
  useEventForm,
  useEventTransform,
  useSidebarState,

  // Utilities
  transformEventForSidebar,
  createBlankEvent,
  formatDurationToISO8601,

  // Constants
  BLANK_EVENT,
  DRAWER_STYLES,
  SIDEBAR_BODY_STYLES,
  USER_ROLES,
  RECURRENCE_PATTERNS,
  EVENT_DISPLAY_MODES
}
