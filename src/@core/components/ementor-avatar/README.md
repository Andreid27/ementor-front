# EmentorAvatar Component

A reusable Avatar component with built-in profile fetching and avatar downloading logic.

## Features

- Automatic profile fetching from Redux store
- Automatic avatar downloading with caching
- Support for both professors and students
- Support for pre-downloaded avatars
- Compatible with MUI transitions (Zoom, Slide, etc.)

## Usage

### Case 1: Professor Avatar (with userId)

```tsx
import EmentorAvatar, { UserType } from 'src/@core/components/ementor-avatar'

;<EmentorAvatar userId={professorUserId} userType={UserType.PROFESSOR} sx={{ width: 48, height: 48 }} />
```

The component will:

1. Fetch the professor profile from Redux store (with 30-day caching)
2. Download and display the avatar automatically

### Case 2: Student Avatar (with userId)

```tsx
import EmentorAvatar, { UserType } from 'src/@core/components/ementor-avatar'

;<EmentorAvatar userId={studentUserId} userType={UserType.STUDENT} sx={{ width: 48, height: 48 }} />
```

The component will:

1. Find the student in `selectAllStudents` Redux store
2. Download and display the avatar automatically

### Case 3: Pre-downloaded Avatar (bulk processing)

When avatars are already downloaded in bulk (like in the Timeline example):

```tsx
import EmentorAvatar, { UserType } from 'src/@core/components/ementor-avatar'

// Avatar already downloaded in bulk
const processedData = await processStudentQuizzesData(data, users)

<EmentorAvatar
  userType={UserType.STUDENT}
  avatarSrc={row.avatar} // Pre-downloaded avatar URL
  sx={{ width: 40, height: 40 }}
/>
```

The component will use the provided `avatarSrc` directly without fetching.

## Props

| Prop        | Type                          | Required | Description                                           |
| ----------- | ----------------------------- | -------- | ----------------------------------------------------- |
| `userId`    | `string \| null \| undefined` | No\*     | User ID to fetch profile for                          |
| `userType`  | `UserType`                    | Yes      | Either `UserType.STUDENT` or `UserType.PROFESSOR`     |
| `avatarSrc` | `string \| null`              | No       | Pre-downloaded avatar URL (skips fetching)            |
| `fullSize`  | `boolean`                     | No       | Whether to download full-size avatar (default: false) |
| `sx`        | `object`                      | No       | MUI sx prop for styling                               |
| `alt`       | `string`                      | No       | Alt text for the avatar                               |
| ...rest     | `any`                         | No       | Any other MUI Avatar props                            |

\*Required unless `avatarSrc` is provided

## Examples with MUI Transitions

### With Zoom

```tsx
<Zoom in={open} timeout={700}>
  <EmentorAvatar userId={userId} userType={UserType.PROFESSOR} sx={{ width: 48, height: 48 }} />
</Zoom>
```

### With Slide

```tsx
<Slide direction='up' in={open}>
  <EmentorAvatar userId={userId} userType={UserType.STUDENT} sx={{ width: 40, height: 40 }} />
</Slide>
```

## How it Works

### For Professors

1. Component checks Redux store for cached professor profile
2. If not cached or expired (>30 days), fetches from API
3. Extracts profile picture info
4. Downloads avatar using `profilePictureDownloader`
5. Displays the avatar

### For Students (Case 1)

1. Component looks up student in `selectAllStudents` Redux store
2. Extracts profile picture info
3. Downloads avatar using `profilePictureDownloader`
4. Displays the avatar

### For Pre-downloaded Avatars (Case 2)

1. Component receives `avatarSrc` prop
2. Directly uses the provided URL
3. No fetching or downloading needed

## Notes

- The component uses `forwardRef` to work with MUI transitions
- Avatar downloading is cached by `profilePictureDownloader` singleton
- Handles API, External, and None picture types
- Automatically handles CORS for external images (Google, etc.)
