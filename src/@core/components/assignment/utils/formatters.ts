// ** Type Imports
import type { AssignableEntity, SelectedUser } from '../GenericAssignmentModal.types'

/**
 * Formats a user's full name
 */
export const formatUserName = (firstName?: string, lastName?: string): string => {
  if (!firstName && !lastName) return 'Utilizator necunoscut'
  if (!firstName) return lastName || ''
  if (!lastName) return firstName || ''

  return `${lastName} ${firstName}`
}

/**
 * Gets initials from a name
 */
export const getInitials = (firstName?: string, lastName?: string): string => {
  const first = firstName?.[0]?.toUpperCase() || ''
  const last = lastName?.[0]?.toUpperCase() || ''

  return `${first}${last}` || '?'
}

/**
 * Formats a count with proper singular/plural form
 */
export const formatCount = (
  count: number,
  singular: string,
  plural: string
): string => {
  return `${count} ${count === 1 ? singular : plural}`
}

/**
 * Formats a date for display
 */
export const formatDate = (date: Date | string | null): string => {
  if (!date) return '-'

  const d = typeof date === 'string' ? new Date(date) : date

  return new Intl.DateTimeFormat('ro-RO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(d)
}

/**
 * Formats a date for API (ISO string)
 */
export const formatDateForAPI = (date: Date | null): string | null => {
  return date ? date.toISOString() : null
}

/**
 * Formats selected users summary
 */
export const formatSelectedUsersSummary = (users: SelectedUser[]): string => {
  if (users.length === 0) return 'Niciun utilizator selectat'
  if (users.length === 1) {
    const user = users[0]
    return formatUserName(user.userInfo.firstName, user.userInfo.lastName)
  }

  return `${users.length} utilizatori selectați`
}

/**
 * Formats selected entities summary
 */
export const formatSelectedEntitiesSummary = <T extends AssignableEntity>(
  entities: T[],
  labelSingular: string,
  labelPlural: string,
  getDisplayValue: (entity: T) => string
): string => {
  if (entities.length === 0) {
    return `Niciun ${labelSingular.toLowerCase()} selectat`
  }
  if (entities.length === 1) {
    return getDisplayValue(entities[0])
  }

  return `${entities.length} ${labelPlural.toLowerCase()} selectate`
}

/**
 * Truncates text to a maximum length
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text

  return `${text.substring(0, maxLength)}...`
}

/**
 * Formats a series pattern for display
 */
export const formatSeriesPattern = (pattern?: string): string => {
  if (!pattern) return ''

  // You can add more sophisticated pattern formatting here
  return pattern
}

/**
 * Gets color based on index (for series grouping)
 */
export const getColorByIndex = (index: number): string => {
  const colors = [
    'primary',
    'secondary',
    'success',
    'info',
    'warning',
    'error'
  ]

  return colors[index % colors.length]
}

/**
 * Formats validation errors for display
 */
export const formatValidationErrors = (errors: Record<string, string>): string => {
  const errorMessages = Object.values(errors)

  if (errorMessages.length === 0) return ''
  if (errorMessages.length === 1) return errorMessages[0]

  return `${errorMessages.length} erori de validare`
}
