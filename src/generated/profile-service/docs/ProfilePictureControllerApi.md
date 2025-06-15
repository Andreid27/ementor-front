# ProfilePictureControllerApi

All URIs are relative to *https://dev.api.e-mentor.ro/service2*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**download2**](#download2) | **GET** /profile-image/download/{fileId} | Download file|
|[**generateAllThumbnails**](#generateallthumbnails) | **GET** /profile-image/generate/all-users | Generate thumbnails for all users|
|[**upload**](#upload) | **POST** /profile-image/upload | Upload a new image|

# **download2**
> File download2()


### Example

```typescript
import {
    ProfilePictureControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new ProfilePictureControllerApi(configuration);

let fileId: string; // (default to undefined)

const { status, data } = await apiInstance.download2(
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

# **generateAllThumbnails**
> string generateAllThumbnails()


### Example

```typescript
import {
    ProfilePictureControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new ProfilePictureControllerApi(configuration);

const { status, data } = await apiInstance.generateAllThumbnails();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**string**

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

# **upload**
> string upload()


### Example

```typescript
import {
    ProfilePictureControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new ProfilePictureControllerApi(configuration);

let file: File; // (default to undefined)

const { status, data } = await apiInstance.upload(
    file
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **file** | [**File**] |  | defaults to undefined|


### Return type

**string**

### Authorization

[OIDC Authentication](../README.md#OIDC Authentication)

### HTTP request headers

 - **Content-Type**: multipart/form-data
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Request successful |  -  |
|**400** | Invalid request |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

