/**
 * PhotoCacheService Singleton Instance
 *
 * Single shared instance of PhotoCacheService used across the entire application.
 * This ensures consistent caching and rate limiting for all photo loading operations.
 */

import { PhotoCacheService } from './PhotoCacheService'
import { PHOTO_CACHE_CONFIG } from '../config/photo-cache-config'

/**
 * Singleton instance of PhotoCacheService
 * Import and use this instance throughout the application
 */
export const photoCacheService = new PhotoCacheService(PHOTO_CACHE_CONFIG)

/**
 * Export the class as well for testing purposes
 */
export { PhotoCacheService }
