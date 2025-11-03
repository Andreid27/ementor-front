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

All URIs are relative to *https://dev.api.e-mentor.ro*

Class | Method | HTTP request | Description
------------ | ------------- | ------------- | -------------
*HostFileControllerApi* | [**delete1**](docs/HostFileControllerApi.md#delete1) | **DELETE** /host-file/{id} | Delete a speciality by ID.
*HostFileControllerApi* | [**download**](docs/HostFileControllerApi.md#download) | **GET** /host-file/download/{fileId} | Download file
*HostFileControllerApi* | [**upload**](docs/HostFileControllerApi.md#upload) | **POST** /host-file/upload | Upload a document
*LessonControllerApi* | [**_delete**](docs/LessonControllerApi.md#_delete) | **DELETE** /lesson/delete/{id} | Delete a existing lesson.
*LessonControllerApi* | [**addTimeToLessonStudent**](docs/LessonControllerApi.md#addtimetolessonstudent) | **GET** /lesson/student-lesson-time/{id} | Add time to a lesson student.
*LessonControllerApi* | [**assign**](docs/LessonControllerApi.md#assign) | **POST** /lesson/assign | Assign a lesson to a student.
*LessonControllerApi* | [**create**](docs/LessonControllerApi.md#create) | **POST** /lesson/create | Create a new lesson.
*LessonControllerApi* | [**deleteAssigned**](docs/LessonControllerApi.md#deleteassigned) | **DELETE** /lesson/delete-assigned/{id} | Delete a assigned lesson of a student.
*LessonControllerApi* | [**deletePermanent**](docs/LessonControllerApi.md#deletepermanent) | **DELETE** /lesson/delete-permanent/{id} | Delete a existing lesson.
*LessonControllerApi* | [**get**](docs/LessonControllerApi.md#get) | **GET** /lesson/{id} | Get a lesson by ID
*LessonControllerApi* | [**getDashboardStats**](docs/LessonControllerApi.md#getdashboardstats) | **GET** /lesson/dashboard-stats | Get dashboard stats
*LessonControllerApi* | [**getPaginated**](docs/LessonControllerApi.md#getpaginated) | **POST** /lesson/paginated | Get paginated quizzes
*LessonControllerApi* | [**getPaginatedLessonStudent**](docs/LessonControllerApi.md#getpaginatedlessonstudent) | **POST** /lesson/assigned-paginated | Get paginated student lessons
*LessonControllerApi* | [**getStudentStats**](docs/LessonControllerApi.md#getstudentstats) | **GET** /lesson/dashboard-stats/{id} | Get student stats
*LessonControllerApi* | [**start**](docs/LessonControllerApi.md#start) | **GET** /lesson/student-lesson/{id} | Get a lesson by id
*LessonControllerApi* | [**update**](docs/LessonControllerApi.md#update) | **PUT** /lesson/update | Update an existing lesson.


### Documentation For Models

 - [AssignLessonDTO](docs/AssignLessonDTO.md)
 - [ChapterDTO](docs/ChapterDTO.md)
 - [FilterCriteriaObject](docs/FilterCriteriaObject.md)
 - [FilterOptionObject](docs/FilterOptionObject.md)
 - [HostFileDTO](docs/HostFileDTO.md)
 - [LessonDTO](docs/LessonDTO.md)
 - [LessonStudentView](docs/LessonStudentView.md)
 - [LessonView](docs/LessonView.md)
 - [PaginatedRequest](docs/PaginatedRequest.md)
 - [PaginatedResponseLessonStudentView](docs/PaginatedResponseLessonStudentView.md)
 - [PaginatedResponseLessonView](docs/PaginatedResponseLessonView.md)
 - [SortCriteria](docs/SortCriteria.md)


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

