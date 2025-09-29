# StudentProfessorRelationshipControllerApi

All URIs are relative to *https://dev.api.e-mentor.ro*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createRelationship**](#createrelationship) | **POST** /student-professor-relationships | Create a new student-professor relationship|
|[**deactivateRelationship**](#deactivaterelationship) | **DELETE** /student-professor-relationships/{studentUserId}/{professorId} | Deactivate student-professor relationship|
|[**getActiveProfessorsForStudent**](#getactiveprofessorsforstudent) | **GET** /student-professor-relationships/student/{studentUserId}/professors | Get all active professors for a student|
|[**getActiveStudentsForCurrentProfessor**](#getactivestudentsforcurrentprofessor) | **GET** /student-professor-relationships/students | Get all active students for current professor|
|[**getActiveStudentsForProfessor**](#getactivestudentsforprofessor) | **GET** /student-professor-relationships/professor/{professorId}/students | Get all active students for a professor|
|[**getDefaultPrice**](#getdefaultprice) | **GET** /student-professor-relationships/{studentUserId}/{professorId}/price | Get default price for student-professor relationship|
|[**getPriceWithFallback**](#getpricewithfallback) | **GET** /student-professor-relationships/{studentUserId}/{professorId}/price-with-fallback | Get price with fallback logic|
|[**hasActiveRelationship**](#hasactiverelationship) | **GET** /student-professor-relationships/{studentUserId}/{professorId}/exists | Check if active relationship exists|
|[**updateDefaultPrice**](#updatedefaultprice) | **PUT** /student-professor-relationships/{studentUserId}/{professorId}/price | Update default price for student-professor relationship|

# **createRelationship**
> StudentProfessorRelationshipDTO createRelationship()

Creates a new relationship with optional default pricing. Requires PROFESSOR or ADMIN role. Uses serializable transaction isolation.

### Example

```typescript
import {
    StudentProfessorRelationshipControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new StudentProfessorRelationshipControllerApi(configuration);

let studentUserId: string; // (default to undefined)
let professorId: string; // (default to undefined)
let defaultPrice: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.createRelationship(
    studentUserId,
    professorId,
    defaultPrice
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **studentUserId** | [**string**] |  | defaults to undefined|
| **professorId** | [**string**] |  | defaults to undefined|
| **defaultPrice** | [**number**] |  | (optional) defaults to undefined|


### Return type

**StudentProfessorRelationshipDTO**

### Authorization

[OIDC Authentication](../README.md#OIDC Authentication)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**403** | Access denied |  -  |
|**400** | Invalid request or negative price |  -  |
|**409** | Relationship already exists |  -  |
|**201** | Relationship created successfully |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deactivateRelationship**
> deactivateRelationship()

Deactivates (soft delete) a student-professor relationship. Uses serializable transaction isolation. Requires PROFESSOR or ADMIN role.

### Example

```typescript
import {
    StudentProfessorRelationshipControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new StudentProfessorRelationshipControllerApi(configuration);

let studentUserId: string; // (default to undefined)
let professorId: string; // (default to undefined)

const { status, data } = await apiInstance.deactivateRelationship(
    studentUserId,
    professorId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **studentUserId** | [**string**] |  | defaults to undefined|
| **professorId** | [**string**] |  | defaults to undefined|


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
|**200** | Relationship deactivated successfully |  -  |
|**404** | Relationship not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getActiveProfessorsForStudent**
> Array<StudentProfessorRelationshipDTO> getActiveProfessorsForStudent()

Retrieves all active professor relationships for a specific student.

### Example

```typescript
import {
    StudentProfessorRelationshipControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new StudentProfessorRelationshipControllerApi(configuration);

let studentUserId: string; // (default to undefined)

const { status, data } = await apiInstance.getActiveProfessorsForStudent(
    studentUserId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **studentUserId** | [**string**] |  | defaults to undefined|


### Return type

**Array<StudentProfessorRelationshipDTO>**

### Authorization

[OIDC Authentication](../README.md#OIDC Authentication)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**403** | Access denied |  -  |
|**200** | Professors retrieved successfully |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getActiveStudentsForCurrentProfessor**
> Array<StudentProfessorRelationshipDTO> getActiveStudentsForCurrentProfessor()

Retrieves all active student relationships for a specific professor.

### Example

```typescript
import {
    StudentProfessorRelationshipControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new StudentProfessorRelationshipControllerApi(configuration);

const { status, data } = await apiInstance.getActiveStudentsForCurrentProfessor();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**Array<StudentProfessorRelationshipDTO>**

### Authorization

[OIDC Authentication](../README.md#OIDC Authentication)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**403** | Access denied |  -  |
|**200** | Students retrieved successfully |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getActiveStudentsForProfessor**
> Array<StudentProfessorRelationshipDTO> getActiveStudentsForProfessor()

Retrieves all active student relationships for a specific professor.

### Example

```typescript
import {
    StudentProfessorRelationshipControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new StudentProfessorRelationshipControllerApi(configuration);

let professorId: string; // (default to undefined)

const { status, data } = await apiInstance.getActiveStudentsForProfessor(
    professorId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **professorId** | [**string**] |  | defaults to undefined|


### Return type

**Array<StudentProfessorRelationshipDTO>**

### Authorization

[OIDC Authentication](../README.md#OIDC Authentication)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**403** | Access denied |  -  |
|**200** | Students retrieved successfully |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getDefaultPrice**
> number getDefaultPrice()

Retrieves the default price per session for a specific relationship.

### Example

```typescript
import {
    StudentProfessorRelationshipControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new StudentProfessorRelationshipControllerApi(configuration);

let studentUserId: string; // (default to undefined)
let professorId: string; // (default to undefined)

const { status, data } = await apiInstance.getDefaultPrice(
    studentUserId,
    professorId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **studentUserId** | [**string**] |  | defaults to undefined|
| **professorId** | [**string**] |  | defaults to undefined|


### Return type

**number**

### Authorization

[OIDC Authentication](../README.md#OIDC Authentication)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Price retrieved successfully |  -  |
|**404** | Price not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getPriceWithFallback**
> number getPriceWithFallback()

Gets the effective price using fallback logic: 1. Relationship price, 2. Event default price, 3. Error if none available

### Example

```typescript
import {
    StudentProfessorRelationshipControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new StudentProfessorRelationshipControllerApi(configuration);

let studentUserId: string; // (default to undefined)
let professorId: string; // (default to undefined)
let eventDefaultPrice: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.getPriceWithFallback(
    studentUserId,
    professorId,
    eventDefaultPrice
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **studentUserId** | [**string**] |  | defaults to undefined|
| **professorId** | [**string**] |  | defaults to undefined|
| **eventDefaultPrice** | [**number**] |  | (optional) defaults to undefined|


### Return type

**number**

### Authorization

[OIDC Authentication](../README.md#OIDC Authentication)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Price retrieved successfully |  -  |
|**400** | No price available |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **hasActiveRelationship**
> boolean hasActiveRelationship()

Checks if an active relationship exists between student and professor.

### Example

```typescript
import {
    StudentProfessorRelationshipControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new StudentProfessorRelationshipControllerApi(configuration);

let studentUserId: string; // (default to undefined)
let professorId: string; // (default to undefined)

const { status, data } = await apiInstance.hasActiveRelationship(
    studentUserId,
    professorId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **studentUserId** | [**string**] |  | defaults to undefined|
| **professorId** | [**string**] |  | defaults to undefined|


### Return type

**boolean**

### Authorization

[OIDC Authentication](../README.md#OIDC Authentication)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Check completed successfully |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateDefaultPrice**
> updateDefaultPrice()

Updates the default price per session for a specific relationship. Uses atomic update for transaction safety. Requires PROFESSOR or ADMIN role.

### Example

```typescript
import {
    StudentProfessorRelationshipControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new StudentProfessorRelationshipControllerApi(configuration);

let studentUserId: string; // (default to undefined)
let professorId: string; // (default to undefined)
let defaultPrice: number; // (default to undefined)

const { status, data } = await apiInstance.updateDefaultPrice(
    studentUserId,
    professorId,
    defaultPrice
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **studentUserId** | [**string**] |  | defaults to undefined|
| **professorId** | [**string**] |  | defaults to undefined|
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
|**200** | Price updated successfully |  -  |
|**404** | Relationship not found |  -  |
|**400** | Invalid price (negative) |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

