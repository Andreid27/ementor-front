// ** React Imports
import { useEffect } from 'react'

// ** Types
interface UseSidebarStateProps {
  isOpen: boolean
  selectedEvent: any
  isEditMode: boolean
  setIsEditMode: (value: boolean) => void
  resetToStoredValues: () => void
  resetToEmptyValues: () => void
}

export const useSidebarState = ({
  isOpen,
  selectedEvent,
  isEditMode,
  setIsEditMode,
  resetToStoredValues,
  resetToEmptyValues
}: UseSidebarStateProps) => {
  // ** Effect to handle sidebar state changes
  useEffect(() => {
    if (isOpen) {
      if (selectedEvent !== null && !selectedEvent?.isDaySummary) {
        resetToStoredValues()
        // Set edit mode to false for existing events (view-only by default)
        setIsEditMode(false)
      } else if (!selectedEvent?.isDaySummary) {
        resetToEmptyValues()
        // Set edit mode to true for new events
        setIsEditMode(true)
      }
    }
  }, [isOpen, selectedEvent, resetToStoredValues, resetToEmptyValues, setIsEditMode, isEditMode])

  // ** Determine sidebar mode
  const isDaySummary = selectedEvent?.isDaySummary
  const isViewMode = !isEditMode && selectedEvent !== null && !isDaySummary
  const isFormMode = isEditMode || (selectedEvent === null && !isDaySummary)

  return {
    isDaySummary,
    isViewMode,
    isFormMode
  }
}
