# Profile Service API Integration

This directory contains the generated TypeScript API client for the E-mentor Profile Service (Service 2).

## 🚀 Generated From

- **Swagger URL**: https://dev.api.e-mentor.ro/service2/e-docs
- **Base URL**: `/service2`
- **Generated**: June 15, 2025

## 📦 What's Included

### Generated Files

- `api.ts` - All API endpoint functions and interfaces
- `configuration.ts` - Configuration class for API client setup
- `index.ts` - Main exports
- `base.ts` - Base classes and utilities
- `common.ts` - Common utilities and helpers

### Custom Integration Files

- `../profile-service-client.ts` - Wrapper that integrates with your axios interceptor
- `../services/profile-service-examples.ts` - Service classes with examples

## 🔧 Available APIs

The profile service includes the following controllers:

### 👨‍🎓 Student Profile Controller

- Create, read, update student profiles
- Get paginated student profiles
- Profile prerequisites

### 👨‍🏫 Professor Profile Controller

- Create, read, update professor profiles
- Get paginated professor profiles

### 🏫 University Controller

- CRUD operations for universities
- Get all universities

### 📚 Speciality Controller

- CRUD operations for specialities
- Get all specialities

### 📅 Events Controller

- Create and manage singular events
- Create recurring event series
- Get consolidated events
- Modify/reschedule events
- Complete events with attendance
- Cancel events

### 🖼️ Profile Picture Controller

- Upload profile pictures
- Download profile pictures
- Generate thumbnails

### 🖼️ Thumbnail Controller

- Download thumbnails for users

### 💳 Bank Account Controller

- Get bank accounts for professors

### 👤 User Controller

- Get user groups
- Get users by role

## 💡 Usage Examples

### Basic Usage with Generated Client

```typescript
import { profileServiceClient } from '@/generated/profile-service-client'

// Get current student profile
const profile = await profileServiceClient.studentProfile.getUserProfile()

// Get all universities
const universities = await profileServiceClient.university.getAll()

// Upload profile picture
const fileId = await profileServiceClient.profilePicture.upload({ file })
```

### Using Service Classes (Recommended)

```typescript
import { StudentProfileService } from '@/services/profile-service-examples'

// Get current student profile
const profile = await StudentProfileService.getCurrentStudentProfile()

// Update student profile
const updated = await StudentProfileService.updateStudentProfile(profileData)
```

### React Hook Usage

```typescript
import { useProfileService } from '@/services/profile-service-examples'

function MyComponent() {
  const { callProfileService, loading, error } = useProfileService()

  const fetchData = async () => {
    const profile = await callProfileService(() => StudentProfileService.getCurrentStudentProfile())
  }
}
```

## 🔐 Authentication

All API calls automatically use your existing axios interceptor (`@core/axios/axiosEmentor.js`) which handles:

- ✅ Token management and refresh
- ✅ Request/response interceptors
- ✅ Error handling
- ✅ Authentication headers

## 🔄 Regeneration

To regenerate this API when the service changes:

```bash
# Regenerate just the profile service
npm run generate:api profile-service https://dev.api.e-mentor.ro/service2/e-docs

# Or regenerate all services
npm run generate:apis
```

## 📋 Available Types

Key TypeScript interfaces available:

```typescript
;-StudentProfileDTO -
  ProfessorProfileDTO -
  UniversityDTO -
  SpecialityDTO -
  SingularEventDTO -
  EventOccurrenceDTO -
  RecurringSeriesDTO -
  BankAccountDTO -
  UserDTO -
  GroupDTO -
  PaginatedRequest -
  PaginatedResponseStudentProfileView -
  PaginatedResponseProfessorProfileView
```

## 🚨 Important Notes

1. **Don't modify generated files directly** - They will be overwritten on regeneration
2. **Use the service wrapper classes** in `/services/profile-service-examples.ts` for business logic
3. **All API calls go through your custom axios interceptor** for authentication
4. **Generated files are TypeScript** - provides full type safety
5. **Base path is configured** to use your environment variables

## 🛠️ Troubleshooting

### Common Issues

**API calls failing?**

- Check that `NEXT_PUBLIC_PROD_HOST` environment variable is set
- Ensure your axios interceptor is working correctly
- Verify the service is accessible at the swagger URL

**TypeScript errors?**

- Make sure you're importing from the correct paths
- Check that all required parameters are provided
- Use the generated types for better IntelliSense

**Authentication issues?**

- The API client uses your existing token management
- Check your token refresh logic in `token-validator.js`
- Verify tokens are being sent in request headers

### Getting Help

Check the main API generation guide: `API_GENERATION_GUIDE.md`
