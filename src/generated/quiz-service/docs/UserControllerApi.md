# UserControllerApi

All URIs are relative to *https://api.e-mentor.ro/service3*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**getUsersWithRole**](#getuserswithrole) | **GET** /users/role/{roleName} | |

# **getUsersWithRole**
> Array<UserRepresentation> getUsersWithRole()


### Example

```typescript
import {
    UserControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new UserControllerApi(configuration);

let roleName: string; // (default to undefined)

const { status, data } = await apiInstance.getUsersWithRole(
    roleName
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **roleName** | [**string**] |  | defaults to undefined|


### Return type

**Array<UserRepresentation>**

### Authorization

[OIDC Authentication](../README.md#OIDC Authentication)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

