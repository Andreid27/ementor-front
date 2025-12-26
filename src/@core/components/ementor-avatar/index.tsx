// ** React Imports
import { useState, useEffect, forwardRef } from 'react'

// ** Redux Imports
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchProfessorProfile as fetchProfessorProfileAction,
  selectProfessorProfile,
  selectAllStudents
} from 'src/store/apps/user'

// ** MUI Imports
import Avatar from 'src/@core/components/mui/avatar'

// ** Utils
import extractProfilePicture from 'src/@core/axios/profile-picture-extractor'
import profilePictureDownloader from 'src/@core/axios/profile-picture-downloader'
import { photoCacheService } from 'src/@core/services/photo-cache-service-instance'

export enum UserType {
  STUDENT = 'student',
  PROFESSOR = 'professor'
}

interface EmentorAvatarProps {
  userId?: string | null | undefined
  userType: UserType
  fullSize?: boolean
  // For pre-downloaded avatars (case 2)
  avatarSrc?: string | null
  sx?: any
  alt?: string
  className?: string
  [key: string]: any // Allow any other Avatar props
}

// ** Helper Functions (Single Responsibility Principle)

/**
 * Available avatar colors for MUI Avatar component
 */
const AVATAR_COLORS = ['primary', 'secondary', 'error', 'warning', 'info', 'success'] as const

/**
 * Generate a consistent color based on user ID
 * Uses a simple hash function to convert ID to a color index
 */
const getAvatarColor = (userId: string | null | undefined): typeof AVATAR_COLORS[number] => {
  if (!userId) return 'primary'

  // Simple hash function to convert string to number
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }

  // Get absolute value and map to color index
  const index = Math.abs(hash) % AVATAR_COLORS.length
  return AVATAR_COLORS[index]
}

/**
 * Processes picture info and returns the appropriate avatar URL
 * Now uses PhotoCacheService for unified caching of both API and EXTERNAL photos
 */
const processAvatarUrl = async (pictureInfo: any, fullSize: boolean): Promise<string | null> => {
  if (pictureInfo.type === 'API') {
    // Use PhotoCacheService for API photos (replaces profilePictureDownloader)
    return await photoCacheService.getPhoto('API', pictureInfo.url, pictureInfo.userId, fullSize)
  }

  if (pictureInfo.type === 'EXTERNAL') {
    // Use PhotoCacheService for EXTERNAL photos (Google photos)
    // This prevents 429 errors by rate limiting and caching as blob URLs
    return await photoCacheService.getPhoto('EXTERNAL', pictureInfo.url, pictureInfo.userId, fullSize)
  }

  return null
}

/**
 * Custom hook to fetch and manage user profile based on type (Single Responsibility)
 */
const useUserProfile = (userId: string | null | undefined, userType: UserType, shouldFetch: boolean) => {
  const dispatch = useDispatch()

  // Conditionally select only the needed profile based on userType
  const professorProfile = useSelector(state =>
    userType === UserType.PROFESSOR && userId ? selectProfessorProfile(userId)(state) : null
  )

  const allStudents = useSelector(state => (userType === UserType.STUDENT ? selectAllStudents(state) : []))

  // Fetch professor profile if needed
  useEffect(() => {
    if (shouldFetch && userId && userType === UserType.PROFESSOR) {
      // @ts-ignore - Dispatch typing issue with thunk
      dispatch(fetchProfessorProfileAction(userId))
    }
  }, [shouldFetch, userId, userType, dispatch])

  // Return the appropriate profile
  if (userType === UserType.PROFESSOR) {
    return professorProfile
  }

  if (userType === UserType.STUDENT && userId) {
    return allStudents.find(student => student.id === userId) || null
  }

  return null
}

/**
 * Custom hook to handle avatar URL management (Single Responsibility)
 */
const useAvatarUrl = (
  userId: string | null | undefined,
  userType: UserType,
  fullSize: boolean,
  avatarSrc: string | null | undefined,
  profile: any
) => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Case 2: Pre-downloaded avatar
  useEffect(() => {
    if (avatarSrc !== undefined) {
      setAvatarUrl(avatarSrc)
    }
  }, [avatarSrc])

  // Case 1: Fetch and download avatar
  useEffect(() => {
    const downloadAvatar = async () => {
      // Skip if pre-downloaded avatar is provided
      if (avatarSrc !== undefined || !userId) {
        if (!userId && avatarSrc === undefined) {
          setAvatarUrl(null)
        }
        return
      }

      setIsLoading(true)
      try {
        if (!profile) {
          setAvatarUrl(null)
          return
        }

        const pictureInfo = extractProfilePicture(profile, fullSize)
        const url = await processAvatarUrl(pictureInfo, fullSize)
        setAvatarUrl(url)
      } catch (error) {
        console.error('Error downloading avatar:', error)
        setAvatarUrl(null)
      } finally {
        setIsLoading(false)
      }
    }

    downloadAvatar()
  }, [userId, profile, fullSize, avatarSrc])

  return { avatarUrl, isLoading }
}

const EmentorAvatar = forwardRef<any, EmentorAvatarProps>(
  ({ userId, userType, fullSize = false, avatarSrc, alt, ...avatarProps }, ref) => {
    // Determine if we should fetch profile from API
    const shouldFetchProfile = userType === UserType.PROFESSOR && !!userId && avatarSrc === undefined

    // Get user profile (conditionally fetches only what's needed based on userType)
    const profile = useUserProfile(userId, userType, shouldFetchProfile)

    // Get avatar URL
    const { avatarUrl } = useAvatarUrl(userId, userType, fullSize, avatarSrc, profile)

    // Generate initials from profile or alt text
    const getInitials = () => {
      if (profile?.firstName || profile?.lastName) {
        const firstName = profile.firstName || ''
        const lastName = profile.lastName || ''
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
      }

      // Fallback to alt text if provided
      if (alt) {
        const parts = alt.trim().split(' ')
        if (parts.length >= 2) {
          return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase()
        }
        return alt.substring(0, 2).toUpperCase()
      }

      return '??'
    }

    // Type assertion needed because custom Avatar component doesn't export proper TypeScript types
    const AvatarComponent = Avatar as any

    // Generate consistent color based on user ID
    const avatarColor = getAvatarColor(userId)

    // Add lazy loading and no-referrer policy to prevent 429 errors from Google
    const imgProps = avatarProps.imgProps || {}
    const enhancedImgProps = {
      ...imgProps,
      loading: 'lazy' as const,
      referrerPolicy: 'no-referrer' as const // Prevent Google from tracking referrer for rate limiting
    }

    // Merge color into sx prop only if no avatar image is available
    const sxWithColor = !avatarUrl ? {
      ...avatarProps.sx,
      bgcolor: `${avatarColor}.main`,
      color: `${avatarColor}.contrastText`
    } : avatarProps.sx

    return (
      <AvatarComponent
        ref={ref}
        {...avatarProps}
        sx={sxWithColor}
        src={avatarUrl || undefined}
        imgProps={enhancedImgProps}
        alt={alt}
      >
        {!avatarUrl && getInitials()}
      </AvatarComponent>
    )
  }
)

EmentorAvatar.displayName = 'EmentorAvatar'

export default EmentorAvatar
