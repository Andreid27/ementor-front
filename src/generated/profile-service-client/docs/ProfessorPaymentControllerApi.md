# ProfessorPaymentControllerApi

All URIs are relative to *http://localhost:49202*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createPortalSession**](#createportalsession) | **POST** /subscriptions/portal | Create Stripe Customer Portal session for billing management|
|[**getMyPayments**](#getmypayments) | **GET** /subscriptions/payments | Get my payments|
|[**getSubscriptionStatus**](#getsubscriptionstatus) | **GET** /subscriptions/my | Get current subscription status|

# **createPortalSession**
> { [key: string]: string; } createPortalSession()


### Example

```typescript
import {
    ProfessorPaymentControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new ProfessorPaymentControllerApi(configuration);

let returnUrl: string; // (default to undefined)

const { status, data } = await apiInstance.createPortalSession(
    returnUrl
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **returnUrl** | [**string**] |  | defaults to undefined|


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
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getMyPayments**
> PageProfessorPaymentDTO getMyPayments()


### Example

```typescript
import {
    ProfessorPaymentControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new ProfessorPaymentControllerApi(configuration);

let page: number; // (optional) (default to 0)
let size: number; // (optional) (default to 10)

const { status, data } = await apiInstance.getMyPayments(
    page,
    size
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **page** | [**number**] |  | (optional) defaults to 0|
| **size** | [**number**] |  | (optional) defaults to 10|


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

# **getSubscriptionStatus**
> ProfessorSubscriptionDTO getSubscriptionStatus()


### Example

```typescript
import {
    ProfessorPaymentControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new ProfessorPaymentControllerApi(configuration);

const { status, data } = await apiInstance.getSubscriptionStatus();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**ProfessorSubscriptionDTO**

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

