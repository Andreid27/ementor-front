# Calendar Events Controller Implementation

This document describes the complete implementation of all EventsControllerApi operations in the Redux calendar store.

## Overview

All 17 operations from the EventsControllerApi have been implemented as Redux async thunks with proper error handling, loading states, and type safety. The implementation also includes comprehensive utility functions for working with attendees, events, and pricing.

## Implemented Operations

### 1. Core Event Operations

#### `fetchEvents` (getConsolidatedEvents)

- **Purpose**: Fetches consolidated events for a date range
- **Returns**: `EventOccurrenceDTO[]`
- **Usage**: Used as the main data fetching method for the calendar

#### `addEvent` (createSingularEvent / createRecurringSeries)

- **Purpose**: Creates new events (singular or recurring)
- **Supports**: Both singular events and recurring series
- **Auto-dispatch**: Automatically refreshes events after creation

#### `updateEvent` (updateSingularEvent / updateRecurringSeries)

- **Purpose**: Updates existing events
- **Supports**: Both singular events and recurring series
- **Auto-dispatch**: Automatically refreshes events after update

#### `deleteEvent` (deleteSingularEvent)

- **Purpose**: Deletes singular events
- **Auto-dispatch**: Automatically refreshes events after deletion

### 2. Event Occurrence Operations

#### `modifyEventOccurrence`

- **Purpose**: Modifies/reschedules a specific event occurrence
- **Parameters**: `seriesId`, `originalStartTime`, `newStartTime`, `newEndTime`, `newPrice`, `newMeetingLink`
- **Returns**: `EventOccurrenceDTO`

#### `cancelEventOccurrence`

- **Purpose**: Cancels a specific event occurrence
- **Parameters**: `seriesId`, `occurrenceStartTime`
- **Returns**: `EventOccurrenceDTO`

#### `completeEventOccurrence`

- **Purpose**: Completes an event occurrence with attendance tracking
- **Parameters**: `seriesId`, `originalStartTime`, `actualStartTime`, `actualEndTime`, `attendeeIds`
- **Returns**: `EventOccurrenceDTO`

### 3. Attendee Operations

#### `getAttendees`

- **Purpose**: Retrieves full UserDTO objects for expected attendees
- **Parameters**: `seriesId` or `occurrenceId`
- **Returns**: `UserDTO[]`
- **Integration**: Works with existing student photos and data

### 4. Professor-Specific Operations

#### `getConsolidatedEventsForProfessor`

- **Purpose**: Gets consolidated events for a specific professor
- **Parameters**: `professorId`, `startDate`, `endDate`
- **Returns**: `EventOccurrenceDTO[]`

#### `getMyEvents`

- **Purpose**: Gets events for the current professor
- **Parameters**: `startDate`, `endDate`
- **Returns**: `EventsDTO`

#### `getMySingularEvents`

- **Purpose**: Gets singular events for the current professor
- **Parameters**: `startDate`, `endDate`
- **Returns**: `SingularEventDTO[]`

#### `getSingularEventsForProfessor`

- **Purpose**: Gets singular events for a specific professor
- **Parameters**: `professorId`, `startDate`, `endDate`
- **Returns**: `SingularEventDTO[]`

### 5. Pricing Operations

#### `setEventOccurrenceAttendeePrice`

- **Purpose**: Sets price for a specific attendee in an event occurrence
- **Parameters**: `occurrenceId`, `attendeeId`, `price`
- **Authorization**: Requires PROFESSOR or ADMIN role

#### `setRecurringSeriesAttendeePrice`

- **Purpose**: Sets price for a specific attendee in a recurring series
- **Parameters**: `seriesId`, `attendeeId`, `price`
- **Authorization**: Requires PROFESSOR or ADMIN role

#### `setSingularEventAttendeePrice`

- **Purpose**: Sets price for a specific attendee in a singular event
- **Parameters**: `eventId`, `attendeeId`, `price`
- **Authorization**: Requires PROFESSOR or ADMIN role

## Redux Store Structure

```typescript
interface CalendarState {
  events: EventOccurrenceDTO[] // Main consolidated events
  selectedEvent: EventOccurrenceDTO | null // Currently selected event
  attendees: UserDTO[] // Attendees for selected event/series
  myEvents: EventsDTO | null // Current professor's events
  mySingularEvents: SingularEventDTO[] // Current professor's singular events
  loading: boolean // Loading state
  error: string | null // Error message
}
```

## Selectors

- `selectCalendarEvents` - Get all events
- `selectSelectedEvent` - Get selected event
- `selectAttendees` - Get attendees
- `selectMyEvents` - Get current professor's events
- `selectMySingularEvents` - Get current professor's singular events
- `selectCalendarLoading` - Get loading state
- `selectCalendarError` - Get error state

## Utility Functions

### Attendee Utils (`attendeeUtils.ts`)

- `mergeAttendeesWithPhotos` - Merge attendee data with student photos
- `getAttendeeDisplayName` - Get display name with fallbacks
- `getAttendeeInitials` - Get initials for avatar
- `filterAttendeesBySearch` - Filter attendees by search term
- `sortAttendeesByName` - Sort attendees alphabetically

### Event Utils (`eventUtils.ts`)

- `calculateEventEndTime` - Calculate end time from start time and duration
- `calculateEventDuration` - Calculate duration from start and end time
- `formatEventDuration` - Format duration for display
- `isAllDayEvent` - Check if event is all-day
- `getEventStatus` - Get event status (upcoming, ongoing, completed, cancelled)
- `sortEventsByStartTime` - Sort events by start time
- `filterEventsByDateRange` - Filter events by date range
- `groupEventsByDate` - Group events by date
- `doEventsOverlap` - Check if two events overlap
- `findConflictingEvents` - Find conflicting events
- `singularEventToCalendarEvent` - Convert SingularEventDTO to calendar format
- `recurringSeriesEventToCalendarEvent` - Convert RecurringSeriesDTO to calendar format
- `eventOccurrenceToCalendarEvent` - Convert EventOccurrenceDTO to calendar format

### Pricing Utils (`pricingUtils.ts`)

- `calculateTotalRevenue` - Calculate total revenue from attendee prices
- `calculateAveragePrice` - Calculate average price per attendee
- `getAttendeePriceById` - Get specific attendee price
- `updateAttendeePrice` - Update attendee price in collection
- `removeAttendeePrice` - Remove attendee price from collection
- `mergeAttendeePricesWithDetails` - Merge prices with attendee details
- `formatPrice` - Format price for display (supports RON currency)
- `validatePrice` - Validate price values
- `calculatePriceStatistics` - Calculate price statistics

## Usage Examples

### Basic Event Operations

```typescript
// Fetch events
dispatch(fetchEvents())

// Add a new singular event
dispatch(
  addEvent({
    title: 'Math Lesson',
    start: '2024-01-15T10:00:00Z',
    end: '2024-01-15T11:00:00Z',
    expectedAttendees: ['student1', 'student2'],
    extendedProps: {
      description: 'Algebra basics',
      price: 50,
      meetingLink: 'https://meet.google.com/abc-def-ghi'
    }
  })
)

// Update an event
dispatch(
  updateEvent({
    id: 'event123',
    title: 'Updated Math Lesson'
    // ... other properties
  })
)

// Delete an event
dispatch(deleteEvent('event123'))
```

### Attendee Operations

```typescript
// Get attendees for a series
dispatch(getAttendees({ seriesId: 'series123' }))

// Get attendees for an occurrence
dispatch(getAttendees({ occurrenceId: 'occurrence123' }))

// Set attendee price
dispatch(
  setSingularEventAttendeePrice({
    eventId: 'event123',
    attendeeId: 'student1',
    price: 75
  })
)
```

### Event Occurrence Operations

```typescript
// Complete an event with attendance
dispatch(
  completeEventOccurrence({
    seriesId: 'series123',
    originalStartTime: '2024-01-15T10:00:00Z',
    actualStartTime: '2024-01-15T10:05:00Z',
    actualEndTime: '2024-01-15T11:00:00Z',
    attendeeIds: ['student1', 'student2']
  })
)

// Cancel an event occurrence
dispatch(
  cancelEventOccurrence({
    seriesId: 'series123',
    occurrenceStartTime: '2024-01-15T10:00:00Z'
  })
)

// Modify an event occurrence
dispatch(
  modifyEventOccurrence({
    id: 'series123',
    newStartTime: '2024-01-15T11:00:00Z',
    newEndTime: '2024-01-15T12:00:00Z',
    newPrice: 60
  })
)
```

### Using Utilities

```typescript
import {
  mergeAttendeesWithPhotos,
  getAttendeeDisplayName,
  calculateTotalRevenue,
  formatPrice,
  eventOccurrenceToCalendarEvent
} from 'src/store/apps/calendar'

// Merge attendees with photos
const attendeesWithPhotos = mergeAttendeesWithPhotos(attendees, studentsWithAvatars)

// Format attendee display
const displayName = getAttendeeDisplayName(attendee)

// Calculate revenue
const totalRevenue = calculateTotalRevenue(attendeePrices)
const formattedPrice = formatPrice(totalRevenue) // "150,00 RON"

// Convert event for calendar display
const calendarEvent = eventOccurrenceToCalendarEvent(eventOccurrence)
```

## Error Handling

All async thunks include comprehensive error handling:

- Loading states are managed automatically
- Errors are stored in the Redux state
- Failed operations can be retried
- Error messages are user-friendly

## Integration with Existing Code

The implementation is designed to work seamlessly with existing student IDs and photos:

- Attendee utilities merge student data with photos
- Event utilities handle all DTO conversions
- Pricing utilities support the existing currency format
- All operations maintain compatibility with the existing calendar UI

## Performance Considerations

- Events are automatically refreshed after mutations
- Attendee data is cached in Redux state
- Utility functions are optimized for performance
- Large datasets are handled efficiently

## Type Safety

All operations are fully typed using the generated OpenAPI types:

- `EventOccurrenceDTO`, `SingularEventDTO`, `RecurringSeriesDTO`
- `UserDTO` for attendee information
- `EventsDTO` for grouped events
- Custom interfaces for utility functions

This implementation provides a complete, production-ready calendar system with all EventsControllerApi operations available through Redux.
