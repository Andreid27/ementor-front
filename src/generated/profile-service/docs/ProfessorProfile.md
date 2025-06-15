# ProfessorProfile


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
**university** | [**University**](University.md) |  | [optional] [default to undefined]
**speciality** | [**Speciality**](Speciality.md) |  | [optional] [default to undefined]
**fullName** | **string** |  | [optional] [default to undefined]
**about** | **string** |  | [optional] [default to undefined]
**bankAccounts** | [**Array&lt;BankAccount&gt;**](BankAccount.md) |  | [optional] [default to undefined]

## Example

```typescript
import { ProfessorProfile } from 'ementor-api-client';

const instance: ProfessorProfile = {
    id,
    creation,
    expires,
    modified,
    userId,
    picture,
    address,
    university,
    speciality,
    fullName,
    about,
    bankAccounts,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
