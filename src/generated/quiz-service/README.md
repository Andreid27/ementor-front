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

All URIs are relative to *https://api.e-mentor.ro/service3*

Class | Method | HTTP request | Description
------------ | ------------- | ------------- | -------------
*ChaptersControllerApi* | [**create2**](docs/ChaptersControllerApi.md#create2) | **POST** /chapter/create | Create a new chapter.
*ChaptersControllerApi* | [**delete2**](docs/ChaptersControllerApi.md#delete2) | **DELETE** /chapter/delete/{id} | Delete an existing chapter.
*ChaptersControllerApi* | [**get**](docs/ChaptersControllerApi.md#get) | **POST** /chapter/all-ids | Get chapters by id
*ChaptersControllerApi* | [**get3**](docs/ChaptersControllerApi.md#get3) | **GET** /chapter/{id} | Get chapter by id
*ChaptersControllerApi* | [**getPaginated2**](docs/ChaptersControllerApi.md#getpaginated2) | **POST** /chapter/paginated | Get paginated chapters
*ChaptersControllerApi* | [**update2**](docs/ChaptersControllerApi.md#update2) | **PUT** /chapter/update | Update an existing chapter.
*QuestionsControllerApi* | [**create1**](docs/QuestionsControllerApi.md#create1) | **POST** /question/create | Create a new question.
*QuestionsControllerApi* | [**delete1**](docs/QuestionsControllerApi.md#delete1) | **DELETE** /question/delete/{id} | Delete a existing question.
*QuestionsControllerApi* | [**get2**](docs/QuestionsControllerApi.md#get2) | **GET** /question/{id} | Get question by id
*QuestionsControllerApi* | [**getPaginated1**](docs/QuestionsControllerApi.md#getpaginated1) | **POST** /question/paginated | Get paginated questions
*QuestionsControllerApi* | [**update1**](docs/QuestionsControllerApi.md#update1) | **PUT** /question/update | Update a existing student profile.
*QuizzesControllerApi* | [**_delete**](docs/QuizzesControllerApi.md#_delete) | **DELETE** /quiz/delete/{id} | Delete an existing quiz.
*QuizzesControllerApi* | [**assign**](docs/QuizzesControllerApi.md#assign) | **POST** /quiz/assign | Assign a quiz to a student.
*QuizzesControllerApi* | [**create**](docs/QuizzesControllerApi.md#create) | **POST** /quiz/create | Create a new quiz.
*QuizzesControllerApi* | [**createComplete**](docs/QuizzesControllerApi.md#createcomplete) | **POST** /quiz/create-complete | Create a new quiz with all new questions.
*QuizzesControllerApi* | [**deleteAssigned**](docs/QuizzesControllerApi.md#deleteassigned) | **DELETE** /quiz/delete-assigned/{id} | Delete a assigned quiz attempt of a student.
*QuizzesControllerApi* | [**get1**](docs/QuizzesControllerApi.md#get1) | **GET** /quiz/{id} | Get quiz by id
*QuizzesControllerApi* | [**getAttempt**](docs/QuizzesControllerApi.md#getattempt) | **GET** /quiz/attempt/{id} | Get quiz by id
*QuizzesControllerApi* | [**getAttemptPreview**](docs/QuizzesControllerApi.md#getattemptpreview) | **GET** /quiz/attempt-preview/{id} | Get quiz student view by id
*QuizzesControllerApi* | [**getDashboardStats**](docs/QuizzesControllerApi.md#getdashboardstats) | **GET** /quiz/dashboard-stats | Get student stats by id
*QuizzesControllerApi* | [**getDashboardStats1**](docs/QuizzesControllerApi.md#getdashboardstats1) | **GET** /quiz/dashboard-stats/{id} | Get quiz by id
*QuizzesControllerApi* | [**getPaginated**](docs/QuizzesControllerApi.md#getpaginated) | **POST** /quiz/paginated | Get paginated quizzes
*QuizzesControllerApi* | [**getPaginatedQuizStudent**](docs/QuizzesControllerApi.md#getpaginatedquizstudent) | **POST** /quiz/assigned-paginated | Get paginated quizzes
*QuizzesControllerApi* | [**start**](docs/QuizzesControllerApi.md#start) | **GET** /quiz/start/{id} | Start quiz by id
*QuizzesControllerApi* | [**submit**](docs/QuizzesControllerApi.md#submit) | **POST** /quiz/submit | Submit a quiz.
*QuizzesControllerApi* | [**update**](docs/QuizzesControllerApi.md#update) | **PUT** /quiz/update | Update an existing quiz.
*QuizzesControllerApi* | [**updateComplete**](docs/QuizzesControllerApi.md#updatecomplete) | **PUT** /quiz/update-complete | Update quiz with all new questions.
*UserControllerApi* | [**getUsersWithRole**](docs/UserControllerApi.md#getuserswithrole) | **GET** /users/role/{roleName} | 


### Documentation For Models

 - [AssignQuizDTO](docs/AssignQuizDTO.md)
 - [Chapter](docs/Chapter.md)
 - [ChapterDTO](docs/ChapterDTO.md)
 - [CredentialRepresentation](docs/CredentialRepresentation.md)
 - [CredentialRepresentationConfig](docs/CredentialRepresentationConfig.md)
 - [FederatedIdentityRepresentation](docs/FederatedIdentityRepresentation.md)
 - [FilterCriteriaObject](docs/FilterCriteriaObject.md)
 - [FilterOptionObject](docs/FilterOptionObject.md)
 - [PaginatedRequest](docs/PaginatedRequest.md)
 - [PaginatedResponseChapter](docs/PaginatedResponseChapter.md)
 - [PaginatedResponseQuestion](docs/PaginatedResponseQuestion.md)
 - [PaginatedResponseQuizzesStudentsView](docs/PaginatedResponseQuizzesStudentsView.md)
 - [PaginatedResponseQuizzesView](docs/PaginatedResponseQuizzesView.md)
 - [Question](docs/Question.md)
 - [QuestionDTO](docs/QuestionDTO.md)
 - [QuizDTO](docs/QuizDTO.md)
 - [QuizStudent](docs/QuizStudent.md)
 - [QuizWriteDTO](docs/QuizWriteDTO.md)
 - [QuizzesStudentsView](docs/QuizzesStudentsView.md)
 - [QuizzesView](docs/QuizzesView.md)
 - [SocialLinkRepresentation](docs/SocialLinkRepresentation.md)
 - [SortCriteria](docs/SortCriteria.md)
 - [StudentQuestionsDTO](docs/StudentQuestionsDTO.md)
 - [StudentQuizResultDTO](docs/StudentQuizResultDTO.md)
 - [StudentQuizzesDTO](docs/StudentQuizzesDTO.md)
 - [StudentStatsDTO](docs/StudentStatsDTO.md)
 - [SubmitQuizDTO](docs/SubmitQuizDTO.md)
 - [SubmitedQuestionAnswer](docs/SubmitedQuestionAnswer.md)
 - [UserConsentRepresentation](docs/UserConsentRepresentation.md)
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
- **Authorization URL**: https://api.e-mentor.ro/auth/realms/e-mentor/protocol/openid-connect/auth
- **Scopes**: 
 - **openid**: OpenID Connect scope
 - **profile**: Access user profile information
 - **email**: Access user email

