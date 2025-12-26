# InvoiceDTO


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  | [optional] [default to undefined]
**number** | **string** |  | [optional] [default to undefined]
**series** | **string** |  | [optional] [default to undefined]
**externalInvoiceId** | **string** |  | [optional] [default to undefined]
**integrationId** | **string** |  | [optional] [default to undefined]
**payment** | [**BankTransferPayment**](BankTransferPayment.md) |  | [optional] [default to undefined]
**customer** | [**CustomerDTO**](CustomerDTO.md) |  | [optional] [default to undefined]
**lineItems** | [**Array&lt;InvoiceLineItemDTO&gt;**](InvoiceLineItemDTO.md) |  | [optional] [default to undefined]
**subtotalAmount** | **number** |  | [optional] [default to undefined]
**taxAmount** | **number** |  | [optional] [default to undefined]
**totalAmount** | **number** |  | [optional] [default to undefined]
**issueDate** | **string** |  | [optional] [default to undefined]
**dueDate** | **string** |  | [optional] [default to undefined]
**status** | **string** |  | [optional] [default to undefined]
**currencyCode** | **string** |  | [optional] [default to undefined]
**currencyName** | **string** |  | [optional] [default to undefined]
**notes** | **string** |  | [optional] [default to undefined]
**downloadUrl** | **string** |  | [optional] [default to undefined]
**createdBy** | **string** |  | [optional] [default to undefined]

## Example

```typescript
import { InvoiceDTO } from 'ementor-api-client';

const instance: InvoiceDTO = {
    id,
    number,
    series,
    externalInvoiceId,
    integrationId,
    payment,
    customer,
    lineItems,
    subtotalAmount,
    taxAmount,
    totalAmount,
    issueDate,
    dueDate,
    status,
    currencyCode,
    currencyName,
    notes,
    downloadUrl,
    createdBy,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
