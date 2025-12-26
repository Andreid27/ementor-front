# EventsControllerApi

All URIs are relative to *http://localhost:49202*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**cancelEventOccurrence**](#canceleventoccurrence) | **POST** /events/occurrence/cancel | Cancel an event occurrence|
|[**completeEventOccurrence**](#completeeventoccurrence) | **POST** /events/occurrence/complete | Complete an event occurrence with attendance|
|[**createRecurringSeries**](#createrecurringseries) | **POST** /events/series | Create a new recurring series|
|[**createSingularEvent**](#createsingularevent) | **POST** /events/singular | Create a new singular event|
|[**deleteSingularEvent**](#deletesingularevent) | **DELETE** /events/singular/{eventId} | Delete a singular event|
|[**getAttendees**](#getattendees) | **GET** /events/attendees | Get full user DTOs for expected attendees by series or occurrence ID|
|[**getConsolidatedEvents**](#getconsolidatedevents) | **GET** /events/consolidated | Get consolidated events for date range|
|[**getConsolidatedEventsForProfessor**](#getconsolidatedeventsforprofessor) | **GET** /events/consolidated/professor/{professorId} | Get consolidated events for a specific professor|
|[**getEventOccurrenceByEventAttendeeId**](#geteventoccurrencebyeventattendeeid) | **GET** /events/event-occurrence/{eventAttendeeId} | Get event occurrence by event attendee ID|
|[**getMyEvents**](#getmyevents) | **GET** /events/my-events | Get my events (for current professor)|
|[**getMyRecurringSeries**](#getmyrecurringseries) | **GET** /events/series | Get my recurring series|
|[**getMySingularEvents**](#getmysingularevents) | **GET** /events/singular/my-events | Get my singular events|
|[**getSingularEventsForProfessor**](#getsingulareventsforprofessor) | **GET** /events/singular/professor/{professorId} | Get singular events for a specific professor|
|[**modifyEventOccurrence**](#modifyeventoccurrence) | **POST** /events/occurrence/modify | Modify/reschedule an event occurrence. It will be found by seriesId and originalStartTime.|
|[**setEventOccurrenceAttendeePrice**](#seteventoccurrenceattendeeprice) | **PUT** /events/occurrence/{occurrenceId}/attendee-price | Set price for specific attendee in event occurrence|
|[**setRecurringSeriesAttendeePrice**](#setrecurringseriesattendeeprice) | **PUT** /events/series/{seriesId}/attendee-price | Set price for specific attendee in recurring series|
|[**setSingularEventAttendeePrice**](#setsingulareventattendeeprice) | **PUT** /events/singular/{eventId}/attendee-price | Set price for specific attendee in singular event|
|[**updateRecurringSeries**](#updaterecurringseries) | **PUT** /events/series/{seriesId} | Update a recurring series|
|[**updateSingularEvent**](#updatesingularevent) | **PUT** /events/singular/{eventId} | Update a singular event|

# **cancelEventOccurrence**
> EventOccurrenceDTO cancelEventOccurrence()


### Example

```typescript
import {
    EventsControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new EventsControllerApi(configuration);

let seriesId: string; // (default to undefined)
let originalStartTime: string; // (default to undefined)

const { status, data } = await apiInstance.cancelEventOccurrence(
    seriesId,
    originalStartTime
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **seriesId** | [**string**] |  | defaults to undefined|
| **originalStartTime** | [**string**] |  | defaults to undefined|


### Return type

**EventOccurrenceDTO**

### Authorization

[OIDC Authentication](../README.md#OIDC Authentication)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Event cancelled successfully |  -  |
|**400** | Invalid request |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **completeEventOccurrence**
> EventOccurrenceDTO completeEventOccurrence(eventAttendeeDTO)


### Example

```typescript
import {
    EventsControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new EventsControllerApi(configuration);

let originalStartTime: string; // (default to undefined)
let actualStartTime: string; // (default to undefined)
let actualEndTime: string; // (default to undefined)
let eventAttendeeDTO: Array<EventAttendeeDTO>; //
let singularEventId: string; // (optional) (default to undefined)
let seriesId: string; // (optional) (default to undefined)
let description: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.completeEventOccurrence(
    originalStartTime,
    actualStartTime,
    actualEndTime,
    eventAttendeeDTO,
    singularEventId,
    seriesId,
    description
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **eventAttendeeDTO** | **Array<EventAttendeeDTO>**|  | |
| **originalStartTime** | [**string**] |  | defaults to undefined|
| **actualStartTime** | [**string**] |  | defaults to undefined|
| **actualEndTime** | [**string**] |  | defaults to undefined|
| **singularEventId** | [**string**] |  | (optional) defaults to undefined|
| **seriesId** | [**string**] |  | (optional) defaults to undefined|
| **description** | [**string**] |  | (optional) defaults to undefined|


### Return type

**EventOccurrenceDTO**

### Authorization

[OIDC Authentication](../README.md#OIDC Authentication)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Event completed successfully |  -  |
|**400** | Invalid request |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **createRecurringSeries**
> RecurringSeriesDTO createRecurringSeries(recurringSeriesDTO)


### Example

```typescript
import {
    EventsControllerApi,
    Configuration,
    RecurringSeriesDTO
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new EventsControllerApi(configuration);

let recurringSeriesDTO: RecurringSeriesDTO; //

const { status, data } = await apiInstance.createRecurringSeries(
    recurringSeriesDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **recurringSeriesDTO** | **RecurringSeriesDTO**|  | |


### Return type

**RecurringSeriesDTO**

### Authorization

[OIDC Authentication](../README.md#OIDC Authentication)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | Series created successfully |  -  |
|**400** | Invalid request |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **createSingularEvent**
> SingularEventDTO createSingularEvent(singularEventDTO)


### Example

```typescript
import {
    EventsControllerApi,
    Configuration,
    SingularEventDTO
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new EventsControllerApi(configuration);

let singularEventDTO: SingularEventDTO; //

const { status, data } = await apiInstance.createSingularEvent(
    singularEventDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **singularEventDTO** | **SingularEventDTO**|  | |


### Return type

**SingularEventDTO**

### Authorization

[OIDC Authentication](../README.md#OIDC Authentication)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | Singular event created successfully |  -  |
|**400** | Invalid request |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deleteSingularEvent**
> deleteSingularEvent()


### Example

```typescript
import {
    EventsControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new EventsControllerApi(configuration);

let eventId: string; // (default to undefined)

const { status, data } = await apiInstance.deleteSingularEvent(
    eventId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **eventId** | [**string**] |  | defaults to undefined|


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
|**200** | Singular event deleted successfully |  -  |
|**404** | Event not found |  -  |
|**400** | Invalid request |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getAttendees**
> Array<UserDTO> getAttendees()


### Example

```typescript
import {
    EventsControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new EventsControllerApi(configuration);

let seriesId: string; // (optional) (default to undefined)
let occurrenceId: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.getAttendees(
    seriesId,
    occurrenceId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **seriesId** | [**string**] |  | (optional) defaults to undefined|
| **occurrenceId** | [**string**] |  | (optional) defaults to undefined|


### Return type

**Array<UserDTO>**

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

# **getConsolidatedEvents**
> Array<EventOccurrenceDTO> getConsolidatedEvents()

Returns merged events from RecurringSeries and EventOccurrence. EventOccurrence overrides RecurringSeries for same time. Cancelled events are excluded entirely.

### Example

```typescript
import {
    EventsControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new EventsControllerApi(configuration);

let startDate: string; // (default to undefined)
let endDate: string; // (default to undefined)

const { status, data } = await apiInstance.getConsolidatedEvents(
    startDate,
    endDate
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **startDate** | [**string**] |  | defaults to undefined|
| **endDate** | [**string**] |  | defaults to undefined|


### Return type

**Array<EventOccurrenceDTO>**

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

# **getConsolidatedEventsForProfessor**
> Array<EventOccurrenceDTO> getConsolidatedEventsForProfessor()


### Example

```typescript
import {
    EventsControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new EventsControllerApi(configuration);

let professorId: string; // (default to undefined)
let startDate: string; // (default to undefined)
let endDate: string; // (default to undefined)

const { status, data } = await apiInstance.getConsolidatedEventsForProfessor(
    professorId,
    startDate,
    endDate
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **professorId** | [**string**] |  | defaults to undefined|
| **startDate** | [**string**] |  | defaults to undefined|
| **endDate** | [**string**] |  | defaults to undefined|


### Return type

**Array<EventOccurrenceDTO>**

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

# **getEventOccurrenceByEventAttendeeId**
> EventOccurrenceDTO getEventOccurrenceByEventAttendeeId()


### Example

```typescript
import {
    EventsControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new EventsControllerApi(configuration);

let eventAttendeeId: string; // (default to undefined)

const { status, data } = await apiInstance.getEventOccurrenceByEventAttendeeId(
    eventAttendeeId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **eventAttendeeId** | [**string**] |  | defaults to undefined|


### Return type

**EventOccurrenceDTO**

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

# **getMyEvents**
> EventsDTO getMyEvents()


### Example

```typescript
import {
    EventsControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new EventsControllerApi(configuration);

let startDate: string; // (default to undefined)
let endDate: string; // (default to undefined)

const { status, data } = await apiInstance.getMyEvents(
    startDate,
    endDate
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **startDate** | [**string**] |  | defaults to undefined|
| **endDate** | [**string**] |  | defaults to undefined|


### Return type

**EventsDTO**

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

# **getMyRecurringSeries**
> Array<RecurringSeriesDTO> getMyRecurringSeries()


### Example

```typescript
import {
    EventsControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new EventsControllerApi(configuration);

const { status, data } = await apiInstance.getMyRecurringSeries();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**Array<RecurringSeriesDTO>**

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

# **getMySingularEvents**
> Array<SingularEventDTO> getMySingularEvents()


### Example

```typescript
import {
    EventsControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new EventsControllerApi(configuration);

let startDate: string; // (default to undefined)
let endDate: string; // (default to undefined)

const { status, data } = await apiInstance.getMySingularEvents(
    startDate,
    endDate
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **startDate** | [**string**] |  | defaults to undefined|
| **endDate** | [**string**] |  | defaults to undefined|


### Return type

**Array<SingularEventDTO>**

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

# **getSingularEventsForProfessor**
> Array<SingularEventDTO> getSingularEventsForProfessor()


### Example

```typescript
import {
    EventsControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new EventsControllerApi(configuration);

let professorId: string; // (default to undefined)
let startDate: string; // (default to undefined)
let endDate: string; // (default to undefined)

const { status, data } = await apiInstance.getSingularEventsForProfessor(
    professorId,
    startDate,
    endDate
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **professorId** | [**string**] |  | defaults to undefined|
| **startDate** | [**string**] |  | defaults to undefined|
| **endDate** | [**string**] |  | defaults to undefined|


### Return type

**Array<SingularEventDTO>**

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

# **modifyEventOccurrence**
> EventOccurrenceDTO modifyEventOccurrence(eventAttendeeDTO)


### Example

```typescript
import {
    EventsControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new EventsControllerApi(configuration);

let seriesId: string; // (default to undefined)
let originalStartTime: string; // (default to undefined)
let newStartTime: string; // (default to undefined)
let eventAttendeeDTO: Array<EventAttendeeDTO>; //
let duration: string; // (optional) (default to undefined)
let newPrice: number; // (optional) (default to undefined)
let newMeetingLink: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.modifyEventOccurrence(
    seriesId,
    originalStartTime,
    newStartTime,
    eventAttendeeDTO,
    duration,
    newPrice,
    newMeetingLink
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **eventAttendeeDTO** | **Array<EventAttendeeDTO>**|  | |
| **seriesId** | [**string**] |  | defaults to undefined|
| **originalStartTime** | [**string**] |  | defaults to undefined|
| **newStartTime** | [**string**] |  | defaults to undefined|
| **duration** | [**string**] |  | (optional) defaults to undefined|
| **newPrice** | [**number**] |  | (optional) defaults to undefined|
| **newMeetingLink** | [**string**] |  | (optional) defaults to undefined|


### Return type

**EventOccurrenceDTO**

### Authorization

[OIDC Authentication](../README.md#OIDC Authentication)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Event modified successfully |  -  |
|**400** | Invalid request |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **setEventOccurrenceAttendeePrice**
> setEventOccurrenceAttendeePrice()

Sets or updates the price for a specific attendee in an event occurrence. Uses transaction-safe operations. Requires PROFESSOR or ADMIN role.

### Example

```typescript
import {
    EventsControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new EventsControllerApi(configuration);

let occurrenceId: string; // (default to undefined)
let attendeeId: string; // (default to undefined)
let price: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.setEventOccurrenceAttendeePrice(
    occurrenceId,
    attendeeId,
    price
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **occurrenceId** | [**string**] |  | defaults to undefined|
| **attendeeId** | [**string**] |  | defaults to undefined|
| **price** | [**number**] |  | (optional) defaults to undefined|


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
|**403** | Access denied |  -  |
|**200** | Attendee price set successfully |  -  |
|**400** | Invalid request |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **setRecurringSeriesAttendeePrice**
> setRecurringSeriesAttendeePrice()

Sets or updates the price for a specific attendee in a recurring series. Uses transaction-safe operations. Requires PROFESSOR or ADMIN role.

### Example

```typescript
import {
    EventsControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new EventsControllerApi(configuration);

let seriesId: string; // (default to undefined)
let attendeeId: string; // (default to undefined)
let price: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.setRecurringSeriesAttendeePrice(
    seriesId,
    attendeeId,
    price
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **seriesId** | [**string**] |  | defaults to undefined|
| **attendeeId** | [**string**] |  | defaults to undefined|
| **price** | [**number**] |  | (optional) defaults to undefined|


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
|**403** | Access denied |  -  |
|**200** | Attendee price set successfully |  -  |
|**400** | Invalid request |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **setSingularEventAttendeePrice**
> setSingularEventAttendeePrice()

Sets or updates the price for a specific attendee in a singular event. Uses transaction-safe operations. Requires PROFESSOR or ADMIN role.

### Example

```typescript
import {
    EventsControllerApi,
    Configuration
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new EventsControllerApi(configuration);

let eventId: string; // (default to undefined)
let attendeeId: string; // (default to undefined)
let price: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.setSingularEventAttendeePrice(
    eventId,
    attendeeId,
    price
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **eventId** | [**string**] |  | defaults to undefined|
| **attendeeId** | [**string**] |  | defaults to undefined|
| **price** | [**number**] |  | (optional) defaults to undefined|


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
|**403** | Access denied |  -  |
|**200** | Attendee price set successfully |  -  |
|**400** | Invalid request |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateRecurringSeries**
> RecurringSeriesDTO updateRecurringSeries(recurringSeriesDTO)


### Example

```typescript
import {
    EventsControllerApi,
    Configuration,
    RecurringSeriesDTO
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new EventsControllerApi(configuration);

let seriesId: string; // (default to undefined)
let recurringSeriesDTO: RecurringSeriesDTO; //

const { status, data } = await apiInstance.updateRecurringSeries(
    seriesId,
    recurringSeriesDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **recurringSeriesDTO** | **RecurringSeriesDTO**|  | |
| **seriesId** | [**string**] |  | defaults to undefined|


### Return type

**RecurringSeriesDTO**

### Authorization

[OIDC Authentication](../README.md#OIDC Authentication)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Series updated successfully |  -  |
|**404** | Series not found |  -  |
|**400** | Invalid request |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateSingularEvent**
> SingularEventDTO updateSingularEvent(singularEventDTO)


### Example

```typescript
import {
    EventsControllerApi,
    Configuration,
    SingularEventDTO
} from 'ementor-api-client';

const configuration = new Configuration();
const apiInstance = new EventsControllerApi(configuration);

let eventId: string; // (default to undefined)
let singularEventDTO: SingularEventDTO; //

const { status, data } = await apiInstance.updateSingularEvent(
    eventId,
    singularEventDTO
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **singularEventDTO** | **SingularEventDTO**|  | |
| **eventId** | [**string**] |  | defaults to undefined|


### Return type

**SingularEventDTO**

### Authorization

[OIDC Authentication](../README.md#OIDC Authentication)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**404** | Event not found |  -  |
|**200** | Singular event updated successfully |  -  |
|**400** | Invalid request |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

