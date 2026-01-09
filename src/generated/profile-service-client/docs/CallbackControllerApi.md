# CallbackControllerApi

All URIs are relative to *http://localhost:49202*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**handleStripeWebhook**](#handlestripewebhook) | **POST** /callbacks/stripe | Stripe Webhook Endpoint|

# **handleStripeWebhook**
> string handleStripeWebhook(body)


### Example

```typescript
import {
    CallbackControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new CallbackControllerApi(configuration);

let stripeSignature: string; // (default to undefined)
let body: string; //

const { status, data } = await apiInstance.handleStripeWebhook(
    stripeSignature,
    body
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **body** | **string**|  | |
| **stripeSignature** | [**string**] |  | defaults to undefined|


### Return type

**string**

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

