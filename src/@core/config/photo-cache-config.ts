/**
 * Photo Cache Configuration
 *
 * Configures rate limiting and caching behavior for the PhotoCacheService.
 * Different domains have different rate limits to prevent 429 errors.
 */

import { PhotoCacheConfig } from '../types/photo-cache.types'

export const PHOTO_CACHE_CONFIG: PhotoCacheConfig = {
  /**
   * Rate limiting configuration per domain
   */
  rateLimits: {
    /**
     * Google Photos - Parallel loading with referrerPolicy="no-referrer"
     * The no-referrer policy prevents Google's rate limiting
     * Allow parallel requests and cache the results
     */
    'lh3.googleusercontent.com': {
      maxConcurrent: 20, // Allow many parallel requests
      minSpacing: 0, // No artificial delays
      retryConfig: {
        maxRetries: 2, // Minimal retries since 429s shouldn't happen
        baseDelay: 1000,
        maxDelay: 5000
      }
    },

    /**
     * E-Mentor API - More relaxed limits for our own backend
     */
    'api.e-mentor.ro': {
      maxConcurrent: 10,
      minSpacing: 0, // No spacing needed for our API
      retryConfig: {
        maxRetries: 2,
        baseDelay: 500,
        maxDelay: 5000
      }
    },

    /**
     * Default configuration for other external domains
     */
    default: {
      maxConcurrent: 5,
      minSpacing: 200,
      retryConfig: {
        maxRetries: 2,
        baseDelay: 1000,
        maxDelay: 5000
      }
    }
  },

  /**
   * Cache configuration
   */
  cache: {
    /**
     * Maximum number of images to cache
     * When exceeded, least recently used images will be evicted
     */
    maxSize: 500,

    /**
     * Time-to-live for cached images (2 hours)
     * Images older than this will be refetched
     */
    ttl: 2 * 60 * 60 * 1000,

    /**
     * Enable LRU (Least Recently Used) eviction
     */
    enableLRU: true
  }
}
