# FinanceBreakdownRowDTO


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**key** | **string** |  | [default to undefined]
**label** | **string** |  | [default to undefined]
**sessions** | **number** | Distinct occurrences | [default to undefined]
**billedAttendances** | **number** |  | [default to undefined]
**students** | **number** | Distinct students | [default to undefined]
**earned** | **number** |  | [default to undefined]
**paid** | **number** | Allocations to these attendances up to periodEnd | [default to undefined]
**outstanding** | **number** |  | [default to undefined]
**shareOfEarned** | **number** | earned / totalEarned, 4 decimals | [default to undefined]

## Example

```typescript
import { FinanceBreakdownRowDTO } from 'ementor-api-client';

const instance: FinanceBreakdownRowDTO = {
    key,
    label,
    sessions,
    billedAttendances,
    students,
    earned,
    paid,
    outstanding,
    shareOfEarned,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
