# EventDebtSummaryDTO


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**eventId** | **string** |  | [optional] [default to undefined]
**eventTitle** | **string** |  | [optional] [default to undefined]
**eventDescription** | **string** |  | [optional] [default to undefined]
**eventDate** | **string** |  | [optional] [default to undefined]
**professorId** | **string** |  | [optional] [default to undefined]
**professorName** | **string** |  | [optional] [default to undefined]
**totalAttendees** | **number** |  | [optional] [default to undefined]
**chargedAttendees** | **number** |  | [optional] [default to undefined]
**totalEventCost** | **number** |  | [optional] [default to undefined]
**totalPaidAmount** | **number** |  | [optional] [default to undefined]
**outstandingDebt** | **number** |  | [optional] [default to undefined]
**isCompleted** | **boolean** |  | [optional] [default to undefined]
**isFullyPaid** | **boolean** |  | [optional] [default to undefined]
**lastPaymentDate** | **string** |  | [optional] [default to undefined]
**paymentsCount** | **number** |  | [optional] [default to undefined]
**currency** | **string** |  | [optional] [default to undefined]
**paymentAllocations** | [**Array&lt;PaymentAllocationDetailDTO&gt;**](PaymentAllocationDetailDTO.md) |  | [optional] [default to undefined]

## Example

```typescript
import { EventDebtSummaryDTO } from 'ementor-api-client';

const instance: EventDebtSummaryDTO = {
    eventId,
    eventTitle,
    eventDescription,
    eventDate,
    professorId,
    professorName,
    totalAttendees,
    chargedAttendees,
    totalEventCost,
    totalPaidAmount,
    outstandingDebt,
    isCompleted,
    isFullyPaid,
    lastPaymentDate,
    paymentsCount,
    currency,
    paymentAllocations,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
