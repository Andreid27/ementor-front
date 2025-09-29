# WalletControllerApi

All URIs are relative to *https://dev.api.e-mentor.ro*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**getMyBalance**](#getmybalance) | **GET** /wallet/balance | Get current user\&#39;s wallet balance|
|[**getMyBalanceHistory**](#getmybalancehistory) | **GET** /wallet/history | Get current user\&#39;s wallet balance history|
|[**getMyWallet**](#getmywallet) | **GET** /wallet/my | Get current user\&#39;s wallet|
|[**getUserBalance**](#getuserbalance) | **GET** /wallet/balance/user/{userId} | Get balance by user ID (admin only)|
|[**getUserBalanceHistory**](#getuserbalancehistory) | **GET** /wallet/history/user/{userId} | Get balance history by user ID (admin only)|
|[**getUserWallet**](#getuserwallet) | **GET** /wallet/user/{userId} | Get wallet by user ID (admin only)|
|[**getUsersWithCredit**](#getuserswithcredit) | **GET** /wallet/with-credit | Get users with credit (admin only)|
|[**getUsersWithDebt**](#getuserswithdebt) | **GET** /wallet/with-debt | Get users with debt (admin only)|

# **getMyBalance**
> number getMyBalance()


### Example

```typescript
import {
    WalletControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new WalletControllerApi(configuration);

const { status, data } = await apiInstance.getMyBalance();
```

### Parameters
This endpoint does not have any parameters.


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

# **getMyBalanceHistory**
> WalletSummaryDTO getMyBalanceHistory()


### Example

```typescript
import {
    WalletControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new WalletControllerApi(configuration);

const { status, data } = await apiInstance.getMyBalanceHistory();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**WalletSummaryDTO**

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

# **getMyWallet**
> WalletDTO getMyWallet()


### Example

```typescript
import {
    WalletControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new WalletControllerApi(configuration);

const { status, data } = await apiInstance.getMyWallet();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**WalletDTO**

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

# **getUserBalance**
> number getUserBalance()


### Example

```typescript
import {
    WalletControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new WalletControllerApi(configuration);

let userId: string; // (default to undefined)

const { status, data } = await apiInstance.getUserBalance(
    userId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **userId** | [**string**] |  | defaults to undefined|


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
|**404** | User not found |  -  |
|**401** | Unauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getUserBalanceHistory**
> Array<WalletBalanceChangeDTO> getUserBalanceHistory()


### Example

```typescript
import {
    WalletControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new WalletControllerApi(configuration);

let userId: string; // (default to undefined)

const { status, data } = await apiInstance.getUserBalanceHistory(
    userId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **userId** | [**string**] |  | defaults to undefined|


### Return type

**Array<WalletBalanceChangeDTO>**

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
|**404** | User not found |  -  |
|**401** | Unauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getUserWallet**
> WalletDTO getUserWallet()


### Example

```typescript
import {
    WalletControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new WalletControllerApi(configuration);

let userId: string; // (default to undefined)

const { status, data } = await apiInstance.getUserWallet(
    userId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **userId** | [**string**] |  | defaults to undefined|


### Return type

**WalletDTO**

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
|**404** | User not found |  -  |
|**401** | Unauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getUsersWithCredit**
> Array<WalletDTO> getUsersWithCredit()


### Example

```typescript
import {
    WalletControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new WalletControllerApi(configuration);

const { status, data } = await apiInstance.getUsersWithCredit();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**Array<WalletDTO>**

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

# **getUsersWithDebt**
> Array<WalletDTO> getUsersWithDebt()


### Example

```typescript
import {
    WalletControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new WalletControllerApi(configuration);

const { status, data } = await apiInstance.getUsersWithDebt();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**Array<WalletDTO>**

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

