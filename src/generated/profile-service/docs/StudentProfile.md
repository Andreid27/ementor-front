# StudentProfile


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  | [optional] [default to undefined]
**creation** | **string** |  | [optional] [default to undefined]
**expires** | **string** |  | [optional] [default to undefined]
**modified** | **string** |  | [optional] [default to undefined]
**userId** | **string** |  | [optional] [default to undefined]
**picture** | [**ProfilePicture**](ProfilePicture.md) |  | [optional] [default to undefined]
**address** | [**Address**](Address.md) |  | [optional] [default to undefined]
**desiredExamDate** | **string** |  | [optional] [default to undefined]
**desiredUniversity** | [**University**](University.md) |  | [optional] [default to undefined]
**desiredSpeciality** | [**Speciality**](Speciality.md) |  | [optional] [default to undefined]
**school** | **string** |  | [optional] [default to undefined]
**schoolDomain** | **string** |  | [optional] [default to undefined]
**schoolSpeciality** | **string** |  | [optional] [default to undefined]
**schoolGrade** | **number** |  | [optional] [default to undefined]
**professorRelationships** | [**Array&lt;StudentProfessorRelationship&gt;**](StudentProfessorRelationship.md) |  | [optional] [default to undefined]
**pictureUrl** | **string** |  | [optional] [default to undefined]
**phone** | **string** |  | [optional] [default to undefined]
**defaultPricePerSession** | **number** |  | [optional] [default to undefined]

## Example

```typescript
import { StudentProfile } from 'ementor-api-client';

const instance: StudentProfile = {
    id,
    creation,
    expires,
    modified,
    userId,
    picture,
    address,
    desiredExamDate,
    desiredUniversity,
    desiredSpeciality,
    school,
    schoolDomain,
    schoolSpeciality,
    schoolGrade,
    professorRelationships,
    pictureUrl,
    phone,
    defaultPricePerSession,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
