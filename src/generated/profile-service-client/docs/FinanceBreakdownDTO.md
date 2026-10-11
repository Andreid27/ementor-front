# FinanceBreakdownDTO


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**periodStart** | **string** | First day of the period (Europe/Bucharest), inclusive | [default to undefined]
**periodEnd** | **string** | Last day of the period (Europe/Bucharest), inclusive | [default to undefined]
**generatedAt** | **string** | UTC instant the numbers were computed | [default to undefined]
**currency** | **string** | ISO 4217 currency of every amount | [default to undefined]
**by** | **string** |  | [default to undefined]
**totalEarned** | **number** |  | [default to undefined]
**rows** | [**Array&lt;FinanceBreakdownRowDTO&gt;**](FinanceBreakdownRowDTO.md) |  | [default to undefined]

## Example

```typescript
import { FinanceBreakdownDTO } from 'ementor-api-client';

const instance: FinanceBreakdownDTO = {
    periodStart,
    periodEnd,
    generatedAt,
    currency,
    by,
    totalEarned,
    rows,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
