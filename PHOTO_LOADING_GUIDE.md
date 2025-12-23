# Photo Loading Guide - Universal Approach

This guide explains how to use the unified photo loading system across the entire app.

## TL;DR - Two Simple Approaches

### Approach 1: Use EmentorAvatar (Recommended - Easiest)

**Just use EmentorAvatar everywhere** - it handles everything automatically!

```tsx
import EmentorAvatar, { UserType } from 'src/@core/components/ementor-avatar'

// Automatically loads and caches photo
<EmentorAvatar
  userId={user.id}
  userType={UserType.STUDENT}
/>
```

### Approach 2: Manual Photo Loading (For Lists/Tables)

**Use the photo-loader service** for bulk loading in lists/tables:

```typescript
import { loadPhotosForUsers } from 'src/@core/services/photo-loader'

// Load photos for all users
const usersWithPhotos = await loadPhotosForUsers(users)

// Now each user has an 'avatar' field
usersWithPhotos.forEach(user => {
  console.log(user.avatar) // Blob URL or null
})
```

---

## Detailed Guide

## 1. For Individual User Avatars (Most Common)

**Use Case**: Displaying a single user's avatar (profile page, navbar, cards, etc.)

### ✅ Recommended: EmentorAvatar

```tsx
import EmentorAvatar, { UserType } from 'src/@core/components/ementor-avatar'

// Student avatar
<EmentorAvatar
  userId={studentId}
  userType={UserType.STUDENT}
/>

// Professor avatar
<EmentorAvatar
  userId={professorId}
  userType={UserType.PROFESSOR}
/>

// With custom size
<EmentorAvatar
  userId={userId}
  userType={UserType.STUDENT}
  fullSize={true}
  sx={{ width: 100, height: 100 }}
/>

// With pre-loaded avatar URL (skips fetching)
<EmentorAvatar
  userId={userId}
  userType={UserType.STUDENT}
  avatarSrc={preLoadedUrl} // If you already have the URL
/>
```

**Benefits:**
- ✅ Automatic photo loading and caching
- ✅ Fallback to initials if photo fails
- ✅ Uses PhotoCacheService (parallel loading, no 429s)
- ✅ Works with both API and Google photos
- ✅ Lazy loading built-in
- ✅ referrerPolicy="no-referrer" built-in

---

## 2. For User Lists/Tables

**Use Case**: Student list, payment timeline, quiz results, etc.

### ✅ Option A: Load Photos Then Use EmentorAvatar

```tsx
import { loadPhotosForUsers } from 'src/@core/services/photo-loader'
import EmentorAvatar, { UserType } from 'src/@core/components/ementor-avatar'

function StudentList({ students }) {
  const [studentsWithPhotos, setStudentsWithPhotos] = useState([])

  useEffect(() => {
    async function loadPhotos() {
      const result = await loadPhotosForUsers(students)
      setStudentsWithPhotos(result)
    }
    loadPhotos()
  }, [students])

  return (
    <div>
      {studentsWithPhotos.map(student => (
        <div key={student.id}>
          {/* Use avatarSrc to pass pre-loaded photo */}
          <EmentorAvatar
            userId={student.id}
            userType={UserType.STUDENT}
            avatarSrc={student.avatar} // Pre-loaded
          />
          <span>{student.name}</span>
        </div>
      ))}
    </div>
  )
}
```

### ✅ Option B: Let EmentorAvatar Handle Everything (Simplest)

```tsx
import EmentorAvatar, { UserType } from 'src/@core/components/ementor-avatar'

function StudentList({ students }) {
  return (
    <div>
      {students.map(student => (
        <div key={student.id}>
          {/* EmentorAvatar fetches and caches automatically */}
          <EmentorAvatar
            userId={student.id}
            userType={UserType.STUDENT}
          />
          <span>{student.name}</span>
        </div>
      ))}
    </div>
  )
}
```

**Why Option B is better:**
- Simpler code (no photo loading logic needed)
- PhotoCacheService handles parallel loading
- Photos are cached across components
- Lazy loading prevents loading off-screen images

---

## 3. For Paginated Lists (DataGrid, Tables)

**Use Case**: Student list with pagination, large datasets

### ✅ Recommended: Load Photos Per Page

```tsx
import { useEffect, useState } from 'react'
import { loadPhotosForPage } from 'src/@core/services/photo-loader'
import { DataGrid } from '@mui/x-data-grid'

function StudentTable({ students }) {
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 25 })
  const [studentsWithPhotos, setStudentsWithPhotos] = useState(students)

  // Load photos when page changes
  useEffect(() => {
    async function loadPhotos() {
      const result = await loadPhotosForPage(
        students,
        paginationModel.page,
        paginationModel.pageSize
      )
      setStudentsWithPhotos(result)
    }
    loadPhotos()
  }, [students, paginationModel.page, paginationModel.pageSize])

  const columns = [
    {
      field: 'avatar',
      headerName: 'Avatar',
      renderCell: ({ row }) => (
        <EmentorAvatar
          userId={row.id}
          userType={UserType.STUDENT}
          avatarSrc={row.avatar} // Pre-loaded for current page
        />
      )
    },
    // ... other columns
  ]

  return (
    <DataGrid
      rows={studentsWithPhotos}
      columns={columns}
      paginationModel={paginationModel}
      onPaginationModelChange={setPaginationModel}
    />
  )
}
```

---

## 4. For Bulk Data Processing (ACL Page, Payment Timeline)

**Use Case**: Processing quiz data, payment data with user photos

### ✅ Before (Old Way - Multiple Custom Functions):

```javascript
// ❌ Old way - custom function per page
const processStudentQuizzesData = async (data, users) => {
  // 50+ lines of custom code
  // Duplicated across multiple files
}
```

### ✅ After (New Way - One Universal Function):

```typescript
// ✅ New way - one function for all pages
import { loadPhotosForUsers } from 'src/@core/services/photo-loader'

// Load photos for users
const usersWithPhotos = await loadPhotosForUsers(users)

// Map to your data
const dataWithAvatars = quizData.map(quiz => {
  const user = usersWithPhotos.find(u => u.id === quiz.studentId)
  return { ...quiz, avatar: user?.avatar }
})
```

**Example: ACL Page Refactor**

```javascript
// Before
const processStudentQuizzesData = async (data, users) => {
  const usersOnPage = data.map(row => row.studentId)
  let uniqueUsers = [...new Set(usersOnPage)]
  let processedUsersList = []
  for (const userId of uniqueUsers) {
    const user = users.find(user => user.id === userId)
    if (user) {
      const processedUser = extractProfilePicture(user)
      processedUsersList.push(processedUser)
    }
  }
  const result = await Promise.all(
    processedUsersList.map(async profilePicture => {
      if (profilePicture.type === 'API') {
        const avatar = await photoCacheService.getPhoto('API', profilePicture.url, profilePicture.userId)
        return { ...profilePicture, avatar: avatar || null }
      } else if (profilePicture.type === 'EXTERNAL') {
        const avatar = await photoCacheService.getPhoto('EXTERNAL', profilePicture.url, profilePicture.userId)
        return { ...profilePicture, avatar }
      } else {
        return { ...profilePicture, avatar: null }
      }
    })
  )
  return data.map(row => {
    const user = result.find(user => user.userId === row.studentId)
    return { ...row, avatar: user.avatar }
  })
}

// After (Much Simpler!)
import { loadPhotosForUsers } from 'src/@core/services/photo-loader'

const processStudentQuizzesData = async (data, users) => {
  const usersWithPhotos = await loadPhotosForUsers(users)
  return data.map(row => {
    const user = usersWithPhotos.find(u => u.id === row.studentId)
    return { ...row, avatar: user?.avatar }
  })
}
```

---

## 5. API Reference

### `loadPhotoForUser(user, fullSize?)`

Load photo for a single user.

```typescript
import { loadPhotoForUser } from 'src/@core/services/photo-loader'

const photoUrl = await loadPhotoForUser(user) // Thumbnail
const fullPhotoUrl = await loadPhotoForUser(user, true) // Full size
```

**Parameters:**
- `user` - User object with `id` and optional `attributes`
- `fullSize` - Boolean, default `false`

**Returns:** `Promise<string | null>` - Blob URL or null

---

### `loadPhotosForUsers(users, fullSize?)`

Load photos for multiple users in parallel.

```typescript
import { loadPhotosForUsers } from 'src/@core/services/photo-loader'

const usersWithPhotos = await loadPhotosForUsers(users)
// Each user now has an 'avatar' field
```

**Parameters:**
- `users` - Array of user objects
- `fullSize` - Boolean, default `false`

**Returns:** `Promise<Array>` - Users with `avatar` field added

---

### `loadPhotosForPage(allUsers, page, pageSize, fullSize?)`

Load photos only for users on a specific page (pagination).

```typescript
import { loadPhotosForPage } from 'src/@core/services/photo-loader'

const usersWithPhotos = await loadPhotosForPage(allUsers, 0, 25)
// Only users on page 0 (first 25) have photos loaded
```

**Parameters:**
- `allUsers` - All users in the dataset
- `page` - Page number (0-indexed)
- `pageSize` - Items per page
- `fullSize` - Boolean, default `false`

**Returns:** `Promise<Array>` - All users, but only current page has photos

---

### `preloadPhotosForUsers(users, fullSize?)`

Preload photos in the background (fire and forget).

```typescript
import { preloadPhotosForUsers } from 'src/@core/services/photo-loader'

// Preload without waiting
preloadPhotosForUsers(nextPageUsers)
```

**Parameters:**
- `users` - Array of user objects
- `fullSize` - Boolean, default `false`

**Returns:** `void` - Doesn't return anything, runs in background

---

## 6. Migration Guide

### Migrating from Custom Photo Processing

**Step 1**: Identify custom photo functions in your files:
- `processStudentPhotos`
- `processStudentQuizzesData`
- `loadStudentPhoto`
- Any function that calls `extractProfilePicture` + `photoCacheService.getPhoto`

**Step 2**: Replace with `loadPhotosForUsers`:

```typescript
// Before
const processedData = await processStudentQuizzesData(data, users)

// After
import { loadPhotosForUsers } from 'src/@core/services/photo-loader'

const usersWithPhotos = await loadPhotosForUsers(users)
const processedData = data.map(item => {
  const user = usersWithPhotos.find(u => u.id === item.studentId)
  return { ...item, avatar: user?.avatar }
})
```

**Step 3**: Update components to use EmentorAvatar:

```tsx
// Before
<StudentAvatar student={student} />

// After
<EmentorAvatar
  userId={student.id}
  userType={UserType.STUDENT}
  avatarSrc={student.avatar}
/>
```

---

## 7. Best Practices

### ✅ DO:
- Use `EmentorAvatar` for individual avatars (simplest)
- Use `loadPhotosForUsers` for bulk loading in lists
- Use `loadPhotosForPage` for paginated lists
- Pass `avatarSrc` to EmentorAvatar if you've already loaded photos
- Let PhotoCacheService handle caching (it's automatic)

### ❌ DON'T:
- Don't create custom photo processing functions
- Don't call `extractProfilePicture` + `photoCacheService.getPhoto` manually
- Don't implement your own caching logic
- Don't use different avatar components for different pages
- Don't worry about 429 errors (handled by referrerPolicy)

---

## 8. How It All Works Together

```
User Data (from API)
        ↓
EmentorAvatar (or loadPhotosForUsers)
        ↓
extractProfilePicture() - determines photo type (API/EXTERNAL/NONE)
        ↓
PhotoCacheService.getPhoto() - loads and caches
        ↓
    ┌───────────────┴───────────────┐
    ↓                               ↓
API Photo                    Google Photo
(via backend)            (with referrerPolicy)
    ↓                               ↓
Blob URL                        Blob URL
    ↓                               ↓
    └───────────────┬───────────────┘
                    ↓
            Cached (30 min)
                    ↓
        Rendered in Avatar Component
```

**Key Features:**
- ✅ Parallel loading (20 concurrent requests)
- ✅ Automatic caching (30 min TTL)
- ✅ No 429 errors (referrerPolicy="no-referrer")
- ✅ Works with API and Google photos
- ✅ Lazy loading
- ✅ Fallback to initials

---

## 9. Examples from the App

### Example 1: Student List Page (Current Implementation)

```tsx
// src/pages/apps/user/list/index.tsx

import { loadPhotosForPage } from 'src/@core/services/photo-loader'
import EmentorAvatar, { UserType } from 'src/@core/components/ementor-avatar'

const UserList = () => {
  const [students, setStudents] = useState([])
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 25 })

  // Load photos for current page
  useEffect(() => {
    async function loadPhotos() {
      const result = await loadPhotosForPage(
        students,
        paginationModel.page,
        paginationModel.pageSize
      )
      setStudents(result)
    }
    if (students.length > 0) {
      loadPhotos()
    }
  }, [paginationModel.page, paginationModel.pageSize])

  const columns = [
    {
      field: 'student',
      headerName: 'Student',
      renderCell: ({ row }) => (
        <Box display="flex" alignItems="center">
          <EmentorAvatar
            userId={row.studentUserId}
            userType={UserType.STUDENT}
            avatarSrc={row.avatar}
          />
          <Typography>{row.studentName}</Typography>
        </Box>
      )
    }
  ]

  return <DataGrid rows={students} columns={columns} />
}
```

### Example 2: ACL Page (Simplified)

```javascript
// src/pages/acl/index.js

import { loadPhotosForUsers } from 'src/@core/services/photo-loader'

const ACLPage = () => {
  const processStudentQuizzesData = async (quizData, users) => {
    // Load photos for all users
    const usersWithPhotos = await loadPhotosForUsers(users)

    // Map photos to quiz data
    return quizData.map(quiz => {
      const user = usersWithPhotos.find(u => u.id === quiz.studentId)
      return { ...quiz, avatar: user?.avatar }
    })
  }

  // Use in timeline component
  return <CardActivityTimeline data={quizzesData} />
}
```

### Example 3: Payment Timeline

```tsx
// src/pages/acl/components/PaymentTimeline.tsx

import { loadPhotosForUsers } from 'src/@core/services/photo-loader'
import EmentorAvatar, { UserType } from 'src/@core/components/ementor-avatar'

const PaymentTimeline = () => {
  const processPayments = async (payments, users) => {
    const usersWithPhotos = await loadPhotosForUsers(users)

    return payments.map(payment => {
      const user = usersWithPhotos.find(u => u.id === payment.payerId)
      return { ...payment, avatar: user?.avatar }
    })
  }

  // In timeline item
  return (
    <TimelineItem>
      <EmentorAvatar
        userId={payment.payerId}
        userType={UserType.STUDENT}
        avatarSrc={payment.avatar}
      />
    </TimelineItem>
  )
}
```

---

## Summary

**For most use cases, just use EmentorAvatar** - it handles everything automatically!

**For lists/tables with many users**, use `loadPhotosForUsers` to bulk load, then pass the photo URL to EmentorAvatar via `avatarSrc`.

**That's it!** No need for custom photo processing logic in every component.
