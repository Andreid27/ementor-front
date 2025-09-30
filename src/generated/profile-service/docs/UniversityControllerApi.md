# UniversityControllerApi

All URIs are relative to *https://api.e-mentor.ro//service2*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**_delete**](#_delete) | **DELETE** /university/{id} | Delete a university by ID.|
|[**create**](#create) | **POST** /university/create | Create a new university.|
|[**get**](#get) | **GET** /university/{id} | Get university|
|[**getAll**](#getall) | **GET** /university/get | Get all universities|
|[**update**](#update) | **PUT** /university/update | Create a new university.|

# **_delete**
> _delete()


### Example

```typescript
import {
    UniversityControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new UniversityControllerApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance._delete(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

void (empty response body)

### Authorization

[OIDC Authentication](../README.md#OIDC Authentication)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**404** | Speciality not found |  -  |
|**204** | Request successful |  -  |
|**400** | Invalid request |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **create**
> create(universityDTO)


### Example

```typescript
import {
    UniversityControllerApi,
    Configuration,
    UniversityDTO
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new UniversityControllerApi(configuration);

let universityDTO: UniversityDTO; //

const { status, data } = await apiInstance.create(
    universityDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **universityDTO** | **UniversityDTO**|  | |


### Return type

void (empty response body)

### Authorization

[OIDC Authentication](../README.md#OIDC Authentication)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Request successful |  -  |
|**400** | Invalid request |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **get**
> UniversityDTO get()


### Example

```typescript
import {
    UniversityControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new UniversityControllerApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.get(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**UniversityDTO**

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

# **getAll**
> Array<UniversityDTO> getAll()


### Example

```typescript
import {
    UniversityControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new UniversityControllerApi(configuration);

const { status, data } = await apiInstance.getAll();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**Array<UniversityDTO>**

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

# **update**
> update(universityDTO)


### Example

```typescript
import {
    UniversityControllerApi,
    Configuration,
    UniversityDTO
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new UniversityControllerApi(configuration);

let universityDTO: UniversityDTO; //

const { status, data } = await apiInstance.update(
    universityDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **universityDTO** | **UniversityDTO**|  | |


### Return type

void (empty response body)

### Authorization

[OIDC Authentication](../README.md#OIDC Authentication)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Request successful |  -  |
|**400** | Invalid request |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

