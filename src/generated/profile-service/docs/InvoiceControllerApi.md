# InvoiceControllerApi

All URIs are relative to *http://localhost:49202*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**downloadInvoiceById**](#downloadinvoicebyid) | **GET** /invoices/{id}/download | Download invoice by ID|
|[**getMyInvoices**](#getmyinvoices) | **GET** /invoices/my | Get invoices for the current user|

# **downloadInvoiceById**
> File downloadInvoiceById()


### Example

```typescript
import {
    InvoiceControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new InvoiceControllerApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.downloadInvoiceById(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**File**

### Authorization

[OIDC Authentication](../README.md#OIDC Authentication)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**404** | Not Found |  -  |
|**403** | Forbidden |  -  |
|**200** | Request successful |  -  |
|**401** | Unauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

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

