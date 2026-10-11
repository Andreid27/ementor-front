# FinanceKpisDTO


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**periodStart** | **string** |  | [default to undefined]
**periodEnd** | **string** |  | [default to undefined]
**earned** | **number** | Sum of EVENT_CHARGEs whose session date is in the period | [default to undefined]
**collected** | **number** | CONFIRMED payments with confirmedAt in the period | [default to undefined]
**outstanding** | **number** | Cumulative unpaid charges as of periodEnd | [default to undefined]
**credit** | **number** | Cumulative unallocated confirmed payments as of periodEnd | [default to undefined]
**expected** | **number** | Future scheduled sessions in the period | [default to undefined]
**lost** | **number** | Cancelled sessions in the period | [default to undefined]
**awaitingCompletion** | **number** | Past sessions in the period not yet completed or cancelled | [default to undefined]
**sessionsCompleted** | **number** |  | [default to undefined]
**sessionsCancelled** | **number** |  | [default to undefined]
**sessionsExpected** | **number** | Number of sessions counted in expected | [default to undefined]
**sessionsAwaitingCompletion** | **number** |  | [default to undefined]
**billedAttendances** | **number** |  | [default to undefined]
**activePayingStudents** | **number** |  | [default to undefined]
**averagePricePerSession** | **number** | earned / billedAttendances; null when billedAttendances &#x3D; 0 | [default to undefined]
**collectionRate** | **number** | collected / earned, 4 decimals; null when earned &#x3D; 0 | [default to undefined]

## Example

```typescript
import { FinanceKpisDTO } from 'ementor-api-client';

const instance: FinanceKpisDTO = {
    periodStart,
    periodEnd,
    earned,
    collected,
    outstanding,
    credit,
    expected,
    lost,
    awaitingCompletion,
    sessionsCompleted,
    sessionsCancelled,
    sessionsExpected,
    sessionsAwaitingCompletion,
    billedAttendances,
    activePayingStudents,
    averagePricePerSession,
    collectionRate,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
