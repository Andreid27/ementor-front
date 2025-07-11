# EventOccurrenceDTO


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  | [optional] [default to undefined]
**recurringSeriesId** | **string** |  | [optional] [default to undefined]
**seriesTitle** | **string** |  | [optional] [default to undefined]
**seriesDescription** | **string** |  | [optional] [default to undefined]
**originalStartTime** | **string** |  | [optional] [default to undefined]
**actualStartTime** | **string** |  | [optional] [default to undefined]
**actualEndTime** | **string** |  | [optional] [default to undefined]
**duration** | [**SingularEventDTODuration**](SingularEventDTODuration.md) |  | [optional] [default to undefined]
**price** | **number** |  | [optional] [default to undefined]
**meetingLink** | **string** |  | [optional] [default to undefined]
**attendanceCount** | **number** |  | [optional] [default to undefined]
**professorName** | **string** |  | [optional] [default to undefined]
**professorId** | **string** |  | [optional] [default to undefined]
**creation** | **string** |  | [optional] [default to undefined]
**modified** | **string** |  | [optional] [default to undefined]
**eventAttendees** | [**Array&lt;EventAttendeeDTO&gt;**](EventAttendeeDTO.md) |  | [optional] [default to undefined]
**virtual** | **boolean** |  | [optional] [default to undefined]
**cancelled** | **boolean** |  | [optional] [default to undefined]
**completed** | **boolean** |  | [optional] [default to undefined]
**effectiveStartTime** | **string** |  | [optional] [default to undefined]
**upcoming** | **boolean** |  | [optional] [default to undefined]
**missed** | **boolean** |  | [optional] [default to undefined]
**rescheduled** | **boolean** |  | [optional] [default to undefined]
**effectiveEndTime** | **string** |  | [optional] [default to undefined]

## Example

```typescript
import { EventOccurrenceDTO } from 'ementor-api-client';

const instance: EventOccurrenceDTO = {
    id,
    recurringSeriesId,
    seriesTitle,
    seriesDescription,
    originalStartTime,
    actualStartTime,
    actualEndTime,
    duration,
    price,
    meetingLink,
    attendanceCount,
    professorName,
    professorId,
    creation,
    modified,
    eventAttendees,
    virtual,
    cancelled,
    completed,
    effectiveStartTime,
    upcoming,
    missed,
    rescheduled,
    effectiveEndTime,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
