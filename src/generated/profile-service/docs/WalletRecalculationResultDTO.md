# WalletRecalculationResultDTO


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**userId** | **string** |  | [optional] [default to undefined]
**previousBalance** | **number** |  | [optional] [default to undefined]
**calculatedBalance** | **number** |  | [optional] [default to undefined]
**finalBalance** | **number** |  | [optional] [default to undefined]
**balanceDiscrepancy** | **number** |  | [optional] [default to undefined]
**hasDiscrepancy** | **boolean** |  | [optional] [default to undefined]
**balanceUpdated** | **boolean** |  | [optional] [default to undefined]
**totalChangesProcessed** | **number** |  | [optional] [default to undefined]
**validChanges** | **number** |  | [optional] [default to undefined]
**invalidChanges** | **number** |  | [optional] [default to undefined]
**validationErrors** | **Array&lt;string&gt;** |  | [optional] [default to undefined]
**validationWarnings** | **Array&lt;string&gt;** |  | [optional] [default to undefined]
**performedBy** | **string** |  | [optional] [default to undefined]
**performedAt** | **string** |  | [optional] [default to undefined]

## Example

```typescript
import { WalletRecalculationResultDTO } from 'ementor-api-client';

const instance: WalletRecalculationResultDTO = {
    userId,
    previousBalance,
    calculatedBalance,
    finalBalance,
    balanceDiscrepancy,
    hasDiscrepancy,
    balanceUpdated,
    totalChangesProcessed,
    validChanges,
    invalidChanges,
    validationErrors,
    validationWarnings,
    performedBy,
    performedAt,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
