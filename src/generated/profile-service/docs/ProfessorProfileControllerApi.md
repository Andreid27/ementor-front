# ProfessorProfileControllerApi

All URIs are relative to *https://dev.api.e-mentor.ro*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**create3**](#create3) | **POST** /professor-profile/create | Create a new student profile.|
|[**get3**](#get3) | **GET** /professor-profile/{id} | Get professor profile|
|[**getFull2**](#getfull2) | **GET** /professor-profile/get-full | Get full professor profile by user id|
|[**getFull3**](#getfull3) | **GET** /professor-profile/get-full/{userId} | Get full professor profile by user id|
|[**getPaginated1**](#getpaginated1) | **POST** /professor-profile/paginated | Get paginated professor profiles|
|[**getUserProfile1**](#getuserprofile1) | **GET** /professor-profile/get | Get current professor profile|
|[**update2**](#update2) | **PUT** /professor-profile/update | Update a existing student profile.|

# **create3**
> create3(professorProfileDTO)


### Example

```typescript
import {
    ProfessorProfileControllerApi,
    Configuration,
    ProfessorProfileDTO
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new ProfessorProfileControllerApi(configuration);

let professorProfileDTO: ProfessorProfileDTO; //

const { status, data } = await apiInstance.create3(
    professorProfileDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **professorProfileDTO** | **ProfessorProfileDTO**|  | |


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

# **get3**
> ProfessorProfileDTO get3()


### Example

```typescript
import {
    ProfessorProfileControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new ProfessorProfileControllerApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.get3(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**ProfessorProfileDTO**

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

# **getFull2**
> ProfessorProfileDTO getFull2()


### Example

```typescript
import {
    ProfessorProfileControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new ProfessorProfileControllerApi(configuration);

const { status, data } = await apiInstance.getFull2();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**ProfessorProfileDTO**

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

# **getFull3**
> ProfessorProfileDTO getFull3()


### Example

```typescript
import {
    ProfessorProfileControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new ProfessorProfileControllerApi(configuration);

let userId: string; // (default to undefined)

const { status, data } = await apiInstance.getFull3(
    userId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **userId** | [**string**] |  | defaults to undefined|


### Return type

**ProfessorProfileDTO**

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

# **getPaginated1**
> PaginatedResponseProfessorProfileView getPaginated1(paginatedRequest)


### Example

```typescript
import {
    ProfessorProfileControllerApi,
    Configuration,
    PaginatedRequest
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new ProfessorProfileControllerApi(configuration);

let paginatedRequest: PaginatedRequest; //

const { status, data } = await apiInstance.getPaginated1(
    paginatedRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **paginatedRequest** | **PaginatedRequest**|  | |


### Return type

**PaginatedResponseProfessorProfileView**

### Authorization

[OIDC Authentication](../README.md#OIDC Authentication)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Request successful |  -  |
|**400** | Invalid request |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getUserProfile1**
> ProfessorProfileDTO getUserProfile1()


### Example

```typescript
import {
    ProfessorProfileControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new ProfessorProfileControllerApi(configuration);

const { status, data } = await apiInstance.getUserProfile1();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**ProfessorProfileDTO**

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

# **update2**
> update2(professorProfileDTO)


### Example

```typescript
import {
    ProfessorProfileControllerApi,
    Configuration,
    ProfessorProfileDTO
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new ProfessorProfileControllerApi(configuration);

let professorProfileDTO: ProfessorProfileDTO; //

const { status, data } = await apiInstance.update2(
    professorProfileDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **professorProfileDTO** | **ProfessorProfileDTO**|  | |


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

