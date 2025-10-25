// ** API Client
import apiClient from 'src/@core/axios/axiosEmentor'
import * as apiSpec from 'src/apiSpec'

// ** Utils
import extractProfilePicture from 'src/@core/axios/profile-picture-extractor'
import profilePictureDownloader from 'src/@core/axios/profile-picture-downloader'

// ** Toast
import toast from 'react-hot-toast'

// ** Local Types
import { StudentListItem } from '../types'
import { handleBatchPhotoError } from '../utils'

// ** Constants
import { PHOTO_LOADING_TIMEOUT, MAX_PHOTO_RETRY_ATTEMPTS } from '../constants'

export interface PhotoResult {
  studentUserId: string
  url?: string
  error: boolean
}

export class PhotoLoadingService {
  private loadingCache = new Map<string, Promise<PhotoResult>>()
  private resultCache = new Map<string, PhotoResult>()

  /**
   * Load a single student's profile picture
   */
  async loadStudentPhoto(studentUserId: string, retryCount = 0): Promise<PhotoResult> {
    // Check cache first
    if (this.resultCache.has(studentUserId)) {
      return this.resultCache.get(studentUserId)!
    }

    // Check if already loading
    if (this.loadingCache.has(studentUserId)) {
      return this.loadingCache.get(studentUserId)!
    }

    // Create loading promise
    const loadingPromise = this.performPhotoLoad(studentUserId, retryCount)
    this.loadingCache.set(studentUserId, loadingPromise)

    try {
      const result = await loadingPromise
      this.resultCache.set(studentUserId, result)
      this.loadingCache.delete(studentUserId)
      return result
    } catch (error) {
      this.loadingCache.delete(studentUserId)
      throw error
    }
  }

  /**
   * Perform the actual photo loading
   */
  private async performPhotoLoad(studentUserId: string, retryCount: number): Promise<PhotoResult> {
    return new Promise(async resolve => {
      const timeoutId = setTimeout(() => {
        resolve({
          studentUserId,
          error: true
        })
      }, PHOTO_LOADING_TIMEOUT)

      try {
        // Fetch profile data
        const profileResponse = await apiClient.get(`${apiSpec.STUDENT_PROFILE_CONTROLLER}/get-full/${studentUserId}`)

        if (profileResponse.status === 200 && profileResponse.data) {
          const profilePicture = extractProfilePicture(profileResponse.data, true)
          let finalUrl: string | null = null

          if (profilePicture.type === 'API') {
            finalUrl = await profilePictureDownloader(profilePicture.url, profilePicture.userId, true)
          } else if (profilePicture.type === 'EXTERNAL') {
            finalUrl = profilePicture.url
          }

          clearTimeout(timeoutId)
          resolve({
            studentUserId,
            url: finalUrl || undefined,
            error: !finalUrl
          })
        } else {
          clearTimeout(timeoutId)
          resolve({
            studentUserId,
            error: true
          })
        }
      } catch (error) {
        clearTimeout(timeoutId)

        // Retry logic
        if (retryCount < MAX_PHOTO_RETRY_ATTEMPTS) {
          console.warn(`Retrying photo load for student ${studentUserId}, attempt ${retryCount + 1}`)
          try {
            const retryResult = await this.performPhotoLoad(studentUserId, retryCount + 1)
            resolve(retryResult)
          } catch (retryError) {
            resolve({
              studentUserId,
              error: true
            })
          }
        } else {
          console.warn(`Failed to load photo for student ${studentUserId} after ${retryCount} retries:`, error)
          resolve({
            studentUserId,
            error: true
          })
        }
      }
    })
  }

  /**
   * Load photos for multiple students
   */
  async loadBatchPhotos(students: StudentListItem[]): Promise<Map<string, PhotoResult>> {
    const results = new Map<string, PhotoResult>()
    const loadPromises: Promise<PhotoResult>[] = []

    // Start loading all photos concurrently
    for (const student of students) {
      if (student.studentUserId) {
        loadPromises.push(this.loadStudentPhoto(student.studentUserId))
      }
    }

    // Wait for all to complete
    const photoResults = await Promise.allSettled(loadPromises)
    let failedCount = 0

    photoResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        results.set(result.value.studentUserId, result.value)
        if (result.value.error) {
          failedCount++
        }
      } else {
        failedCount++
        const student = students[index]
        if (student?.studentUserId) {
          results.set(student.studentUserId, {
            studentUserId: student.studentUserId,
            error: true
          })
        }
      }
    })

    // Handle batch errors
    if (failedCount > 0) {
      handleBatchPhotoError(failedCount, students.length, {
        error: message => toast.error(message),
        success: message => toast.success(message),
        warning: message => toast(message, { icon: '⚠️' }),
        info: message => toast(message, { icon: 'ℹ️' })
      })
    }

    return results
  }

  /**
   * Clear photo cache
   */
  clearCache(): void {
    this.loadingCache.clear()
    this.resultCache.clear()
  }

  /**
   * Get cached photo result
   */
  getCachedPhoto(studentUserId: string): PhotoResult | undefined {
    return this.resultCache.get(studentUserId)
  }

  /**
   * Preload photos for visible students
   */
  async preloadPhotos(students: StudentListItem[]): Promise<void> {
    // Load photos in background without blocking UI
    this.loadBatchPhotos(students).catch(error => {
      console.warn('Background photo preloading failed:', error)
    })
  }
}

// ** Create singleton instance
export const photoLoadingService = new PhotoLoadingService()

// ** Export convenience methods
export const loadStudentPhoto = (studentUserId: string) => photoLoadingService.loadStudentPhoto(studentUserId)

export const loadBatchPhotos = (students: StudentListItem[]) => photoLoadingService.loadBatchPhotos(students)

export const preloadPhotos = (students: StudentListItem[]) => photoLoadingService.preloadPhotos(students)

export const clearPhotoCache = () => photoLoadingService.clearCache()
