// ** API Types
import { StudentProfessorRelationshipDTO } from 'src/generated/profile-service/api'

// ** Axios Import
import apiClient from 'src/@core/axios/axiosEmentor'
import * as apiSpec from 'src/apiSpec'

// ** Toast Import
import toast from 'react-hot-toast'

// ** Local Types and Utils
import { StudentListItem, ApiErrorResponse, ToastMethods } from './types'

import { transformStudentData, handleApiError } from './utils'

// ** Toast methods wrapper
const toastMethods: ToastMethods = {
  error: (message: string, options = {}) => {
    toast.error(message, {
      duration: 5000,
      position: 'top-right',
      ...options
    })
  },
  success: (message: string, options = {}) => {
    toast.success(message, {
      duration: 3000,
      position: 'top-right',
      ...options
    })
  },
  warning: (message: string, options = {}) => {
    toast(message, {
      duration: 4000,
      position: 'top-right',
      icon: '⚠️',
      ...options
    })
  },
  info: (message: string, options = {}) => {
    toast(message, {
      duration: 4000,
      position: 'top-right',
      icon: 'ℹ️',
      ...options
    })
  }
}

// ** Student API Service
export class StudentApiService {
  /**
   * Fetch active students for the current professor
   */
  async fetchActiveStudents(): Promise<StudentListItem[]> {
    try {
      const response = await apiClient.get(`${apiSpec.PROFILE_SERVICE}/student-professor-relationships/students`)

      if (response.data && Array.isArray(response.data)) {
        const transformedData = transformStudentData(response.data as StudentProfessorRelationshipDTO[])

        toastMethods.success(`Loaded ${transformedData.length} students successfully`)

        return transformedData
      } else {
        toastMethods.warning('No students found for your account')
        return []
      }
    } catch (error) {
      console.error('Failed to fetch students:', error)

      const apiError = error as ApiErrorResponse
      handleApiError(apiError, toastMethods)

      // Return empty array on error to prevent UI crashes
      return []
    }
  }

  /**
   * Refresh student data
   */
  async refreshStudents(): Promise<StudentListItem[]> {
    toastMethods.info('Refreshing student data...')
    return this.fetchActiveStudents()
  }
}

// ** Create singleton instance
export const studentApiService = new StudentApiService()

// ** Export individual methods for convenience
export const fetchActiveStudents = () => studentApiService.fetchActiveStudents()
export const refreshStudents = () => studentApiService.refreshStudents()

// ** Error handling utilities
export const handleStudentApiError = (error: any): void => {
  const apiError = error as ApiErrorResponse
  handleApiError(apiError, toastMethods)
}

// ** Success message utilities
export const showStudentLoadSuccess = (count: number): void => {
  toastMethods.success(`Successfully loaded ${count} students`)
}

export const showStudentLoadWarning = (message: string): void => {
  toastMethods.warning(message)
}

export const showStudentLoadInfo = (message: string): void => {
  toastMethods.info(message)
}

// ** Photo error handling (for compatibility with StudentAvatar)
export const handlePhotoError = (studentId: string, toast: any): void => {
  console.warn(`Failed to load photo for student: ${studentId}`)
  // Individual photo failures will just show initials, no toast needed
}
