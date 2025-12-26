# StudentDebtSummaryDTO


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**studentId** | **string** |  | [optional] [default to undefined]
**studentName** | **string** |  | [optional] [default to undefined]
**professorId** | **string** |  | [optional] [default to undefined]
**professorName** | **string** |  | [optional] [default to undefined]
**totalDebt** | **number** |  | [optional] [default to undefined]
**totalPaid** | **number** |  | [optional] [default to undefined]
**outstandingBalance** | **number** |  | [optional] [default to undefined]
**totalEvents** | **number** |  | [optional] [default to undefined]
**unpaidEvents** | **number** |  | [optional] [default to undefined]
**oldestUnpaidEventDate** | **string** |  | [optional] [default to undefined]
**lastPaymentDate** | **string** |  | [optional] [default to undefined]
**eventBreakdown** | [**Array&lt;EventPaymentInfoDTO&gt;**](EventPaymentInfoDTO.md) |  | [optional] [default to undefined]
**currency** | **string** |  | [optional] [default to undefined]
**reportGeneratedAt** | **string** |  | [optional] [default to undefined]

## Example

```typescript
import { StudentDebtSummaryDTO } from 'ementor-api-client';

const instance: StudentDebtSummaryDTO = {
    studentId,
    studentName,
    professorId,
    professorName,
    totalDebt,
    totalPaid,
    outstandingBalance,
    totalEvents,
    unpaidEvents,
    oldestUnpaidEventDate,
    lastPaymentDate,
    eventBreakdown,
    currency,
    reportGeneratedAt,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
