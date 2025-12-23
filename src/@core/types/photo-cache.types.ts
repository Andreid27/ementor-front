/**
 * Photo Cache Type Definitions
 *
 * Defines types for the PhotoCacheService that handles unified caching
 * for both API-based and external (Google) profile photos.
 */

/**
 * Photo type enum
 */
export type PhotoType = 'API' | 'EXTERNAL' | 'NONE'

/**
 * Photo information returned by extractProfilePicture
 */
export interface PhotoInfo {
  type: PhotoType
  url?: string
  userId: string
  domain?: string
}

/**
 * Queued request in the rate limiter
 */
export interface QueuedRequest {
  url: string
  resolve: (value: Response) => void
  reject: (error: Error) => void
  retries: number
  timestamp: number
}

/**
 * Rate limit configuration for a domain
 */
export interface RateLimitConfig {
  maxConcurrent: number
  minSpacing: number // milliseconds between requests
  retryConfig?: {
    maxRetries: number
    baseDelay: number // milliseconds
    maxDelay: number // milliseconds
  }
}

/**
 * Overall photo cache configuration
 */
export interface PhotoCacheConfig {
  rateLimits: Record<string, RateLimitConfig>
  cache: {
    maxSize: number
    ttl: number // milliseconds
    enableLRU: boolean
  }
}

/**
 * Cache entry with metadata
 */
export interface CacheEntry {
  blobUrl: string | null
  timestamp: number
  lastAccessed: number
  userId: string
  type: PhotoType
}

/**
 * Cache statistics
 */
export interface CacheStats {
  cacheSize: number
  inFlightRequests: number
  totalHits: number
  totalMisses: number
  hitRate: number
  cacheKeys: string[]
  queueSizes: Record<string, number>
}
