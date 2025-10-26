# QuestionsControllerApi

All URIs are relative to *https://api.e-mentor.ro/service3*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**create1**](#create1) | **POST** /question/create | Create a new question.|
|[**delete1**](#delete1) | **DELETE** /question/delete/{id} | Delete a existing question.|
|[**get2**](#get2) | **GET** /question/{id} | Get question by id|
|[**getPaginated1**](#getpaginated1) | **POST** /question/paginated | Get paginated questions|
|[**update1**](#update1) | **PUT** /question/update | Update a existing student profile.|

# **create1**
> create1(questionDTO)


### Example

```typescript
import {
    QuestionsControllerApi,
    Configuration,
    QuestionDTO
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new QuestionsControllerApi(configuration);

let questionDTO: QuestionDTO; //

const { status, data } = await apiInstance.create1(
    questionDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **questionDTO** | **QuestionDTO**|  | |


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

# **delete1**
> delete1()


### Example

```typescript
import {
    QuestionsControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new QuestionsControllerApi(configuration);

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
|**200** | Request successful |  -  |
|**400** | Invalid request |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **get2**
> QuestionDTO get2()


### Example

```typescript
import {
    QuestionsControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new QuestionsControllerApi(configuration);

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

**QuestionDTO**

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
> PaginatedResponseQuestion getPaginated1(paginatedRequest)


### Example

```typescript
import {
    QuestionsControllerApi,
    Configuration,
    PaginatedRequest
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new QuestionsControllerApi(configuration);

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

**PaginatedResponseQuestion**

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

# **update1**
> update1(questionDTO)


### Example

```typescript
import {
    QuestionsControllerApi,
    Configuration,
    QuestionDTO
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new QuestionsControllerApi(configuration);

let questionDTO: QuestionDTO; //

const { status, data } = await apiInstance.update1(
    questionDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **questionDTO** | **QuestionDTO**|  | |


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

