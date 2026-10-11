# FinanceStudentRowDTO


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**student** | [**FinanceStudentRefDTO**](FinanceStudentRefDTO.md) |  | [default to undefined]
**relationshipStatus** | **string** | null when there is no relationship row | [default to undefined]
**effectivePrice** | **number** | Price a new session would be billed at | [default to undefined]
**effectivePriceSource** | **string** |  | [default to undefined]
**sessionsInPeriod** | **number** | Billed attendances in the period | [default to undefined]
**earnedInPeriod** | **number** |  | [default to undefined]
**collectedInPeriod** | **number** |  | [default to undefined]
**outstanding** | **number** | As of periodEnd | [default to undefined]
**credit** | **number** | As of periodEnd | [default to undefined]
**unpaidSessions** | **number** | As of periodEnd | [default to undefined]
**oldestUnpaidSessionDate** | **string** |  | [default to undefined]
**lastPaymentDate** | **string** | confirmedAt of the latest CONFIRMED payment with confirmedAt &lt;&#x3D; periodEnd | [default to undefined]
**lastPaymentAmount** | **number** |  | [default to undefined]

## Example

```typescript
import { FinanceStudentRowDTO } from 'ementor-api-client';

const instance: FinanceStudentRowDTO = {
    student,
    relationshipStatus,
    effectivePrice,
    effectivePriceSource,
    sessionsInPeriod,
    earnedInPeriod,
    collectedInPeriod,
    outstanding,
    credit,
    unpaidSessions,
    oldestUnpaidSessionDate,
    lastPaymentDate,
    lastPaymentAmount,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
