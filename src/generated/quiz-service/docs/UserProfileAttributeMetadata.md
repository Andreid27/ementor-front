# UserProfileAttributeMetadata


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**name** | **string** |  | [optional] [default to undefined]
**displayName** | **string** |  | [optional] [default to undefined]
**required** | **boolean** |  | [optional] [default to undefined]
**readOnly** | **boolean** |  | [optional] [default to undefined]
**annotations** | **{ [key: string]: object; }** |  | [optional] [default to undefined]
**validators** | **{ [key: string]: { [key: string]: object; }; }** |  | [optional] [default to undefined]
**group** | **string** |  | [optional] [default to undefined]
**multivalued** | **boolean** |  | [optional] [default to undefined]

## Example

```typescript
import { UserProfileAttributeMetadata } from 'ementor-api-client';

const instance: UserProfileAttributeMetadata = {
    name,
    displayName,
    required,
    readOnly,
    annotations,
    validators,
    group,
    multivalued,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
