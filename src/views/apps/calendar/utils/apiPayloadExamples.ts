/**
 * ✅ CORRECT API PAYLOAD EXAMPLES
 *
 * This file demonstrates the correct way to structure API payloads for events.
 * All attendee information including pricing should be included in the main DTO.
 */

import { RecurringSeriesDTO, SingularEventDTO, EventAttendeeDTO } from 'src/generated/profile-service'

// ❌ WRONG: Raw fields without proper DTO structure
export const WRONG_PAYLOAD_EXAMPLE = {
  title: 'Marti 17-19',
  description: '',
  startTime: '2025-07-15T14:15:00.000Z',
  duration: 'PT2H',
  pattern: 'WEEKLY',
  price: 134,
  meetingLink: 'https://meet.google.com/zxv-qarw-evf'
}

// ✅ CORRECT: Complete RecurringSeriesDTO with attendees
export const CORRECT_RECURRING_SERIES_PAYLOAD: RecurringSeriesDTO = {
  id: '1ccededd-1555-461d-9970-59666ae099b5',
  title: 'Marti 17-19',
  description: '',
  startTime: '2025-07-15T14:15:00Z',
  duration: 'PT2H' as any, // ISO 8601 duration format
  pattern: 'WEEKLY',
  price: 134,
  meetingLink: 'https://meet.google.com/zxv-qarw-evf',
  endRecurrence: null,
  eventAttendees: [
    {
      id: '4de06046-9abb-418f-a979-bca35c0ec81d',
      attendeeId: 'd829e3fd-1e7e-4e0b-9103-97ec948ca4ed',
      hasCustomPricing: true,
      customPrice: 150,
      expected: true,
      attended: false
    },
    {
      id: '620218b0-9b5a-4c66-93d6-f7a5aca75e96',
      attendeeId: '0e04f232-8d7d-48bd-9eec-a352170041e7',
      hasCustomPricing: true,
      customPrice: 136,
      expected: true,
      attended: false
    }
  ],
  professorId: 'eff2d861-d4a8-4b40-bc5e-71f21080da5d',
  professorName: 'Dr. Drd. Angela-Maria Dincă',
  creation: '2025-07-07T19:39:49.911325Z',
  modified: '2025-07-11T18:29:13.927958Z'
}

// ✅ CORRECT: Complete SingularEventDTO with attendees
export const CORRECT_SINGULAR_EVENT_PAYLOAD: SingularEventDTO = {
  id: 'event-123',
  title: 'Math Tutoring Session',
  description: 'Advanced calculus review',
  startTime: '2025-07-15T14:15:00Z',
  duration: 'PT2H' as any, // ISO 8601 duration format
  price: 100,
  meetingLink: 'https://meet.google.com/abc-defg-hij',
  eventAttendees: [
    {
      id: 'attendee-1',
      attendeeId: 'student-1',
      hasCustomPricing: true,
      customPrice: 120,
      expected: true,
      attended: false
    },
    {
      id: 'attendee-2',
      attendeeId: 'student-2',
      hasCustomPricing: false,
      customPrice: undefined,
      expected: true,
      attended: false
    }
  ],
  professorId: 'prof-123',
  professorName: 'Dr. Smith',
  creation: '2025-07-07T19:39:49.911325Z',
  modified: '2025-07-11T18:29:13.927958Z'
}

/**
 * Utility function to validate EventAttendeeDTO structure
 */
export const validateEventAttendeeDTO = (attendee: EventAttendeeDTO): boolean => {
  return !!(
    attendee.attendeeId &&
    typeof attendee.expected === 'boolean' &&
    typeof attendee.attended === 'boolean' &&
    (attendee.hasCustomPricing === false ||
      (attendee.hasCustomPricing === true && typeof attendee.customPrice === 'number'))
  )
}

/**
 * Utility function to validate that all pricing is included in DTO
 */
export const validateCompletePricing = (dto: RecurringSeriesDTO | SingularEventDTO): boolean => {
  if (!dto.eventAttendees) return true // No attendees is valid

  return dto.eventAttendees.every(attendee => {
    if (attendee.hasCustomPricing) {
      return typeof attendee.customPrice === 'number'
    }
    return true
  })
}

/**
 * Example of the CORRECT way to create an event with attendees
 */
export const createEventWithAttendees = async (
  title: string,
  attendeeIds: string[],
  defaultPrice: number,
  customPrices: { [attendeeId: string]: number } = {}
) => {
  // Build attendees array with pricing information
  const eventAttendees: EventAttendeeDTO[] = attendeeIds.map(attendeeId => {
    const customPrice = customPrices[attendeeId]
    const hasCustomPricing = customPrice !== undefined && customPrice !== defaultPrice

    return {
      attendeeId,
      hasCustomPricing,
      customPrice: hasCustomPricing ? customPrice : undefined,
      expected: true,
      attended: false
    }
  })

  // Create complete DTO
  const singularEventDTO: SingularEventDTO = {
    title,
    startTime: new Date().toISOString(),
    duration: { seconds: 3600 }, // 1 hour
    price: defaultPrice,
    eventAttendees // ✅ All attendee data included in main DTO
  }

  // Send to API - NO additional calls needed
  // ❌ DON'T DO: separate calls to setAttendeePrice endpoints

  return singularEventDTO
}
