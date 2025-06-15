# Address


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  | [optional] [default to undefined]
**creation** | **string** |  | [optional] [default to undefined]
**expires** | **string** |  | [optional] [default to undefined]
**modified** | **string** |  | [optional] [default to undefined]
**county** | [**Location**](Location.md) |  | [optional] [default to undefined]
**city** | **string** |  | [default to undefined]
**street** | **string** |  | [default to undefined]
**number** | **string** |  | [default to undefined]
**block** | **string** |  | [optional] [default to undefined]
**staircase** | **string** |  | [optional] [default to undefined]
**apartment** | **number** |  | [optional] [default to undefined]
**createdBy** | **string** |  | [optional] [default to undefined]

## Example

```typescript
import { Address } from 'ementor-api-client';

const instance: Address = {
    id,
    creation,
    expires,
    modified,
    county,
    city,
    street,
    number,
    block,
    staircase,
    apartment,
    createdBy,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
