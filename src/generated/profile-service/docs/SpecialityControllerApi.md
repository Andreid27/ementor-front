# SpecialityControllerApi

All URIs are relative to *https://dev.api.e-mentor.ro*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**create2**](#create2) | **POST** /speciality/create | Create a new speciality.|
|[**delete1**](#delete1) | **DELETE** /speciality/{id} | Delete a speciality by ID.|
|[**get2**](#get2) | **GET** /speciality/{id} | Get speciality|
|[**getAll1**](#getall1) | **GET** /speciality/get | Get all specialities|
|[**register**](#register) | **PUT** /speciality/update | Update a speciality.|

# **create2**
> create2(specialityDTO)


### Example

```typescript
import {
    SpecialityControllerApi,
    Configuration,
    SpecialityDTO
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new SpecialityControllerApi(configuration);

let specialityDTO: SpecialityDTO; //

const { status, data } = await apiInstance.create2(
    specialityDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **specialityDTO** | **SpecialityDTO**|  | |


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

# **delete1**
> delete1()


### Example

```typescript
import {
    SpecialityControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new SpecialityControllerApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.delete1(
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

# **get2**
> SpecialityDTO get2()


### Example

```typescript
import {
    SpecialityControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new SpecialityControllerApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.get2(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**SpecialityDTO**

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

# **getAll1**
> Array<SpecialityDTO> getAll1()


### Example

```typescript
import {
    SpecialityControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new SpecialityControllerApi(configuration);

const { status, data } = await apiInstance.getAll1();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**Array<SpecialityDTO>**

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

# **register**
> register(specialityDTO)


### Example

```typescript
import {
    SpecialityControllerApi,
    Configuration,
    SpecialityDTO
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new SpecialityControllerApi(configuration);

let specialityDTO: SpecialityDTO; //

const { status, data } = await apiInstance.register(
    specialityDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **specialityDTO** | **SpecialityDTO**|  | |


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

