# BankAccount


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  | [optional] [default to undefined]
**creation** | **string** |  | [optional] [default to undefined]
**expires** | **string** |  | [optional] [default to undefined]
**modified** | **string** |  | [optional] [default to undefined]
**iban** | **string** |  | [optional] [default to undefined]
**bankName** | **string** |  | [optional] [default to undefined]
**accountHolderName** | **string** |  | [optional] [default to undefined]
**swiftCode** | **string** |  | [optional] [default to undefined]
**isPrimary** | **boolean** |  | [optional] [default to undefined]
**professor** | [**ProfessorProfile**](ProfessorProfile.md) |  | [optional] [default to undefined]

## Example

```typescript
import { BankAccount } from 'ementor-api-client';

const instance: BankAccount = {
    id,
    creation,
    expires,
    modified,
    iban,
    bankName,
    accountHolderName,
    swiftCode,
    isPrimary,
    professor,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
