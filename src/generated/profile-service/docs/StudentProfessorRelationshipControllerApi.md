# StudentProfessorRelationshipControllerApi

All URIs are relative to *http://localhost:49202*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**addStudentByEmail**](#addstudentbyemail) | **POST** /student-professor-relationships/add-student-by-email | Add student to professor\&#39;s class by email|
|[**createRelationship**](#createrelationship) | **POST** /student-professor-relationships | Create a new student-professor relationship|
|[**deactivateRelationship**](#deactivaterelationship) | **DELETE** /student-professor-relationships/{studentUserId}/{professorId} | Deactivate student-professor relationship|
|[**getActiveProfessorsForStudent**](#getactiveprofessorsforstudent) | **GET** /student-professor-relationships/student/{studentUserId}/professors | Get all active professors for a student|
|[**getActiveStudentsForCurrentProfessor**](#getactivestudentsforcurrentprofessor) | **GET** /student-professor-relationships/students | Get all active students for current professor|
|[**getActiveStudentsForProfessor**](#getactivestudentsforprofessor) | **GET** /student-professor-relationships/professor/{professorId}/students | Get all active students for a professor|
|[**getDefaultPrice**](#getdefaultprice) | **GET** /student-professor-relationships/{studentUserId}/{professorId}/price | Get default price for student-professor relationship|
|[**getPriceWithFallback**](#getpricewithfallback) | **GET** /student-professor-relationships/{studentUserId}/{professorId}/price-with-fallback | Get price with fallback logic|
|[**getProfessorGenerations**](#getprofessorgenerations) | **GET** /student-professor-relationships/professor/{professorId}/generations | Get professor\&#39;s generation summary|
|[**getStudentsByGeneration**](#getstudentsbygeneration) | **GET** /student-professor-relationships/professor/{professorId}/students-by-generation | Get students filtered by generation|
|[**hasActiveRelationship**](#hasactiverelationship) | **GET** /student-professor-relationships/{studentUserId}/{professorId}/exists | Check if active relationship exists|
|[**joinByCode**](#joinbycode) | **POST** /student-professor-relationships/join-by-code | Student joins professor by invitation code|
|[**removeStudentFromProfessor**](#removestudentfromprofessor) | **DELETE** /student-professor-relationships/professor/{professorId}/student/{studentUserId} | Remove student from professor\&#39;s class|
|[**updateDefaultPrice**](#updatedefaultprice) | **PUT** /student-professor-relationships/{studentUserId}/{professorId}/price | Update default price for student-professor relationship|
|[**updateGeneration**](#updategeneration) | **PUT** /student-professor-relationships/{studentUserId}/{professorId}/generation | Update student generation|

# **addStudentByEmail**
> StudentProfessorRelationshipDTO addStudentByEmail(addStudentByEmailRequest)

Creates a new relationship by looking up student by email. Validates that the user exists and has completed their profile. Requires PROFESSOR or ADMIN role. Uses serializable transaction isolation.

### Example

```typescript
import {
    StudentProfessorRelationshipControllerApi,
    Configuration,
    AddStudentByEmailRequest
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new StudentProfessorRelationshipControllerApi(configuration);

let addStudentByEmailRequest: AddStudentByEmailRequest; //

const { status, data } = await apiInstance.addStudentByEmail(
    addStudentByEmailRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **addStudentByEmailRequest** | **AddStudentByEmailRequest**|  | |


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
|**400** | Invalid request, negative price, or incomplete profile |  -  |
|**403** | Access denied |  -  |
|**409** | Relationship already exists |  -  |
|**404** | User not found with provided email |  -  |
|**201** | Relationship created successfully |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

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

# **getProfessorGenerations**
> Array<string> getProfessorGenerations()

Retrieves all generations with student counts for a professor. Requires PROFESSOR or ADMIN role.

### Example

```typescript
import {
    StudentProfessorRelationshipControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new StudentProfessorRelationshipControllerApi(configuration);

let professorId: string; // (default to undefined)

const { status, data } = await apiInstance.getProfessorGenerations(
    professorId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **professorId** | [**string**] |  | defaults to undefined|


### Return type

**Array<string>**

### Authorization

[OIDC Authentication](../README.md#OIDC Authentication)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Generations retrieved successfully |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getStudentsByGeneration**
> Array<StudentProfessorRelationshipDTO> getStudentsByGeneration()

Retrieves students for a professor, optionally filtered by generation. Requires PROFESSOR or ADMIN role.

### Example

```typescript
import {
    StudentProfessorRelationshipControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new StudentProfessorRelationshipControllerApi(configuration);

let professorId: string; // (default to undefined)
let generation: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.getStudentsByGeneration(
    professorId,
    generation
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **professorId** | [**string**] |  | defaults to undefined|
| **generation** | [**string**] |  | (optional) defaults to undefined|


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
|**200** | Students retrieved successfully |  -  |

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

# **joinByCode**
> JoinByCodeResponse joinByCode(joinByCodeRequest)

Allows a student to join a professor\'s class using an invitation code. Requires STUDENT role and Idempotency-Key header.

### Example

```typescript
import {
    StudentProfessorRelationshipControllerApi,
    Configuration,
    JoinByCodeRequest
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new StudentProfessorRelationshipControllerApi(configuration);

let idempotencyKey: string; // (default to undefined)
let joinByCodeRequest: JoinByCodeRequest; //

const { status, data } = await apiInstance.joinByCode(
    idempotencyKey,
    joinByCodeRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **joinByCodeRequest** | **JoinByCodeRequest**|  | |
| **idempotencyKey** | [**string**] |  | defaults to undefined|


### Return type

**JoinByCodeResponse**

### Authorization

[OIDC Authentication](../README.md#OIDC Authentication)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**404** | Invalid invitation code |  -  |
|**201** | Successfully joined professor |  -  |
|**409** | Already joined this professor |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **removeStudentFromProfessor**
> { [key: string]: string; } removeStudentFromProfessor()

Removes (deactivates) a student from professor\'s class. Requires PROFESSOR or ADMIN role.

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

const { status, data } = await apiInstance.removeStudentFromProfessor(
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

**{ [key: string]: string; }**

### Authorization

[OIDC Authentication](../README.md#OIDC Authentication)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Student removed successfully |  -  |
|**404** | Relationship not found |  -  |

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

# **updateGeneration**
> StudentProfessorRelationshipDTO updateGeneration(updateGenerationRequest)

Updates the academic year generation for a student-professor relationship. Requires PROFESSOR or ADMIN role.

### Example

```typescript
import {
    StudentProfessorRelationshipControllerApi,
    Configuration,
    UpdateGenerationRequest
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new StudentProfessorRelationshipControllerApi(configuration);

let studentUserId: string; // (default to undefined)
let professorId: string; // (default to undefined)
let updateGenerationRequest: UpdateGenerationRequest; //

const { status, data } = await apiInstance.updateGeneration(
    studentUserId,
    professorId,
    updateGenerationRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **updateGenerationRequest** | **UpdateGenerationRequest**|  | |
| **studentUserId** | [**string**] |  | defaults to undefined|
| **professorId** | [**string**] |  | defaults to undefined|


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
|**400** | Invalid generation format |  -  |
|**404** | Relationship not found |  -  |
|**200** | Generation updated successfully |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

