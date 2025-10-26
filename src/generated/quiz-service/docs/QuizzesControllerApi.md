# QuizzesControllerApi

All URIs are relative to *https://api.e-mentor.ro/service3*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**_delete**](#_delete) | **DELETE** /quiz/delete/{id} | Delete an existing quiz.|
|[**assign**](#assign) | **POST** /quiz/assign | Assign a quiz to a student.|
|[**create**](#create) | **POST** /quiz/create | Create a new quiz.|
|[**createComplete**](#createcomplete) | **POST** /quiz/create-complete | Create a new quiz with all new questions.|
|[**deleteAssigned**](#deleteassigned) | **DELETE** /quiz/delete-assigned/{id} | Delete a assigned quiz attempt of a student.|
|[**get1**](#get1) | **GET** /quiz/{id} | Get quiz by id|
|[**getAttempt**](#getattempt) | **GET** /quiz/attempt/{id} | Get quiz by id|
|[**getAttemptPreview**](#getattemptpreview) | **GET** /quiz/attempt-preview/{id} | Get quiz student view by id|
|[**getDashboardStats**](#getdashboardstats) | **GET** /quiz/dashboard-stats | Get student stats by id|
|[**getDashboardStats1**](#getdashboardstats1) | **GET** /quiz/dashboard-stats/{id} | Get quiz by id|
|[**getPaginated**](#getpaginated) | **POST** /quiz/paginated | Get paginated quizzes|
|[**getPaginatedQuizStudent**](#getpaginatedquizstudent) | **POST** /quiz/assigned-paginated | Get paginated quizzes|
|[**start**](#start) | **GET** /quiz/start/{id} | Start quiz by id|
|[**submit**](#submit) | **POST** /quiz/submit | Submit a quiz.|
|[**update**](#update) | **PUT** /quiz/update | Update an existing quiz.|
|[**updateComplete**](#updatecomplete) | **PUT** /quiz/update-complete | Update quiz with all new questions.|

# **_delete**
> _delete()


### Example

```typescript
import {
    QuizzesControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new QuizzesControllerApi(configuration);

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
|**200** | Request successful |  -  |
|**400** | Invalid request |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **assign**
> assign(assignQuizDTO)


### Example

```typescript
import {
    QuizzesControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new QuizzesControllerApi(configuration);

let assignQuizDTO: Array<AssignQuizDTO>; //

const { status, data } = await apiInstance.assign(
    assignQuizDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **assignQuizDTO** | **Array<AssignQuizDTO>**|  | |


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
|**201** | Created |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **create**
> create(quizDTO)


### Example

```typescript
import {
    QuizzesControllerApi,
    Configuration,
    QuizDTO
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new QuizzesControllerApi(configuration);

let quizDTO: QuizDTO; //

const { status, data } = await apiInstance.create(
    quizDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **quizDTO** | **QuizDTO**|  | |


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
|**201** | Created |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **createComplete**
> createComplete(quizWriteDTO)


### Example

```typescript
import {
    QuizzesControllerApi,
    Configuration,
    QuizWriteDTO
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new QuizzesControllerApi(configuration);

let quizWriteDTO: QuizWriteDTO; //

const { status, data } = await apiInstance.createComplete(
    quizWriteDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **quizWriteDTO** | **QuizWriteDTO**|  | |


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
|**201** | Created |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deleteAssigned**
> deleteAssigned()


### Example

```typescript
import {
    QuizzesControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new QuizzesControllerApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.deleteAssigned(
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
|**204** | Request successful |  -  |
|**400** | Invalid request |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **get1**
> QuizDTO get1()


### Example

```typescript
import {
    QuizzesControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new QuizzesControllerApi(configuration);

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

**QuizDTO**

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

# **getAttempt**
> SubmitQuizDTO getAttempt()


### Example

```typescript
import {
    QuizzesControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new QuizzesControllerApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.getAttempt(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**SubmitQuizDTO**

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

# **getAttemptPreview**
> QuizzesStudentsView getAttemptPreview()


### Example

```typescript
import {
    QuizzesControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new QuizzesControllerApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.getAttemptPreview(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**QuizzesStudentsView**

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

# **getDashboardStats**
> StudentStatsDTO getDashboardStats()


### Example

```typescript
import {
    QuizzesControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new QuizzesControllerApi(configuration);

let days: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.getDashboardStats(
    days
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **days** | [**number**] |  | (optional) defaults to undefined|


### Return type

**StudentStatsDTO**

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

# **getDashboardStats1**
> StudentStatsDTO getDashboardStats1()


### Example

```typescript
import {
    QuizzesControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new QuizzesControllerApi(configuration);

let id: string; // (default to undefined)
let days: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.getDashboardStats1(
    id,
    days
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|
| **days** | [**number**] |  | (optional) defaults to undefined|


### Return type

**StudentStatsDTO**

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
> PaginatedResponseQuizzesView getPaginated(paginatedRequest)


### Example

```typescript
import {
    QuizzesControllerApi,
    Configuration,
    PaginatedRequest
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new QuizzesControllerApi(configuration);

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

**PaginatedResponseQuizzesView**

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

# **getPaginatedQuizStudent**
> PaginatedResponseQuizzesStudentsView getPaginatedQuizStudent(paginatedRequest)


### Example

```typescript
import {
    QuizzesControllerApi,
    Configuration,
    PaginatedRequest
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new QuizzesControllerApi(configuration);

let paginatedRequest: PaginatedRequest; //

const { status, data } = await apiInstance.getPaginatedQuizStudent(
    paginatedRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **paginatedRequest** | **PaginatedRequest**|  | |


### Return type

**PaginatedResponseQuizzesStudentsView**

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

# **start**
> QuizDTO start()


### Example

```typescript
import {
    QuizzesControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new QuizzesControllerApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.start(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**QuizDTO**

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
|**202** | Accepted |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **submit**
> SubmitQuizDTO submit(submitQuizDTO)


### Example

```typescript
import {
    QuizzesControllerApi,
    Configuration,
    SubmitQuizDTO
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new QuizzesControllerApi(configuration);

let submitQuizDTO: SubmitQuizDTO; //

const { status, data } = await apiInstance.submit(
    submitQuizDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **submitQuizDTO** | **SubmitQuizDTO**|  | |


### Return type

**SubmitQuizDTO**

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

# **update**
> update(quizDTO)


### Example

```typescript
import {
    QuizzesControllerApi,
    Configuration,
    QuizDTO
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new QuizzesControllerApi(configuration);

let quizDTO: QuizDTO; //

const { status, data } = await apiInstance.update(
    quizDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **quizDTO** | **QuizDTO**|  | |


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

# **updateComplete**
> updateComplete(quizWriteDTO)


### Example

```typescript
import {
    QuizzesControllerApi,
    Configuration,
    QuizWriteDTO
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new QuizzesControllerApi(configuration);

let quizWriteDTO: QuizWriteDTO; //

const { status, data } = await apiInstance.updateComplete(
    quizWriteDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **quizWriteDTO** | **QuizWriteDTO**|  | |


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
|**202** | Accepted |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

