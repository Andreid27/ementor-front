# ProfessorPaymentSummaryDTO


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**professorId** | **string** |  | [optional] [default to undefined]
**totalReceived** | **number** |  | [optional] [default to undefined]
**totalAllocated** | **number** |  | [optional] [default to undefined]
**pendingAllocations** | **number** |  | [optional] [default to undefined]
**totalPayments** | **number** |  | [optional] [default to undefined]
**confirmedPayments** | **number** |  | [optional] [default to undefined]
**pendingPayments** | **number** |  | [optional] [default to undefined]
**totalStudents** | **number** |  | [optional] [default to undefined]
**studentsWithDebt** | **number** |  | [optional] [default to undefined]
**reportPeriodStart** | **string** |  | [optional] [default to undefined]
**reportPeriodEnd** | **string** |  | [optional] [default to undefined]
**studentSummaries** | [**Array&lt;StudentDebtSummaryDTO&gt;**](StudentDebtSummaryDTO.md) |  | [optional] [default to undefined]
**currency** | **string** |  | [optional] [default to undefined]
**reportGeneratedAt** | **string** |  | [optional] [default to undefined]

## Example

```typescript
import { ProfessorPaymentSummaryDTO } from 'ementor-api-client';

const instance: ProfessorPaymentSummaryDTO = {
    professorId,
    totalReceived,
    totalAllocated,
    pendingAllocations,
    totalPayments,
    confirmedPayments,
    pendingPayments,
    totalStudents,
    studentsWithDebt,
    reportPeriodStart,
    reportPeriodEnd,
    studentSummaries,
    currency,
    reportGeneratedAt,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
