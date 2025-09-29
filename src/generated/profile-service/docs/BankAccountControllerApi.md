# BankAccountControllerApi

All URIs are relative to *https://dev.api.e-mentor.ro*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**getBankAccountsForProfessor**](#getbankaccountsforprofessor) | **GET** /bank-account/professor/{professorId} | Get bank accounts for a professor|

# **getBankAccountsForProfessor**
> Array<BankAccountDTO> getBankAccountsForProfessor()


### Example

```typescript
import {
    BankAccountControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new BankAccountControllerApi(configuration);

let professorId: string; // (default to undefined)

const { status, data } = await apiInstance.getBankAccountsForProfessor(
    professorId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **professorId** | [**string**] |  | defaults to undefined|


### Return type

**Array<BankAccountDTO>**

### Authorization

[OIDC Authentication](../README.md#OIDC Authentication)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Request successful |  -  |
|**400** | Invalid request |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

