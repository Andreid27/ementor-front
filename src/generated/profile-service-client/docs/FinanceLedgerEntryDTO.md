# FinanceLedgerEntryDTO


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** | Stable unique key: SESSION_CHARGE:&lt;eventAttendeeId&gt; or PAYMENT:&lt;paymentId&gt; | [default to undefined]
**date** | **string** |  | [default to undefined]
**type** | **string** |  | [default to undefined]
**amount** | **number** | Signed. Charges are negative and payments positive. | [default to undefined]
**affectsBalance** | **boolean** | false for non-CONFIRMED payments | [default to undefined]
**runningBalance** | **number** | Balance after this entry | [default to undefined]
**sessionTitle** | **string** | SESSION_CHARGE only | [default to undefined]
**eventOccurrenceId** | **string** | SESSION_CHARGE only | [default to undefined]
**eventAttendeeId** | **string** | SESSION_CHARGE only | [default to undefined]
**recurringSeriesId** | **string** | SESSION_CHARGE of a series occurrence only | [default to undefined]
**sessionPaidAmount** | **number** | SESSION_CHARGE only. Allocated to this session as of periodEnd. | [default to undefined]
**sessionUnpaidAmount** | **number** | SESSION_CHARGE only | [default to undefined]
**paymentId** | **string** | PAYMENT only | [default to undefined]
**paymentStatus** | **string** | PAYMENT only | [default to undefined]
**paymentReferenceCode** | **string** | PAYMENT only | [default to undefined]
**paymentSurplus** | **number** | CONFIRMED PAYMENT only. Unallocated amount as of periodEnd. | [default to undefined]
**allocatedToSessions** | [**Array&lt;FinanceSessionAllocationDTO&gt;**](FinanceSessionAllocationDTO.md) | CONFIRMED PAYMENT only (may be empty) | [default to undefined]

## Example

```typescript
import { FinanceLedgerEntryDTO } from 'ementor-api-client';

const instance: FinanceLedgerEntryDTO = {
    id,
    date,
    type,
    amount,
    affectsBalance,
    runningBalance,
    sessionTitle,
    eventOccurrenceId,
    eventAttendeeId,
    recurringSeriesId,
    sessionPaidAmount,
    sessionUnpaidAmount,
    paymentId,
    paymentStatus,
    paymentReferenceCode,
    paymentSurplus,
    allocatedToSessions,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
