/**
 * The avatar for a student or a professor, used everywhere a person's photo appears.
 *
 * Shows the person's photo once it is downloaded, and their initials until then or when there is no photo.
 * Photos come from the shared photo cache, so each one is downloaded once per session.
 */
import { forwardRef, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import CustomAvatar from 'src/@core/components/mui/avatar'
import Icon from 'src/@core/components/icon'
import { getPhotoSources } from 'src/@core/services/photo-sources'
import { photoCache } from 'src/@core/services/photo-cache'
import { fetchProfessorProfile, selectProfessorProfile, selectStudentById } from 'src/store/apps/user'

export enum UserType {
  STUDENT = 'student',
  PROFESSOR = 'professor'
}

interface EmentorAvatarProps {
  // The person's user id; the student or professor is looked up in the store
  userId?: string | null
  userType?: UserType
  // The person, when the caller already has them (any shape: student list item, profile DTO, Keycloak user)
  user?: any
  // Display name for the initials, when the person is not in the store
  name?: string | null
  alt?: string
  // The full-size photo instead of the thumbnail
  fullSize?: boolean
  sx?: any
  [key: string]: any
}

const AVATAR_COLORS = ['primary', 'secondary', 'error', 'warning', 'info', 'success'] as const

// The same person always gets the same color
const colorFor = (seed: string | null | undefined): (typeof AVATAR_COLORS)[number] => {
  if (!seed) return 'primary'
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i)
    hash |= 0
  }

  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

// First letter of the first and of the last name: "Ana Maria Pop" -> "AP"
export const initialsOf = (fullName: string | null | undefined): string => {
  const parts = (fullName || '').trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return ''

  return `${parts[0][0]}${parts.length > 1 ? parts[parts.length - 1][0] : ''}`.toUpperCase()
}

const personName = (person: any): string => {
  if (!person) return ''
  const first = person.firstName ?? person.user?.firstName
  const last = person.lastName ?? person.user?.lastName

  return [first, last].filter(Boolean).join(' ') || person.fullName || person.studentName || ''
}

const EmentorAvatar = forwardRef<any, EmentorAvatarProps>(
  ({ userId, userType = UserType.STUDENT, user, name, alt, fullSize = false, sx, imgProps, ...avatarProps }, ref) => {
    const dispatch = useDispatch()
    const isProfessor = userType === UserType.PROFESSOR

    const professorProfile = useSelector((state: any) =>
      isProfessor && userId ? selectProfessorProfile(userId)(state) : null
    )

    const storedStudent = useSelector((state: any) =>
      !isProfessor && userId ? selectStudentById(userId)(state) : null
    )

    useEffect(() => {
      if (isProfessor && userId) {
        // @ts-ignore - thunk dispatch typing; the thunk returns the cached profile when it has one
        dispatch(fetchProfessorProfile(userId))
      }
    }, [dispatch, isProfessor, userId])

    // The person passed in wins; the stored copy fills in what it lacks (often the photo fields)
    const stored = isProfessor ? professorProfile : storedStudent
    const size = fullSize ? 'full' : 'thumb'
    const ownSources = getPhotoSources(user, size)
    const sources = ownSources.length > 0 ? ownSources : getPhotoSources(stored, size)
    const sourcesKey = sources.map(source => source.url).join('|')

    // The photo belongs to the sources it was loaded for, so a reused avatar never shows the previous person
    const [photo, setPhoto] = useState<{ key: string; url: string | null }>(() => ({
      key: sourcesKey,
      url: photoCache.peek(sources)
    }))

    useEffect(() => {
      // Show what is already downloaded at once, then fetch the preferred photo if that was not it
      setPhoto({ key: sourcesKey, url: photoCache.peek(sources) })
      if (sources.length === 0 || photoCache.hasBest(sources)) return

      let active = true
      photoCache.load(sources).then(url => {
        if (active) setPhoto({ key: sourcesKey, url })
      })

      return () => {
        active = false
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sourcesKey])

    const photoUrl = photo.key === sourcesKey ? photo.url : photoCache.peek(sources)
    const displayName = personName(user) || personName(stored) || name || alt || ''
    const initials = initialsOf(displayName)

    const handleImageError = () => {
      if (photoUrl) photoCache.forget(photoUrl)
      setPhoto({ key: sourcesKey, url: null })
    }

    // Type assertion needed because the custom Avatar component has no TypeScript types
    const AvatarComponent = CustomAvatar as any

    return (
      <AvatarComponent
        ref={ref}
        skin='light'
        color={colorFor(userId || displayName)}
        {...avatarProps}
        sx={sx}
        src={photoUrl || undefined}
        alt={displayName}
        imgProps={{ ...imgProps, onError: handleImageError }}
      >
        {photoUrl ? null : initials || <Icon icon='tabler:user' fontSize='60%' />}
      </AvatarComponent>
    )
  }
)

EmentorAvatar.displayName = 'EmentorAvatar'

export default EmentorAvatar
