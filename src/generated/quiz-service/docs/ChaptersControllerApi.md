# ChaptersControllerApi

All URIs are relative to *https://api.e-mentor.ro/service3*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**create2**](#create2) | **POST** /chapter/create | Create a new chapter.|
|[**delete2**](#delete2) | **DELETE** /chapter/delete/{id} | Delete an existing chapter.|
|[**get**](#get) | **POST** /chapter/all-ids | Get chapters by id|
|[**get3**](#get3) | **GET** /chapter/{id} | Get chapter by id|
|[**getPaginated2**](#getpaginated2) | **POST** /chapter/paginated | Get paginated chapters|
|[**update2**](#update2) | **PUT** /chapter/update | Update an existing chapter.|

# **create2**
> create2(chapterDTO)


### Example

```typescript
import {
    ChaptersControllerApi,
    Configuration,
    ChapterDTO
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new ChaptersControllerApi(configuration);

let chapterDTO: ChapterDTO; //

const { status, data } = await apiInstance.create2(
    chapterDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **chapterDTO** | **ChapterDTO**|  | |


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
|**201** | Request successful |  -  |
|**500** | Invalid request |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **delete2**
> delete2()


### Example

```typescript
import {
    ChaptersControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new ChaptersControllerApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.delete2(
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

# **get**
> Array<ChapterDTO> get(chapterDTO)


### Example

```typescript
import {
    ChaptersControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new ChaptersControllerApi(configuration);

let chapterDTO: Array<ChapterDTO>; //

const { status, data } = await apiInstance.get(
    chapterDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **chapterDTO** | **Array<ChapterDTO>**|  | |


### Return type

**Array<ChapterDTO>**

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

# **get3**
> ChapterDTO get3()


### Example

```typescript
import {
    ChaptersControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new ChaptersControllerApi(configuration);

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

**ChapterDTO**

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

# **getPaginated2**
> PaginatedResponseChapter getPaginated2(paginatedRequest)


### Example

```typescript
import {
    ChaptersControllerApi,
    Configuration,
    PaginatedRequest
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new ChaptersControllerApi(configuration);

let paginatedRequest: PaginatedRequest; //

const { status, data } = await apiInstance.getPaginated2(
    paginatedRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **paginatedRequest** | **PaginatedRequest**|  | |


### Return type

**PaginatedResponseChapter**

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

# **update2**
> update2(chapterDTO)


### Example

```typescript
import {
    ChaptersControllerApi,
    Configuration,
    ChapterDTO
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new ChaptersControllerApi(configuration);

let chapterDTO: ChapterDTO; //

const { status, data } = await apiInstance.update2(
    chapterDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **chapterDTO** | **ChapterDTO**|  | |


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

