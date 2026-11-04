/**
 * Where a user's profile photo can be downloaded from, best source first.
 *
 * Users reach the frontend in several shapes: Keycloak users and student lists keep the photo in
 * `attributes` (`pictureId`, `picture`), profile DTOs keep `pictureId` at the top, the Google picture in
 * `user.picture`, and the one saved at registration in `pictureUrl`. This is the one place that reads them.
 */
import { PROFILE_IMAGE_CONTROLLER, THUMBNAIL_CONTROLLER } from 'src/apiSpec'

export type PhotoSize = 'thumb' | 'full'

export interface PhotoSource {
  // API photos need the user's token; EXTERNAL ones (Google) are public
  kind: 'API' | 'EXTERNAL'
  url: string
  // The uploaded photo both sizes belong to; the cache shares one request budget between them
  photoId?: string
}

const firstString = (value: unknown): string | undefined => {
  const item = Array.isArray(value) ? value[0] : value

  return typeof item === 'string' && item.length > 0 ? item : undefined
}

const uploadedPictureId = (user: any): string | undefined =>
  firstString(user?.attributes?.pictureId) ??
  firstString(user?.pictureId) ??
  firstString(user?.user?.attributes?.pictureId)

// The Keycloak attribute is refreshed on every Google login; pictureUrl is the copy saved at registration
const googlePicture = (user: any): string | undefined =>
  firstString(user?.attributes?.picture) ??
  firstString(user?.user?.picture) ??
  firstString(user?.user?.attributes?.picture) ??
  firstString(user?.pictureUrl)

// Google serves any size; the stored link asks for 96 px, which is blurry in the profile drawer
const sizedGoogleUrl = (url: string, size: PhotoSize): string =>
  size === 'full' && url.includes('googleusercontent.com') ? url.replace(/=s\d+(-c)?$/, '=s800-c') : url

/**
 * The photo sources for a user, in the order to try them: the uploaded photo in the asked size,
 * the uploaded photo in the other size, then the Google picture. An empty list means the user has
 * no photo.
 */
export const getPhotoSources = (user: any, size: PhotoSize = 'thumb'): PhotoSource[] => {
  if (!user) return []

  const sources: PhotoSource[] = []
  const pictureId = uploadedPictureId(user)

  if (pictureId) {
    const thumb: PhotoSource = { kind: 'API', url: `${THUMBNAIL_CONTROLLER}/download/${pictureId}`, photoId: pictureId }
    const full: PhotoSource = { kind: 'API', url: `${PROFILE_IMAGE_CONTROLLER}/download/${pictureId}`, photoId: pictureId }
    sources.push(...(size === 'full' ? [full, thumb] : [thumb, full]))
  }

  const google = googlePicture(user)
  if (google) {
    sources.push({ kind: 'EXTERNAL', url: sizedGoogleUrl(google, size) })
  }

  return sources
}
