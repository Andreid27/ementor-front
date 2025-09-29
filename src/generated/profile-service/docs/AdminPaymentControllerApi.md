# AdminPaymentControllerApi

All URIs are relative to *https://dev.api.e-mentor.ro*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**getAllPayments**](#getallpayments) | **GET** /admin/payment-system/payments | Get all payments with filtering and pagination (admin only)|
|[**getAllPendingPayments**](#getallpendingpayments) | **GET** /admin/payment-system/payments/pending | Get all pending payments (admin only)|
|[**getAllWallets**](#getallwallets) | **GET** /admin/payment-system/wallets | Get all wallets with pagination (admin only)|
|[**getEventDebtSummary1**](#geteventdebtsummary1) | **GET** /admin/payment-system/fifo/events/{eventId}/debt-summary | Get event debt summary for administrative oversight (admin only)|
|[**getFIFOStatistics**](#getfifostatistics) | **GET** /admin/payment-system/fifo/statistics | Get enhanced payment system statistics with FIFO metrics (admin only)|
|[**getPaymentAllocations**](#getpaymentallocations) | **GET** /admin/payment-system/fifo/payments/{paymentId}/allocations | Get payment allocation details (admin only)|
|[**getPaymentSystemStatistics**](#getpaymentsystemstatistics) | **GET** /admin/payment-system/statistics | Get payment system statistics (admin only)|
|[**getPaymentsByPayer**](#getpaymentsbypayer) | **GET** /admin/payment-system/payments/payer/{payerId} | Get payments by payer ID (admin only)|
|[**getPaymentsByProfessor**](#getpaymentsbyprofessor) | **GET** /admin/payment-system/payments/professor/{professorId} | Get payments by professor ID (admin only)|
|[**getProfessorPaymentSummary1**](#getprofessorpaymentsummary1) | **GET** /admin/payment-system/fifo/professors/{professorId}/payment-summary | Get professor payment summary with FIFO analytics (admin only)|
|[**getRecentPayments**](#getrecentpayments) | **GET** /admin/payment-system/payments/recent | Get recent payments (admin only)|
|[**getStudentDebtSummary1**](#getstudentdebtsummary1) | **GET** /admin/payment-system/fifo/students/{studentId}/professors/{professorId}/debt-summary | Get student debt summary for administrative review (admin only)|
|[**getTotalDebt1**](#gettotaldebt1) | **GET** /admin/payment-system/fifo/students/{studentId}/professors/{professorId}/total-debt | Calculate total debt for administrative overview (admin only)|
|[**syncStudentSoloClients**](#syncstudentsoloclients) | **GET** /admin/payment-system/sync-student-solo-clients/{userId} | Sync student solo clients with payment system (admin only)|

# **getAllPayments**
> PageBankTransferPaymentDTO getAllPayments()


### Example

```typescript
import {
    AdminPaymentControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new AdminPaymentControllerApi(configuration);

let page: number; // (optional) (default to 0)
let size: number; // (optional) (default to 20)
let status: 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'EXPIRED'; // (optional) (default to undefined)
let startDate: string; // (optional) (default to undefined)
let endDate: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.getAllPayments(
    page,
    size,
    status,
    startDate,
    endDate
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **page** | [**number**] |  | (optional) defaults to 0|
| **size** | [**number**] |  | (optional) defaults to 20|
| **status** | [**&#39;PENDING&#39; | &#39;CONFIRMED&#39; | &#39;REJECTED&#39; | &#39;EXPIRED&#39;**]**Array<&#39;PENDING&#39; &#124; &#39;CONFIRMED&#39; &#124; &#39;REJECTED&#39; &#124; &#39;EXPIRED&#39;>** |  | (optional) defaults to undefined|
| **startDate** | [**string**] |  | (optional) defaults to undefined|
| **endDate** | [**string**] |  | (optional) defaults to undefined|


### Return type

**PageBankTransferPaymentDTO**

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

# **getAllPendingPayments**
> Array<BankTransferPaymentDTO> getAllPendingPayments()


### Example

```typescript
import {
    AdminPaymentControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new AdminPaymentControllerApi(configuration);

const { status, data } = await apiInstance.getAllPendingPayments();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**Array<BankTransferPaymentDTO>**

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

# **getAllWallets**
> PageWalletDTO getAllWallets()


### Example

```typescript
import {
    AdminPaymentControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new AdminPaymentControllerApi(configuration);

let page: number; // (optional) (default to 0)
let size: number; // (optional) (default to 20)

const { status, data } = await apiInstance.getAllWallets(
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

**PageWalletDTO**

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

# **getEventDebtSummary1**
> EventDebtSummaryDTO getEventDebtSummary1()


### Example

```typescript
import {
    AdminPaymentControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new AdminPaymentControllerApi(configuration);

let eventId: string; // (default to undefined)

const { status, data } = await apiInstance.getEventDebtSummary1(
    eventId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **eventId** | [**string**] |  | defaults to undefined|


### Return type

**EventDebtSummaryDTO**

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
|**404** | Event not found |  -  |
|**401** | Unauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getFIFOStatistics**
> FIFOSystemStatisticsDTO getFIFOStatistics()


### Example

```typescript
import {
    AdminPaymentControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new AdminPaymentControllerApi(configuration);

const { status, data } = await apiInstance.getFIFOStatistics();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**FIFOSystemStatisticsDTO**

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

# **getPaymentAllocations**
> PaymentDetailDTO getPaymentAllocations()


### Example

```typescript
import {
    AdminPaymentControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new AdminPaymentControllerApi(configuration);

let paymentId: string; // (default to undefined)

const { status, data } = await apiInstance.getPaymentAllocations(
    paymentId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **paymentId** | [**string**] |  | defaults to undefined|


### Return type

**PaymentDetailDTO**

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
|**404** | Payment not found |  -  |
|**401** | Unauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getPaymentSystemStatistics**
> PaymentSystemStatisticsDTO getPaymentSystemStatistics()


### Example

```typescript
import {
    AdminPaymentControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new AdminPaymentControllerApi(configuration);

const { status, data } = await apiInstance.getPaymentSystemStatistics();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**PaymentSystemStatisticsDTO**

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

# **getPaymentsByPayer**
> PageBankTransferPaymentDTO getPaymentsByPayer()


### Example

```typescript
import {
    AdminPaymentControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new AdminPaymentControllerApi(configuration);

let payerId: string; // (default to undefined)
let page: number; // (optional) (default to 0)
let size: number; // (optional) (default to 20)

const { status, data } = await apiInstance.getPaymentsByPayer(
    payerId,
    page,
    size
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **payerId** | [**string**] |  | defaults to undefined|
| **page** | [**number**] |  | (optional) defaults to 0|
| **size** | [**number**] |  | (optional) defaults to 20|


### Return type

**PageBankTransferPaymentDTO**

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

# **getPaymentsByProfessor**
> PageBankTransferPaymentDTO getPaymentsByProfessor()


### Example

```typescript
import {
    AdminPaymentControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new AdminPaymentControllerApi(configuration);

let professorId: string; // (default to undefined)
let page: number; // (optional) (default to 0)
let size: number; // (optional) (default to 20)

const { status, data } = await apiInstance.getPaymentsByProfessor(
    professorId,
    page,
    size
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **professorId** | [**string**] |  | defaults to undefined|
| **page** | [**number**] |  | (optional) defaults to 0|
| **size** | [**number**] |  | (optional) defaults to 20|


### Return type

**PageBankTransferPaymentDTO**

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

# **getProfessorPaymentSummary1**
> ProfessorPaymentSummaryDTO getProfessorPaymentSummary1()


### Example

```typescript
import {
    AdminPaymentControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new AdminPaymentControllerApi(configuration);

let professorId: string; // (default to undefined)

const { status, data } = await apiInstance.getProfessorPaymentSummary1(
    professorId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **professorId** | [**string**] |  | defaults to undefined|


### Return type

**ProfessorPaymentSummaryDTO**

### Authorization

[OIDC Authentication](../README.md#OIDC Authentication)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**403** | Forbidden |  -  |
|**404** | Professor not found |  -  |
|**200** | Request successful |  -  |
|**401** | Unauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getRecentPayments**
> Array<BankTransferPaymentDTO> getRecentPayments()


### Example

```typescript
import {
    AdminPaymentControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new AdminPaymentControllerApi(configuration);

let days: number; // (optional) (default to 7)

const { status, data } = await apiInstance.getRecentPayments(
    days
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **days** | [**number**] |  | (optional) defaults to 7|


### Return type

**Array<BankTransferPaymentDTO>**

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

# **getStudentDebtSummary1**
> StudentDebtSummaryDTO getStudentDebtSummary1()


### Example

```typescript
import {
    AdminPaymentControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new AdminPaymentControllerApi(configuration);

let studentId: string; // (default to undefined)
let professorId: string; // (default to undefined)

const { status, data } = await apiInstance.getStudentDebtSummary1(
    studentId,
    professorId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **studentId** | [**string**] |  | defaults to undefined|
| **professorId** | [**string**] |  | defaults to undefined|


### Return type

**StudentDebtSummaryDTO**

### Authorization

[OIDC Authentication](../README.md#OIDC Authentication)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**404** | Student or professor not found |  -  |
|**403** | Forbidden |  -  |
|**200** | Request successful |  -  |
|**401** | Unauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getTotalDebt1**
> number getTotalDebt1()


### Example

```typescript
import {
    AdminPaymentControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new AdminPaymentControllerApi(configuration);

let studentId: string; // (default to undefined)
let professorId: string; // (default to undefined)

const { status, data } = await apiInstance.getTotalDebt1(
    studentId,
    professorId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **studentId** | [**string**] |  | defaults to undefined|
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
|**403** | Forbidden |  -  |
|**200** | Request successful |  -  |
|**401** | Unauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **syncStudentSoloClients**
> string syncStudentSoloClients()


### Example

```typescript
import {
    AdminPaymentControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new AdminPaymentControllerApi(configuration);

let userId: string; // (default to undefined)

const { status, data } = await apiInstance.syncStudentSoloClients(
    userId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **userId** | [**string**] |  | defaults to undefined|


### Return type

**string**

### Authorization

[OIDC Authentication](../README.md#OIDC Authentication)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**403** | Forbidden |  -  |
|**200** | Sync completed |  -  |
|**401** | Unauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

