# FinanceAgingDTO


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**periodStart** | **string** | First day of the period (Europe/Bucharest), inclusive | [default to undefined]
**periodEnd** | **string** | Last day of the period (Europe/Bucharest), inclusive | [default to undefined]
**generatedAt** | **string** | UTC instant the numbers were computed | [default to undefined]
**currency** | **string** | ISO 4217 currency of every amount | [default to undefined]
**totalOutstanding** | **number** |  | [default to undefined]
**buckets** | [**Array&lt;FinanceAgingBucketDTO&gt;**](FinanceAgingBucketDTO.md) |  | [default to undefined]
**topStudents** | [**Array&lt;FinanceAgingStudentDTO&gt;**](FinanceAgingStudentDTO.md) |  | [default to undefined]

## Example

```typescript
import { FinanceAgingDTO } from 'ementor-api-client';

const instance: FinanceAgingDTO = {
    periodStart,
    periodEnd,
    generatedAt,
    currency,
    totalOutstanding,
    buckets,
    topStudents,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
