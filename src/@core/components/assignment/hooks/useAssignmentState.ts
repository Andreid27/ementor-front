// ** React Imports
import { useState, useCallback } from 'react'

// ** Type Imports
import type { AssignableEntity, SelectedUser } from '../GenericAssignmentModal.types'

/**
 * Custom hook for managing assignment state
 *
 * Provides state and handlers for:
 * - Selected entities
 * - Selected users
 * - Assignment options
 * - Validation errors
 */
export const useAssignmentState = <T extends AssignableEntity>(
  defaultOptions: Record<string, any> = {}
) => {
  // ========================================
  // STATE
  // ========================================

  const [selectedEntities, setSelectedEntities] = useState<T[]>([])
  const [selectedUsers, setSelectedUsers] = useState<SelectedUser[]>([])
  const [assignmentOptions, setAssignmentOptions] = useState<Record<string, any>>(defaultOptions)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // ========================================
  // HANDLERS
  // ========================================

  /**
   * Reset all state
   */
  const reset = useCallback(() => {
    setSelectedEntities([])
    setSelectedUsers([])
    setAssignmentOptions(defaultOptions)
    setValidationErrors({})
  }, [defaultOptions])

  /**
   * Update a single assignment option
   */
  const updateOption = useCallback((key: string, value: any) => {
    setAssignmentOptions(prev => ({
      ...prev,
      [key]: value
    }))
  }, [])

  /**
   * Set a validation error for a field
   */
  const setError = useCallback((field: string, message: string) => {
    setValidationErrors(prev => ({
      ...prev,
      [field]: message
    }))
  }, [])

  /**
   * Clear a validation error for a field
   */
  const clearError = useCallback((field: string) => {
    setValidationErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[field]
      return newErrors
    })
  }, [])

  /**
   * Clear all validation errors
   */
  const clearAllErrors = useCallback(() => {
    setValidationErrors({})
  }, [])

  // ========================================
  // RETURN
  // ========================================

  return {
    // State
    selectedEntities,
    selectedUsers,
    assignmentOptions,
    validationErrors,

    // Setters
    setSelectedEntities,
    setSelectedUsers,
    setAssignmentOptions,
    setValidationErrors,

    // Helpers
    reset,
    updateOption,
    setError,
    clearError,
    clearAllErrors,

    // Computed
    hasSelection: selectedEntities.length > 0 && selectedUsers.length > 0,
    hasErrors: Object.keys(validationErrors).length > 0
  }
}
