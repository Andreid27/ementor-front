# ProfessorProfileDTO


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  | [optional] [default to undefined]
**userId** | **string** |  | [optional] [default to undefined]
**user** | [**UserDTO**](UserDTO.md) |  | [optional] [default to undefined]
**pictureId** | **string** |  | [optional] [default to undefined]
**universityId** | **string** |  | [default to undefined]
**universityValue** | **string** |  | [optional] [default to undefined]
**specialityId** | **string** |  | [default to undefined]
**specialityValue** | **string** |  | [optional] [default to undefined]
**fullName** | **string** |  | [optional] [default to undefined]
**about** | **string** |  | [optional] [default to undefined]
**address** | [**AddressDTO**](AddressDTO.md) |  | [optional] [default to undefined]
**bankAccounts** | [**Array&lt;BankAccountDTO&gt;**](BankAccountDTO.md) |  | [optional] [default to undefined]

## Example

```typescript
import { ProfessorProfileDTO } from 'ementor-api-client';

const instance: ProfessorProfileDTO = {
    id,
    userId,
    user,
    pictureId,
    universityId,
    universityValue,
    specialityId,
    specialityValue,
    fullName,
    about,
    address,
    bankAccounts,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
