// Test script for event classification
const testEvent = {
  id: 'f3f08777-2bf9-4c3e-8c96-23a0c6e32dda',
  recurringSeriesId: '1ccededd-1555-461d-9970-59666ae099b5',
  seriesTitle: 'Marti 17-19',
  seriesDescription: null,
  originalStartTime: '2025-07-14T14:15:00Z',
  actualStartTime: '2025-07-15T14:00:00Z',
  actualEndTime: null,
  duration: 'PT2H',
  price: 132,
  meetingLink: 'https://meet.google.com/zxv-qarw-evf',
  attendanceCount: 0,
  professorName: 'Dr. Drd. Angela-Maria Dincă',
  professorId: 'eff2d861-d4a8-4b40-bc5e-71f21080da5d',
  creation: '2025-07-13T09:22:06.636494Z',
  modified: null,
  eventAttendees: [
    {
      id: 'c255d671-a8d3-494e-883f-2302b55e845f',
      attendeeId: '0e04f232-8d7d-48bd-9eec-a352170041e7',
      hasCustomPricing: true,
      customPrice: 145,
      expected: true,
      attended: false
    }
  ],
  virtual: false,
  cancelled: false,
  completed: false,
  effectiveStartTime: '2025-07-15T14:00:00Z',
  upcoming: true,
  missed: false,
  rescheduled: true,
  effectiveEndTime: '2025-07-15T16:00:00Z'
}

// Classification functions (copied from eventTypeUtils.ts)
const isSingularEvent = event => {
  return !event.recurringSeriesId && !event.seriesId && event.virtual === false
}

const isRecurringSeriesOccurrence = event => {
  return !!(event.recurringSeriesId || event.seriesId) && event.virtual === false
}

const isVirtualRecurringSeries = event => {
  return event.virtual === true
}

const getEventClassification = event => {
  if (isSingularEvent(event)) {
    return 'Singular Event'
  } else if (isRecurringSeriesOccurrence(event)) {
    return 'Recurring Series Occurrence'
  } else if (isVirtualRecurringSeries(event)) {
    return 'Virtual Recurring Series'
  } else {
    return 'Unknown Event Type'
  }
}

// Test the classification
console.log('=== EVENT CLASSIFICATION TEST ===')
console.log('Event ID:', testEvent.id)
console.log('Recurring Series ID:', testEvent.recurringSeriesId)
console.log('Virtual:', testEvent.virtual)
console.log('')
console.log('Classification Results:')
console.log('- isSingularEvent:', isSingularEvent(testEvent))
console.log('- isRecurringSeriesOccurrence:', isRecurringSeriesOccurrence(testEvent))
console.log('- isVirtualRecurringSeries:', isVirtualRecurringSeries(testEvent))
console.log('')
console.log('Final Classification:', getEventClassification(testEvent))
console.log('')

// Detailed analysis
console.log('=== DETAILED ANALYSIS ===')
console.log('Has recurringSeriesId:', !!testEvent.recurringSeriesId)
console.log('Has seriesId:', !!testEvent.seriesId)
console.log('Virtual is false:', testEvent.virtual === false)
console.log(
  'Should be occurrence:',
  !!(testEvent.recurringSeriesId || testEvent.seriesId) && testEvent.virtual === false
)
