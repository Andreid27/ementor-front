# RecurringSeriesDTO


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  | [optional] [default to undefined]
**title** | **string** |  | [optional] [default to undefined]
**description** | **string** |  | [optional] [default to undefined]
**startTime** | **string** |  | [optional] [default to undefined]
**duration** | [**SingularEventDTODuration**](SingularEventDTODuration.md) |  | [optional] [default to undefined]
**pattern** | **string** |  | [optional] [default to undefined]
**price** | **number** |  | [optional] [default to undefined]
**meetingLink** | **string** |  | [optional] [default to undefined]
**endRecurrence** | **string** |  | [optional] [default to undefined]
**expectedAttendees** | **Array&lt;string&gt;** |  | [optional] [default to undefined]
**professorId** | **string** |  | [optional] [default to undefined]
**professorName** | **string** |  | [optional] [default to undefined]
**creation** | **string** |  | [optional] [default to undefined]
**modified** | **string** |  | [optional] [default to undefined]

## Example

```typescript
import { RecurringSeriesDTO } from 'ementor-api-client';

const instance: RecurringSeriesDTO = {
    id,
    title,
    description,
    startTime,
    duration,
    pattern,
    price,
    meetingLink,
    endRecurrence,
    expectedAttendees,
    professorId,
    professorName,
    creation,
    modified,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
