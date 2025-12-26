# CredentialRepresentation


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  | [optional] [default to undefined]
**type** | **string** |  | [optional] [default to undefined]
**userLabel** | **string** |  | [optional] [default to undefined]
**createdDate** | **number** |  | [optional] [default to undefined]
**secretData** | **string** |  | [optional] [default to undefined]
**credentialData** | **string** |  | [optional] [default to undefined]
**priority** | **number** |  | [optional] [default to undefined]
**value** | **string** |  | [optional] [default to undefined]
**temporary** | **boolean** |  | [optional] [default to undefined]
**device** | **string** |  | [optional] [default to undefined]
**hashedSaltedValue** | **string** |  | [optional] [default to undefined]
**salt** | **string** |  | [optional] [default to undefined]
**hashIterations** | **number** |  | [optional] [default to undefined]
**counter** | **number** |  | [optional] [default to undefined]
**algorithm** | **string** |  | [optional] [default to undefined]
**digits** | **number** |  | [optional] [default to undefined]
**period** | **number** |  | [optional] [default to undefined]
**config** | [**CredentialRepresentationConfig**](CredentialRepresentationConfig.md) |  | [optional] [default to undefined]

## Example

```typescript
import { CredentialRepresentation } from 'ementor-api-client';

const instance: CredentialRepresentation = {
    id,
    type,
    userLabel,
    createdDate,
    secretData,
    credentialData,
    priority,
    value,
    temporary,
    device,
    hashedSaltedValue,
    salt,
    hashIterations,
    counter,
    algorithm,
    digits,
    period,
    config,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
