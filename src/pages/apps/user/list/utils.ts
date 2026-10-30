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
// The admission fields are newer than the generated client, so they are read without its type
const admissionFields = (rel: StudentProfessorRelationshipDTO) => {
  const { admissionScore, admissionUniversityValue, admissionSpecialityValue, admissionExamDate } = rel as any

  return { admissionScore, admissionUniversityValue, admissionSpecialityValue, admissionExamDate }
}

export const transformStudentData: StudentDataTransformer = (
  relationships: StudentProfessorRelationshipDTO[]
): StudentListItem[] => {
  return relationships.map((rel, index) => {
    // Check if data is already transformed (has studentUserId field)
    // If so, return it as-is (it's already a StudentListItem)
    if ('studentUserId' in rel && rel.studentUserId) {
      return rel as any as StudentListItem
    }

    const firstName = rel.firstName || ''
    const lastName = rel.lastName || ''
    const fullName = [firstName, lastName].filter(Boolean).join(' ') || 'Elev necunoscut'

    // For raw API data: rel.studentId contains the student UUID
    // For already-transformed data: rel.id contains the student UUID
    const studentId = rel.studentId || rel.id || `student-${index}`

    return {
      id: studentId, // Use studentId which contains the student user UUID
      studentUserId: studentId,
      studentName: fullName,
      firstName: firstName, // Add firstName for backward compatibility
      lastName: lastName, // Add lastName for backward compatibility
      email: rel.email || '',
      avatar: '', // Will be loaded using profile picture extraction
      role: 'student',
      pricing: formatPricing(rel.defaultPricePerSession),
      billing: 'Per Session', // Default billing type
      status: rel.status || 'active',
      defaultPricePerSession: rel.defaultPricePerSession,
      walletBalance: rel.walletBalance,
      createdAt: new Date().toISOString(),
      avatarColor: getRandomAvatarColor(),
      fullName, // For compatibility
      attributes: rel.attributes, // Preserve attributes for profile picture extraction
      generation: rel.generation, // Include generation from API
      professorId: rel.professorId, // Include professorId from API
      ...admissionFields(rel)
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
    errorMessage = 'Sesiunea a expirat. Autentifică-te din nou.'
  } else if (error.response?.status === 403) {
    errorMessage = 'Nu ai acces la lista de elevi.'
  } else if (error.response?.status >= 500) {
    errorMessage = 'Eroare de server. Încearcă din nou mai târziu.'
  } else if (error.response?.status === 404) {
    errorMessage = 'Nu am găsit elevi pentru contul tău.'
  } else {
    errorMessage = 'Elevii nu s-au putut încărca. Verifică conexiunea.'
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
    toast.warning('Unele fotografii ale elevilor nu s-au putut încărca. Verifică conexiunea.', {
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
    generation?: string
  }
): StudentListItem[] => {
  return students.filter(student => {
    // Generation filter
    if (filters.generation && student.generation !== filters.generation) {
      return false
    }

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
    return 'Nesetat'
  }
  return `${defaultPricePerSession} RON/ședință`
}

// ** Price group summary for the statistics cards
export interface PriceGroup {
  label: string
  studentCount: number
  total: number
  priceCount: number
}

// ** Group students with a price set by their price per session
// The most common prices get their own group; when there are more than maxGroups
// distinct prices, the least common ones are merged into a single "Other prices" group
export const groupStudentsByPrice = (
  students: Array<{ defaultPricePerSession?: number }>,
  maxGroups = 4
): PriceGroup[] => {
  const countsByPrice = new Map<number, number>()
  students.forEach(student => {
    const price = student.defaultPricePerSession
    if (price && price > 0) {
      countsByPrice.set(price, (countsByPrice.get(price) ?? 0) + 1)
    }
  })

  const byCount = Array.from(countsByPrice.entries()).sort(([priceA, countA], [priceB, countB]) =>
    countB !== countA ? countB - countA : priceA - priceB
  )

  const ownGroupCount = byCount.length > maxGroups ? maxGroups - 1 : byCount.length

  const groups: PriceGroup[] = byCount
    .slice(0, ownGroupCount)
    .sort(([priceA], [priceB]) => priceA - priceB)
    .map(([price, count]) => ({
      label: `${price} RON/ședință`,
      studentCount: count,
      total: price * count,
      priceCount: 1
    }))

  const remaining = byCount.slice(ownGroupCount)
  if (remaining.length > 0) {
    groups.push({
      label: 'Alte prețuri',
      studentCount: remaining.reduce((sum, [, count]) => sum + count, 0),
      total: remaining.reduce((sum, [price, count]) => sum + price * count, 0),
      priceCount: remaining.length
    })
  }

  return groups
}

// ** Generate status display color
export const getStatusColor = (status: string): 'success' | 'warning' | 'secondary' => {
  return (userStatusObj[status] as 'success' | 'warning' | 'secondary') || 'secondary'
}

// ** Generate school year options (YYYY-YYYY format)
// Returns current school year and previous 5 years
// School year starts in September (month 8 in 0-indexed system)
export const generateSchoolYearOptions = (): string[] => {
  const today = new Date()
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth() // 0-indexed (0 = January, 8 = September)

  // If we're before September, the school year is (currentYear-1)-(currentYear)
  // If we're in or after September, the school year is (currentYear)-(currentYear+1)
  const schoolYearStartYear = currentMonth >= 8 ? currentYear : currentYear - 1

  // Generate current year and previous 5 years (total of 6 options)
  const schoolYears: string[] = []
  for (let i = 0; i < 6; i++) {
    const startYear = schoolYearStartYear - i
    const endYear = startYear + 1
    schoolYears.push(`${startYear}-${endYear}`)
  }

  return schoolYears
}

// ** Romanian money and counts, as on the Finances page: 1.430,00 RON; 1 elev, 3 elevi, 20 de elevi
const ronFormat = new Intl.NumberFormat('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export const formatRon = (value: number): string => `${ronFormat.format(value)} RON`

export const formatStudentCount = (count: number, suffix = ''): string => {
  const lastTwoDigits = Math.abs(count) % 100
  const takesDe = count !== 0 && (lastTwoDigits === 0 || lastTwoDigits >= 20)
  const noun = count === 1 ? 'elev' : `${takesDe ? 'de ' : ''}elevi`

  return [count, noun, suffix].filter(part => part !== '').join(' ')
}
