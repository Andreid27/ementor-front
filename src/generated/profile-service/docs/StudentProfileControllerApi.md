# StudentProfileControllerApi

All URIs are relative to *https://dev.api.e-mentor.ro*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**create1**](#create1) | **POST** /student-profile/create | Create a new student profile.|
|[**deactivate**](#deactivate) | **DELETE** /student-profile/{id} | Deactivate student profile|
|[**get1**](#get1) | **GET** /student-profile/{id} | Get student profile|
|[**getFull**](#getfull) | **GET** /student-profile/get-full/{userId} | Get full student profile by user id|
|[**getFull1**](#getfull1) | **GET** /student-profile/get-full | Get full student profile by user id|
|[**getPaginated**](#getpaginated) | **POST** /student-profile/paginated | Get paginated workpoints|
|[**getProfilePrerequire**](#getprofileprerequire) | **GET** /student-profile/profile-prerequire | Get current initial data for creating student profile|
|[**getUserProfile**](#getuserprofile) | **GET** /student-profile/get | Get current student profile|
|[**setDefaultPricePerSession**](#setdefaultpricepersession) | **PUT** /student-profile/{studentId}/default-price | Set default price per session for a student|
|[**update1**](#update1) | **PUT** /student-profile/update | Update a existing student profile.|

# **create1**
> StudentProfileDTO create1(studentProfileDTO)


### Example

```typescript
import {
    StudentProfileControllerApi,
    Configuration,
    StudentProfileDTO
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new StudentProfileControllerApi(configuration);

let studentProfileDTO: StudentProfileDTO; //

const { status, data } = await apiInstance.create1(
    studentProfileDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **studentProfileDTO** | **StudentProfileDTO**|  | |


### Return type

**StudentProfileDTO**

### Authorization

[OIDC Authentication](../README.md#OIDC Authentication)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | Request successful |  -  |
|**400** | Invalid request |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deactivate**
> object deactivate()


### Example

```typescript
import {
    StudentProfileControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new StudentProfileControllerApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.deactivate(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**object**

### Authorization

[OIDC Authentication](../README.md#OIDC Authentication)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**204** | Request successful |  -  |
|**400** | Invalid request |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **get1**
> StudentProfileDTO get1()


### Example

```typescript
import {
    StudentProfileControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new StudentProfileControllerApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.get1(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**StudentProfileDTO**

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

# **getFull**
> StudentProfileDTO getFull()


### Example

```typescript
import {
    StudentProfileControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new StudentProfileControllerApi(configuration);

let userId: string; // (default to undefined)

const { status, data } = await apiInstance.getFull(
    userId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **userId** | [**string**] |  | defaults to undefined|


### Return type

**StudentProfileDTO**

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

# **getFull1**
> StudentProfileDTO getFull1()


### Example

```typescript
import {
    StudentProfileControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new StudentProfileControllerApi(configuration);

const { status, data } = await apiInstance.getFull1();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**StudentProfileDTO**

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

# **getPaginated**
> PaginatedResponseStudentProfileView getPaginated(paginatedRequest)


### Example

```typescript
import {
    StudentProfileControllerApi,
    Configuration,
    PaginatedRequest
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new StudentProfileControllerApi(configuration);

let paginatedRequest: PaginatedRequest; //

const { status, data } = await apiInstance.getPaginated(
    paginatedRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **paginatedRequest** | **PaginatedRequest**|  | |


### Return type

**PaginatedResponseStudentProfileView**

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

# **getProfilePrerequire**
> ProfilePrerequrireDTO getProfilePrerequire()


### Example

```typescript
import {
    StudentProfileControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new StudentProfileControllerApi(configuration);

const { status, data } = await apiInstance.getProfilePrerequire();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**ProfilePrerequrireDTO**

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

# **getUserProfile**
> StudentProfileDTO getUserProfile()


### Example

```typescript
import {
    StudentProfileControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new StudentProfileControllerApi(configuration);

const { status, data } = await apiInstance.getUserProfile();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**StudentProfileDTO**

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

# **setDefaultPricePerSession**
> setDefaultPricePerSession()


### Example

```typescript
import {
    StudentProfileControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new StudentProfileControllerApi(configuration);

let studentId: string; // (default to undefined)
let defaultPrice: number; // (default to undefined)

const { status, data } = await apiInstance.setDefaultPricePerSession(
    studentId,
    defaultPrice
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **studentId** | [**string**] |  | defaults to undefined|
| **defaultPrice** | [**number**] |  | defaults to undefined|


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
|**403** | Access denied |  -  |
|**200** | Request successful |  -  |
|**400** | Invalid request |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **update1**
> update1(studentProfileDTO)


### Example

```typescript
import {
    StudentProfileControllerApi,
    Configuration,
    StudentProfileDTO
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new StudentProfileControllerApi(configuration);

let studentProfileDTO: StudentProfileDTO; //

const { status, data } = await apiInstance.update1(
    studentProfileDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **studentProfileDTO** | **StudentProfileDTO**|  | |


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

