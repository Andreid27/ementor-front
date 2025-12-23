/**
 * Universal Photo Loader Service
 *
 * Centralized photo loading logic for the entire app.
 * Use this instead of custom processStudentPhotos, processStudentQuizzesData, etc.
 *
 * Usage:
 *
 * // Load photos for a list of users
 * const usersWithPhotos = await loadPhotosForUsers(users)
 *
 * // Load a single photo
 * const photoUrl = await loadPhotoForUser(user)
 */

import extractProfilePicture from 'src/@core/axios/profile-picture-extractor'
import { photoCacheService } from 'src/@core/services/photo-cache-service-instance'

export interface UserWithPhoto {
  [key: string]: any
  avatar?: string | null
}

export interface PhotoResult {
  userId: string
  avatar: string | null
  type: 'API' | 'EXTERNAL' | 'NONE'
}

/**
 * Load photo for a single user
 *
 * @param user - User object with id and optional attributes
 * @param fullSize - Whether to fetch full size or thumbnail
 * @returns Photo URL or null
 */
export async function loadPhotoForUser(user: any, fullSize: boolean = false): Promise<string | null> {
  if (!user) return null

  try {
    // Extract profile picture info
    const pictureInfo = extractProfilePicture(user)

    // Load based on type
    if (pictureInfo.type === 'API' && pictureInfo.url) {
      return await photoCacheService.getPhoto('API', pictureInfo.url, pictureInfo.userId, fullSize)
    } else if (pictureInfo.type === 'EXTERNAL' && pictureInfo.url) {
      return await photoCacheService.getPhoto('EXTERNAL', pictureInfo.url, pictureInfo.userId, fullSize)
    }

    return null
  } catch (error) {
    console.warn('[PhotoLoader] Failed to load photo for user:', error)
    return null
  }
}

/**
 * Load photos for a list of users in parallel
 *
 * @param users - Array of user objects
 * @param fullSize - Whether to fetch full size or thumbnail
 * @returns Array of users with avatar field populated
 */
export async function loadPhotosForUsers<T extends Record<string, any>>(
  users: T[],
  fullSize: boolean = false
): Promise<(T & { avatar?: string | null })[]> {
  if (!users || users.length === 0) {
    return []
  }

  try {
    // Extract unique users to avoid duplicate requests
    const uniqueUserIds = Array.from(
      new Set(
        users.map(user => user.id || user.studentId || user.userId || user.studentUserId || user.payerId)
      )
    ).filter(Boolean)

    // Load photos in parallel
    const photoResults = await Promise.all(
      uniqueUserIds.map(async userId => {
        // Find the user data
        const userData = users.find(
          u =>
            u.id === userId ||
            u.studentId === userId ||
            u.userId === userId ||
            u.studentUserId === userId ||
            u.payerId === userId
        )

        if (!userData) {
          return { userId, avatar: null }
        }

        // Load photo
        const avatar = await loadPhotoForUser(userData, fullSize)

        return { userId, avatar }
      })
    )

    // Create a map for quick lookup
    const photoMap = new Map(photoResults.map(r => [r.userId, r.avatar]))

    // Return users with avatar field
    return users.map(user => {
      const userId = user.id || user.studentId || user.userId || user.studentUserId || user.payerId
      const avatar = photoMap.get(userId) || null

      return { ...user, avatar }
    })
  } catch (error) {
    console.error('[PhotoLoader] Failed to load photos for users:', error)
    return users.map(user => ({ ...user, avatar: null }))
  }
}

/**
 * Load photos for users on a specific page only (for pagination)
 *
 * @param allUsers - All users in the dataset
 * @param page - Page number (0-indexed)
 * @param pageSize - Number of items per page
 * @param fullSize - Whether to fetch full size or thumbnail
 * @returns Users with photos loaded only for current page
 */
export async function loadPhotosForPage<T extends Record<string, any>>(
  allUsers: T[],
  page: number,
  pageSize: number,
  fullSize: boolean = false
): Promise<(T & { avatar?: string | null })[]> {
  if (!allUsers || allUsers.length === 0) {
    return []
  }

  // Calculate page range
  const startIndex = page * pageSize
  const endIndex = startIndex + pageSize
  const usersOnPage = allUsers.slice(startIndex, endIndex)

  // Load photos only for users on current page
  const usersWithPhotos = await loadPhotosForUsers(usersOnPage, fullSize)

  // Create a map for quick lookup
  const photoMap = new Map(
    usersWithPhotos.map(u => [
      u.id || u.studentId || u.userId || u.studentUserId || u.payerId,
      u.avatar
    ])
  )

  // Return all users, but only users on current page have photos loaded
  return allUsers.map(user => {
    const userId = user.id || user.studentId || user.userId || user.studentUserId || user.payerId
    const avatar = photoMap.get(userId) || null

    return { ...user, avatar }
  })
}

/**
 * Preload photos for users (fire and forget)
 * Useful for prefetching photos in the background
 *
 * @param users - Array of user objects
 * @param fullSize - Whether to fetch full size or thumbnail
 */
export function preloadPhotosForUsers(users: any[], fullSize: boolean = false): void {
  // Fire and forget - don't await
  loadPhotosForUsers(users, fullSize).catch(error => {
    console.warn('[PhotoLoader] Preload failed:', error)
  })
}
