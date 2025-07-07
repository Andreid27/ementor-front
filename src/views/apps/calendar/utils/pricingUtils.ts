import { UserDTO } from 'src/generated/profile-service'

/**
 * Utility functions for handling attendee pricing
 */

export interface AttendeePrice {
  attendeeId: string
  price: number
  attendeeDetails?: UserDTO
}

export interface PricingConfiguration {
  eventId?: string
  seriesId?: string
  occurrenceId?: string
  attendeePrices: AttendeePrice[]
  defaultPrice?: number
}

/**
 * Calculate total revenue from attendee prices
 */
export const calculateTotalRevenue = (attendeePrices: AttendeePrice[]): number => {
  return attendeePrices.reduce((total, attendeePrice) => total + attendeePrice.price, 0)
}

/**
 * Calculate average price per attendee
 */
export const calculateAveragePrice = (attendeePrices: AttendeePrice[]): number => {
  if (attendeePrices.length === 0) return 0
  return calculateTotalRevenue(attendeePrices) / attendeePrices.length
}

/**
 * Get attendee price by ID
 */
export const getAttendeePriceById = (
  attendeePrices: AttendeePrice[],
  attendeeId: string
): AttendeePrice | undefined => {
  return attendeePrices.find(ap => ap.attendeeId === attendeeId)
}

/**
 * Update attendee price in collection
 */
export const updateAttendeePrice = (
  attendeePrices: AttendeePrice[],
  attendeeId: string,
  newPrice: number
): AttendeePrice[] => {
  const existingIndex = attendeePrices.findIndex(ap => ap.attendeeId === attendeeId)

  if (existingIndex >= 0) {
    // Update existing price
    const updated = [...attendeePrices]
    updated[existingIndex] = { ...updated[existingIndex], price: newPrice }
    return updated
  } else {
    // Add new attendee price
    return [...attendeePrices, { attendeeId, price: newPrice }]
  }
}

/**
 * Remove attendee price from collection
 */
export const removeAttendeePrice = (attendeePrices: AttendeePrice[], attendeeId: string): AttendeePrice[] => {
  return attendeePrices.filter(ap => ap.attendeeId !== attendeeId)
}

/**
 * Merge attendee prices with attendee details
 */
export const mergeAttendeePricesWithDetails = (
  attendeePrices: AttendeePrice[],
  attendees: UserDTO[]
): AttendeePrice[] => {
  return attendeePrices.map(attendeePrice => {
    const attendeeDetails = attendees.find(a => a.userId === attendeePrice.attendeeId)
    return {
      ...attendeePrice,
      attendeeDetails
    }
  })
}

/**
 * Format price for display
 */
export const formatPrice = (price: number, currency: string = 'RON'): string => {
  return new Intl.NumberFormat('ro-RO', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(price)
}

/**
 * Validate price value
 */
export const validatePrice = (price: number): { isValid: boolean; message?: string } => {
  if (price < 0) {
    return { isValid: false, message: 'Price cannot be negative' }
  }

  if (price > 10000) {
    return { isValid: false, message: 'Price cannot exceed 10,000 RON' }
  }

  return { isValid: true }
}

/**
 * Calculate price statistics
 */
export const calculatePriceStatistics = (attendeePrices: AttendeePrice[]) => {
  if (attendeePrices.length === 0) {
    return {
      total: 0,
      average: 0,
      min: 0,
      max: 0,
      count: 0
    }
  }

  const prices = attendeePrices.map(ap => ap.price)
  const total = prices.reduce((sum, price) => sum + price, 0)
  const average = total / prices.length
  const min = Math.min(...prices)
  const max = Math.max(...prices)

  return {
    total,
    average,
    min,
    max,
    count: prices.length
  }
}
