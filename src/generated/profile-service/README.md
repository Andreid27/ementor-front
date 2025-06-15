## ementor-api-client@1.0

This generator creates TypeScript/JavaScript client that utilizes [axios](https://github.com/axios/axios). The generated Node module can be used in the following environments:

Environment
* Node.js
* Webpack
* Browserify

Language level
* ES5 - you must have a Promises/A+ library installed
* ES6

Module system
* CommonJS
* ES6 module system

It can be used in both TypeScript and JavaScript. In TypeScript, the definition will be automatically resolved via `package.json`. ([Reference](https://www.typescriptlang.org/docs/handbook/declaration-files/consumption.html))

### Building

To build and compile the typescript sources to javascript use:
```
npm install
npm run build
```

### Publishing

First build the package then run `npm publish`

### Consuming

navigate to the folder of your consuming project and run one of the following commands.

_published:_

```
npm install ementor-api-client@1.0 --save
```

_unPublished (not recommended):_

```
npm install PATH_TO_GENERATED_PACKAGE --save
```

### Documentation for API Endpoints

All URIs are relative to *https://dev.api.e-mentor.ro/service2*

Class | Method | HTTP request | Description
------------ | ------------- | ------------- | -------------
*BankAccountControllerApi* | [**getBankAccountsForProfessor**](docs/BankAccountControllerApi.md#getbankaccountsforprofessor) | **GET** /bank-account/professor/{professorId} | Get bank accounts for a professor
*EventsControllerApi* | [**cancelEventOccurrence**](docs/EventsControllerApi.md#canceleventoccurrence) | **POST** /events/occurrence/cancel | Cancel an event occurrence
*EventsControllerApi* | [**completeEventOccurrence**](docs/EventsControllerApi.md#completeeventoccurrence) | **POST** /events/occurrence/complete | Complete an event occurrence with attendance
*EventsControllerApi* | [**createRecurringSeries**](docs/EventsControllerApi.md#createrecurringseries) | **POST** /events/series | Create a new recurring series
*EventsControllerApi* | [**createSingularEvent**](docs/EventsControllerApi.md#createsingularevent) | **POST** /events/singular | Create a new singular event
*EventsControllerApi* | [**deleteSingularEvent**](docs/EventsControllerApi.md#deletesingularevent) | **DELETE** /events/singular/{eventId} | Delete a singular event
*EventsControllerApi* | [**getConsolidatedEvents**](docs/EventsControllerApi.md#getconsolidatedevents) | **GET** /events/consolidated | Get consolidated events for date range
*EventsControllerApi* | [**getConsolidatedEventsForProfessor**](docs/EventsControllerApi.md#getconsolidatedeventsforprofessor) | **GET** /events/consolidated/professor/{professorId} | Get consolidated events for a specific professor
*EventsControllerApi* | [**getMyEvents**](docs/EventsControllerApi.md#getmyevents) | **GET** /events/my-events | Get my events (for current professor)
*EventsControllerApi* | [**getMySingularEvents**](docs/EventsControllerApi.md#getmysingularevents) | **GET** /events/singular/my-events | Get my singular events
*EventsControllerApi* | [**getSingularEventsForProfessor**](docs/EventsControllerApi.md#getsingulareventsforprofessor) | **GET** /events/singular/professor/{professorId} | Get singular events for a specific professor
*EventsControllerApi* | [**modifyEventOccurrence**](docs/EventsControllerApi.md#modifyeventoccurrence) | **POST** /events/occurrence/modify | Modify/reschedule an event occurrence. It will be found by seriesId and originalStartTime.
*EventsControllerApi* | [**updateSingularEvent**](docs/EventsControllerApi.md#updatesingularevent) | **PUT** /events/singular/{eventId} | Update a singular event
*ProfessorProfileControllerApi* | [**create3**](docs/ProfessorProfileControllerApi.md#create3) | **POST** /professor-profile/create | Create a new student profile.
*ProfessorProfileControllerApi* | [**get3**](docs/ProfessorProfileControllerApi.md#get3) | **GET** /professor-profile/{id} | Get professor profile
*ProfessorProfileControllerApi* | [**getFull2**](docs/ProfessorProfileControllerApi.md#getfull2) | **GET** /professor-profile/get-full | Get full professor profile by user id
*ProfessorProfileControllerApi* | [**getFull3**](docs/ProfessorProfileControllerApi.md#getfull3) | **GET** /professor-profile/get-full/{userId} | Get full professor profile by user id
*ProfessorProfileControllerApi* | [**getPaginated1**](docs/ProfessorProfileControllerApi.md#getpaginated1) | **POST** /professor-profile/paginated | Get paginated professor profiles
*ProfessorProfileControllerApi* | [**getUserProfile1**](docs/ProfessorProfileControllerApi.md#getuserprofile1) | **GET** /professor-profile/get | Get current professor profile
*ProfessorProfileControllerApi* | [**update2**](docs/ProfessorProfileControllerApi.md#update2) | **PUT** /professor-profile/update | Update a existing student profile.
*ProfilePictureControllerApi* | [**download2**](docs/ProfilePictureControllerApi.md#download2) | **GET** /profile-image/download/{fileId} | Download file
*ProfilePictureControllerApi* | [**generateAllThumbnails**](docs/ProfilePictureControllerApi.md#generateallthumbnails) | **GET** /profile-image/generate/all-users | Generate thumbnails for all users
*ProfilePictureControllerApi* | [**upload**](docs/ProfilePictureControllerApi.md#upload) | **POST** /profile-image/upload | Upload a new image
*SpecialityControllerApi* | [**create2**](docs/SpecialityControllerApi.md#create2) | **POST** /speciality/create | Create a new speciality.
*SpecialityControllerApi* | [**delete1**](docs/SpecialityControllerApi.md#delete1) | **DELETE** /speciality/{id} | Delete a speciality by ID.
*SpecialityControllerApi* | [**get2**](docs/SpecialityControllerApi.md#get2) | **GET** /speciality/{id} | Get speciality
*SpecialityControllerApi* | [**getAll1**](docs/SpecialityControllerApi.md#getall1) | **GET** /speciality/get | Get all specialities
*SpecialityControllerApi* | [**register**](docs/SpecialityControllerApi.md#register) | **PUT** /speciality/update | Update a speciality.
*StudentProfileControllerApi* | [**create1**](docs/StudentProfileControllerApi.md#create1) | **POST** /student-profile/create | Create a new student profile.
*StudentProfileControllerApi* | [**deactivate**](docs/StudentProfileControllerApi.md#deactivate) | **DELETE** /student-profile/{id} | Deactivate student profile
*StudentProfileControllerApi* | [**get1**](docs/StudentProfileControllerApi.md#get1) | **GET** /student-profile/{id} | Get student profile
*StudentProfileControllerApi* | [**getFull**](docs/StudentProfileControllerApi.md#getfull) | **GET** /student-profile/get-full/{userId} | Get full student profile by user id
*StudentProfileControllerApi* | [**getFull1**](docs/StudentProfileControllerApi.md#getfull1) | **GET** /student-profile/get-full | Get full student profile by user id
*StudentProfileControllerApi* | [**getPaginated**](docs/StudentProfileControllerApi.md#getpaginated) | **POST** /student-profile/paginated | Get paginated workpoints
*StudentProfileControllerApi* | [**getProfilePrerequire**](docs/StudentProfileControllerApi.md#getprofileprerequire) | **GET** /student-profile/profile-prerequire | Get current initial data for creating student profile
*StudentProfileControllerApi* | [**getUserProfile**](docs/StudentProfileControllerApi.md#getuserprofile) | **GET** /student-profile/get | Get current student profile
*StudentProfileControllerApi* | [**update1**](docs/StudentProfileControllerApi.md#update1) | **PUT** /student-profile/update | Update a existing student profile.
*ThumbnailControllerApi* | [**download**](docs/ThumbnailControllerApi.md#download) | **GET** /thumbnail/download | Download file for the current user
*ThumbnailControllerApi* | [**download1**](docs/ThumbnailControllerApi.md#download1) | **GET** /thumbnail/download/{fileId} | Download file
*UniversityControllerApi* | [**_delete**](docs/UniversityControllerApi.md#_delete) | **DELETE** /university/{id} | Delete a university by ID.
*UniversityControllerApi* | [**create**](docs/UniversityControllerApi.md#create) | **POST** /university/create | Create a new university.
*UniversityControllerApi* | [**get**](docs/UniversityControllerApi.md#get) | **GET** /university/{id} | Get university
*UniversityControllerApi* | [**getAll**](docs/UniversityControllerApi.md#getall) | **GET** /university/get | Get all universities
*UniversityControllerApi* | [**update**](docs/UniversityControllerApi.md#update) | **PUT** /university/update | Create a new university.
*UserControllerApi* | [**getUserGroups**](docs/UserControllerApi.md#getusergroups) | **GET** /users/{userId}/groups | 
*UserControllerApi* | [**getUsersWithRole**](docs/UserControllerApi.md#getuserswithrole) | **GET** /users/role/{roleName} | 


### Documentation For Models

 - [Address](docs/Address.md)
 - [AddressDTO](docs/AddressDTO.md)
 - [BankAccount](docs/BankAccount.md)
 - [BankAccountDTO](docs/BankAccountDTO.md)
 - [CredentialRepresentation](docs/CredentialRepresentation.md)
 - [CredentialRepresentationConfig](docs/CredentialRepresentationConfig.md)
 - [EventOccurrence](docs/EventOccurrence.md)
 - [EventOccurrenceDTO](docs/EventOccurrenceDTO.md)
 - [EventOccurrenceDuration](docs/EventOccurrenceDuration.md)
 - [EventOccurrenceDurationUnitsInner](docs/EventOccurrenceDurationUnitsInner.md)
 - [EventOccurrenceDurationUnitsInnerDuration](docs/EventOccurrenceDurationUnitsInnerDuration.md)
 - [EventsDTO](docs/EventsDTO.md)
 - [FederatedIdentityRepresentation](docs/FederatedIdentityRepresentation.md)
 - [FilterCriteriaObject](docs/FilterCriteriaObject.md)
 - [FilterOptionObject](docs/FilterOptionObject.md)
 - [GroupDTO](docs/GroupDTO.md)
 - [Location](docs/Location.md)
 - [LocationDTO](docs/LocationDTO.md)
 - [LocationLevel](docs/LocationLevel.md)
 - [PaginatedRequest](docs/PaginatedRequest.md)
 - [PaginatedResponseProfessorProfileView](docs/PaginatedResponseProfessorProfileView.md)
 - [PaginatedResponseStudentProfileView](docs/PaginatedResponseStudentProfileView.md)
 - [ProfessorProfile](docs/ProfessorProfile.md)
 - [ProfessorProfileDTO](docs/ProfessorProfileDTO.md)
 - [ProfessorProfileView](docs/ProfessorProfileView.md)
 - [ProfilePicture](docs/ProfilePicture.md)
 - [ProfilePrerequrireDTO](docs/ProfilePrerequrireDTO.md)
 - [RecurringSeries](docs/RecurringSeries.md)
 - [RecurringSeriesDTO](docs/RecurringSeriesDTO.md)
 - [SingularEventDTO](docs/SingularEventDTO.md)
 - [SingularEventDTODuration](docs/SingularEventDTODuration.md)
 - [SingularEventDTODurationUnitsInner](docs/SingularEventDTODurationUnitsInner.md)
 - [SocialLinkRepresentation](docs/SocialLinkRepresentation.md)
 - [SortCriteria](docs/SortCriteria.md)
 - [Speciality](docs/Speciality.md)
 - [SpecialityDTO](docs/SpecialityDTO.md)
 - [StudentProfileDTO](docs/StudentProfileDTO.md)
 - [StudentProfileView](docs/StudentProfileView.md)
 - [University](docs/University.md)
 - [UniversityDTO](docs/UniversityDTO.md)
 - [UniversitySpecialitiesDTO](docs/UniversitySpecialitiesDTO.md)
 - [UniversitySpeciality](docs/UniversitySpeciality.md)
 - [UserConsentRepresentation](docs/UserConsentRepresentation.md)
 - [UserDTO](docs/UserDTO.md)
 - [UserProfileAttributeGroupMetadata](docs/UserProfileAttributeGroupMetadata.md)
 - [UserProfileAttributeMetadata](docs/UserProfileAttributeMetadata.md)
 - [UserProfileMetadata](docs/UserProfileMetadata.md)
 - [UserRepresentation](docs/UserRepresentation.md)


<a id="documentation-for-authorization"></a>
## Documentation For Authorization


Authentication schemes defined for the API:
<a id="OIDC Authentication"></a>
### OIDC Authentication

- **Type**: OAuth
- **Flow**: accessCode
- **Authorization URL**: https://dev.api.e-mentor.ro/auth/realms/e-mentor/protocol/openid-connect/auth
- **Scopes**: 
 - **openid**: OpenID Connect scope
 - **profile**: Access user profile information
 - **email**: Access user email

