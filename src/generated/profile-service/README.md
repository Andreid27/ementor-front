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
*AdminPaymentControllerApi* | [**getAllPayments**](docs/AdminPaymentControllerApi.md#getallpayments) | **GET** /admin/payment-system/payments | Get all payments with filtering and pagination (admin only)
*AdminPaymentControllerApi* | [**getAllPendingPayments**](docs/AdminPaymentControllerApi.md#getallpendingpayments) | **GET** /admin/payment-system/payments/pending | Get all pending payments (admin only)
*AdminPaymentControllerApi* | [**getAllWallets**](docs/AdminPaymentControllerApi.md#getallwallets) | **GET** /admin/payment-system/wallets | Get all wallets with pagination (admin only)
*AdminPaymentControllerApi* | [**getEventDebtSummary1**](docs/AdminPaymentControllerApi.md#geteventdebtsummary1) | **GET** /admin/payment-system/fifo/events/{eventId}/debt-summary | Get event debt summary for administrative oversight (admin only)
*AdminPaymentControllerApi* | [**getFIFOStatistics**](docs/AdminPaymentControllerApi.md#getfifostatistics) | **GET** /admin/payment-system/fifo/statistics | Get enhanced payment system statistics with FIFO metrics (admin only)
*AdminPaymentControllerApi* | [**getPaymentAllocations**](docs/AdminPaymentControllerApi.md#getpaymentallocations) | **GET** /admin/payment-system/fifo/payments/{paymentId}/allocations | Get payment allocation details (admin only)
*AdminPaymentControllerApi* | [**getPaymentSystemStatistics**](docs/AdminPaymentControllerApi.md#getpaymentsystemstatistics) | **GET** /admin/payment-system/statistics | Get payment system statistics (admin only)
*AdminPaymentControllerApi* | [**getPaymentsByPayer**](docs/AdminPaymentControllerApi.md#getpaymentsbypayer) | **GET** /admin/payment-system/payments/payer/{payerId} | Get payments by payer ID (admin only)
*AdminPaymentControllerApi* | [**getPaymentsByProfessor**](docs/AdminPaymentControllerApi.md#getpaymentsbyprofessor) | **GET** /admin/payment-system/payments/professor/{professorId} | Get payments by professor ID (admin only)
*AdminPaymentControllerApi* | [**getProfessorPaymentSummary1**](docs/AdminPaymentControllerApi.md#getprofessorpaymentsummary1) | **GET** /admin/payment-system/fifo/professors/{professorId}/payment-summary | Get professor payment summary with FIFO analytics (admin only)
*AdminPaymentControllerApi* | [**getRecentPayments**](docs/AdminPaymentControllerApi.md#getrecentpayments) | **GET** /admin/payment-system/payments/recent | Get recent payments (admin only)
*AdminPaymentControllerApi* | [**getStudentDebtSummary1**](docs/AdminPaymentControllerApi.md#getstudentdebtsummary1) | **GET** /admin/payment-system/fifo/students/{studentId}/professors/{professorId}/debt-summary | Get student debt summary for administrative review (admin only)
*AdminPaymentControllerApi* | [**getTotalDebt1**](docs/AdminPaymentControllerApi.md#gettotaldebt1) | **GET** /admin/payment-system/fifo/students/{studentId}/professors/{professorId}/total-debt | Calculate total debt for administrative overview (admin only)
*AdminPaymentControllerApi* | [**syncStudentSoloClients**](docs/AdminPaymentControllerApi.md#syncstudentsoloclients) | **GET** /admin/payment-system/sync-student-solo-clients/{userId} | Sync student solo clients with payment system (admin only)
*BankAccountControllerApi* | [**getBankAccountsForProfessor**](docs/BankAccountControllerApi.md#getbankaccountsforprofessor) | **GET** /bank-account/professor/{professorId} | Get bank accounts for a professor
*EventsControllerApi* | [**cancelEventOccurrence**](docs/EventsControllerApi.md#canceleventoccurrence) | **POST** /events/occurrence/cancel | Cancel an event occurrence
*EventsControllerApi* | [**completeEventOccurrence**](docs/EventsControllerApi.md#completeeventoccurrence) | **POST** /events/occurrence/complete | Complete an event occurrence with attendance
*EventsControllerApi* | [**createRecurringSeries**](docs/EventsControllerApi.md#createrecurringseries) | **POST** /events/series | Create a new recurring series
*EventsControllerApi* | [**createSingularEvent**](docs/EventsControllerApi.md#createsingularevent) | **POST** /events/singular | Create a new singular event
*EventsControllerApi* | [**deleteSingularEvent**](docs/EventsControllerApi.md#deletesingularevent) | **DELETE** /events/singular/{eventId} | Delete a singular event
*EventsControllerApi* | [**getAttendees**](docs/EventsControllerApi.md#getattendees) | **GET** /events/attendees | Get full user DTOs for expected attendees by series or occurrence ID
*EventsControllerApi* | [**getConsolidatedEvents**](docs/EventsControllerApi.md#getconsolidatedevents) | **GET** /events/consolidated | Get consolidated events for date range
*EventsControllerApi* | [**getConsolidatedEventsForProfessor**](docs/EventsControllerApi.md#getconsolidatedeventsforprofessor) | **GET** /events/consolidated/professor/{professorId} | Get consolidated events for a specific professor
*EventsControllerApi* | [**getMyEvents**](docs/EventsControllerApi.md#getmyevents) | **GET** /events/my-events | Get my events (for current professor)
*EventsControllerApi* | [**getMySingularEvents**](docs/EventsControllerApi.md#getmysingularevents) | **GET** /events/singular/my-events | Get my singular events
*EventsControllerApi* | [**getSingularEventsForProfessor**](docs/EventsControllerApi.md#getsingulareventsforprofessor) | **GET** /events/singular/professor/{professorId} | Get singular events for a specific professor
*EventsControllerApi* | [**modifyEventOccurrence**](docs/EventsControllerApi.md#modifyeventoccurrence) | **POST** /events/occurrence/modify | Modify/reschedule an event occurrence. It will be found by seriesId and originalStartTime.
*EventsControllerApi* | [**setEventOccurrenceAttendeePrice**](docs/EventsControllerApi.md#seteventoccurrenceattendeeprice) | **PUT** /events/occurrence/{occurrenceId}/attendee-price | Set price for specific attendee in event occurrence
*EventsControllerApi* | [**setRecurringSeriesAttendeePrice**](docs/EventsControllerApi.md#setrecurringseriesattendeeprice) | **PUT** /events/series/{seriesId}/attendee-price | Set price for specific attendee in recurring series
*EventsControllerApi* | [**setSingularEventAttendeePrice**](docs/EventsControllerApi.md#setsingulareventattendeeprice) | **PUT** /events/singular/{eventId}/attendee-price | Set price for specific attendee in singular event
*EventsControllerApi* | [**updateRecurringSeries**](docs/EventsControllerApi.md#updaterecurringseries) | **PUT** /events/series/{seriesId} | Update a recurring series
*EventsControllerApi* | [**updateSingularEvent**](docs/EventsControllerApi.md#updatesingularevent) | **PUT** /events/singular/{eventId} | Update a singular event
*FIFOAllocationApi* | [**getEventDebtSummary**](docs/FIFOAllocationApi.md#geteventdebtsummary) | **GET** /fifo/events/{eventId}/debt-summary | Get event debt summary
*FIFOAllocationApi* | [**getPaymentDetails**](docs/FIFOAllocationApi.md#getpaymentdetails) | **GET** /fifo/payments/{paymentId}/details | Get detailed payment information
*FIFOAllocationApi* | [**getProfessorPaymentSummary**](docs/FIFOAllocationApi.md#getprofessorpaymentsummary) | **GET** /fifo/payments/professor/summary | Get professor payment summary
*FIFOAllocationApi* | [**getProfessorPaymentSummaryAdmin**](docs/FIFOAllocationApi.md#getprofessorpaymentsummaryadmin) | **GET** /fifo/payments/professor/{professorId}/summary | Get payment summary for specific professor
*FIFOAllocationApi* | [**getStudentDebtSummary**](docs/FIFOAllocationApi.md#getstudentdebtsummary) | **GET** /fifo/debt/student/professor/{professorId} | Get student debt summary for specific professor
*FIFOAllocationApi* | [**getStudentDebtSummaryAdmin**](docs/FIFOAllocationApi.md#getstudentdebtsummaryadmin) | **GET** /fifo/debt/student/{studentId}/professor/{professorId} | Get debt summary for specific student and professor
*FIFOAllocationApi* | [**getTotalDebt**](docs/FIFOAllocationApi.md#gettotaldebt) | **GET** /fifo/debt/total/professor/{professorId} | Calculate total outstanding debt
*FIFOAllocationApi* | [**getTotalDebtAdmin**](docs/FIFOAllocationApi.md#gettotaldebtadmin) | **GET** /fifo/debt/total/student/{studentId}/professor/{professorId} | Calculate total debt for specific student
*FIFOAllocationApi* | [**healthCheck**](docs/FIFOAllocationApi.md#healthcheck) | **GET** /fifo/health | FIFO service health check
*FIFOAllocationApi* | [**simulatePaymentAllocation**](docs/FIFOAllocationApi.md#simulatepaymentallocation) | **GET** /fifo/simulate/student/professor/{professorId}/amount/{amount} | Simulate FIFO allocation for payment amount
*HostFileControllerApi* | [**delete2**](docs/HostFileControllerApi.md#delete2) | **DELETE** /host-file/{id} | Delete a speciality by ID.
*HostFileControllerApi* | [**download3**](docs/HostFileControllerApi.md#download3) | **GET** /host-file/download/{fileId} | Download file
*HostFileControllerApi* | [**upload1**](docs/HostFileControllerApi.md#upload1) | **POST** /host-file/upload | Upload a document
*PaymentControllerApi* | [**canConfirmPayment**](docs/PaymentControllerApi.md#canconfirmpayment) | **GET** /payment/can-confirm/{paymentId} | Check if payment can be confirmed
*PaymentControllerApi* | [**confirmPayment**](docs/PaymentControllerApi.md#confirmpayment) | **POST** /payment/confirm | Confirm a bank transfer payment
*PaymentControllerApi* | [**createPayment**](docs/PaymentControllerApi.md#createpayment) | **POST** /payment | Create a new bank transfer payment
*PaymentControllerApi* | [**generateReference**](docs/PaymentControllerApi.md#generatereference) | **POST** /payment/references/generate | Generate payment reference code
*PaymentControllerApi* | [**getConfirmationHistory**](docs/PaymentControllerApi.md#getconfirmationhistory) | **GET** /payment/confirmation-history | Get payment confirmation history for current professor
*PaymentControllerApi* | [**getConfirmationResult**](docs/PaymentControllerApi.md#getconfirmationresult) | **GET** /payment/confirmation-result/{paymentId} | Get payment confirmation result with FIFO allocation details
*PaymentControllerApi* | [**getMyPayments**](docs/PaymentControllerApi.md#getmypayments) | **GET** /payment/my | Get payments for current student
*PaymentControllerApi* | [**getPaymentById**](docs/PaymentControllerApi.md#getpaymentbyid) | **GET** /payment/{paymentId} | Get specific payment by ID
*PaymentControllerApi* | [**getPaymentForConfirmation**](docs/PaymentControllerApi.md#getpaymentforconfirmation) | **GET** /payment/confirmation/{paymentId} | Get payment details for confirmation
*PaymentControllerApi* | [**getPendingPayments**](docs/PaymentControllerApi.md#getpendingpayments) | **GET** /payment/pending | Get pending payments for current professor
*PaymentControllerApi* | [**getProfessorPaymentInfo**](docs/PaymentControllerApi.md#getprofessorpaymentinfo) | **GET** /payment/professor/{professorId}/info | Get professor payment information including bank accounts
*PaymentControllerApi* | [**rejectPayment**](docs/PaymentControllerApi.md#rejectpayment) | **POST** /payment/reject | Reject a bank transfer payment
*PaymentControllerApi* | [**validateReference**](docs/PaymentControllerApi.md#validatereference) | **POST** /payment/references/validate | Validate a payment reference code
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
*StudentProfessorRelationshipControllerApi* | [**createRelationship**](docs/StudentProfessorRelationshipControllerApi.md#createrelationship) | **POST** /student-professor-relationships | Create a new student-professor relationship
*StudentProfessorRelationshipControllerApi* | [**deactivateRelationship**](docs/StudentProfessorRelationshipControllerApi.md#deactivaterelationship) | **DELETE** /student-professor-relationships/{studentUserId}/{professorId} | Deactivate student-professor relationship
*StudentProfessorRelationshipControllerApi* | [**getActiveProfessorsForStudent**](docs/StudentProfessorRelationshipControllerApi.md#getactiveprofessorsforstudent) | **GET** /student-professor-relationships/student/{studentUserId}/professors | Get all active professors for a student
*StudentProfessorRelationshipControllerApi* | [**getActiveStudentsForCurrentProfessor**](docs/StudentProfessorRelationshipControllerApi.md#getactivestudentsforcurrentprofessor) | **GET** /student-professor-relationships/students | Get all active students for current professor
*StudentProfessorRelationshipControllerApi* | [**getActiveStudentsForProfessor**](docs/StudentProfessorRelationshipControllerApi.md#getactivestudentsforprofessor) | **GET** /student-professor-relationships/professor/{professorId}/students | Get all active students for a professor
*StudentProfessorRelationshipControllerApi* | [**getDefaultPrice**](docs/StudentProfessorRelationshipControllerApi.md#getdefaultprice) | **GET** /student-professor-relationships/{studentUserId}/{professorId}/price | Get default price for student-professor relationship
*StudentProfessorRelationshipControllerApi* | [**getPriceWithFallback**](docs/StudentProfessorRelationshipControllerApi.md#getpricewithfallback) | **GET** /student-professor-relationships/{studentUserId}/{professorId}/price-with-fallback | Get price with fallback logic
*StudentProfessorRelationshipControllerApi* | [**hasActiveRelationship**](docs/StudentProfessorRelationshipControllerApi.md#hasactiverelationship) | **GET** /student-professor-relationships/{studentUserId}/{professorId}/exists | Check if active relationship exists
*StudentProfessorRelationshipControllerApi* | [**updateDefaultPrice**](docs/StudentProfessorRelationshipControllerApi.md#updatedefaultprice) | **PUT** /student-professor-relationships/{studentUserId}/{professorId}/price | Update default price for student-professor relationship
*StudentProfileControllerApi* | [**create1**](docs/StudentProfileControllerApi.md#create1) | **POST** /student-profile/create | Create a new student profile.
*StudentProfileControllerApi* | [**deactivate**](docs/StudentProfileControllerApi.md#deactivate) | **DELETE** /student-profile/{id} | Deactivate student profile
*StudentProfileControllerApi* | [**get1**](docs/StudentProfileControllerApi.md#get1) | **GET** /student-profile/{id} | Get student profile
*StudentProfileControllerApi* | [**getFull**](docs/StudentProfileControllerApi.md#getfull) | **GET** /student-profile/get-full/{userId} | Get full student profile by user id
*StudentProfileControllerApi* | [**getFull1**](docs/StudentProfileControllerApi.md#getfull1) | **GET** /student-profile/get-full | Get full student profile by user id
*StudentProfileControllerApi* | [**getPaginated**](docs/StudentProfileControllerApi.md#getpaginated) | **POST** /student-profile/paginated | Get paginated workpoints
*StudentProfileControllerApi* | [**getProfilePrerequire**](docs/StudentProfileControllerApi.md#getprofileprerequire) | **GET** /student-profile/profile-prerequire | Get current initial data for creating student profile
*StudentProfileControllerApi* | [**getUserProfile**](docs/StudentProfileControllerApi.md#getuserprofile) | **GET** /student-profile/get | Get current student profile
*StudentProfileControllerApi* | [**setDefaultPricePerSession**](docs/StudentProfileControllerApi.md#setdefaultpricepersession) | **PUT** /student-profile/{studentId}/default-price | Set default price per session for a student
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
*WalletControllerApi* | [**getMyBalance**](docs/WalletControllerApi.md#getmybalance) | **GET** /wallet/balance | Get current user\&#39;s wallet balance
*WalletControllerApi* | [**getMyBalanceHistory**](docs/WalletControllerApi.md#getmybalancehistory) | **GET** /wallet/history | Get current user\&#39;s wallet balance history
*WalletControllerApi* | [**getMyWallet**](docs/WalletControllerApi.md#getmywallet) | **GET** /wallet/my | Get current user\&#39;s wallet
*WalletControllerApi* | [**getUserBalance**](docs/WalletControllerApi.md#getuserbalance) | **GET** /wallet/balance/user/{userId} | Get balance by user ID (admin only)
*WalletControllerApi* | [**getUserBalanceHistory**](docs/WalletControllerApi.md#getuserbalancehistory) | **GET** /wallet/history/user/{userId} | Get balance history by user ID (admin only)
*WalletControllerApi* | [**getUserWallet**](docs/WalletControllerApi.md#getuserwallet) | **GET** /wallet/user/{userId} | Get wallet by user ID (admin only)
*WalletControllerApi* | [**getUsersWithCredit**](docs/WalletControllerApi.md#getuserswithcredit) | **GET** /wallet/with-credit | Get users with credit (admin only)
*WalletControllerApi* | [**getUsersWithDebt**](docs/WalletControllerApi.md#getuserswithdebt) | **GET** /wallet/with-debt | Get users with debt (admin only)


### Documentation For Models

 - [Address](docs/Address.md)
 - [AddressDTO](docs/AddressDTO.md)
 - [AllocationResultDTO](docs/AllocationResultDTO.md)
 - [BankAccount](docs/BankAccount.md)
 - [BankAccountDTO](docs/BankAccountDTO.md)
 - [BankTransferPaymentDTO](docs/BankTransferPaymentDTO.md)
 - [CreatePaymentRequest](docs/CreatePaymentRequest.md)
 - [CredentialRepresentation](docs/CredentialRepresentation.md)
 - [CredentialRepresentationConfig](docs/CredentialRepresentationConfig.md)
 - [EventAttendee](docs/EventAttendee.md)
 - [EventAttendeeDTO](docs/EventAttendeeDTO.md)
 - [EventDebtSummaryDTO](docs/EventDebtSummaryDTO.md)
 - [EventOccurrence](docs/EventOccurrence.md)
 - [EventOccurrenceDTO](docs/EventOccurrenceDTO.md)
 - [EventOccurrenceDuration](docs/EventOccurrenceDuration.md)
 - [EventOccurrenceDurationUnitsInner](docs/EventOccurrenceDurationUnitsInner.md)
 - [EventOccurrenceDurationUnitsInnerDuration](docs/EventOccurrenceDurationUnitsInnerDuration.md)
 - [EventPaymentInfoDTO](docs/EventPaymentInfoDTO.md)
 - [EventsDTO](docs/EventsDTO.md)
 - [FIFOSystemStatisticsDTO](docs/FIFOSystemStatisticsDTO.md)
 - [FederatedIdentityRepresentation](docs/FederatedIdentityRepresentation.md)
 - [FilterCriteriaObject](docs/FilterCriteriaObject.md)
 - [FilterOptionObject](docs/FilterOptionObject.md)
 - [GenerateReferenceRequest](docs/GenerateReferenceRequest.md)
 - [GroupDTO](docs/GroupDTO.md)
 - [HostFile](docs/HostFile.md)
 - [InvoicePlatform](docs/InvoicePlatform.md)
 - [Location](docs/Location.md)
 - [LocationDTO](docs/LocationDTO.md)
 - [LocationLevel](docs/LocationLevel.md)
 - [PageBankTransferPaymentDTO](docs/PageBankTransferPaymentDTO.md)
 - [PageWalletDTO](docs/PageWalletDTO.md)
 - [PageableObject](docs/PageableObject.md)
 - [PaginatedRequest](docs/PaginatedRequest.md)
 - [PaginatedResponseProfessorProfileView](docs/PaginatedResponseProfessorProfileView.md)
 - [PaginatedResponseStudentProfileView](docs/PaginatedResponseStudentProfileView.md)
 - [PaymentAllocationDetailDTO](docs/PaymentAllocationDetailDTO.md)
 - [PaymentConfirmationRequest](docs/PaymentConfirmationRequest.md)
 - [PaymentConfirmationResultDTO](docs/PaymentConfirmationResultDTO.md)
 - [PaymentDetailDTO](docs/PaymentDetailDTO.md)
 - [PaymentEventAssociation](docs/PaymentEventAssociation.md)
 - [PaymentReferenceDTO](docs/PaymentReferenceDTO.md)
 - [PaymentSystemStatisticsDTO](docs/PaymentSystemStatisticsDTO.md)
 - [ProfessorPaymentInfoDTO](docs/ProfessorPaymentInfoDTO.md)
 - [ProfessorPaymentSummaryDTO](docs/ProfessorPaymentSummaryDTO.md)
 - [ProfessorPlatformIntegration](docs/ProfessorPlatformIntegration.md)
 - [ProfessorProfile](docs/ProfessorProfile.md)
 - [ProfessorProfileDTO](docs/ProfessorProfileDTO.md)
 - [ProfessorProfileView](docs/ProfessorProfileView.md)
 - [ProfilePicture](docs/ProfilePicture.md)
 - [ProfilePrerequrireDTO](docs/ProfilePrerequrireDTO.md)
 - [RecurringSeries](docs/RecurringSeries.md)
 - [RecurringSeriesDTO](docs/RecurringSeriesDTO.md)
 - [ReferenceValidationRequest](docs/ReferenceValidationRequest.md)
 - [ReferenceValidationResponseDTO](docs/ReferenceValidationResponseDTO.md)
 - [SingularEventDTO](docs/SingularEventDTO.md)
 - [SingularEventDTODuration](docs/SingularEventDTODuration.md)
 - [SingularEventDTODurationUnitsInner](docs/SingularEventDTODurationUnitsInner.md)
 - [SocialLinkRepresentation](docs/SocialLinkRepresentation.md)
 - [SortCriteria](docs/SortCriteria.md)
 - [SortObject](docs/SortObject.md)
 - [Speciality](docs/Speciality.md)
 - [SpecialityDTO](docs/SpecialityDTO.md)
 - [StudentDebtSummaryDTO](docs/StudentDebtSummaryDTO.md)
 - [StudentProfessorRelationshipDTO](docs/StudentProfessorRelationshipDTO.md)
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
 - [WalletBalanceChangeDTO](docs/WalletBalanceChangeDTO.md)
 - [WalletDTO](docs/WalletDTO.md)
 - [WalletSummaryDTO](docs/WalletSummaryDTO.md)


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

