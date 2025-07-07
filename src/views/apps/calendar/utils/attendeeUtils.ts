import { UserDTO } from 'src/generated/profile-service'

/**
 * Utility functions for handling attendees with their photos and pricing data
 */

export interface StudentData {
  id?: string
  userId?: string
  fullName?: string
  firstName?: string
  lastName?: string
  email?: string
  avatar?: string | null
  role?: string
  [key: string]: any
}

export interface AttendeeWithPhoto extends UserDTO {
  avatar?: string | null
  studentData?: StudentData
  price?: number
  defaultPrice?: number
}

export interface AttendeeWithPricing extends AttendeeWithPhoto {
  individualPrice?: number
  hasCustomPrice?: boolean
  priceStatus?: 'default' | 'custom' | 'not-set'
}

/**
 * Merge attendee data with student photos and information
 */
export const mergeAttendeesWithPhotos = (
  attendees: UserDTO[],
  studentsWithAvatars: StudentData[]
): AttendeeWithPhoto[] => {
  return attendees.map(attendee => {
    const studentWithAvatar = studentsWithAvatars.find(
      student => student.id === attendee.userId || student.userId === attendee.userId
    )

    return {
      ...attendee,
      avatar: studentWithAvatar?.avatar || null,
      studentData: studentWithAvatar || null
    }
  })
}

/**
 * Get attendees from student IDs with photos and data
 */
export const getAttendeesFromStudentIds = (
  studentIds: string[],
  studentsWithAvatars: StudentData[]
): AttendeeWithPhoto[] => {
  return studentIds.map(studentId => {
    const studentData = studentsWithAvatars.find(student => student.id === studentId || student.userId === studentId)

    if (!studentData) {
      return {
        userId: studentId,
        avatar: null,
        studentData: null
      }
    }

    return {
      userId: studentData.id || studentData.userId || studentId,
      firstName: studentData.firstName,
      lastName: studentData.lastName,
      email: studentData.email,
      avatar: studentData.avatar || null,
      studentData: studentData
    }
  })
}

/**
 * Merge attendees with pricing information
 */
export const mergeAttendeesWithPricing = (
  attendees: AttendeeWithPhoto[],
  attendeePrices: { [key: string]: number } = {},
  defaultPrice: number = 0
): AttendeeWithPricing[] => {
  return attendees.map(attendee => {
    const attendeeId = attendee.userId || attendee.studentData?.id || attendee.studentData?.userId
    const individualPrice = attendeeId ? attendeePrices[attendeeId] : undefined

    return {
      ...attendee,
      individualPrice,
      hasCustomPrice: individualPrice !== undefined,
      priceStatus: individualPrice !== undefined ? 'custom' : defaultPrice > 0 ? 'default' : 'not-set',
      price: individualPrice || defaultPrice,
      defaultPrice
    }
  })
}

/**
 * Get attendee display name with fallbacks
 */
export const getAttendeeDisplayName = (attendee: AttendeeWithPhoto): string => {
  // Try UserDTO properties first
  if (attendee.firstName && attendee.lastName) {
    return `${attendee.firstName} ${attendee.lastName}`.trim()
  }

  if (attendee.firstName) {
    return attendee.firstName
  }

  if (attendee.lastName) {
    return attendee.lastName
  }

  // Try studentData properties
  if (attendee.studentData?.firstName && attendee.studentData?.lastName) {
    return `${attendee.studentData.firstName} ${attendee.studentData.lastName}`.trim()
  }

  if (attendee.studentData?.fullName) {
    return attendee.studentData.fullName
  }

  if (attendee.studentData?.firstName) {
    return attendee.studentData.firstName
  }

  if (attendee.studentData?.lastName) {
    return attendee.studentData.lastName
  }

  // Try email
  if (attendee.email) {
    return attendee.email
  }

  if (attendee.studentData?.email) {
    return attendee.studentData.email
  }

  return 'Unknown User'
}

/**
 * Get attendee initials for avatar
 */
export const getAttendeeInitials = (attendee: AttendeeWithPhoto): string => {
  const firstName = attendee.firstName || attendee.studentData?.firstName || ''
  const lastName = attendee.lastName || attendee.studentData?.lastName || ''

  if (firstName && lastName) {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  if (firstName) {
    return firstName.charAt(0).toUpperCase()
  }

  if (lastName) {
    return lastName.charAt(0).toUpperCase()
  }

  const email = attendee.email || attendee.studentData?.email
  if (email) {
    return email.charAt(0).toUpperCase()
  }

  return '?'
}

/**
 * Get attendee avatar with fallbacks
 */
export const getAttendeeAvatar = (attendee: AttendeeWithPhoto): string | null => {
  return attendee.avatar || attendee.studentData?.avatar || null
}

/**
 * Get attendee ID (userId or studentId)
 */
export const getAttendeeId = (attendee: AttendeeWithPhoto): string => {
  return attendee.userId || attendee.studentData?.id || attendee.studentData?.userId || ''
}

/**
 * Filter attendees by search term
 */
export const filterAttendeesBySearch = (attendees: AttendeeWithPhoto[], searchTerm: string): AttendeeWithPhoto[] => {
  if (!searchTerm.trim()) {
    return attendees
  }

  const term = searchTerm.toLowerCase()

  return attendees.filter(attendee => {
    const displayName = getAttendeeDisplayName(attendee).toLowerCase()
    const email = (attendee.email || attendee.studentData?.email || '').toLowerCase()

    return displayName.includes(term) || email.includes(term)
  })
}

/**
 * Sort attendees by name
 */
export const sortAttendeesByName = (attendees: AttendeeWithPhoto[]): AttendeeWithPhoto[] => {
  return [...attendees].sort((a, b) => {
    const nameA = getAttendeeDisplayName(a)
    const nameB = getAttendeeDisplayName(b)
    return nameA.localeCompare(nameB)
  })
}

/**
 * Filter available students for selection (not already attendees)
 */
export const filterAvailableStudents = (allStudents: StudentData[], currentAttendeeIds: string[]): StudentData[] => {
  return allStudents.filter(student => {
    const studentId = student.id || student.userId
    return studentId && !currentAttendeeIds.includes(studentId)
  })
}

/**
 * Calculate attendee statistics
 */
export const calculateAttendeeStats = (attendees: AttendeeWithPricing[]) => {
  const totalAttendees = attendees.length
  const attendeesWithCustomPrice = attendees.filter(a => a.hasCustomPrice).length
  const attendeesWithDefaultPrice = attendees.filter(a => a.priceStatus === 'default').length
  const attendeesWithoutPrice = attendees.filter(a => a.priceStatus === 'not-set').length

  const totalRevenue = attendees.reduce((sum, attendee) => sum + (attendee.price || 0), 0)
  const averagePrice = totalAttendees > 0 ? totalRevenue / totalAttendees : 0

  return {
    totalAttendees,
    attendeesWithCustomPrice,
    attendeesWithDefaultPrice,
    attendeesWithoutPrice,
    totalRevenue,
    averagePrice
  }
}

/**
 * Validate attendee pricing
 */
export const validateAttendeePricing = (attendees: AttendeeWithPricing[]): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []

  // Check for negative prices
  const negativePrice = attendees.find(a => (a.price || 0) < 0)
  if (negativePrice) {
    errors.push(`Negative price found for ${getAttendeeDisplayName(negativePrice)}`)
  }

  // Check for extremely high prices
  const highPrice = attendees.find(a => (a.price || 0) > 10000)
  if (highPrice) {
    errors.push(`Price too high for ${getAttendeeDisplayName(highPrice)} (max 10,000 RON)`)
  }

  // Check for attendees without any price
  const noPriceAttendees = attendees.filter(a => a.priceStatus === 'not-set')
  if (noPriceAttendees.length > 0) {
    errors.push(`${noPriceAttendees.length} attendees have no price set`)
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Group attendees by price status
 */
export const groupAttendeesByPriceStatus = (attendees: AttendeeWithPricing[]) => {
  return attendees.reduce((groups, attendee) => {
    const status = attendee.priceStatus || 'not-set'
    if (!groups[status]) {
      groups[status] = []
    }
    groups[status].push(attendee)
    return groups
  }, {} as Record<string, AttendeeWithPricing[]>)
}

/**
 * Convert attendees to student IDs array
 */
export const attendeesToStudentIds = (attendees: AttendeeWithPhoto[]): string[] => {
  return attendees.map(attendee => getAttendeeId(attendee)).filter(id => id !== '')
}

/**
 * Convert student IDs to attendee prices map
 */
export const createAttendeePricesMap = (attendees: AttendeeWithPricing[]): { [key: string]: number } => {
  const pricesMap: { [key: string]: number } = {}

  attendees.forEach(attendee => {
    const attendeeId = getAttendeeId(attendee)
    if (attendeeId && attendee.individualPrice !== undefined) {
      pricesMap[attendeeId] = attendee.individualPrice
    }
  })

  return pricesMap
}
