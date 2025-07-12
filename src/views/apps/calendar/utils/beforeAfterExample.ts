/**
 * 🧪 TEST EXAMPLES - Before vs After API Fix
 *
 * This file shows examples of the payloads before and after the fix.
 */

// ❌ BEFORE (WRONG) - What we were sending
export const BEFORE_PAYLOAD = {
  // Raw fields without proper DTO structure
  title: 'Marti 17-19',
  description: '',
  startTime: '2025-07-15T14:15:00.000Z',
  duration: 'PT2H',
  pattern: 'WEEKLY',
  price: 134,
  meetingLink: 'https://meet.google.com/zxv-qarw-evf'
  // Missing: attendee information
}

// Then separate API calls:
// POST /events/series/{seriesId}/attendee-price?attendeeId=student1&price=150
// POST /events/series/{seriesId}/attendee-price?attendeeId=student2&price=136

// ✅ AFTER (CORRECT) - What we now send
export const AFTER_PAYLOAD = {
  // Complete RecurringSeriesDTO structure
  id: '1ccededd-1555-461d-9970-59666ae099b5',
  title: 'Marti 17-19',
  description: '',
  startTime: '2025-07-15T14:15:00Z',
  duration: 'PT2H',
  pattern: 'WEEKLY',
  price: 134,
  meetingLink: 'https://meet.google.com/zxv-qarw-evf',
  endRecurrence: null,
  // ✅ All attendee data included in main payload
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

// Now only ONE API call:
// POST /events/series - with complete payload above

console.log('✅ API usage has been corrected!')
console.log('Before: Raw fields + separate pricing calls')
console.log('After: Complete DTO with all attendee data')
