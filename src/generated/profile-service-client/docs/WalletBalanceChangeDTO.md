# WalletBalanceChangeDTO


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  | [optional] [default to undefined]
**userId** | **string** |  | [optional] [default to undefined]
**changeType** | **string** |  | [optional] [default to undefined]
**amount** | **number** |  | [optional] [default to undefined]
**balanceBefore** | **number** |  | [optional] [default to undefined]
**balanceAfter** | **number** |  | [optional] [default to undefined]
**referenceId** | **string** |  | [optional] [default to undefined]
**referenceType** | **string** |  | [optional] [default to undefined]
**creation** | **string** |  | [optional] [default to undefined]
**createdBy** | **string** |  | [optional] [default to undefined]

## Example

```typescript
import { WalletBalanceChangeDTO } from 'ementor-api-client';

const instance: WalletBalanceChangeDTO = {
    id,
    userId,
    changeType,
    amount,
    balanceBefore,
    balanceAfter,
    referenceId,
    referenceType,
    creation,
    createdBy,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
