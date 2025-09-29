# PaymentConfirmationResultDTO


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**paymentId** | **string** |  | [optional] [default to undefined]
**confirmedAt** | **string** |  | [optional] [default to undefined]
**confirmedBy** | **string** |  | [optional] [default to undefined]
**totalAmount** | **number** |  | [optional] [default to undefined]
**walletBalanceBefore** | **number** |  | [optional] [default to undefined]
**walletBalanceAfter** | **number** |  | [optional] [default to undefined]
**allocations** | [**Array&lt;AllocationResultDTO&gt;**](AllocationResultDTO.md) |  | [optional] [default to undefined]
**totalAllocated** | **number** |  | [optional] [default to undefined]
**surplusAmount** | **number** |  | [optional] [default to undefined]
**currency** | **string** |  | [optional] [default to undefined]

## Example

```typescript
import { PaymentConfirmationResultDTO } from 'ementor-api-client';

const instance: PaymentConfirmationResultDTO = {
    paymentId,
    confirmedAt,
    confirmedBy,
    totalAmount,
    walletBalanceBefore,
    walletBalanceAfter,
    allocations,
    totalAllocated,
    surplusAmount,
    currency,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
