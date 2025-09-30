# InvoiceControllerApi

All URIs are relative to *https://api.e-mentor.ro//service2*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**getMyInvoices**](#getmyinvoices) | **GET** /invoices/my | Get invoices for the current user|

# **getMyInvoices**
> Array<InvoiceDTO> getMyInvoices()


### Example

```typescript
import {
    InvoiceControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new InvoiceControllerApi(configuration);

const { status, data } = await apiInstance.getMyInvoices();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**Array<InvoiceDTO>**

### Authorization

[OIDC Authentication](../README.md#OIDC Authentication)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**403** | Forbidden |  -  |
|**200** | Request successful |  -  |
|**401** | Unauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

