# PaymentDetailDTO


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**paymentId** | **string** |  | [optional] [default to undefined]
**studentId** | **string** |  | [optional] [default to undefined]
**studentName** | **string** |  | [optional] [default to undefined]
**professorId** | **string** |  | [optional] [default to undefined]
**professorName** | **string** |  | [optional] [default to undefined]
**amount** | **number** |  | [optional] [default to undefined]
**paymentStatus** | **string** |  | [optional] [default to undefined]
**paymentMethod** | **string** |  | [optional] [default to undefined]
**submittedAt** | **string** |  | [optional] [default to undefined]
**confirmedAt** | **string** |  | [optional] [default to undefined]
**confirmedBy** | **string** |  | [optional] [default to undefined]
**confirmedByName** | **string** |  | [optional] [default to undefined]
**proofOfPaymentPath** | **string** |  | [optional] [default to undefined]
**referenceNumber** | **string** |  | [optional] [default to undefined]
**totalAllocated** | **number** |  | [optional] [default to undefined]
**surplusAmount** | **number** |  | [optional] [default to undefined]
**allocationsCount** | **number** |  | [optional] [default to undefined]
**allocations** | [**Array&lt;PaymentAllocationDetailDTO&gt;**](PaymentAllocationDetailDTO.md) |  | [optional] [default to undefined]
**currency** | **string** |  | [optional] [default to undefined]
**notes** | **string** |  | [optional] [default to undefined]

## Example

```typescript
import { PaymentDetailDTO } from 'ementor-api-client';

const instance: PaymentDetailDTO = {
    paymentId,
    studentId,
    studentName,
    professorId,
    professorName,
    amount,
    paymentStatus,
    paymentMethod,
    submittedAt,
    confirmedAt,
    confirmedBy,
    confirmedByName,
    proofOfPaymentPath,
    referenceNumber,
    totalAllocated,
    surplusAmount,
    allocationsCount,
    allocations,
    currency,
    notes,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
