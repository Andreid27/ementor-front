// ** Utils (same as ACLPage)
import extractProfilePicture from 'src/@core/axios/profile-picture-extractor'
import profilePictureDownloader from 'src/@core/axios/profile-picture-downloader'
import { photoCacheService } from 'src/@core/services/photo-cache-service-instance'

// ** Local Types
import { StudentListItem } from '../types'

export interface PhotoResult {
  userId: string
  avatar: string | null
  type?: 'API' | 'EXTERNAL' | 'INITIALS' | 'NONE'
}

/**
 * Process student photos for the current page only
 * Uses the same approach as ACLPage's processStudentQuizzesData
 *
 * @param students - Array of students on the current page
 * @param fullStudentData - Full student data with profile info (optional for enhanced data)
 * @returns Promise with students enriched with avatar URLs
 */
export const processStudentPhotos = async (
  students: StudentListItem[],
  fullStudentData?: any[]
): Promise<StudentListItem[]> => {
  // Extract unique user IDs from current page
  // Use student.id which contains the studentId after transformation
  const usersOnPage = students.map(student => student.id)
  const uniqueUserIds = Array.from(new Set(usersOnPage))

  // Process profile pictures for unique users
  const processedUsersList: Array<{
    userId: string
    type: 'API' | 'EXTERNAL' | 'INITIALS' | 'NONE'
    url?: string
  }> = []

  for (const userId of uniqueUserIds) {
    // Try to find student data with attributes (from API response or transformed data)
    // Match by: id (transformed data contains studentId), studentUserId (legacy), or studentId (raw data)
    const studentData = fullStudentData?.find(
      (s: any) => s.id === userId || s.studentUserId === userId || s.studentId === userId
    )

    if (studentData && studentData.attributes) {
      // IMPORTANT: extractProfilePicture expects 'id' to be the USER ID, not relationship ID
      // Create a normalized object for extractProfilePicture
      const normalizedData = {
        id: studentData.studentUserId || studentData.studentId || userId,
        attributes: studentData.attributes
      }

      // Extract profile picture using the same logic as ACLPage
      const processedPicture = extractProfilePicture(normalizedData) as {
        userId: string
        type: 'API' | 'EXTERNAL' | 'INITIALS' | 'NONE'
        url?: string
      }
      processedUsersList.push(processedPicture)
    }
  }

  // Download avatars using PhotoCacheService for unified caching and rate limiting
  // This prevents 429 errors from Google by rate limiting and caching as blob URLs
  const result = await Promise.all(
    processedUsersList.map(async profilePicture => {
      if (profilePicture.type === 'API' && profilePicture.url) {
        // Use PhotoCacheService for API-based profile pictures
        const avatar = await photoCacheService.getPhoto('API', profilePicture.url, profilePicture.userId)
        return { ...profilePicture, avatar: avatar || null }
      } else if (profilePicture.type === 'EXTERNAL' && profilePicture.url) {
        // Use PhotoCacheService for EXTERNAL photos (Google photos)
        // Rate limiting prevents 429 errors, blob caching improves subsequent loads
        const avatar = await photoCacheService.getPhoto('EXTERNAL', profilePicture.url, profilePicture.userId)
        return { ...profilePicture, avatar }
      } else {
        return { ...profilePicture, avatar: null }
      }
    })
  )

  // Map avatars back to students
  // IMPORTANT: Match by student.id (which contains studentId after transformation)
  return students.map(student => {
    const userWithAvatar = result.find(user => user.userId === student.id)

    // Only return a new object if we actually have a photo to add
    // This prevents unnecessary re-renders and maintains object identity
    if (userWithAvatar?.avatar) {
      return {
        ...student,
        avatar: userWithAvatar.avatar
      }
    }

    // If no avatar, return the original student object to maintain identity
    return student
  })
}

/**
 * Preload photos for students on the current page only (small version)
 * This is called when the DataGrid page changes
 *
 * @param students - Students currently visible on the page
 * @returns Promise that resolves when photos are loaded
 */
export const preloadPhotosForCurrentPage = async (students: StudentListItem[]): Promise<void> => {
  try {
    // Process only the students on the current page
    await processStudentPhotos(students)
  } catch (error) {
    console.warn('Failed to preload photos for current page:', error)
  }
}

/**
 * Legacy export for backward compatibility
 * Now only processes current page instead of all students
 */
export const preloadPhotos = preloadPhotosForCurrentPage

/**
 * Clear any photo caches if needed
 * This is a no-op since we don't cache anymore - we fetch on demand per page
 */
export const clearPhotoCache = (): void => {
  // No-op: we don't maintain a cache anymore
  console.log('Photo cache cleared (no cache maintained)')
}

/**
 * Load a single student photo
 * Uses PhotoCacheService for unified caching and rate limiting
 */
export const loadStudentPhoto = async (student: StudentListItem): Promise<PhotoResult> => {
  try {
    const profilePicture = extractProfilePicture(student)

    if (profilePicture.type === 'API' && profilePicture.url) {
      // Use PhotoCacheService for API-based profile pictures
      const avatar = await photoCacheService.getPhoto('API', profilePicture.url, profilePicture.userId)

      return {
        userId: student.studentUserId,
        avatar: avatar || null,
        type: profilePicture.type
      }
    } else if (profilePicture.type === 'EXTERNAL' && profilePicture.url) {
      // Use PhotoCacheService for EXTERNAL photos (Google photos)
      // Rate limiting prevents 429 errors, blob caching improves subsequent loads
      const avatar = await photoCacheService.getPhoto('EXTERNAL', profilePicture.url, profilePicture.userId)

      return {
        userId: student.studentUserId,
        avatar: avatar || null,
        type: profilePicture.type
      }
    } else {
      return {
        userId: student.studentUserId,
        avatar: null,
        type: 'INITIALS'
      }
    }
  } catch (error) {
    console.warn(`Failed to load photo for student ${student.studentUserId}:`, error)

    return {
      userId: student.studentUserId,
      avatar: null,
      type: 'INITIALS'
    }
  }
}
