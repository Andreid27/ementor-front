# FinanceOverviewDTO


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**periodStart** | **string** | First day of the period (Europe/Bucharest), inclusive | [default to undefined]
**periodEnd** | **string** | Last day of the period (Europe/Bucharest), inclusive | [default to undefined]
**generatedAt** | **string** | UTC instant the numbers were computed | [default to undefined]
**currency** | **string** | ISO 4217 currency of every amount | [default to undefined]
**current** | [**FinanceKpisDTO**](FinanceKpisDTO.md) |  | [default to undefined]
**previous** | [**FinanceKpisDTO**](FinanceKpisDTO.md) |  | [default to undefined]
**pendingPaymentsCount** | **number** | PENDING payments right now (not period-filtered) | [default to undefined]
**pendingPaymentsAmount** | **number** | Sum of PENDING payments right now (not period-filtered) | [default to undefined]

## Example

```typescript
import { FinanceOverviewDTO } from 'ementor-api-client';

const instance: FinanceOverviewDTO = {
    periodStart,
    periodEnd,
    generatedAt,
    currency,
    current,
    previous,
    pendingPaymentsCount,
    pendingPaymentsAmount,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
