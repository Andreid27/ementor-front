# FinanceExportDTO


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**periodStart** | **string** | First day of the period (Europe/Bucharest), inclusive | [default to undefined]
**periodEnd** | **string** | Last day of the period (Europe/Bucharest), inclusive | [default to undefined]
**generatedAt** | **string** | UTC instant the numbers were computed | [default to undefined]
**currency** | **string** | ISO 4217 currency of every amount | [default to undefined]
**rows** | [**Array&lt;FinanceExportRowDTO&gt;**](FinanceExportRowDTO.md) |  | [default to undefined]

## Example

```typescript
import { FinanceExportDTO } from 'ementor-api-client';

const instance: FinanceExportDTO = {
    periodStart,
    periodEnd,
    generatedAt,
    currency,
    rows,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
