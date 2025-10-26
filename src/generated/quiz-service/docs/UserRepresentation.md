# UserRepresentation


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  | [optional] [default to undefined]
**username** | **string** |  | [optional] [default to undefined]
**firstName** | **string** |  | [optional] [default to undefined]
**lastName** | **string** |  | [optional] [default to undefined]
**email** | **string** |  | [optional] [default to undefined]
**emailVerified** | **boolean** |  | [optional] [default to undefined]
**attributes** | **{ [key: string]: Array&lt;string&gt;; }** |  | [optional] [default to undefined]
**userProfileMetadata** | [**UserProfileMetadata**](UserProfileMetadata.md) |  | [optional] [default to undefined]
**self** | **string** |  | [optional] [default to undefined]
**origin** | **string** |  | [optional] [default to undefined]
**createdTimestamp** | **number** |  | [optional] [default to undefined]
**enabled** | **boolean** |  | [optional] [default to undefined]
**totp** | **boolean** |  | [optional] [default to undefined]
**federationLink** | **string** |  | [optional] [default to undefined]
**serviceAccountClientId** | **string** |  | [optional] [default to undefined]
**credentials** | [**Array&lt;CredentialRepresentation&gt;**](CredentialRepresentation.md) |  | [optional] [default to undefined]
**disableableCredentialTypes** | **Set&lt;string&gt;** |  | [optional] [default to undefined]
**requiredActions** | **Array&lt;string&gt;** |  | [optional] [default to undefined]
**federatedIdentities** | [**Array&lt;FederatedIdentityRepresentation&gt;**](FederatedIdentityRepresentation.md) |  | [optional] [default to undefined]
**realmRoles** | **Array&lt;string&gt;** |  | [optional] [default to undefined]
**clientRoles** | **{ [key: string]: Array&lt;string&gt;; }** |  | [optional] [default to undefined]
**clientConsents** | [**Array&lt;UserConsentRepresentation&gt;**](UserConsentRepresentation.md) |  | [optional] [default to undefined]
**notBefore** | **number** |  | [optional] [default to undefined]
**applicationRoles** | **{ [key: string]: Array&lt;string&gt;; }** |  | [optional] [default to undefined]
**socialLinks** | [**Array&lt;SocialLinkRepresentation&gt;**](SocialLinkRepresentation.md) |  | [optional] [default to undefined]
**groups** | **Array&lt;string&gt;** |  | [optional] [default to undefined]
**access** | **{ [key: string]: boolean; }** |  | [optional] [default to undefined]

## Example

```typescript
import { UserRepresentation } from 'ementor-api-client';

const instance: UserRepresentation = {
    id,
    username,
    firstName,
    lastName,
    email,
    emailVerified,
    attributes,
    userProfileMetadata,
    self,
    origin,
    createdTimestamp,
    enabled,
    totp,
    federationLink,
    serviceAccountClientId,
    credentials,
    disableableCredentialTypes,
    requiredActions,
    federatedIdentities,
    realmRoles,
    clientRoles,
    clientConsents,
    notBefore,
    applicationRoles,
    socialLinks,
    groups,
    access,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
