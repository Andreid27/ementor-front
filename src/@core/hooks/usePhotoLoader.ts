/**
 * usePhotoLoader Hook
 *
 * Universal photo loading hook that works across the entire app.
 * Handles photo extraction, caching, and loading for any user data.
 *
 * Usage:
 * const { loadPhotos, getPhotoUrl, isLoading } = usePhotoLoader()
 *
 * // Load photos for a list of users
 * await loadPhotos(users)
 *
 * // Get cached photo URL for a specific user
 * const photoUrl = getPhotoUrl(userId)
 */

import { useState, useCallback, useRef } from 'react'
import extractProfilePicture from 'src/@core/axios/profile-picture-extractor'
import { photoCacheService } from 'src/@core/services/photo-cache-service-instance'

export interface PhotoLoadResult {
  userId: string
  photoUrl: string | null
  type: 'API' | 'EXTERNAL' | 'NONE'
}

export interface UsePhotoLoaderReturn {
  loadPhotos: (users: any[]) => Promise<PhotoLoadResult[]>
  getPhotoUrl: (userId: string) => string | null
  isLoading: boolean
  photoMap: Map<string, string | null>
  clearCache: () => void
}

/**
 * Universal photo loader hook
 */
export const usePhotoLoader = (): UsePhotoLoaderReturn => {
  const [isLoading, setIsLoading] = useState(false)
  const photoMapRef = useRef<Map<string, string | null>>(new Map())

  /**
   * Load photos for a list of users
   * Works with any user object that has an 'id' field and optional 'attributes' field
   */
  const loadPhotos = useCallback(async (users: any[]): Promise<PhotoLoadResult[]> => {
    if (!users || users.length === 0) {
      return []
    }

    setIsLoading(true)

    try {
      // Extract unique user IDs
      const uniqueUserIds = Array.from(
        new Set(
          users.map(user => user.id || user.studentId || user.userId || user.studentUserId)
        )
      ).filter(Boolean)

      // Process each user's profile picture
      const results = await Promise.all(
        uniqueUserIds.map(async userId => {
          // Find user data
          const userData = users.find(
            u =>
              u.id === userId ||
              u.studentId === userId ||
              u.userId === userId ||
              u.studentUserId === userId
          )

          if (!userData) {
            return { userId, photoUrl: null, type: 'NONE' as const }
          }

          // Extract profile picture info
          const pictureInfo = extractProfilePicture(userData)

          // Load photo using PhotoCacheService
          let photoUrl: string | null = null

          if (pictureInfo.type === 'API' && pictureInfo.url) {
            photoUrl = await photoCacheService.getPhoto('API', pictureInfo.url, pictureInfo.userId)
          } else if (pictureInfo.type === 'EXTERNAL' && pictureInfo.url) {
            photoUrl = await photoCacheService.getPhoto('EXTERNAL', pictureInfo.url, pictureInfo.userId)
          }

          // Cache in local map
          photoMapRef.current.set(userId as string, photoUrl)

          return {
            userId: userId as string,
            photoUrl,
            type: pictureInfo.type
          }
        })
      )

      setIsLoading(false)
      return results
    } catch (error) {
      console.error('[usePhotoLoader] Failed to load photos:', error)
      setIsLoading(false)
      return []
    }
  }, [])

  /**
   * Get cached photo URL for a specific user
   */
  const getPhotoUrl = useCallback((userId: string): string | null => {
    return photoMapRef.current.get(userId) || null
  }, [])

  /**
   * Clear the local photo cache
   */
  const clearCache = useCallback(() => {
    photoMapRef.current.clear()
  }, [])

  return {
    loadPhotos,
    getPhotoUrl,
    isLoading,
    photoMap: photoMapRef.current,
    clearCache
  }
}
