# ThumbnailControllerApi

All URIs are relative to *https://dev.api.e-mentor.ro/service2*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**download**](#download) | **GET** /thumbnail/download | Download file for the current user|
|[**download1**](#download1) | **GET** /thumbnail/download/{fileId} | Download file|

# **download**
> File download()


### Example

```typescript
import {
    ThumbnailControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new ThumbnailControllerApi(configuration);

const { status, data } = await apiInstance.download();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**File**

### Authorization

[OIDC Authentication](../README.md#OIDC Authentication)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**404** | Not found |  -  |
|**200** | Request successful |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **download1**
> File download1()


### Example

```typescript
import {
    ThumbnailControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new ThumbnailControllerApi(configuration);

let fileId: string; // (default to undefined)

const { status, data } = await apiInstance.download1(
    fileId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **fileId** | [**string**] |  | defaults to undefined|


### Return type

**File**

### Authorization

[OIDC Authentication](../README.md#OIDC Authentication)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Request successful |  -  |
|**400** | Invalid request |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

