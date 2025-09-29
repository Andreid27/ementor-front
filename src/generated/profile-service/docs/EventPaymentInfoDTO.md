# EventPaymentInfoDTO


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**eventPriceLeftToPay** | **number** |  | [optional] [default to undefined]
**totalPaidForEvent** | **number** |  | [optional] [default to undefined]
**eventAttendee** | [**EventAttendee**](EventAttendee.md) |  | [optional] [default to undefined]
**paymentsForEvent** | [**Array&lt;PaymentEventAssociation&gt;**](PaymentEventAssociation.md) |  | [optional] [default to undefined]

## Example

```typescript
import { EventPaymentInfoDTO } from 'ementor-api-client';

const instance: EventPaymentInfoDTO = {
    eventPriceLeftToPay,
    totalPaidForEvent,
    eventAttendee,
    paymentsForEvent,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
