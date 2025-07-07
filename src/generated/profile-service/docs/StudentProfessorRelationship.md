# StudentProfessorRelationship


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  | [optional] [default to undefined]
**student** | [**StudentProfile**](StudentProfile.md) |  | [optional] [default to undefined]
**professor** | [**ProfessorProfile**](ProfessorProfile.md) |  | [optional] [default to undefined]
**defaultPricePerSession** | **number** |  | [optional] [default to undefined]
**createdAt** | **string** |  | [optional] [default to undefined]
**modifiedAt** | **string** |  | [optional] [default to undefined]
**status** | **string** |  | [optional] [default to undefined]

## Example

```typescript
import { StudentProfessorRelationship } from 'ementor-api-client';

const instance: StudentProfessorRelationship = {
    id,
    student,
    professor,
    defaultPricePerSession,
    createdAt,
    modifiedAt,
    status,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
