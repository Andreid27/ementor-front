# FIFOAllocationApi

All URIs are relative to *http://localhost:49202*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**getEventDebtSummary**](#geteventdebtsummary) | **GET** /fifo/events/{eventId}/debt-summary | Get event debt summary|
|[**getPaymentDetails**](#getpaymentdetails) | **GET** /fifo/payments/{paymentId}/details | Get detailed payment information|
|[**getProfessorPaymentSummary**](#getprofessorpaymentsummary) | **GET** /fifo/payments/professor/summary | Get professor payment summary|
|[**getProfessorPaymentSummaryAdmin**](#getprofessorpaymentsummaryadmin) | **GET** /fifo/payments/professor/{professorId}/summary | Get payment summary for specific professor|
|[**getStudentDebtSummary**](#getstudentdebtsummary) | **GET** /fifo/debt/student/professor/{professorId} | Get student debt summary for specific professor|
|[**getStudentDebtSummaryAdmin**](#getstudentdebtsummaryadmin) | **GET** /fifo/debt/student/{studentId}/professor/{professorId} | Get debt summary for specific student and professor|
|[**getTotalDebt**](#gettotaldebt) | **GET** /fifo/debt/total/professor/{professorId} | Calculate total outstanding debt|
|[**getTotalDebtAdmin**](#gettotaldebtadmin) | **GET** /fifo/debt/total/student/{studentId}/professor/{professorId} | Calculate total debt for specific student|
|[**healthCheck**](#healthcheck) | **GET** /fifo/health | FIFO service health check|
|[**simulatePaymentAllocation**](#simulatepaymentallocation) | **GET** /fifo/simulate/student/professor/{professorId}/amount/{amount} | Simulate FIFO allocation for payment amount|

# **getEventDebtSummary**
> EventDebtSummaryDTO getEventDebtSummary()

Comprehensive debt and payment analytics for specific event

### Example

```typescript
import {
    FIFOAllocationApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new FIFOAllocationApi(configuration);

let eventId: string; //Event ID to get debt summary for (default to undefined)

const { status, data } = await apiInstance.getEventDebtSummary(
    eventId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **eventId** | [**string**] | Event ID to get debt summary for | defaults to undefined|


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
|**200** | Event debt summary retrieved successfully |  -  |
|**403** | Forbidden |  -  |
|**404** | Event not found |  -  |
|**401** | Unauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getPaymentDetails**
> PaymentDetailDTO getPaymentDetails()

Comprehensive payment details including FIFO allocation breakdown

### Example

```typescript
import {
    FIFOAllocationApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new FIFOAllocationApi(configuration);

let paymentId: string; //Payment ID to get details for (default to undefined)

const { status, data } = await apiInstance.getPaymentDetails(
    paymentId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **paymentId** | [**string**] | Payment ID to get details for | defaults to undefined|


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
|**200** | Payment details retrieved successfully |  -  |
|**403** | Forbidden |  -  |
|**404** | Payment not found |  -  |
|**401** | Unauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getProfessorPaymentSummary**
> ProfessorPaymentSummaryDTO getProfessorPaymentSummary()

Comprehensive payment analytics for current professor including allocation details

### Example

```typescript
import {
    FIFOAllocationApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new FIFOAllocationApi(configuration);

const { status, data } = await apiInstance.getProfessorPaymentSummary();
```

### Parameters
This endpoint does not have any parameters.


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
|**200** | Payment summary retrieved successfully |  -  |
|**401** | Unauthorized |  -  |
|**403** | Forbidden - professors only |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getProfessorPaymentSummaryAdmin**
> ProfessorPaymentSummaryDTO getProfessorPaymentSummaryAdmin()

Administrative endpoint for viewing professor payment analytics

### Example

```typescript
import {
    FIFOAllocationApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new FIFOAllocationApi(configuration);

let professorId: string; //Professor ID to get payment summary for (default to undefined)

const { status, data } = await apiInstance.getProfessorPaymentSummaryAdmin(
    professorId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **professorId** | [**string**] | Professor ID to get payment summary for | defaults to undefined|


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
|**403** | Forbidden - admins only |  -  |
|**200** | Payment summary retrieved successfully |  -  |
|**404** | Professor not found |  -  |
|**401** | Unauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getStudentDebtSummary**
> StudentDebtSummaryDTO getStudentDebtSummary()

Returns comprehensive debt breakdown including event details, payment history, and outstanding balances

### Example

```typescript
import {
    FIFOAllocationApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new FIFOAllocationApi(configuration);

let professorId: string; //Professor ID to get debt summary for (default to undefined)

const { status, data } = await apiInstance.getStudentDebtSummary(
    professorId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **professorId** | [**string**] | Professor ID to get debt summary for | defaults to undefined|


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
|**403** | Forbidden - students only |  -  |
|**200** | Debt summary retrieved successfully |  -  |
|**404** | Professor not found |  -  |
|**401** | Unauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getStudentDebtSummaryAdmin**
> StudentDebtSummaryDTO getStudentDebtSummaryAdmin()

Administrative endpoint for viewing student debt details

### Example

```typescript
import {
    FIFOAllocationApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new FIFOAllocationApi(configuration);

let studentId: string; //Student ID to get debt summary for (default to undefined)
let professorId: string; //Professor ID to get debt summary for (default to undefined)

const { status, data } = await apiInstance.getStudentDebtSummaryAdmin(
    studentId,
    professorId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **studentId** | [**string**] | Student ID to get debt summary for | defaults to undefined|
| **professorId** | [**string**] | Professor ID to get debt summary for | defaults to undefined|


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
|**200** | Debt summary retrieved successfully |  -  |
|**403** | Forbidden - professors and admins only |  -  |
|**401** | Unauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getTotalDebt**
> number getTotalDebt()

Returns the total outstanding debt amount for current student with specific professor

### Example

```typescript
import {
    FIFOAllocationApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new FIFOAllocationApi(configuration);

let professorId: string; //Professor ID to calculate debt for (default to undefined)

const { status, data } = await apiInstance.getTotalDebt(
    professorId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **professorId** | [**string**] | Professor ID to calculate debt for | defaults to undefined|


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
|**403** | Forbidden - students only |  -  |
|**200** | Total debt calculated successfully |  -  |
|**401** | Unauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getTotalDebtAdmin**
> number getTotalDebtAdmin()

Administrative endpoint for calculating student debt totals

### Example

```typescript
import {
    FIFOAllocationApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new FIFOAllocationApi(configuration);

let studentId: string; //Student ID to calculate debt for (default to undefined)
let professorId: string; //Professor ID to calculate debt for (default to undefined)

const { status, data } = await apiInstance.getTotalDebtAdmin(
    studentId,
    professorId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **studentId** | [**string**] | Student ID to calculate debt for | defaults to undefined|
| **professorId** | [**string**] | Professor ID to calculate debt for | defaults to undefined|


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
|**403** | Forbidden - admins only |  -  |
|**200** | Total debt calculated successfully |  -  |
|**401** | Unauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **healthCheck**
> string healthCheck()

Simple health check to verify FIFO allocation service availability

### Example

```typescript
import {
    FIFOAllocationApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new FIFOAllocationApi(configuration);

const { status, data } = await apiInstance.healthCheck();
```

### Parameters
This endpoint does not have any parameters.


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
|**200** | Service is healthy |  -  |
|**401** | Unauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **simulatePaymentAllocation**
> PaymentDetailDTO simulatePaymentAllocation()

Shows how a payment would be allocated across events without actually processing it

### Example

```typescript
import {
    FIFOAllocationApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new FIFOAllocationApi(configuration);

let professorId: string; //Professor ID to simulate payment for (default to undefined)
let amount: number; //Payment amount to simulate (must be positive) (default to undefined)

const { status, data } = await apiInstance.simulatePaymentAllocation(
    professorId,
    amount
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **professorId** | [**string**] | Professor ID to simulate payment for | defaults to undefined|
| **amount** | [**number**] | Payment amount to simulate (must be positive) | defaults to undefined|


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
|**400** | Invalid amount |  -  |
|**403** | Forbidden - students only |  -  |
|**200** | Simulation completed successfully |  -  |
|**401** | Unauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

