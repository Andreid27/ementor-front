## ementor-api-client@1.0

This generator creates TypeScript/JavaScript client that utilizes [axios](https://github.com/axios/axios). The generated Node module can be used in the following environments:

Environment

- Node.js
- Webpack
- Browserify

Language level

- ES5 - you must have a Promises/A+ library installed
- ES6

Module system

- CommonJS
- ES6 module system

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

| Class                                       | Method                                                                                                               | HTTP request                                                                           | Description                                                                                |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| _BankAccountControllerApi_                  | [**getBankAccountsForProfessor**](docs/BankAccountControllerApi.md#getbankaccountsforprofessor)                      | **GET** /bank-account/professor/{professorId}                                          | Get bank accounts for a professor                                                          |
| _EventsControllerApi_                       | [**cancelEventOccurrence**](docs/EventsControllerApi.md#canceleventoccurrence)                                       | **POST** /events/occurrence/cancel                                                     | Cancel an event occurrence                                                                 |
| _EventsControllerApi_                       | [**completeEventOccurrence**](docs/EventsControllerApi.md#completeeventoccurrence)                                   | **POST** /events/occurrence/complete                                                   | Complete an event occurrence with attendance                                               |
| _EventsControllerApi_                       | [**createRecurringSeries**](docs/EventsControllerApi.md#createrecurringseries)                                       | **POST** /events/series                                                                | Create a new recurring series                                                              |
| _EventsControllerApi_                       | [**createSingularEvent**](docs/EventsControllerApi.md#createsingularevent)                                           | **POST** /events/singular                                                              | Create a new singular event                                                                |
| _EventsControllerApi_                       | [**deleteSingularEvent**](docs/EventsControllerApi.md#deletesingularevent)                                           | **DELETE** /events/singular/{eventId}                                                  | Delete a singular event                                                                    |
| _EventsControllerApi_                       | [**getAttendees**](docs/EventsControllerApi.md#getattendees)                                                         | **GET** /events/attendees                                                              | Get full user DTOs for expected attendees by series or occurrence ID                       |
| _EventsControllerApi_                       | [**getConsolidatedEvents**](docs/EventsControllerApi.md#getconsolidatedevents)                                       | **GET** /events/consolidated                                                           | Get consolidated events for date range                                                     |
| _EventsControllerApi_                       | [**getConsolidatedEventsForProfessor**](docs/EventsControllerApi.md#getconsolidatedeventsforprofessor)               | **GET** /events/consolidated/professor/{professorId}                                   | Get consolidated events for a specific professor                                           |
| _EventsControllerApi_                       | [**getMyEvents**](docs/EventsControllerApi.md#getmyevents)                                                           | **GET** /events/my-events                                                              | Get my events (for current professor)                                                      |
| _EventsControllerApi_                       | [**getMySingularEvents**](docs/EventsControllerApi.md#getmysingularevents)                                           | **GET** /events/singular/my-events                                                     | Get my singular events                                                                     |
| _EventsControllerApi_                       | [**getSingularEventsForProfessor**](docs/EventsControllerApi.md#getsingulareventsforprofessor)                       | **GET** /events/singular/professor/{professorId}                                       | Get singular events for a specific professor                                               |
| _EventsControllerApi_                       | [**modifyEventOccurrence**](docs/EventsControllerApi.md#modifyeventoccurrence)                                       | **POST** /events/occurrence/modify                                                     | Modify/reschedule an event occurrence. It will be found by seriesId and originalStartTime. |
| _EventsControllerApi_                       | [**setEventOccurrenceAttendeePrice**](docs/EventsControllerApi.md#seteventoccurrenceattendeeprice)                   | **PUT** /events/occurrence/{occurrenceId}/attendee-price                               | Set price for specific attendee in event occurrence                                        |
| _EventsControllerApi_                       | [**setRecurringSeriesAttendeePrice**](docs/EventsControllerApi.md#setrecurringseriesattendeeprice)                   | **PUT** /events/series/{seriesId}/attendee-price                                       | Set price for specific attendee in recurring series                                        |
| _EventsControllerApi_                       | [**setSingularEventAttendeePrice**](docs/EventsControllerApi.md#setsingulareventattendeeprice)                       | **PUT** /events/singular/{eventId}/attendee-price                                      | Set price for specific attendee in singular event                                          |
| _EventsControllerApi_                       | [**updateRecurringSeries**](docs/EventsControllerApi.md#updaterecurringseries)                                       | **PUT** /events/series/{seriesId}                                                      | Update a recurring series                                                                  |
| _EventsControllerApi_                       | [**updateSingularEvent**](docs/EventsControllerApi.md#updatesingularevent)                                           | **PUT** /events/singular/{eventId}                                                     | Update a singular event                                                                    |
| _ProfessorProfileControllerApi_             | [**create3**](docs/ProfessorProfileControllerApi.md#create3)                                                         | **POST** /professor-profile/create                                                     | Create a new student profile.                                                              |
| _ProfessorProfileControllerApi_             | [**get3**](docs/ProfessorProfileControllerApi.md#get3)                                                               | **GET** /professor-profile/{id}                                                        | Get professor profile                                                                      |
| _ProfessorProfileControllerApi_             | [**getFull2**](docs/ProfessorProfileControllerApi.md#getfull2)                                                       | **GET** /professor-profile/get-full                                                    | Get full professor profile by user id                                                      |
| _ProfessorProfileControllerApi_             | [**getFull3**](docs/ProfessorProfileControllerApi.md#getfull3)                                                       | **GET** /professor-profile/get-full/{userId}                                           | Get full professor profile by user id                                                      |
| _ProfessorProfileControllerApi_             | [**getPaginated1**](docs/ProfessorProfileControllerApi.md#getpaginated1)                                             | **POST** /professor-profile/paginated                                                  | Get paginated professor profiles                                                           |
| _ProfessorProfileControllerApi_             | [**getUserProfile1**](docs/ProfessorProfileControllerApi.md#getuserprofile1)                                         | **GET** /professor-profile/get                                                         | Get current professor profile                                                              |
| _ProfessorProfileControllerApi_             | [**update2**](docs/ProfessorProfileControllerApi.md#update2)                                                         | **PUT** /professor-profile/update                                                      | Update a existing student profile.                                                         |
| _ProfilePictureControllerApi_               | [**download2**](docs/ProfilePictureControllerApi.md#download2)                                                       | **GET** /profile-image/download/{fileId}                                               | Download file                                                                              |
| _ProfilePictureControllerApi_               | [**generateAllThumbnails**](docs/ProfilePictureControllerApi.md#generateallthumbnails)                               | **GET** /profile-image/generate/all-users                                              | Generate thumbnails for all users                                                          |
| _ProfilePictureControllerApi_               | [**upload**](docs/ProfilePictureControllerApi.md#upload)                                                             | **POST** /profile-image/upload                                                         | Upload a new image                                                                         |
| _SpecialityControllerApi_                   | [**create2**](docs/SpecialityControllerApi.md#create2)                                                               | **POST** /speciality/create                                                            | Create a new speciality.                                                                   |
| _SpecialityControllerApi_                   | [**delete1**](docs/SpecialityControllerApi.md#delete1)                                                               | **DELETE** /speciality/{id}                                                            | Delete a speciality by ID.                                                                 |
| _SpecialityControllerApi_                   | [**get2**](docs/SpecialityControllerApi.md#get2)                                                                     | **GET** /speciality/{id}                                                               | Get speciality                                                                             |
| _SpecialityControllerApi_                   | [**getAll1**](docs/SpecialityControllerApi.md#getall1)                                                               | **GET** /speciality/get                                                                | Get all specialities                                                                       |
| _SpecialityControllerApi_                   | [**register**](docs/SpecialityControllerApi.md#register)                                                             | **PUT** /speciality/update                                                             | Update a speciality.                                                                       |
| _StudentProfessorRelationshipControllerApi_ | [**createRelationship**](docs/StudentProfessorRelationshipControllerApi.md#createrelationship)                       | **POST** /student-professor-relationships                                              | Create a new student-professor relationship                                                |
| _StudentProfessorRelationshipControllerApi_ | [**deactivateRelationship**](docs/StudentProfessorRelationshipControllerApi.md#deactivaterelationship)               | **DELETE** /student-professor-relationships/{studentId}/{professorId}                  | Deactivate student-professor relationship                                                  |
| _StudentProfessorRelationshipControllerApi_ | [**getActiveProfessorsForStudent**](docs/StudentProfessorRelationshipControllerApi.md#getactiveprofessorsforstudent) | **GET** /student-professor-relationships/student/{studentId}/professors                | Get all active professors for a student                                                    |
| _StudentProfessorRelationshipControllerApi_ | [**getActiveStudentsForProfessor**](docs/StudentProfessorRelationshipControllerApi.md#getactivestudentsforprofessor) | **GET** /student-professor-relationships/professor/{professorId}/students              | Get all active students for a professor                                                    |
| _StudentProfessorRelationshipControllerApi_ | [**getDefaultPrice**](docs/StudentProfessorRelationshipControllerApi.md#getdefaultprice)                             | **GET** /student-professor-relationships/{studentId}/{professorId}/price               | Get default price for student-professor relationship                                       |
| _StudentProfessorRelationshipControllerApi_ | [**getPriceWithFallback**](docs/StudentProfessorRelationshipControllerApi.md#getpricewithfallback)                   | **GET** /student-professor-relationships/{studentId}/{professorId}/price-with-fallback | Get price with fallback logic                                                              |
| _StudentProfessorRelationshipControllerApi_ | [**hasActiveRelationship**](docs/StudentProfessorRelationshipControllerApi.md#hasactiverelationship)                 | **GET** /student-professor-relationships/{studentId}/{professorId}/exists              | Check if active relationship exists                                                        |
| _StudentProfessorRelationshipControllerApi_ | [**updateDefaultPrice**](docs/StudentProfessorRelationshipControllerApi.md#updatedefaultprice)                       | **PUT** /student-professor-relationships/{studentId}/{professorId}/price               | Update default price for student-professor relationship                                    |
| _StudentProfileControllerApi_               | [**create1**](docs/StudentProfileControllerApi.md#create1)                                                           | **POST** /student-profile/create                                                       | Create a new student profile.                                                              |
| _StudentProfileControllerApi_               | [**deactivate**](docs/StudentProfileControllerApi.md#deactivate)                                                     | **DELETE** /student-profile/{id}                                                       | Deactivate student profile                                                                 |
| _StudentProfileControllerApi_               | [**get1**](docs/StudentProfileControllerApi.md#get1)                                                                 | **GET** /student-profile/{id}                                                          | Get student profile                                                                        |
| _StudentProfileControllerApi_               | [**getFull**](docs/StudentProfileControllerApi.md#getfull)                                                           | **GET** /student-profile/get-full/{userId}                                             | Get full student profile by user id                                                        |
| _StudentProfileControllerApi_               | [**getFull1**](docs/StudentProfileControllerApi.md#getfull1)                                                         | **GET** /student-profile/get-full                                                      | Get full student profile by user id                                                        |
| _StudentProfileControllerApi_               | [**getPaginated**](docs/StudentProfileControllerApi.md#getpaginated)                                                 | **POST** /student-profile/paginated                                                    | Get paginated workpoints                                                                   |
| _StudentProfileControllerApi_               | [**getProfilePrerequire**](docs/StudentProfileControllerApi.md#getprofileprerequire)                                 | **GET** /student-profile/profile-prerequire                                            | Get current initial data for creating student profile                                      |
| _StudentProfileControllerApi_               | [**getUserProfile**](docs/StudentProfileControllerApi.md#getuserprofile)                                             | **GET** /student-profile/get                                                           | Get current student profile                                                                |
| _StudentProfileControllerApi_               | [**setDefaultPricePerSession**](docs/StudentProfileControllerApi.md#setdefaultpricepersession)                       | **PUT** /student-profile/{studentId}/default-price                                     | Set default price per session for a student                                                |
| _StudentProfileControllerApi_               | [**update1**](docs/StudentProfileControllerApi.md#update1)                                                           | **PUT** /student-profile/update                                                        | Update a existing student profile.                                                         |
| _ThumbnailControllerApi_                    | [**download**](docs/ThumbnailControllerApi.md#download)                                                              | **GET** /thumbnail/download                                                            | Download file for the current user                                                         |
| _ThumbnailControllerApi_                    | [**download1**](docs/ThumbnailControllerApi.md#download1)                                                            | **GET** /thumbnail/download/{fileId}                                                   | Download file                                                                              |
| _UniversityControllerApi_                   | [**\_delete**](docs/UniversityControllerApi.md#_delete)                                                              | **DELETE** /university/{id}                                                            | Delete a university by ID.                                                                 |
| _UniversityControllerApi_                   | [**create**](docs/UniversityControllerApi.md#create)                                                                 | **POST** /university/create                                                            | Create a new university.                                                                   |
| _UniversityControllerApi_                   | [**get**](docs/UniversityControllerApi.md#get)                                                                       | **GET** /university/{id}                                                               | Get university                                                                             |
| _UniversityControllerApi_                   | [**getAll**](docs/UniversityControllerApi.md#getall)                                                                 | **GET** /university/get                                                                | Get all universities                                                                       |
| _UniversityControllerApi_                   | [**update**](docs/UniversityControllerApi.md#update)                                                                 | **PUT** /university/update                                                             | Create a new university.                                                                   |
| _UserControllerApi_                         | [**getUserGroups**](docs/UserControllerApi.md#getusergroups)                                                         | **GET** /users/{userId}/groups                                                         |
| _UserControllerApi_                         | [**getUsersWithRole**](docs/UserControllerApi.md#getuserswithrole)                                                   | **GET** /users/role/{roleName}                                                         |

### Documentation For Models

- [Address](docs/Address.md)
- [AddressDTO](docs/AddressDTO.md)
- [BankAccount](docs/BankAccount.md)
- [BankAccountDTO](docs/BankAccountDTO.md)
- [CredentialRepresentation](docs/CredentialRepresentation.md)
- [CredentialRepresentationConfig](docs/CredentialRepresentationConfig.md)
- [EventAttendee](docs/EventAttendee.md)
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
- [StudentProfessorRelationship](docs/StudentProfessorRelationship.md)
- [StudentProfile](docs/StudentProfile.md)
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
