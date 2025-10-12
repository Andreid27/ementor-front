import apiClient from './axiosEmentor'

// Global image cache to store image URLs based on cache key (userId + size)
// This cache persists across the entire application session until page refresh
const imageCache = new Map()

// In-flight requests map to prevent duplicate simultaneous requests
const inFlightRequests = new Map()

/**
 * Downloads and caches profile pictures with singleton behavior
 * @param {string} url - The API endpoint to download the image from
 * @param {string} userId - The unique user identifier
 * @param {boolean} fullSize - Whether to fetch full size or thumbnail
 * @returns {Promise<string|null>} - The blob URL of the cached image or null on error
 */
const profilePictureDownloader = async (url, userId, fullSize = false) => {
  // Create a unique cache key combining userId, URL, and size
  const cacheKey = `${userId}-${url}-${fullSize ? 'full' : 'regular'}`

  // 1. Check if already cached - return immediately
  if (imageCache.has(cacheKey)) {
    console.log(`[ProfilePictureCache] Cache HIT for ${cacheKey}`)

    return imageCache.get(cacheKey)
  }

  // 2. Check if there's already an in-flight request for this exact image
  if (inFlightRequests.has(cacheKey)) {
    console.log(`[ProfilePictureCache] Waiting for in-flight request: ${cacheKey}`)

    // Wait for the existing request to complete and return its result
    return await inFlightRequests.get(cacheKey)
  }

  // 3. Create a new request promise
  const requestPromise = (async () => {
    try {
      console.log(`[ProfilePictureCache] Cache MISS - Downloading: ${cacheKey}`)

      // Fetch the image as a blob from the API
      const response = await apiClient.get(url, {
        responseType: 'blob'
      })

      // Check if the response is a valid blob
      if (response && response.data) {
        const blobUrl = URL.createObjectURL(response.data)

        // Store in cache
        imageCache.set(cacheKey, blobUrl)

        console.log(`[ProfilePictureCache] Cached successfully: ${cacheKey}`)
        console.log(`[ProfilePictureCache] Total cached images: ${imageCache.size}`)

        return blobUrl
      } else {
        throw new Error('Invalid blob response')
      }
    } catch (error) {
      console.error(`[ProfilePictureCache] Error downloading for ${cacheKey}:`, error)

      // Cache null result to prevent retry storms
      imageCache.set(cacheKey, null)

      return null
    } finally {
      // Clean up in-flight request tracking
      inFlightRequests.delete(cacheKey)
    }
  })()

  // Store the promise in in-flight requests
  inFlightRequests.set(cacheKey, requestPromise)

  // Return the promise
  return await requestPromise
}

/**
 * Clear the entire image cache and revoke all blob URLs
 * Useful for memory management or when user logs out
 */
export const clearProfilePictureCache = () => {
  console.log(`[ProfilePictureCache] Clearing cache of ${imageCache.size} images`)

  // Revoke all blob URLs to free memory
  imageCache.forEach(blobUrl => {
    if (blobUrl && typeof blobUrl === 'string' && blobUrl.startsWith('blob:')) {
      URL.revokeObjectURL(blobUrl)
    }
  })

  imageCache.clear()
  inFlightRequests.clear()
}

/**
 * Remove a specific user's images from cache
 * @param {string} userId - The user ID to remove from cache
 */
export const clearUserFromCache = userId => {
  const keysToDelete = []

  imageCache.forEach((value, key) => {
    if (key.startsWith(`${userId}-`)) {
      keysToDelete.push(key)
      if (value && typeof value === 'string' && value.startsWith('blob:')) {
        URL.revokeObjectURL(value)
      }
    }
  })

  keysToDelete.forEach(key => imageCache.delete(key))

  console.log(`[ProfilePictureCache] Cleared ${keysToDelete.length} images for user ${userId}`)
}

/**
 * Get cache statistics
 * @returns {object} Cache statistics
 */
export const getCacheStats = () => {
  return {
    cachedImages: imageCache.size,
    inFlightRequests: inFlightRequests.size,
    cacheKeys: Array.from(imageCache.keys())
  }
}

export default profilePictureDownloader
