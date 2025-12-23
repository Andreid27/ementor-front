# EmentorAvatar Component - Complete Guide

The **EmentorAvatar** is a universal, intelligent avatar component that automatically handles photo loading, caching, and fallback across your entire application.

## 🎯 Why Use EmentorAvatar?

- ✅ **Automatic photo loading** - Fetches and caches photos automatically
- ✅ **No 429 errors** - Built-in `referrerPolicy="no-referrer"` prevents Google rate limiting
- ✅ **Smart caching** - 30-minute blob URL cache, instant subsequent loads
- ✅ **Parallel loading** - Loads up to 20 photos at once
- ✅ **Fallback to initials** - Shows user's initials if photo fails
- ✅ **Works with all photo types** - API photos, Google photos, external URLs
- ✅ **Lazy loading** - Only loads visible images
- ✅ **TypeScript support** - Full type safety

---

## 📦 Installation

The component is already installed in your app at:
```
src/@core/components/ementor-avatar/index.tsx
```

---

## 🚀 Quick Start

### Basic Usage

```tsx
import EmentorAvatar, { UserType } from 'src/@core/components/ementor-avatar'

// Student avatar
<EmentorAvatar
  userId="student-123"
  userType={UserType.STUDENT}
/>

// Professor avatar
<EmentorAvatar
  userId="professor-456"
  userType={UserType.PROFESSOR}
/>
```

That's it! The component handles everything automatically:
1. Fetches user profile from Redux store or API
2. Extracts photo URL (API or Google)
3. Downloads and caches as blob URL
4. Displays photo or initials as fallback

---

## 📖 Complete API Reference

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `userId` | `string` | ✅ Yes | - | User's unique ID |
| `userType` | `UserType` | ✅ Yes | - | `UserType.STUDENT` or `UserType.PROFESSOR` |
| `fullSize` | `boolean` | No | `false` | Load full-size photo (300px) vs thumbnail (96px) |
| `avatarSrc` | `string` | No | `undefined` | Pre-loaded photo URL (skips fetching) |
| `...avatarProps` | `AvatarProps` | No | - | Any MUI Avatar props (sx, className, etc.) |

### UserType Enum

```typescript
enum UserType {
  STUDENT = 'student',
  PROFESSOR = 'professor'
}
```

---

## 📸 Real-World Examples

### Example 1: Single Student Avatar

**Use Case:** Profile page, navbar, user card

```tsx
import EmentorAvatar, { UserType } from 'src/@core/components/ementor-avatar'

function StudentProfile({ studentId }) {
  return (
    <Box>
      {/* Small avatar (96px thumbnail) */}
      <EmentorAvatar
        userId={studentId}
        userType={UserType.STUDENT}
      />
      <Typography>John Doe</Typography>
    </Box>
  )
}
```

**What happens:**
1. Component fetches student profile from Redux store
2. If not in store, fetches from API: `/service2/student-profile/get-full/{studentId}`
3. Extracts photo URL from user's `attributes` field
4. Downloads photo via PhotoCacheService (cached for 30 min)
5. Displays photo or initials "JD" if photo fails

---

### Example 2: Large Professor Avatar

**Use Case:** Professor profile page, large profile card

```tsx
import EmentorAvatar, { UserType } from 'src/@core/components/ementor-avatar'

function ProfessorCard({ professorId }) {
  return (
    <Card>
      {/* Large avatar (300px full size) */}
      <EmentorAvatar
        userId={professorId}
        userType={UserType.PROFESSOR}
        fullSize={true}
        sx={{ width: 150, height: 150 }}
      />
      <Typography variant="h5">Dr. Jane Smith</Typography>
    </Card>
  )
}
```

**What happens:**
1. Component fetches professor profile from Redux store
2. Extracts photo URL (e.g., Google photo or API photo)
3. Downloads **full-size** photo (300px instead of 96px)
4. PhotoCacheService caches with key: `EXTERNAL-professor456-s300c-full`
5. Displays 150x150px avatar (resized from 300px source)

---

### Example 3: List of Students (Multiple Avatars)

**Use Case:** Student list, quiz results, payment timeline

#### ✅ Option A: Let EmentorAvatar Handle Everything (Easiest)

```tsx
import EmentorAvatar, { UserType } from 'src/@core/components/ementor-avatar'

function StudentList({ students }) {
  return (
    <List>
      {students.map(student => (
        <ListItem key={student.id}>
          {/* EmentorAvatar fetches photos automatically */}
          <EmentorAvatar
            userId={student.id}
            userType={UserType.STUDENT}
          />
          <ListItemText primary={student.name} />
        </ListItem>
      ))}
    </List>
  )
}
```

**What happens:**
1. Each EmentorAvatar fetches its photo independently
2. PhotoCacheService handles **parallel loading** (up to 20 at once)
3. Photos load in 1-2 seconds total
4. Lazy loading: off-screen avatars load when scrolled into view
5. All photos cached for 30 minutes

**Performance:**
- First load: 1-2 seconds (parallel fetch)
- Second load: Instant (from cache)
- Network requests: 20 parallel max

---

#### ✅ Option B: Pre-load Photos (Better for Pagination)

```tsx
import { loadPhotosForUsers } from 'src/@core/services/photo-loader'
import EmentorAvatar, { UserType } from 'src/@core/components/ementor-avatar'

function StudentList({ students }) {
  const [studentsWithPhotos, setStudentsWithPhotos] = useState([])

  useEffect(() => {
    async function loadPhotos() {
      // Pre-load all photos at once
      const result = await loadPhotosForUsers(students)
      setStudentsWithPhotos(result)
    }
    loadPhotos()
  }, [students])

  return (
    <List>
      {studentsWithPhotos.map(student => (
        <ListItem key={student.id}>
          {/* Pass pre-loaded photo via avatarSrc */}
          <EmentorAvatar
            userId={student.id}
            userType={UserType.STUDENT}
            avatarSrc={student.avatar} // Pre-loaded
          />
          <ListItemText primary={student.name} />
        </ListItem>
      ))}
    </List>
  )
}
```

**What happens:**
1. `loadPhotosForUsers()` fetches all photos in parallel
2. Each student object gets an `avatar` field with blob URL
3. EmentorAvatar uses `avatarSrc` (skips fetching)
4. Faster initial render (all photos ready at once)

**When to use:**
- Large lists with pagination
- When you need all photos before rendering
- Better control over loading states

---

### Example 4: DataGrid with Pagination

**Use Case:** Student management table with 100+ students

```tsx
import { DataGrid } from '@mui/x-data-grid'
import { loadPhotosForPage } from 'src/@core/services/photo-loader'
import EmentorAvatar, { UserType } from 'src/@core/components/ementor-avatar'

function StudentTable({ allStudents }) {
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 25 })
  const [studentsWithPhotos, setStudentsWithPhotos] = useState(allStudents)

  // Load photos only for current page
  useEffect(() => {
    async function loadPhotos() {
      const result = await loadPhotosForPage(
        allStudents,
        paginationModel.page,
        paginationModel.pageSize
      )
      setStudentsWithPhotos(result)
    }
    loadPhotos()
  }, [allStudents, paginationModel.page, paginationModel.pageSize])

  const columns = [
    {
      field: 'avatar',
      headerName: 'Avatar',
      width: 70,
      renderCell: ({ row }) => (
        <EmentorAvatar
          userId={row.id}
          userType={UserType.STUDENT}
          avatarSrc={row.avatar}
        />
      )
    },
    {
      field: 'name',
      headerName: 'Name',
      width: 200
    },
    // ... other columns
  ]

  return (
    <DataGrid
      rows={studentsWithPhotos}
      columns={columns}
      paginationModel={paginationModel}
      onPaginationModelChange={setPaginationModel}
      pageSizeOptions={[10, 25, 50]}
    />
  )
}
```

**What happens:**
1. Only loads photos for students on **current page** (25 users)
2. When page changes, loads new page's photos
3. Previous pages' photos stay in cache (30 min)
4. Efficient: Only 25 network requests per page instead of 100+

**Performance:**
- Page 1: Loads 25 photos (1-2 seconds)
- Page 2: Loads 25 new photos (1-2 seconds)
- Back to Page 1: Instant (from cache)

---

### Example 5: Custom Styled Avatar

**Use Case:** Large profile photo with custom styling

```tsx
import EmentorAvatar, { UserType } from 'src/@core/components/ementor-avatar'
import { styled } from '@mui/material/styles'

function ProfileHeader({ userId }) {
  return (
    <Box>
      {/* Custom size and styling */}
      <EmentorAvatar
        userId={userId}
        userType={UserType.STUDENT}
        fullSize={true}
        sx={{
          width: 200,
          height: 200,
          border: '4px solid #fff',
          boxShadow: 3,
          '&:hover': {
            transform: 'scale(1.05)',
            transition: 'transform 0.2s'
          }
        }}
      />
    </Box>
  )
}
```

**Supported MUI Avatar Props:**
- `sx` - Custom styles
- `className` - CSS class
- `alt` - Alt text for image
- `variant` - 'circular' | 'rounded' | 'square'
- And all other MUI Avatar props

---

### Example 6: Payment Timeline with Avatars

**Use Case:** Timeline showing payment history with user avatars

```tsx
import Timeline from '@mui/lab/Timeline'
import TimelineItem from '@mui/lab/TimelineItem'
import TimelineContent from '@mui/lab/TimelineContent'
import TimelineDot from '@mui/lab/TimelineDot'
import { loadPhotosForUsers } from 'src/@core/services/photo-loader'
import EmentorAvatar, { UserType } from 'src/@core/components/ementor-avatar'

function PaymentTimeline({ payments, users }) {
  const [paymentsWithAvatars, setPaymentsWithAvatars] = useState([])

  useEffect(() => {
    async function loadPhotos() {
      // Load photos for all payers
      const usersWithPhotos = await loadPhotosForUsers(users)

      // Map photos to payments
      const enriched = payments.map(payment => {
        const user = usersWithPhotos.find(u => u.id === payment.payerId)
        return { ...payment, avatar: user?.avatar, payerName: user?.name }
      })

      setPaymentsWithAvatars(enriched)
    }
    loadPhotos()
  }, [payments, users])

  return (
    <Timeline>
      {paymentsWithAvatars.map(payment => (
        <TimelineItem key={payment.id}>
          <TimelineDot>
            <EmentorAvatar
              userId={payment.payerId}
              userType={UserType.STUDENT}
              avatarSrc={payment.avatar}
              sx={{ width: 40, height: 40 }}
            />
          </TimelineDot>
          <TimelineContent>
            <Typography variant="h6">{payment.amount} RON</Typography>
            <Typography color="text.secondary">
              {payment.payerName} • {payment.date}
            </Typography>
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  )
}
```

---

### Example 7: Avatar with Click Handler

**Use Case:** Clickable avatar that opens user profile

```tsx
import EmentorAvatar, { UserType } from 'src/@core/components/ementor-avatar'
import { useRouter } from 'next/router'

function StudentCard({ student }) {
  const router = useRouter()

  const handleAvatarClick = () => {
    router.push(`/student-profile/${student.id}`)
  }

  return (
    <Card>
      <Box onClick={handleAvatarClick} sx={{ cursor: 'pointer' }}>
        <EmentorAvatar
          userId={student.id}
          userType={UserType.STUDENT}
          sx={{
            width: 80,
            height: 80,
            '&:hover': {
              opacity: 0.8
            }
          }}
        />
      </Box>
      <Typography>{student.name}</Typography>
    </Card>
  )
}
```

---

### Example 8: Avatar Group (Multiple Avatars Stacked)

**Use Case:** Show event attendees or group members

```tsx
import AvatarGroup from '@mui/material/AvatarGroup'
import EmentorAvatar, { UserType } from 'src/@core/components/ementor-avatar'

function EventAttendees({ attendeeIds }) {
  return (
    <Box>
      <Typography variant="subtitle2">Attendees ({attendeeIds.length})</Typography>
      <AvatarGroup max={5} sx={{ justifyContent: 'flex-start' }}>
        {attendeeIds.map(attendeeId => (
          <EmentorAvatar
            key={attendeeId}
            userId={attendeeId}
            userType={UserType.STUDENT}
          />
        ))}
      </AvatarGroup>
    </Box>
  )
}
```

**What happens:**
1. AvatarGroup shows first 4 avatars + "+N" indicator
2. Each EmentorAvatar loads independently
3. PhotoCacheService handles parallel loading
4. Hovering shows additional avatars

---

### Example 9: Loading State with Skeleton

**Use Case:** Show loading skeleton while photo loads

```tsx
import EmentorAvatar, { UserType } from 'src/@core/components/ementor-avatar'
import Skeleton from '@mui/material/Skeleton'
import { useState, useEffect } from 'react'

function StudentProfileWithLoading({ studentId }) {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading (EmentorAvatar loads async)
    const timer = setTimeout(() => setLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <Box>
      {loading ? (
        <Skeleton variant="circular" width={80} height={80} />
      ) : (
        <EmentorAvatar
          userId={studentId}
          userType={UserType.STUDENT}
          sx={{ width: 80, height: 80 }}
        />
      )}
    </Box>
  )
}
```

---

### Example 10: Conditional Avatar (Show Only If Has Photo)

**Use Case:** Only show avatar if user has a profile photo

```tsx
import EmentorAvatar, { UserType } from 'src/@core/components/ementor-avatar'
import { loadPhotoForUser } from 'src/@core/services/photo-loader'
import { useState, useEffect } from 'react'

function ConditionalAvatar({ user }) {
  const [hasPhoto, setHasPhoto] = useState(false)

  useEffect(() => {
    async function checkPhoto() {
      const photoUrl = await loadPhotoForUser(user)
      setHasPhoto(!!photoUrl)
    }
    checkPhoto()
  }, [user])

  if (!hasPhoto) {
    return <Icon icon="tabler:user" /> // Fallback icon
  }

  return (
    <EmentorAvatar
      userId={user.id}
      userType={UserType.STUDENT}
      avatarSrc={user.avatar}
    />
  )
}
```

---

## 🎨 Size Examples

### Small Avatar (Default - 96px thumbnail)

```tsx
<EmentorAvatar
  userId={userId}
  userType={UserType.STUDENT}
  // Uses 96px thumbnail by default
/>
```

**URL:** `https://lh3.googleusercontent.com/.../s96-c`

### Medium Avatar (96px thumbnail, displayed at custom size)

```tsx
<EmentorAvatar
  userId={userId}
  userType={UserType.STUDENT}
  sx={{ width: 60, height: 60 }}
  // Still uses 96px source, just displays smaller
/>
```

### Large Avatar (300px full size)

```tsx
<EmentorAvatar
  userId={userId}
  userType={UserType.STUDENT}
  fullSize={true}
  sx={{ width: 150, height: 150 }}
  // Fetches 300px source
/>
```

**URL:** `https://lh3.googleusercontent.com/.../s300-c`

### Extra Large Avatar (300px full size, displayed larger)

```tsx
<EmentorAvatar
  userId={userId}
  userType={UserType.STUDENT}
  fullSize={true}
  sx={{ width: 200, height: 200 }}
  // Fetches 300px source, displays at 200px
/>
```

---

## ⚡ Performance Best Practices

### ✅ DO:

1. **Use `fullSize={true}` only when needed**
   ```tsx
   // ✅ Good - thumbnail for list
   <EmentorAvatar userId={id} userType={UserType.STUDENT} />

   // ✅ Good - full size for profile page
   <EmentorAvatar userId={id} userType={UserType.STUDENT} fullSize={true} />
   ```

2. **Pre-load photos for paginated lists**
   ```tsx
   const studentsWithPhotos = await loadPhotosForPage(students, page, pageSize)
   ```

3. **Pass `avatarSrc` when you already have the photo**
   ```tsx
   <EmentorAvatar userId={id} userType={UserType.STUDENT} avatarSrc={photoUrl} />
   ```

4. **Let lazy loading work** (don't disable it)
   ```tsx
   // ✅ Lazy loading is automatic - off-screen avatars load when scrolled into view
   ```

### ❌ DON'T:

1. **Don't fetch photos manually**
   ```tsx
   // ❌ Bad - don't do this
   const photo = await fetchPhoto(userId)
   <Avatar src={photo} />

   // ✅ Good - let EmentorAvatar handle it
   <EmentorAvatar userId={userId} userType={UserType.STUDENT} />
   ```

2. **Don't use `fullSize` for small avatars**
   ```tsx
   // ❌ Bad - wastes bandwidth
   <EmentorAvatar userId={id} userType={UserType.STUDENT} fullSize={true} sx={{ width: 40, height: 40 }} />

   // ✅ Good - uses appropriate size
   <EmentorAvatar userId={id} userType={UserType.STUDENT} sx={{ width: 40, height: 40 }} />
   ```

3. **Don't load all photos for large datasets**
   ```tsx
   // ❌ Bad - loads 1000 photos
   const allWithPhotos = await loadPhotosForUsers(allStudents)

   // ✅ Good - loads 25 photos per page
   const pageWithPhotos = await loadPhotosForPage(allStudents, page, 25)
   ```

---

## 🔧 Advanced Usage

### Custom Photo Loader Hook

```tsx
import { useState, useEffect } from 'react'
import { loadPhotosForUsers } from 'src/@core/services/photo-loader'

function useStudentPhotos(students) {
  const [studentsWithPhotos, setStudentsWithPhotos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadPhotos() {
      setLoading(true)
      const result = await loadPhotosForUsers(students)
      setStudentsWithPhotos(result)
      setLoading(false)
    }
    if (students.length > 0) {
      loadPhotos()
    }
  }, [students])

  return { studentsWithPhotos, loading }
}

// Usage
function StudentList({ students }) {
  const { studentsWithPhotos, loading } = useStudentPhotos(students)

  if (loading) return <CircularProgress />

  return studentsWithPhotos.map(student => (
    <EmentorAvatar
      key={student.id}
      userId={student.id}
      userType={UserType.STUDENT}
      avatarSrc={student.avatar}
    />
  ))
}
```

---

### Prefetch Photos in Background

```tsx
import { preloadPhotosForUsers } from 'src/@core/services/photo-loader'

function StudentListWithPrefetch({ students }) {
  // Prefetch next page photos in background
  useEffect(() => {
    const nextPageStudents = students.slice(25, 50)
    preloadPhotosForUsers(nextPageStudents) // Fire and forget
  }, [students])

  // ... render current page
}
```

---

### Clear Cache on Logout

```tsx
import { photoCacheService } from 'src/@core/services/photo-cache-service-instance'

function LogoutButton() {
  const handleLogout = () => {
    // Clear photo cache
    photoCacheService.clearCache()

    // Logout logic
    logout()
  }

  return <Button onClick={handleLogout}>Logout</Button>
}
```

---

### Monitor Cache Performance

```tsx
import { photoCacheService } from 'src/@core/services/photo-cache-service-instance'

function CacheStats() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(photoCacheService.getCacheStats())
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  if (!stats) return null

  return (
    <Box>
      <Typography>Cache Size: {stats.cacheSize}</Typography>
      <Typography>Hit Rate: {(stats.hitRate * 100).toFixed(1)}%</Typography>
      <Typography>Total Hits: {stats.totalHits}</Typography>
      <Typography>Total Misses: {stats.totalMisses}</Typography>
    </Box>
  )
}
```

---

## 🐛 Troubleshooting

### Photos not loading?

1. **Check user has valid ID:**
   ```tsx
   console.log('User ID:', userId) // Should not be null/undefined
   ```

2. **Check user type is correct:**
   ```tsx
   <EmentorAvatar userType={UserType.STUDENT} /> // Not "student" string
   ```

3. **Check Redux store has user data:**
   ```tsx
   const user = useSelector(selectAllStudents).find(u => u.id === userId)
   console.log('User data:', user)
   ```

### Still getting 429 errors?

1. **Check referrerPolicy is applied:**
   - Open DevTools → Network tab
   - Click on a Google photo request
   - Check Headers → Request Headers
   - Should NOT see `Referer: http://localhost:3000`

2. **Check PhotoCacheService initialization:**
   - Look for console message: `[PhotoCache] Initialized with parallel photo loading`
   - Should show 20 parallel requests, not 1

### Photos showing wrong user?

1. **Check userId prop is unique:**
   ```tsx
   {students.map(s => (
     <EmentorAvatar key={s.id} userId={s.id} /> // ✅ Unique ID
   ))}
   ```

2. **Clear cache and reload:**
   ```tsx
   photoCacheService.clearCache()
   ```

---

## 📊 Performance Metrics

### Expected Performance

| Scenario | First Load | Subsequent Load |
|----------|------------|-----------------|
| Single avatar | ~200-500ms | Instant (cache) |
| 10 avatars | ~1-2 seconds | Instant (cache) |
| 50 avatars | ~2-3 seconds | Instant (cache) |
| 100 avatars (paginated) | ~1-2 sec/page | Instant (cache) |

### Network Requests

| Scenario | Network Requests |
|----------|------------------|
| Single avatar | 1 request |
| 10 avatars | 10 parallel requests |
| 50 avatars | 50 parallel (max 20 concurrent) |
| Cached avatar | 0 requests |

### Cache Stats (After 30 min of use)

- **Hit Rate**: 70-90%
- **Cache Size**: 50-200 images
- **Memory Usage**: ~5-20MB (blob URLs)

---

## 🎓 Summary

### Quick Reference

**Single Avatar:**
```tsx
<EmentorAvatar userId={id} userType={UserType.STUDENT} />
```

**Large Avatar:**
```tsx
<EmentorAvatar userId={id} userType={UserType.STUDENT} fullSize={true} sx={{ width: 150, height: 150 }} />
```

**List of Avatars:**
```tsx
{students.map(s => (
  <EmentorAvatar key={s.id} userId={s.id} userType={UserType.STUDENT} />
))}
```

**Pre-loaded Avatar:**
```tsx
<EmentorAvatar userId={id} userType={UserType.STUDENT} avatarSrc={photoUrl} />
```

### Key Features

- ✅ Automatic loading and caching
- ✅ No 429 errors (referrerPolicy)
- ✅ Parallel loading (20 concurrent)
- ✅ 30-minute cache
- ✅ Lazy loading
- ✅ Fallback to initials
- ✅ TypeScript support

### When to Use What

| Use Case | Solution |
|----------|----------|
| Single user | `<EmentorAvatar />` |
| Small list (<20) | `<EmentorAvatar />` for each |
| Large list (20-100) | Pre-load with `loadPhotosForUsers()` |
| Paginated list (100+) | Pre-load with `loadPhotosForPage()` |
| Profile page | `fullSize={true}` |
| List/table | Default size (no fullSize) |

---

## 📚 Related Documentation

- [PHOTO_SYSTEM_SUMMARY.md](PHOTO_SYSTEM_SUMMARY.md) - Overall system architecture
- [PHOTO_LOADING_GUIDE.md](PHOTO_LOADING_GUIDE.md) - Photo loader utilities
- [GOOGLE_PHOTOS_429_ISSUE.md](GOOGLE_PHOTOS_429_ISSUE.md) - Why 429 errors happened and how we fixed them

---

**That's it!** You now know everything about using EmentorAvatar. For most cases, just use `<EmentorAvatar userId={id} userType={UserType.STUDENT} />` and let it handle everything automatically. 🎉
