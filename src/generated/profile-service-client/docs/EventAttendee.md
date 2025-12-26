# EventAttendee


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  | [optional] [default to undefined]
**creation** | **string** |  | [optional] [default to undefined]
**expires** | **string** |  | [optional] [default to undefined]
**modified** | **string** |  | [optional] [default to undefined]
**recurringSeries** | [**RecurringSeries**](RecurringSeries.md) |  | [optional] [default to undefined]
**eventOccurrence** | [**EventOccurrence**](EventOccurrence.md) |  | [optional] [default to undefined]
**attendeeId** | **string** |  | [optional] [default to undefined]
**hasCustomPricing** | **boolean** |  | [optional] [default to undefined]
**customPrice** | **number** |  | [optional] [default to undefined]
**expected** | **boolean** |  | [optional] [default to undefined]
**customPricing** | **number** |  | [optional] [default to undefined]
**effectiveCustomPrice** | **number** |  | [optional] [default to undefined]
**attended** | **boolean** |  | [optional] [default to undefined]
**eventOccurrenceAttendee** | **boolean** |  | [optional] [default to undefined]
**recurringSeriesAttendee** | **boolean** |  | [optional] [default to undefined]
**effectiveEventId** | **string** |  | [optional] [default to undefined]

## Example

```typescript
import { EventAttendee } from 'ementor-api-client';

const instance: EventAttendee = {
    id,
    creation,
    expires,
    modified,
    recurringSeries,
    eventOccurrence,
    attendeeId,
    hasCustomPricing,
    customPrice,
    expected,
    customPricing,
    effectiveCustomPrice,
    attended,
    eventOccurrenceAttendee,
    recurringSeriesAttendee,
    effectiveEventId,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
