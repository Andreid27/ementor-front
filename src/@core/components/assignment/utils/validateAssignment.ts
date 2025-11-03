// ** Type Imports
import type {
  AssignableEntity,
  SelectedUser,
  AssignmentConfig,
  ValidationResult
} from '../GenericAssignmentModal.types'

/**
 * Validates that entities are selected
 */
export const validateEntities = <T extends AssignableEntity>(
  entities: T[],
  entityLabel: string
): string | undefined => {
  if (entities.length === 0) {
    return `Selectează cel puțin un ${entityLabel.toLowerCase()}`
  }
  return undefined
}

/**
 * Validates that users are selected
 */
export const validateUsers = (users: SelectedUser[]): string | undefined => {
  if (users.length === 0) {
    return 'Selectează cel puțin un utilizator'
  }
  return undefined
}

/**
 * Validates configuration fields
 */
export const validateConfigFields = (
  values: Record<string, any>,
  config?: AssignmentConfig
): Record<string, string> => {
  const errors: Record<string, string> = {}

  if (!config) return errors

  config.fields.forEach(field => {
    const value = values[field.key]

    // Check required fields
    if (field.required && (value === undefined || value === null || value === '')) {
      errors[field.key] = `${field.label} este obligatoriu`
      return
    }

    // Run custom validation
    if (field.validation && value !== undefined && value !== null) {
      const error = field.validation(value)
      if (error) {
        errors[field.key] = error
      }
    }
  })

  return errors
}

/**
 * Performs complete validation of assignment data
 */
export const validateAssignment = <T extends AssignableEntity>(
  entities: T[],
  users: SelectedUser[],
  options: Record<string, any>,
  entityLabel: string,
  config?: AssignmentConfig
): ValidationResult => {
  const errors: Array<{ field: string; message: string }> = []

  // Validate entities
  const entityError = validateEntities(entities, entityLabel)
  if (entityError) {
    errors.push({ field: 'entities', message: entityError })
  }

  // Validate users
  const userError = validateUsers(users)
  if (userError) {
    errors.push({ field: 'users', message: userError })
  }

  // Validate config fields
  const configErrors = validateConfigFields(options, config)
  Object.entries(configErrors).forEach(([field, message]) => {
    errors.push({ field, message })
  })

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  }
}

/**
 * Validates a date range (start must be before end)
 */
export const validateDateRange = (
  startDate: Date | null,
  endDate: Date | null,
  fieldLabel: string = 'Data'
): string | undefined => {
  if (!startDate || !endDate) return undefined

  if (startDate >= endDate) {
    return `${fieldLabel} de început trebuie să fie înainte de data de sfârșit`
  }

  return undefined
}

/**
 * Validates a number is within a range
 */
export const validateNumberRange = (
  value: number,
  min?: number,
  max?: number,
  fieldLabel: string = 'Valoarea'
): string | undefined => {
  if (min !== undefined && value < min) {
    return `${fieldLabel} trebuie să fie cel puțin ${min}`
  }

  if (max !== undefined && value > max) {
    return `${fieldLabel} trebuie să fie maxim ${max}`
  }

  return undefined
}

/**
 * Validates an email address
 */
export const validateEmail = (email: string): string | undefined => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!emailRegex.test(email)) {
    return 'Adresa de email nu este validă'
  }

  return undefined
}

/**
 * Validates a required field
 */
export const validateRequired = (
  value: any,
  fieldLabel: string = 'Câmpul'
): string | undefined => {
  if (value === undefined || value === null || value === '') {
    return `${fieldLabel} este obligatoriu`
  }

  return undefined
}
