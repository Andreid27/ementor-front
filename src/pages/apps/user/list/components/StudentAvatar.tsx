// ** React Imports
import { useState, useEffect } from 'react'

// ** MUI Imports
import Avatar from '@mui/material/Avatar'
import { CircularProgress } from '@mui/material'

// ** Custom Components
import CustomAvatar from 'src/@core/components/mui/avatar'

// ** Utils
import { getInitials } from 'src/@core/utils/get-initials'
import extractProfilePicture from 'src/@core/axios/profile-picture-extractor'
import profilePictureDownloader from 'src/@core/axios/profile-picture-downloader'

// ** API Client
import apiClient from 'src/@core/axios/axiosEmentor'
import * as apiSpec from 'src/apiSpec'

// ** Local Types
import { StudentAvatarProps, PhotoLoadingState } from '../types'
import { handlePhotoError } from '../services'

// ** Constants
import { AVATAR_SETTINGS, PHOTO_LOADING_TIMEOUT } from '../constants'

const StudentAvatar: React.FC<StudentAvatarProps> = ({ student, onClick }) => {
  // ** State
  const [photoState, setPhotoState] = useState<PhotoLoadingState[string]>({
    loading: true,
    url: undefined,
    error: false
  })

  // ** Load student profile picture
  useEffect(() => {
    let isMounted = true
    let timeoutId: NodeJS.Timeout

    const loadProfilePicture = async () => {
      if (!student.studentUserId) {
        setPhotoState({ loading: false, error: true })
        return
      }

      try {
        // Set timeout for photo loading
        timeoutId = setTimeout(() => {
          if (isMounted) {
            setPhotoState({ loading: false, error: true })
            handlePhotoError(student.studentUserId, {
              error: () => {},
              success: () => {},
              warning: () => {},
              info: () => {}
            })
          }
        }, PHOTO_LOADING_TIMEOUT)

        // Fetch profile data
        const profileResponse = await apiClient.get(`${apiSpec.PROFILE_CONTROLLER}/get-full/${student.studentUserId}`)

        if (!isMounted) return

        if (profileResponse.status === 200 && profileResponse.data) {
          const profilePicture = extractProfilePicture(profileResponse.data, true)
          let finalUrl: string | null = null

          if (profilePicture.type === 'API') {
            finalUrl = await profilePictureDownloader(profilePicture.url, profilePicture.userId, true)
          } else if (profilePicture.type === 'EXTERNAL') {
            finalUrl = profilePicture.url
          }

          if (isMounted) {
            clearTimeout(timeoutId)
            setPhotoState({
              loading: false,
              url: finalUrl || undefined,
              error: !finalUrl
            })
          }
        } else {
          if (isMounted) {
            clearTimeout(timeoutId)
            setPhotoState({ loading: false, error: true })
          }
        }
      } catch (error) {
        console.warn(`Failed to load photo for student ${student.studentUserId}:`, error)
        if (isMounted) {
          clearTimeout(timeoutId)
          setPhotoState({ loading: false, error: true })
        }
      }
    }

    loadProfilePicture()

    return () => {
      isMounted = false
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [student.studentUserId])

  // ** Handle avatar click
  const handleAvatarClick = () => {
    if (onClick && student.studentUserId) {
      onClick(student.studentUserId)
    }
  }

  // ** Render loading state
  if (photoState.loading) {
    return (
      <CustomAvatar
        sx={{
          mr: AVATAR_SETTINGS.MARGIN_RIGHT,
          width: AVATAR_SETTINGS.SIZE,
          height: AVATAR_SETTINGS.SIZE,
          cursor: onClick ? 'pointer' : 'default'
        }}
        onClick={handleAvatarClick}
      >
        <CircularProgress size={20} />
      </CustomAvatar>
    )
  }

  // ** Render with photo if available
  if (photoState.url && !photoState.error) {
    return (
      <Avatar
        src={photoState.url}
        sx={{
          mr: AVATAR_SETTINGS.MARGIN_RIGHT,
          width: AVATAR_SETTINGS.SIZE,
          height: AVATAR_SETTINGS.SIZE,
          cursor: onClick ? 'pointer' : 'default'
        }}
        onClick={handleAvatarClick}
      />
    )
  }

  // ** Render fallback with initials
  return (
    <CustomAvatar
      skin='light'
      color={student.avatarColor as any}
      sx={{
        mr: AVATAR_SETTINGS.MARGIN_RIGHT,
        width: AVATAR_SETTINGS.SIZE,
        height: AVATAR_SETTINGS.SIZE,
        fontWeight: AVATAR_SETTINGS.FONT_WEIGHT,
        fontSize: (theme: any) => theme.typography.body1.fontSize,
        cursor: onClick ? 'pointer' : 'default'
      }}
      onClick={handleAvatarClick}
    >
      {getInitials(student.studentName || student.fullName || 'Student')}
    </CustomAvatar>
  )
}

export default StudentAvatar
