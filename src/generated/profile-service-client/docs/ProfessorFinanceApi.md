# ProfessorFinanceApi

All URIs are relative to *https://api.e-mentor.ro*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**exportFinanceLedger**](#exportfinanceledger) | **GET** /finance/professor/export | Ledger of all students for the period, for accounting (CSV or JSON)|
|[**getFinanceAging**](#getfinanceaging) | **GET** /finance/professor/aging | Outstanding grouped by age of the unpaid session, as of today|
|[**getFinanceBreakdown**](#getfinancebreakdown) | **GET** /finance/professor/breakdown | Earned in the period split by price, event type or series|
|[**getFinanceOverview**](#getfinanceoverview) | **GET** /finance/professor/overview | KPI overview for the period plus the previous period of equal length|
|[**getFinancePayments**](#getfinancepayments) | **GET** /finance/professor/payments | Paged payments received by this professor, filtered by creation date|
|[**getFinanceStudentLedger**](#getfinancestudentledger) | **GET** /finance/professor/students/{studentId}/ledger | Chronological ledger of one student with this professor|
|[**getFinanceStudents**](#getfinancestudents) | **GET** /finance/professor/students | Paged per-student finance rows|
|[**getFinanceTimeseries**](#getfinancetimeseries) | **GET** /finance/professor/timeseries | Earned / collected / expected / lost per day, week or month|

# **exportFinanceLedger**
> string exportFinanceLedger()


### Example

```typescript
import {
    ProfessorFinanceApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new ProfessorFinanceApi(configuration);

let from: string; //First day of the period, inclusive (Europe/Bucharest). Defaults to the first day of the current month. (optional) (default to undefined)
let to: string; //Last day of the period, inclusive (Europe/Bucharest). Defaults to the last day of the current month. (optional) (default to undefined)
let format: 'CSV' | 'JSON'; //Defaults to CSV (optional) (default to undefined)

const { status, data } = await apiInstance.exportFinanceLedger(
    from,
    to,
    format
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **from** | [**string**] | First day of the period, inclusive (Europe/Bucharest). Defaults to the first day of the current month. | (optional) defaults to undefined|
| **to** | [**string**] | Last day of the period, inclusive (Europe/Bucharest). Defaults to the last day of the current month. | (optional) defaults to undefined|
| **format** | [**&#39;CSV&#39; | &#39;JSON&#39;**]**Array<&#39;CSV&#39; &#124; &#39;JSON&#39;>** | Defaults to CSV | (optional) defaults to undefined|


### Return type

**string**

### Authorization

[OIDC Authentication](../README.md#OIDC Authentication)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: text/csv, application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**401** | Missing or invalid token |  -  |
|**403** | Caller is not a professor |  -  |
|**400** | Invalid parameters |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getFinanceAging**
> FinanceAgingDTO getFinanceAging()


### Example

```typescript
import {
    ProfessorFinanceApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new ProfessorFinanceApi(configuration);

const { status, data } = await apiInstance.getFinanceAging();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**FinanceAgingDTO**

### Authorization

[OIDC Authentication](../README.md#OIDC Authentication)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**401** | Missing or invalid token |  -  |
|**403** | Caller is not a professor |  -  |
|**400** | Invalid parameters |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getFinanceBreakdown**
> FinanceBreakdownDTO getFinanceBreakdown()


### Example

```typescript
import {
    ProfessorFinanceApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new ProfessorFinanceApi(configuration);

let from: string; //First day of the period, inclusive (Europe/Bucharest). Defaults to the first day of the current month. (optional) (default to undefined)
let to: string; //Last day of the period, inclusive (Europe/Bucharest). Defaults to the last day of the current month. (optional) (default to undefined)
let by: 'PRICE' | 'EVENT_TYPE' | 'SERIES'; //Defaults to PRICE (optional) (default to undefined)

const { status, data } = await apiInstance.getFinanceBreakdown(
    from,
    to,
    by
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **from** | [**string**] | First day of the period, inclusive (Europe/Bucharest). Defaults to the first day of the current month. | (optional) defaults to undefined|
| **to** | [**string**] | Last day of the period, inclusive (Europe/Bucharest). Defaults to the last day of the current month. | (optional) defaults to undefined|
| **by** | [**&#39;PRICE&#39; | &#39;EVENT_TYPE&#39; | &#39;SERIES&#39;**]**Array<&#39;PRICE&#39; &#124; &#39;EVENT_TYPE&#39; &#124; &#39;SERIES&#39;>** | Defaults to PRICE | (optional) defaults to undefined|


### Return type

**FinanceBreakdownDTO**

### Authorization

[OIDC Authentication](../README.md#OIDC Authentication)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**401** | Missing or invalid token |  -  |
|**403** | Caller is not a professor |  -  |
|**400** | Invalid parameters |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getFinanceOverview**
> FinanceOverviewDTO getFinanceOverview()


### Example

```typescript
import {
    ProfessorFinanceApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new ProfessorFinanceApi(configuration);

let from: string; //First day of the period, inclusive (Europe/Bucharest). Defaults to the first day of the current month. (optional) (default to undefined)
let to: string; //Last day of the period, inclusive (Europe/Bucharest). Defaults to the last day of the current month. (optional) (default to undefined)

const { status, data } = await apiInstance.getFinanceOverview(
    from,
    to
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **from** | [**string**] | First day of the period, inclusive (Europe/Bucharest). Defaults to the first day of the current month. | (optional) defaults to undefined|
| **to** | [**string**] | Last day of the period, inclusive (Europe/Bucharest). Defaults to the last day of the current month. | (optional) defaults to undefined|


### Return type

**FinanceOverviewDTO**

### Authorization

[OIDC Authentication](../README.md#OIDC Authentication)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**401** | Missing or invalid token |  -  |
|**403** | Caller is not a professor |  -  |
|**400** | Invalid parameters |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getFinancePayments**
> FinancePaymentsPageDTO getFinancePayments()


### Example

```typescript
import {
    ProfessorFinanceApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new ProfessorFinanceApi(configuration);

let from: string; //First day of the period, inclusive (Europe/Bucharest). Defaults to the first day of the current month. (optional) (default to undefined)
let to: string; //Last day of the period, inclusive (Europe/Bucharest). Defaults to the last day of the current month. (optional) (default to undefined)
let status: Array<'PENDING' | 'CONFIRMED' | 'REJECTED' | 'EXPIRED'>; //Repeatable status filter; all statuses when missing (optional) (default to undefined)
let page: number; //0-based page index (optional) (default to undefined)
let size: number; //Page size, 1..100 (default 20) (optional) (default to undefined)

const { status, data } = await apiInstance.getFinancePayments(
    from,
    to,
    status,
    page,
    size
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **from** | [**string**] | First day of the period, inclusive (Europe/Bucharest). Defaults to the first day of the current month. | (optional) defaults to undefined|
| **to** | [**string**] | Last day of the period, inclusive (Europe/Bucharest). Defaults to the last day of the current month. | (optional) defaults to undefined|
| **status** | **Array<&#39;PENDING&#39; &#124; &#39;CONFIRMED&#39; &#124; &#39;REJECTED&#39; &#124; &#39;EXPIRED&#39;>** | Repeatable status filter; all statuses when missing | (optional) defaults to undefined|
| **page** | [**number**] | 0-based page index | (optional) defaults to undefined|
| **size** | [**number**] | Page size, 1..100 (default 20) | (optional) defaults to undefined|


### Return type

**FinancePaymentsPageDTO**

### Authorization

[OIDC Authentication](../README.md#OIDC Authentication)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**401** | Missing or invalid token |  -  |
|**403** | Caller is not a professor |  -  |
|**400** | Invalid parameters |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getFinanceStudentLedger**
> FinanceLedgerDTO getFinanceStudentLedger()


### Example

```typescript
import {
    ProfessorFinanceApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new ProfessorFinanceApi(configuration);

let studentId: string; //Student user id (default to undefined)
let from: string; //First day of the period, inclusive (Europe/Bucharest). Defaults to the first day of the current month. (optional) (default to undefined)
let to: string; //Last day of the period, inclusive (Europe/Bucharest). Defaults to the last day of the current month. (optional) (default to undefined)

const { status, data } = await apiInstance.getFinanceStudentLedger(
    studentId,
    from,
    to
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **studentId** | [**string**] | Student user id | defaults to undefined|
| **from** | [**string**] | First day of the period, inclusive (Europe/Bucharest). Defaults to the first day of the current month. | (optional) defaults to undefined|
| **to** | [**string**] | Last day of the period, inclusive (Europe/Bucharest). Defaults to the last day of the current month. | (optional) defaults to undefined|


### Return type

**FinanceLedgerDTO**

### Authorization

[OIDC Authentication](../README.md#OIDC Authentication)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**404** | Student has no relationship, session or payment with this professor |  -  |
|**401** | Missing or invalid token |  -  |
|**403** | Caller is not a professor |  -  |
|**400** | Invalid parameters |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getFinanceStudents**
> FinanceStudentsPageDTO getFinanceStudents()


### Example

```typescript
import {
    ProfessorFinanceApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new ProfessorFinanceApi(configuration);

let from: string; //First day of the period, inclusive (Europe/Bucharest). Defaults to the first day of the current month. (optional) (default to undefined)
let to: string; //Last day of the period, inclusive (Europe/Bucharest). Defaults to the last day of the current month. (optional) (default to undefined)
let sort: 'outstanding' | 'earned' | 'name'; // (optional) (default to 'outstanding')
let direction: 'asc' | 'desc'; //Defaults to desc for outstanding/earned and asc for name. (optional) (default to undefined)
let page: number; //0-based page index (optional) (default to undefined)
let size: number; //Page size, 1..100 (default 20) (optional) (default to undefined)
let search: string; //Case- and diacritics-insensitive name search (optional) (default to undefined)

const { status, data } = await apiInstance.getFinanceStudents(
    from,
    to,
    sort,
    direction,
    page,
    size,
    search
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **from** | [**string**] | First day of the period, inclusive (Europe/Bucharest). Defaults to the first day of the current month. | (optional) defaults to undefined|
| **to** | [**string**] | Last day of the period, inclusive (Europe/Bucharest). Defaults to the last day of the current month. | (optional) defaults to undefined|
| **sort** | [**&#39;outstanding&#39; | &#39;earned&#39; | &#39;name&#39;**]**Array<&#39;outstanding&#39; &#124; &#39;earned&#39; &#124; &#39;name&#39;>** |  | (optional) defaults to 'outstanding'|
| **direction** | [**&#39;asc&#39; | &#39;desc&#39;**]**Array<&#39;asc&#39; &#124; &#39;desc&#39;>** | Defaults to desc for outstanding/earned and asc for name. | (optional) defaults to undefined|
| **page** | [**number**] | 0-based page index | (optional) defaults to undefined|
| **size** | [**number**] | Page size, 1..100 (default 20) | (optional) defaults to undefined|
| **search** | [**string**] | Case- and diacritics-insensitive name search | (optional) defaults to undefined|


### Return type

**FinanceStudentsPageDTO**

### Authorization

[OIDC Authentication](../README.md#OIDC Authentication)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**401** | Missing or invalid token |  -  |
|**403** | Caller is not a professor |  -  |
|**400** | Invalid parameters |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getFinanceTimeseries**
> FinanceTimeseriesDTO getFinanceTimeseries()


### Example

```typescript
import {
    ProfessorFinanceApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new ProfessorFinanceApi(configuration);

let from: string; //First day of the period, inclusive (Europe/Bucharest). Defaults to the first day of the current month. (optional) (default to undefined)
let to: string; //Last day of the period, inclusive (Europe/Bucharest). Defaults to the last day of the current month. (optional) (default to undefined)
let granularity: 'DAY' | 'WEEK' | 'MONTH'; //Bucket size. Defaults to DAY. DAY allows at most 366 days. (optional) (default to undefined)

const { status, data } = await apiInstance.getFinanceTimeseries(
    from,
    to,
    granularity
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **from** | [**string**] | First day of the period, inclusive (Europe/Bucharest). Defaults to the first day of the current month. | (optional) defaults to undefined|
| **to** | [**string**] | Last day of the period, inclusive (Europe/Bucharest). Defaults to the last day of the current month. | (optional) defaults to undefined|
| **granularity** | [**&#39;DAY&#39; | &#39;WEEK&#39; | &#39;MONTH&#39;**]**Array<&#39;DAY&#39; &#124; &#39;WEEK&#39; &#124; &#39;MONTH&#39;>** | Bucket size. Defaults to DAY. DAY allows at most 366 days. | (optional) defaults to undefined|


### Return type

**FinanceTimeseriesDTO**

### Authorization

[OIDC Authentication](../README.md#OIDC Authentication)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**401** | Missing or invalid token |  -  |
|**403** | Caller is not a professor |  -  |
|**400** | Invalid parameters |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

