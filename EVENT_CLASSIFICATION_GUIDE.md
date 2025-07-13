# Event Type Classification System

## Overview

This document outlines the enhanced event type classification system that distinguishes between singular events and occurrences of recurring series based on the `EventOccurrenceDTO` properties.

## Classification Rules

### 1. Singular Event

- **Condition**: `EventOccurrenceDTO.recurringSeriesId` is **null** AND `virtual == false`
- **Description**: A standalone event that occurs only once and is not part of any recurring series
- **API Endpoint**: Uses `updateSingularEvent` / `createSingularEvent`
- **Example**: A one-time workshop or meeting

### 2. Recurring Series Occurrence

- **Condition**: `EventOccurrenceDTO.recurringSeriesId` is **not null** AND `virtual == false`
- **Description**: A specific instance of a recurring series that has been materialized (not virtual)
- **API Endpoint**: Uses `modifyEventOccurrence`
- **Example**: A specific lesson in a weekly course series that has been customized

### 3. Virtual Recurring Series

- **Condition**: `virtual == true` (regardless of `recurringSeriesId`)
- **Description**: A template/virtual instance of a recurring series that hasn't been materialized yet
- **API Endpoint**: Uses `updateRecurringSeries` or `modifyEventOccurrence` (depending on scope)
- **Example**: Future weekly lessons that appear on the calendar but haven't happened yet

## Implementation

### Utility Functions

The following utility functions are available in `src/views/apps/calendar/utils/eventTypeUtils.ts`:

```typescript
// Check if event is a singular event
isSingularEvent(event: any): boolean

// Check if event is an occurrence of a recurring series
isRecurringSeriesOccurrence(event: any): boolean

// Check if event is a virtual recurring series template
isVirtualRecurringSeries(event: any): boolean

// Get human-readable classification
getEventClassification(event: any): string
```

### Enhanced Logging

The system now includes comprehensive logging to track event classification:

- In `useEventActions.ts`: Logs event type analysis during editing operations
- In `Calendar.js`: Logs classification during event rendering
- Extended props include classification flags for UI components

### API Differentiation

The system automatically routes to the correct API endpoints based on event classification:

- **Singular Events**: `PUT /events/{eventId}` (SingularEventDTO)
- **Series Occurrences**: `POST /events/occurrence/modify` (EventOccurrenceModification)
- **Virtual Series**: `PUT /events/series/{seriesId}` (RecurringSeriesDTO)

## Benefits

1. **Clear Distinction**: Precise categorization of event types based on DTO properties
2. **Correct API Usage**: Automatic routing to appropriate endpoints
3. **Enhanced Debugging**: Comprehensive logging for troubleshooting
4. **Reusable Logic**: Utility functions can be used throughout the application
5. **Type Safety**: Clear interfaces and consistent behavior

## Testing

To verify the classification is working:

1. Check browser console for event classification logs during calendar operations
2. Verify that editing operations call the correct API endpoints
3. Ensure that form field constraints apply correctly based on event type

## Future Enhancements

- Add unit tests for classification functions
- Create event type badges in the UI
- Add metrics tracking for different event types
- Implement event type-specific validation rules
