# BulkWalletRecalculationResultDTO


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**totalUsers** | **number** |  | [optional] [default to undefined]
**successfulRecalculations** | **number** |  | [optional] [default to undefined]
**failedRecalculations** | **number** |  | [optional] [default to undefined]
**walletsWithDiscrepancies** | **number** |  | [optional] [default to undefined]
**walletsUpdated** | **number** |  | [optional] [default to undefined]
**errors** | **Array&lt;string&gt;** |  | [optional] [default to undefined]
**performedBy** | **string** |  | [optional] [default to undefined]
**performedAt** | **string** |  | [optional] [default to undefined]

## Example

```typescript
import { BulkWalletRecalculationResultDTO } from 'ementor-api-client';

const instance: BulkWalletRecalculationResultDTO = {
    totalUsers,
    successfulRecalculations,
    failedRecalculations,
    walletsWithDiscrepancies,
    walletsUpdated,
    errors,
    performedBy,
    performedAt,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
