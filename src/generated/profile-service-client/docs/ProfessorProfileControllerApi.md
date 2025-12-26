# ProfessorProfileControllerApi

All URIs are relative to *http://localhost:49202*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**addStudentByEmail1**](#addstudentbyemail1) | **POST** /professor-profile/add-student-by-email | Add student by email address|
|[**create3**](#create3) | **POST** /professor-profile/create | Create a new student profile.|
|[**get3**](#get3) | **GET** /professor-profile/{id} | Get professor profile|
|[**getFull2**](#getfull2) | **GET** /professor-profile/get-full | Get full professor profile by user id|
|[**getFull3**](#getfull3) | **GET** /professor-profile/get-full/{userId} | Get full professor profile by user id|
|[**getInvitationCode**](#getinvitationcode) | **GET** /professor-profile/invitation-code | Get professor\&#39;s invitation code|
|[**getPaginated1**](#getpaginated1) | **POST** /professor-profile/paginated | Get paginated professor profiles|
|[**getUserProfile1**](#getuserprofile1) | **GET** /professor-profile/get | Get current professor profile|
|[**previewByCode**](#previewbycode) | **GET** /professor-profile/preview-by-code/{code} | Preview professor by invitation code (public)|
|[**regenerateInvitationCode**](#regenerateinvitationcode) | **POST** /professor-profile/invitation-code/regenerate | Regenerate professor\&#39;s invitation code|
|[**update2**](#update2) | **PUT** /professor-profile/update | Update a existing student profile.|

# **addStudentByEmail1**
> StudentProfessorRelationshipDTO addStudentByEmail1(addStudentByEmailRequest)


### Example

```typescript
import {
    ProfessorProfileControllerApi,
    Configuration,
    AddStudentByEmailRequest
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new ProfessorProfileControllerApi(configuration);

let idempotencyKey: string; // (default to undefined)
let addStudentByEmailRequest: AddStudentByEmailRequest; //

const { status, data } = await apiInstance.addStudentByEmail1(
    idempotencyKey,
    addStudentByEmailRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **addStudentByEmailRequest** | **AddStudentByEmailRequest**|  | |
| **idempotencyKey** | [**string**] |  | defaults to undefined|


### Return type

**StudentProfessorRelationshipDTO**

### Authorization

[OIDC Authentication](../README.md#OIDC Authentication)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**501** | Feature not yet implemented |  -  |
|**409** | Relationship already exists |  -  |
|**404** | Student not found |  -  |
|**201** | Student added successfully |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

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

# **getInvitationCode**
> { [key: string]: string; } getInvitationCode()


### Example

```typescript
import {
    ProfessorProfileControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new ProfessorProfileControllerApi(configuration);

const { status, data } = await apiInstance.getInvitationCode();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**{ [key: string]: string; }**

### Authorization

[OIDC Authentication](../README.md#OIDC Authentication)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Invitation code retrieved |  -  |
|**404** | Professor profile not found |  -  |

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

# **previewByCode**
> ProfessorPreviewDTO previewByCode()


### Example

```typescript
import {
    ProfessorProfileControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new ProfessorProfileControllerApi(configuration);

let code: string; // (default to undefined)

const { status, data } = await apiInstance.previewByCode(
    code
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **code** | [**string**] |  | defaults to undefined|


### Return type

**ProfessorPreviewDTO**

### Authorization

[OIDC Authentication](../README.md#OIDC Authentication)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Professor preview retrieved |  -  |
|**404** | Professor not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **regenerateInvitationCode**
> { [key: string]: string; } regenerateInvitationCode()


### Example

```typescript
import {
    ProfessorProfileControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new ProfessorProfileControllerApi(configuration);

const { status, data } = await apiInstance.regenerateInvitationCode();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**{ [key: string]: string; }**

### Authorization

[OIDC Authentication](../README.md#OIDC Authentication)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Invitation code regenerated |  -  |
|**404** | Professor profile not found |  -  |

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

