# FinancePaymentsPageDTO


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**periodStart** | **string** | First day of the period (Europe/Bucharest), inclusive | [default to undefined]
**periodEnd** | **string** | Last day of the period (Europe/Bucharest), inclusive | [default to undefined]
**generatedAt** | **string** | UTC instant the numbers were computed | [default to undefined]
**currency** | **string** | ISO 4217 currency of every amount | [default to undefined]
**page** | **number** | 0-based page index | [default to undefined]
**size** | **number** | Page size | [default to undefined]
**totalItems** | **number** |  | [default to undefined]
**totalPages** | **number** |  | [default to undefined]
**items** | [**Array&lt;FinancePaymentRowDTO&gt;**](FinancePaymentRowDTO.md) |  | [default to undefined]

## Example

```typescript
import { FinancePaymentsPageDTO } from 'ementor-api-client';

const instance: FinancePaymentsPageDTO = {
    periodStart,
    periodEnd,
    generatedAt,
    currency,
    page,
    size,
    totalItems,
    totalPages,
    items,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
