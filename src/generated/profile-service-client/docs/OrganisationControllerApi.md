# OrganisationControllerApi

All URIs are relative to *http://localhost:49202*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createOrUpdateOrganisation**](#createorupdateorganisation) | **PUT** /organisations/{professorId} | Create or update organisation|
|[**deleteOrganisation**](#deleteorganisation) | **DELETE** /organisations/{professorId} | Delete organisation|
|[**getOrganisation**](#getorganisation) | **GET** /organisations/{professorId} | Get organisation by professor ID|

# **createOrUpdateOrganisation**
> OrganisationDto createOrUpdateOrganisation(organisationDto)


### Example

```typescript
import {
    OrganisationControllerApi,
    Configuration,
    OrganisationDto
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new OrganisationControllerApi(configuration);

let professorId: string; // (default to undefined)
let organisationDto: OrganisationDto; //

const { status, data } = await apiInstance.createOrUpdateOrganisation(
    professorId,
    organisationDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **organisationDto** | **OrganisationDto**|  | |
| **professorId** | [**string**] |  | defaults to undefined|


### Return type

**OrganisationDto**

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

# **deleteOrganisation**
> deleteOrganisation()


### Example

```typescript
import {
    OrganisationControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new OrganisationControllerApi(configuration);

let professorId: string; // (default to undefined)

const { status, data } = await apiInstance.deleteOrganisation(
    professorId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **professorId** | [**string**] |  | defaults to undefined|


### Return type

void (empty response body)

### Authorization

[OIDC Authentication](../README.md#OIDC Authentication)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getOrganisation**
> OrganisationDto getOrganisation()


### Example

```typescript
import {
    OrganisationControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new OrganisationControllerApi(configuration);

let professorId: string; // (default to undefined)

const { status, data } = await apiInstance.getOrganisation(
    professorId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **professorId** | [**string**] |  | defaults to undefined|


### Return type

**OrganisationDto**

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

