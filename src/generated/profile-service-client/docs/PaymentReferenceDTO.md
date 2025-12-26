# PaymentReferenceDTO


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**referenceCode** | **string** |  | [optional] [default to undefined]
**professorId** | **string** |  | [optional] [default to undefined]
**professorName** | **string** |  | [optional] [default to undefined]
**amount** | **number** |  | [optional] [default to undefined]
**currency** | **string** |  | [optional] [default to undefined]
**availableBankAccounts** | [**Array&lt;BankAccountDTO&gt;**](BankAccountDTO.md) |  | [optional] [default to undefined]

## Example

```typescript
import { PaymentReferenceDTO } from 'ementor-api-client';

const instance: PaymentReferenceDTO = {
    referenceCode,
    professorId,
    professorName,
    amount,
    currency,
    availableBankAccounts,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
