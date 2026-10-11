# FinancePaymentRowDTO


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  | [default to undefined]
**student** | [**FinanceStudentRefDTO**](FinanceStudentRefDTO.md) |  | [default to undefined]
**amount** | **number** |  | [default to undefined]
**currency** | **string** |  | [default to undefined]
**status** | **string** |  | [default to undefined]
**referenceCode** | **string** |  | [default to undefined]
**createdAt** | **string** |  | [default to undefined]
**confirmedAt** | **string** |  | [default to undefined]
**rejectedReason** | **string** | Always null for now (not stored) | [default to undefined]
**totalAllocated** | **number** |  | [default to undefined]
**surplus** | **number** |  | [default to undefined]
**paymentProofHostFileId** | **string** |  | [default to undefined]

## Example

```typescript
import { FinancePaymentRowDTO } from 'ementor-api-client';

const instance: FinancePaymentRowDTO = {
    id,
    student,
    amount,
    currency,
    status,
    referenceCode,
    createdAt,
    confirmedAt,
    rejectedReason,
    totalAllocated,
    surplus,
    paymentProofHostFileId,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
