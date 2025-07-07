# Attendee Management System

This document describes the comprehensive attendee management system with per-student pricing for the calendar events.

## Overview

The attendee management system provides:

- **Student Integration**: Seamless work with existing student data and profile pictures
- **Flexible Pricing**: Per-student pricing with default price fallbacks
- **API Integration**: Full integration with EventsControllerApi pricing endpoints
- **Rich UI Components**: Pre-built components for managing attendees and pricing
- **Type Safety**: Comprehensive TypeScript support

## Core Features

### 1. Student Data Integration

- Uses existing student data with profile pictures
- Supports both `id` and `userId` field variations
- Merges student avatars with UserDTO data
- Handles missing data gracefully with fallbacks

### 2. Per-Student Pricing

- Individual pricing for each attendee
- Default price fallback for students without custom pricing
- Support for all event types (singular, recurring, occurrence)
- Real-time price validation and statistics

### 3. API Integration

- `setSingularEventAttendeePrice` - Set price for attendee in singular event
- `setRecurringSeriesAttendeePrice` - Set price for attendee in recurring series
- `setEventOccurrenceAttendeePrice` - Set price for attendee in event occurrence
- `getAttendees` - Fetch attendee UserDTO data from API

## Components

### AttendeeManager

Main component for selecting and managing event attendees.

```tsx
import { AttendeeManager } from 'src/views/apps/calendar/utils'

;<AttendeeManager
  students={studentsWithAvatars}
  selectedAttendeeIds={attendeeIds}
  onAttendeeIdsChange={setAttendeeIds}
  attendeePrices={attendeePrices}
  onAttendeePricesChange={setAttendeePrices}
  defaultPrice={50}
  showPricing={true}
  showStatistics={true}
  isReadOnly={false}
/>
```

**Features:**

- Student selection with search and filtering
- Real-time pricing management
- Attendee statistics and validation
- Expandable/collapsible sections
- Avatar display with fallback initials

### AttendeePricingManager

Specialized component for managing pricing of existing event attendees.

```tsx
import { AttendeePricingManager } from 'src/views/apps/calendar/utils'

;<AttendeePricingManager
  eventId='event123'
  eventType='singular'
  attendeeIds={['student1', 'student2']}
  students={studentsWithAvatars}
  attendeePrices={existingPrices}
  defaultPrice={50}
  onPricingUpdated={handlePricingUpdate}
/>
```

**Features:**

- API-integrated pricing updates
- Immediate save with confirmation dialogs
- Loading states and error handling
- Price validation and statistics
- Support for all event types

### EventAttendeeManagement

Complete attendee management with tabbed interface.

```tsx
import { EventAttendeeManagement } from 'src/views/apps/calendar/utils'

;<EventAttendeeManagement
  eventId='event123'
  eventType='singular'
  initialAttendeeIds={event.expectedAttendees}
  initialAttendeePrices={event.attendeePrices}
  defaultPrice={event.price}
  students={studentsWithAvatars}
  onAttendeeIdsChange={handleAttendeeChange}
  onAttendeePricesChange={handlePricingChange}
  isNewEvent={false}
/>
```

**Features:**

- Tabbed interface (Attendees / Pricing)
- Summary statistics bar
- Built-in help system
- Form integration support
- Responsive design

## Hooks

### useAttendeeManagement

Comprehensive hook for attendee and pricing management.

```tsx
import { useAttendeeManagement } from 'src/views/apps/calendar/utils'

const {
  attendees,
  attendeeIds,
  attendeePrices,
  isLoading,
  error,
  setAttendeeIds,
  setAttendeePrices,
  addAttendee,
  removeAttendee,
  setAttendeePrice,
  removeAttendeePrice,
  refreshAttendees,
  totalAttendees,
  totalRevenue,
  averagePrice,
  attendeesWithCustomPrice
} = useAttendeeManagement({
  eventId: 'event123',
  students: studentsWithAvatars,
  initialAttendeeIds: ['student1', 'student2'],
  initialAttendeePrices: { student1: 75 },
  defaultPrice: 50,
  autoFetchAttendees: true
})
```

## Utility Functions

### Attendee Management

```tsx
import {
  getAttendeesFromStudentIds,
  mergeAttendeesWithPricing,
  getAttendeeDisplayName,
  getAttendeeInitials,
  getAttendeeAvatar,
  getAttendeeId,
  filterAttendeesBySearch,
  sortAttendeesByName,
  calculateAttendeeStats,
  validateAttendeePricing
} from 'src/views/apps/calendar/utils'

// Convert student IDs to attendee objects with photos
const attendees = getAttendeesFromStudentIds(studentIds, studentsWithAvatars)

// Add pricing information
const attendeesWithPricing = mergeAttendeesWithPricing(attendees, prices, defaultPrice)

// Get display information
const displayName = getAttendeeDisplayName(attendee)
const initials = getAttendeeInitials(attendee)
const avatar = getAttendeeAvatar(attendee)
```

### Pricing Utilities

```tsx
import { formatPrice, validatePrice, calculateTotalRevenue, calculateAveragePrice } from 'src/views/apps/calendar/utils'

// Format price for display
const formattedPrice = formatPrice(150) // "150,00 RON"

// Validate price input
const validation = validatePrice(75) // { isValid: true }

// Calculate statistics
const totalRevenue = calculateTotalRevenue(attendeePrices)
const averagePrice = calculateAveragePrice(attendeePrices)
```

## Data Structures

### StudentData Interface

```tsx
interface StudentData {
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
```

### AttendeeWithPhoto Interface

```tsx
interface AttendeeWithPhoto extends UserDTO {
  avatar?: string | null
  studentData?: StudentData
  price?: number
  defaultPrice?: number
}
```

### AttendeeWithPricing Interface

```tsx
interface AttendeeWithPricing extends AttendeeWithPhoto {
  individualPrice?: number
  hasCustomPrice?: boolean
  priceStatus?: 'default' | 'custom' | 'not-set'
}
```

## Integration Examples

### Form Integration

```tsx
// In your event form component
const [attendeeIds, setAttendeeIds] = useState<string[]>([])
const [attendeePrices, setAttendeePrices] = useState<{ [key: string]: number }>({})

const handleSubmit = eventData => {
  const eventPayload = {
    ...eventData,
    expectedAttendees: attendeeIds
    // Individual prices will be set via separate API calls
  }

  // Create event first
  await dispatch(addEvent(eventPayload))

  // Then set individual prices if any
  for (const [studentId, price] of Object.entries(attendeePrices)) {
    await dispatch(
      setSingularEventAttendeePrice({
        eventId: newEventId,
        attendeeId: studentId,
        price
      })
    )
  }
}

return (
  <EventAttendeeManagement
    students={studentsWithAvatars}
    initialAttendeeIds={eventData.expectedAttendees}
    defaultPrice={eventData.price}
    onAttendeeIdsChange={setAttendeeIds}
    onAttendeePricesChange={setAttendeePrices}
    isNewEvent={true}
  />
)
```

### Existing Event Management

```tsx
// For existing events with pricing
<EventAttendeeManagement
  eventId={event.id}
  eventType='singular'
  initialAttendeeIds={event.expectedAttendees}
  initialAttendeePrices={event.attendeePrices}
  defaultPrice={event.price}
  students={studentsWithAvatars}
  isReadOnly={!canEdit}
/>
```

## API Integration

### Setting Individual Prices

```tsx
// For singular events
await dispatch(
  setSingularEventAttendeePrice({
    eventId: 'event123',
    attendeeId: 'student1',
    price: 75
  })
)

// For recurring series
await dispatch(
  setRecurringSeriesAttendeePrice({
    seriesId: 'series123',
    attendeeId: 'student1',
    price: 75
  })
)

// For event occurrences
await dispatch(
  setEventOccurrenceAttendeePrice({
    occurrenceId: 'occurrence123',
    attendeeId: 'student1',
    price: 75
  })
)
```

### Fetching Attendees

```tsx
// Get attendees for a series
await dispatch(getAttendees({ seriesId: 'series123' }))

// Get attendees for an occurrence
await dispatch(getAttendees({ occurrenceId: 'occurrence123' }))
```

## Best Practices

### 1. Student Data Handling

- Always provide the `studentsWithAvatars` array with both `id` and `userId` fields
- Include avatar URLs that are already processed/downloaded
- Handle missing student data gracefully

### 2. Pricing Management

- Set default prices at the event level first
- Use individual pricing sparingly for special cases
- Always validate prices before submission
- Provide clear feedback for pricing changes

### 3. Performance

- Use the `useAttendeeManagement` hook for state management
- Enable `autoFetchAttendees` only when needed
- Implement proper loading states for API calls

### 4. User Experience

- Show clear statistics and summaries
- Provide confirmation dialogs for price changes
- Display helpful error messages
- Use consistent formatting for prices (RON currency)

This attendee management system provides a complete solution for managing event attendees with flexible per-student pricing, seamlessly integrated with the existing student data and EventsControllerApi endpoints.
