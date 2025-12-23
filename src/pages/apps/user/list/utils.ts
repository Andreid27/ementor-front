// ** API Types
import { StudentProfessorRelationshipDTO } from 'src/generated/profile-service/api'

// ** Local Types
import {
  StudentListItem,
  StudentDataTransformer,
  ApiErrorResponse,
  ToastMethods,
  UserRoleObj,
  UserStatusObj
} from './types'

// ** User role configuration
export const userRoleObj: UserRoleObj = {
  admin: { icon: 'tabler:device-laptop', color: 'secondary' },
  author: { icon: 'tabler:circle-check', color: 'success' },
  editor: { icon: 'tabler:edit', color: 'info' },
  maintainer: { icon: 'tabler:chart-pie-2', color: 'primary' },
  subscriber: { icon: 'tabler:user', color: 'warning' },
  student: { icon: 'tabler:user', color: 'primary' } // Default for students
}

// ** User status configuration
export const userStatusObj: UserStatusObj = {
  active: 'success',
  pending: 'warning',
  inactive: 'secondary'
}

// ** Data transformation function
export const transformStudentData: StudentDataTransformer = (
  relationships: StudentProfessorRelationshipDTO[]
): StudentListItem[] => {
  return relationships.map((rel, index) => {
    const firstName = rel.firstName || ''
    const lastName = rel.lastName || ''
    const fullName = [firstName, lastName].filter(Boolean).join(' ') || 'Unknown Student'

    return {
      id: rel.id || `student-${index}`,
      studentUserId: rel.studentId || '',
      studentName: fullName,
      email: rel.email || '',
      avatar: '', // Will be loaded using profile picture extraction
      role: 'student',
      pricing: rel.defaultPricePerSession ? `$${rel.defaultPricePerSession}/session` : 'Not set',
      billing: 'Per Session', // Default billing type
      status: rel.status || 'active',
      defaultPricePerSession: rel.defaultPricePerSession,
      createdAt: new Date().toISOString(),
      avatarColor: getRandomAvatarColor(),
      fullName, // For compatibility
      attributes: rel.attributes // Preserve attributes for profile picture extraction
    }
  })
}

// ** Generate random avatar color
export const getRandomAvatarColor = (): string => {
  const colors = ['primary', 'secondary', 'success', 'error', 'warning', 'info']
  return colors[Math.floor(Math.random() * colors.length)]
}

// ** API Error handling function
export const handleApiError = (error: ApiErrorResponse, toast: ToastMethods): void => {
  let errorMessage: string

  if (error.response?.status === 401) {
    errorMessage = 'Authentication required. Please log in again.'
  } else if (error.response?.status === 403) {
    errorMessage = 'Access denied. You do not have permission to view students.'
  } else if (error.response?.status >= 500) {
    errorMessage = 'Server error occurred. Please try again later.'
  } else if (error.response?.status === 404) {
    errorMessage = 'No students found for your account.'
  } else {
    errorMessage = error.message || 'Failed to load students. Please check your connection.'
  }

  toast.error(errorMessage, {
    position: 'top-right',
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true
  })
}

// ** Photo loading error handler
export const handlePhotoError = (studentId: string, toast: ToastMethods): void => {
  console.warn(`Failed to load photo for student: ${studentId}`)
  // Only show toast for critical photo loading failures
  // Individual photo failures will just show initials
}

// ** Batch photo loading error handler
export const handleBatchPhotoError = (failedCount: number, totalCount: number, toast: ToastMethods): void => {
  const failureRate = failedCount / totalCount

  if (failureRate > 0.5) {
    toast.warning('Some student photos could not be loaded. Please check your connection.', {
      position: 'top-right',
      autoClose: 3000
    })
  }
}

// ** Filter students based on search criteria
export const filterStudents = (
  students: StudentListItem[],
  filters: {
    pricing: string
    status: string
    searchValue: string
  }
): StudentListItem[] => {
  return students.filter(student => {
    // Status filter
    if (filters.status && student.status !== filters.status) {
      return false
    }

    // Pricing filter (check if pricing contains the filter value)
    if (filters.pricing) {
      const pricingLower = student.pricing.toLowerCase()
      const filterLower = filters.pricing.toLowerCase()
      if (!pricingLower.includes(filterLower)) {
        return false
      }
    }

    // Search value filter (search in name and email)
    if (filters.searchValue) {
      const searchLower = filters.searchValue.toLowerCase()
      const nameMatch = student.studentName.toLowerCase().includes(searchLower)
      const emailMatch = student.email.toLowerCase().includes(searchLower)
      if (!nameMatch && !emailMatch) {
        return false
      }
    }

    return true
  })
}

// ** Sort students by field
export const sortStudents = (
  students: StudentListItem[],
  field: keyof StudentListItem,
  direction: 'asc' | 'desc' = 'asc'
): StudentListItem[] => {
  return [...students].sort((a, b) => {
    const aValue = a[field]
    const bValue = b[field]

    if (aValue === undefined || aValue === null) return 1
    if (bValue === undefined || bValue === null) return -1

    let comparison = 0

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      comparison = aValue.localeCompare(bValue)
    } else if (typeof aValue === 'number' && typeof bValue === 'number') {
      comparison = aValue - bValue
    } else {
      comparison = String(aValue).localeCompare(String(bValue))
    }

    return direction === 'desc' ? -comparison : comparison
  })
}

// ** Paginate students array
export const paginateStudents = (students: StudentListItem[], page: number, pageSize: number): StudentListItem[] => {
  const startIndex = page * pageSize
  const endIndex = startIndex + pageSize
  return students.slice(startIndex, endIndex)
}

// ** Validate student data
export const validateStudentData = (student: StudentListItem): boolean => {
  return !!(student.id && student.studentUserId && student.studentName)
}

// ** Generate pricing display text
export const formatPricing = (defaultPricePerSession?: number): string => {
  if (!defaultPricePerSession || defaultPricePerSession <= 0) {
    return 'Not set'
  }
  return `$${defaultPricePerSession}/session`
}

// ** Generate status display color
export const getStatusColor = (status: string): 'success' | 'warning' | 'secondary' => {
  return (userStatusObj[status] as 'success' | 'warning' | 'secondary') || 'secondary'
}
