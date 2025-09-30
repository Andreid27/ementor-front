# PaymentControllerApi

All URIs are relative to *https://api.e-mentor.ro//service2*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**canConfirmPayment**](#canconfirmpayment) | **GET** /payment/can-confirm/{paymentId} | Check if payment can be confirmed|
|[**confirmPayment**](#confirmpayment) | **POST** /payment/confirm | Confirm a bank transfer payment|
|[**createPayment**](#createpayment) | **POST** /payment | Create a new bank transfer payment|
|[**generateReference**](#generatereference) | **POST** /payment/references/generate | Generate payment reference code|
|[**getConfirmationHistory**](#getconfirmationhistory) | **GET** /payment/confirmation-history | Get payment confirmation history for current professor|
|[**getConfirmationResult**](#getconfirmationresult) | **GET** /payment/confirmation-result/{paymentId} | Get payment confirmation result with FIFO allocation details|
|[**getMyPayments**](#getmypayments) | **GET** /payment/my | Get payments for current student|
|[**getPaymentById**](#getpaymentbyid) | **GET** /payment/{paymentId} | Get specific payment by ID|
|[**getPaymentForConfirmation**](#getpaymentforconfirmation) | **GET** /payment/confirmation/{paymentId} | Get payment details for confirmation|
|[**getPendingPayments**](#getpendingpayments) | **GET** /payment/pending | Get pending payments for current professor|
|[**getProfessorPaymentInfo**](#getprofessorpaymentinfo) | **GET** /payment/professor/{professorId}/info | Get professor payment information including bank accounts|
|[**rejectPayment**](#rejectpayment) | **POST** /payment/reject | Reject a bank transfer payment|
|[**validateReference**](#validatereference) | **POST** /payment/references/validate | Validate a payment reference code|

# **canConfirmPayment**
> boolean canConfirmPayment()


### Example

```typescript
import {
    PaymentControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new PaymentControllerApi(configuration);

let paymentId: string; // (default to undefined)

const { status, data } = await apiInstance.canConfirmPayment(
    paymentId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **paymentId** | [**string**] |  | defaults to undefined|


### Return type

**boolean**

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

# **confirmPayment**
> BankTransferPaymentDTO confirmPayment(paymentConfirmationRequest)


### Example

```typescript
import {
    PaymentControllerApi,
    Configuration,
    PaymentConfirmationRequest
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new PaymentControllerApi(configuration);

let paymentConfirmationRequest: PaymentConfirmationRequest; //

const { status, data } = await apiInstance.confirmPayment(
    paymentConfirmationRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **paymentConfirmationRequest** | **PaymentConfirmationRequest**|  | |


### Return type

**BankTransferPaymentDTO**

### Authorization

[OIDC Authentication](../README.md#OIDC Authentication)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**400** | Invalid request or payment cannot be confirmed |  -  |
|**403** | Forbidden |  -  |
|**200** | Payment confirmed successfully |  -  |
|**404** | Payment not found |  -  |
|**401** | Unauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **createPayment**
> BankTransferPaymentDTO createPayment(createPaymentRequest)


### Example

```typescript
import {
    PaymentControllerApi,
    Configuration,
    CreatePaymentRequest
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new PaymentControllerApi(configuration);

let createPaymentRequest: CreatePaymentRequest; //

const { status, data } = await apiInstance.createPayment(
    createPaymentRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createPaymentRequest** | **CreatePaymentRequest**|  | |


### Return type

**BankTransferPaymentDTO**

### Authorization

[OIDC Authentication](../README.md#OIDC Authentication)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**403** | Forbidden |  -  |
|**201** | Payment created successfully |  -  |
|**400** | Invalid request |  -  |
|**401** | Unauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **generateReference**
> PaymentReferenceDTO generateReference(generateReferenceRequest)

Generates a unique reference code for bank transfer payment

### Example

```typescript
import {
    PaymentControllerApi,
    Configuration,
    GenerateReferenceRequest
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new PaymentControllerApi(configuration);

let generateReferenceRequest: GenerateReferenceRequest; //

const { status, data } = await apiInstance.generateReference(
    generateReferenceRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **generateReferenceRequest** | **GenerateReferenceRequest**|  | |


### Return type

**PaymentReferenceDTO**

### Authorization

[OIDC Authentication](../README.md#OIDC Authentication)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Reference code generated successfully |  -  |
|**500** | Internal server error |  -  |
|**404** | Professor not found |  -  |
|**403** | Access forbidden |  -  |
|**400** | Invalid request |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getConfirmationHistory**
> Array<BankTransferPaymentDTO> getConfirmationHistory()


### Example

```typescript
import {
    PaymentControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new PaymentControllerApi(configuration);

let startDate: string; // (optional) (default to undefined)
let endDate: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.getConfirmationHistory(
    startDate,
    endDate
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **startDate** | [**string**] |  | (optional) defaults to undefined|
| **endDate** | [**string**] |  | (optional) defaults to undefined|


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

# **getConfirmationResult**
> PaymentConfirmationResultDTO getConfirmationResult()


### Example

```typescript
import {
    PaymentControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new PaymentControllerApi(configuration);

let paymentId: string; // (default to undefined)

const { status, data } = await apiInstance.getConfirmationResult(
    paymentId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **paymentId** | [**string**] |  | defaults to undefined|


### Return type

**PaymentConfirmationResultDTO**

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

# **getMyPayments**
> Array<BankTransferPaymentDTO> getMyPayments()


### Example

```typescript
import {
    PaymentControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new PaymentControllerApi(configuration);

const { status, data } = await apiInstance.getMyPayments();
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

# **getPaymentById**
> BankTransferPaymentDTO getPaymentById()


### Example

```typescript
import {
    PaymentControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new PaymentControllerApi(configuration);

let paymentId: string; // (default to undefined)

const { status, data } = await apiInstance.getPaymentById(
    paymentId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **paymentId** | [**string**] |  | defaults to undefined|


### Return type

**BankTransferPaymentDTO**

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

# **getPaymentForConfirmation**
> BankTransferPaymentDTO getPaymentForConfirmation()


### Example

```typescript
import {
    PaymentControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new PaymentControllerApi(configuration);

let paymentId: string; // (default to undefined)

const { status, data } = await apiInstance.getPaymentForConfirmation(
    paymentId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **paymentId** | [**string**] |  | defaults to undefined|


### Return type

**BankTransferPaymentDTO**

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

# **getPendingPayments**
> Array<BankTransferPaymentDTO> getPendingPayments()


### Example

```typescript
import {
    PaymentControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new PaymentControllerApi(configuration);

const { status, data } = await apiInstance.getPendingPayments();
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

# **getProfessorPaymentInfo**
> ProfessorPaymentInfoDTO getProfessorPaymentInfo()


### Example

```typescript
import {
    PaymentControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new PaymentControllerApi(configuration);

let professorId: string; // (default to undefined)

const { status, data } = await apiInstance.getProfessorPaymentInfo(
    professorId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **professorId** | [**string**] |  | defaults to undefined|


### Return type

**ProfessorPaymentInfoDTO**

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

# **rejectPayment**
> BankTransferPaymentDTO rejectPayment(paymentConfirmationRequest)


### Example

```typescript
import {
    PaymentControllerApi,
    Configuration,
    PaymentConfirmationRequest
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new PaymentControllerApi(configuration);

let paymentConfirmationRequest: PaymentConfirmationRequest; //

const { status, data } = await apiInstance.rejectPayment(
    paymentConfirmationRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **paymentConfirmationRequest** | **PaymentConfirmationRequest**|  | |


### Return type

**BankTransferPaymentDTO**

### Authorization

[OIDC Authentication](../README.md#OIDC Authentication)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**400** | Invalid request or payment cannot be rejected |  -  |
|**403** | Forbidden |  -  |
|**200** | Payment rejected successfully |  -  |
|**404** | Payment not found |  -  |
|**401** | Unauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **validateReference**
> ReferenceValidationResponseDTO validateReference(referenceValidationRequest)


### Example

```typescript
import {
    PaymentControllerApi,
    Configuration,
    ReferenceValidationRequest
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new PaymentControllerApi(configuration);

let referenceValidationRequest: ReferenceValidationRequest; //

const { status, data } = await apiInstance.validateReference(
    referenceValidationRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **referenceValidationRequest** | **ReferenceValidationRequest**|  | |


### Return type

**ReferenceValidationResponseDTO**

### Authorization

[OIDC Authentication](../README.md#OIDC Authentication)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**403** | Forbidden |  -  |
|**200** | Request successful |  -  |
|**400** | Invalid request |  -  |
|**401** | Unauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

