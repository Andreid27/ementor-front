// ** API Types
import { StudentProfessorRelationshipDTO } from 'src/generated/profile-service/api'

// ** Profile Service Client
import { profileServiceClient } from 'src/services'

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

// ** Fetch active students using profileServiceClient
export const fetchActiveStudents = async (): Promise<StudentListItem[]> => {
  try {
    const response = await profileServiceClient.studentProfessorRelationship.getActiveStudentsForCurrentProfessor()

    if (response.data && Array.isArray(response.data)) {
      const transformedData = transformStudentData(response.data as StudentProfessorRelationshipDTO[])

      return transformedData
    } else {
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
export const handlePhotoError = (studentId: string): void => {
  console.warn(`Failed to load photo for student: ${studentId}`)
  // Individual photo failures will just show initials, no toast needed
}
