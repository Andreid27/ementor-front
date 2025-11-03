// ** Type Imports
import type { UserDTO, RecurringSeriesDTO } from 'src/generated/profile-service/api'

/**
 * Interface for a grouped user collection
 */
export interface UserGroup {
  series: RecurringSeriesDTO
  users: UserDTO[]
}

/**
 * Groups users by their recurring series
 *
 * @param users - Array of users to group
 * @param recurringSeries - Array of recurring series
 * @returns Array of user groups
 */
export const groupUsersBySeries = (
  users: UserDTO[],
  recurringSeries: RecurringSeriesDTO[]
): UserGroup[] => {
  const groups = recurringSeries.map(series => {
    // Extract attendee IDs from the series
    const attendeeIds = series.eventAttendees?.map(attendee => attendee.attendeeId) || []

    // Find users that match these attendee IDs
    const seriesUsers = users.filter(user => {
      return user.userId && attendeeIds.includes(user.userId)
    })

    return {
      series,
      users: seriesUsers
    }
  })

  // Filter out groups with no users
  return groups.filter(group => group.users.length > 0)
}

/**
 * Gets all unique users from multiple series
 *
 * @param groups - Array of user groups
 * @returns Array of unique users
 */
export const getUniqueUsersFromGroups = (groups: UserGroup[]): UserDTO[] => {
  const userMap = new Map<string, UserDTO>()

  groups.forEach(group => {
    group.users.forEach(user => {
      if (user.userId && !userMap.has(user.userId)) {
        userMap.set(user.userId, user)
      }
    })
  })

  return Array.from(userMap.values())
}

/**
 * Finds which series a user belongs to
 *
 * @param userId - User ID to search for
 * @param recurringSeries - Array of recurring series
 * @returns Array of series IDs the user belongs to
 */
export const findUserSeries = (
  userId: string,
  recurringSeries: RecurringSeriesDTO[]
): string[] => {
  return recurringSeries
    .filter(series => {
      const attendeeIds = series.eventAttendees?.map(a => a.attendeeId) || []
      return attendeeIds.includes(userId)
    })
    .map(series => series.id)
}

/**
 * Checks if a user belongs to a specific series
 *
 * @param userId - User ID to check
 * @param seriesId - Series ID to check
 * @param recurringSeries - Array of recurring series
 * @returns True if user belongs to series
 */
export const isUserInSeries = (
  userId: string,
  seriesId: string,
  recurringSeries: RecurringSeriesDTO[]
): boolean => {
  const series = recurringSeries.find(s => s.id === seriesId)
  if (!series) return false

  const attendeeIds = series.eventAttendees?.map(a => a.attendeeId) || []
  return attendeeIds.includes(userId)
}
