# FinanceLedgerDTO


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**periodStart** | **string** | First day of the period (Europe/Bucharest), inclusive | [default to undefined]
**periodEnd** | **string** | Last day of the period (Europe/Bucharest), inclusive | [default to undefined]
**generatedAt** | **string** | UTC instant the numbers were computed | [default to undefined]
**currency** | **string** | ISO 4217 currency of every amount | [default to undefined]
**student** | [**FinanceStudentRefDTO**](FinanceStudentRefDTO.md) |  | [default to undefined]
**openingBalance** | **number** |  | [default to undefined]
**closingBalance** | **number** |  | [default to undefined]
**totalCharged** | **number** | Sum of session charges in the period (positive) | [default to undefined]
**totalPaid** | **number** | Sum of CONFIRMED payments in the period | [default to undefined]
**outstanding** | **number** | As of periodEnd | [default to undefined]
**credit** | **number** | As of periodEnd | [default to undefined]
**entries** | [**Array&lt;FinanceLedgerEntryDTO&gt;**](FinanceLedgerEntryDTO.md) |  | [default to undefined]

## Example

```typescript
import { FinanceLedgerDTO } from 'ementor-api-client';

const instance: FinanceLedgerDTO = {
    periodStart,
    periodEnd,
    generatedAt,
    currency,
    student,
    openingBalance,
    closingBalance,
    totalCharged,
    totalPaid,
    outstanding,
    credit,
    entries,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
