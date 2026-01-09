# AdminSubscriptionControllerApi

All URIs are relative to *http://localhost:49202*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**getGlobalPayments**](#getglobalpayments) | **GET** /api/v1/admin/subscriptions/payments | Get global payments history|
|[**getProfessorsWithSubscription**](#getprofessorswithsubscription) | **POST** /api/v1/admin/subscriptions/professors | Get paginated professor profiles with subscription info|
|[**overrideSubscription**](#overridesubscription) | **POST** /api/v1/admin/subscriptions/professor/{professorId}/override | Override subscription expiration date|

# **getGlobalPayments**
> PageProfessorPaymentDTO getGlobalPayments()


### Example

```typescript
import {
    AdminSubscriptionControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new AdminSubscriptionControllerApi(configuration);

let page: number; // (optional) (default to 0)
let size: number; // (optional) (default to 20)

const { status, data } = await apiInstance.getGlobalPayments(
    page,
    size
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **page** | [**number**] |  | (optional) defaults to 0|
| **size** | [**number**] |  | (optional) defaults to 20|


### Return type

**PageProfessorPaymentDTO**

### Authorization

[OIDC Authentication](../README.md#OIDC Authentication)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getProfessorsWithSubscription**
> PaginatedResponseAdminProfessorProfileDTO getProfessorsWithSubscription(paginatedRequest)


### Example

```typescript
import {
    AdminSubscriptionControllerApi,
    Configuration,
    PaginatedRequest
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new AdminSubscriptionControllerApi(configuration);

let paginatedRequest: PaginatedRequest; //

const { status, data } = await apiInstance.getProfessorsWithSubscription(
    paginatedRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **paginatedRequest** | **PaginatedRequest**|  | |


### Return type

**PaginatedResponseAdminProfessorProfileDTO**

### Authorization

[OIDC Authentication](../README.md#OIDC Authentication)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **overrideSubscription**
> overrideSubscription()


### Example

```typescript
import {
    AdminSubscriptionControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new AdminSubscriptionControllerApi(configuration);

let professorId: string; // (default to undefined)
let newEndDate: string; // (default to undefined)

const { status, data } = await apiInstance.overrideSubscription(
    professorId,
    newEndDate
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **professorId** | [**string**] |  | defaults to undefined|
| **newEndDate** | [**string**] |  | defaults to undefined|


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
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

