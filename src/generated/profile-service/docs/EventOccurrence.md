# EventOccurrence


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  | [optional] [default to undefined]
**creation** | **string** |  | [optional] [default to undefined]
**expires** | **string** |  | [optional] [default to undefined]
**modified** | **boolean** |  | [optional] [default to undefined]
**recurringSeries** | [**RecurringSeries**](RecurringSeries.md) |  | [optional] [default to undefined]
**professor** | [**ProfessorProfile**](ProfessorProfile.md) |  | [optional] [default to undefined]
**title** | **string** |  | [optional] [default to undefined]
**description** | **string** |  | [optional] [default to undefined]
**duration** | [**EventOccurrenceDuration**](EventOccurrenceDuration.md) |  | [optional] [default to undefined]
**eventAttendees** | [**Array&lt;EventAttendee&gt;**](EventAttendee.md) |  | [optional] [default to undefined]
**originalStartTime** | **string** |  | [optional] [default to undefined]
**actualStartTime** | **string** |  | [optional] [default to undefined]
**actualEndTime** | **string** |  | [optional] [default to undefined]
**price** | **number** |  | [optional] [default to undefined]
**meetingLink** | **string** |  | [optional] [default to undefined]
**cancelled** | **boolean** |  | [optional] [default to undefined]

## Example

```typescript
import { EventOccurrence } from 'ementor-api-client';

const instance: EventOccurrence = {
    id,
    creation,
    expires,
    modified,
    recurringSeries,
    professor,
    title,
    description,
    duration,
    eventAttendees,
    originalStartTime,
    actualStartTime,
    actualEndTime,
    price,
    meetingLink,
    cancelled,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
