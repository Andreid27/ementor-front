# PaginatedRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**filters** | [**Array&lt;FilterCriteriaObject&gt;**](FilterCriteriaObject.md) |  | [optional] [default to undefined]
**sorters** | [**Array&lt;SortCriteria&gt;**](SortCriteria.md) |  | [optional] [default to undefined]
**page** | **number** |  | [optional] [default to undefined]
**pageSize** | **number** |  | [optional] [default to undefined]

## Example

```typescript
import { PaginatedRequest } from 'ementor-api-client';

const instance: PaginatedRequest = {
    filters,
    sorters,
    page,
    pageSize,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
