/**
 * PhotoCacheService
 *
 * Unified photo caching service that handles both API and EXTERNAL (Google) photos.
 * Features:
 * - Blob URL caching for all photo types
 * - Domain-based rate limiting to prevent 429 errors
 * - Request queuing with configurable concurrency limits
 * - Exponential backoff retry logic for failed requests
 * - In-flight request deduplication
 * - LRU cache eviction
 * - Memory management with blob URL cleanup
 */

import apiClient from '../axios/axiosEmentor'
import {
  PhotoType,
  PhotoCacheConfig,
  QueuedRequest,
  RateLimitConfig,
  CacheEntry,
  CacheStats
} from '../types/photo-cache.types'

/**
 * Request Queue for domain-based rate limiting
 */
class RequestQueue {
  private domain: string
  private config: RateLimitConfig
  private activeRequests: number = 0
  private pendingRequests: QueuedRequest[] = []
  private lastRequestTime: number = 0

  constructor(domain: string, config: RateLimitConfig) {
    this.domain = domain
    this.config = config
  }

  /**
   * Enqueue a request with rate limiting
   */
  async enqueue(url: string, retries: number = 0): Promise<Response> {
    return new Promise<Response>((resolve, reject) => {
      const queuedRequest: QueuedRequest = {
        url,
        resolve,
        reject,
        retries,
        timestamp: Date.now()
      }

      this.pendingRequests.push(queuedRequest)
      this.processQueue()
    })
  }

  /**
   * Process the queue, respecting concurrency and spacing limits
   */
  private async processQueue(): Promise<void> {
    // Check if we can process more requests
    if (this.activeRequests >= this.config.maxConcurrent) {
      return
    }

    if (this.pendingRequests.length === 0) {
      return
    }

    // Check minimum spacing between requests
    const now = Date.now()
    const timeSinceLastRequest = now - this.lastRequestTime
    if (timeSinceLastRequest < this.config.minSpacing) {
      // Wait for the remaining time then try again
      const delay = this.config.minSpacing - timeSinceLastRequest
      setTimeout(() => this.processQueue(), delay)
      return
    }

    // Get next request from queue
    const request = this.pendingRequests.shift()
    if (!request) return

    this.activeRequests++
    this.lastRequestTime = Date.now()

    // Execute the request
    this.executeRequest(request)

    // Try to process more requests
    setTimeout(() => this.processQueue(), this.config.minSpacing)
  }

  /**
   * Execute a single request with retry logic
   */
  private async executeRequest(request: QueuedRequest): Promise<void> {
    try {
      const response = await fetch(request.url, {
        mode: 'cors',
        credentials: 'omit',
        referrerPolicy: 'no-referrer' // Prevent Google from tracking referrer for rate limiting
      })

      // Handle 429 Too Many Requests
      if (response.status === 429) {
        await this.handleRetry(request, response)
        return
      }

      // Handle other error status codes
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      // Success - resolve the promise
      request.resolve(response.clone())
    } catch (error) {
      // Handle network errors or CORS issues
      await this.handleError(request, error as Error)
    } finally {
      this.activeRequests--
      this.processQueue() // Continue processing queue
    }
  }

  /**
   * Handle retry for 429 errors with exponential backoff
   */
  private async handleRetry(request: QueuedRequest, response: Response): Promise<void> {
    const retryConfig = this.config.retryConfig
    if (!retryConfig || request.retries >= retryConfig.maxRetries) {
      // Max retries exceeded
      console.warn(
        `[PhotoCache] ⚠️  429 Too Many Requests after ${request.retries} retries for ${this.domain}.\n` +
        `Photo will show initials. This is rare with referrerPolicy="no-referrer".`
      )
      request.reject(new Error(`429 Too Many Requests after ${request.retries} retries`))
      return
    }

    // Calculate delay with exponential backoff
    const retryAfter = response.headers.get('Retry-After')
    let delay = retryConfig.baseDelay * Math.pow(2, request.retries)

    // Use Retry-After header if present
    if (retryAfter) {
      const retryAfterMs = parseInt(retryAfter) * 1000
      delay = Math.max(delay, retryAfterMs)
    }

    // Add jitter (random 0-20% of delay)
    delay = delay + Math.random() * delay * 0.2

    // Cap at maxDelay
    delay = Math.min(delay, retryConfig.maxDelay)

    console.warn(
      `[PhotoCache] ⏳ 429 for ${this.domain}, retrying in ${Math.round(delay / 1000)}s ` +
      `(attempt ${request.retries + 1}/${retryConfig.maxRetries})`
    )

    // Re-queue with incremented retry count
    setTimeout(() => {
      this.enqueue(request.url, request.retries + 1)
        .then(request.resolve)
        .catch(request.reject)
    }, delay)
  }

  /**
   * Handle network or CORS errors
   */
  private async handleError(request: QueuedRequest, error: Error): Promise<void> {
    const retryConfig = this.config.retryConfig
    if (!retryConfig || request.retries >= retryConfig.maxRetries) {
      // Max retries exceeded
      request.reject(error)
      return
    }

    // Retry with exponential backoff
    const delay = retryConfig.baseDelay * Math.pow(2, request.retries)
    console.warn(`[PhotoCache] Error for ${this.domain}, retrying in ${delay}ms:`, error.message)

    setTimeout(() => {
      this.enqueue(request.url, request.retries + 1)
        .then(request.resolve)
        .catch(request.reject)
    }, delay)
  }

  /**
   * Get current queue size
   */
  getQueueSize(): number {
    return this.pendingRequests.length
  }
}

/**
 * Main PhotoCacheService
 */
export class PhotoCacheService {
  private config: PhotoCacheConfig
  private cache: Map<string, CacheEntry> = new Map()
  private inFlightRequests: Map<string, Promise<string | null>> = new Map()
  private requestQueues: Map<string, RequestQueue> = new Map()

  // Statistics
  private stats = {
    totalHits: 0,
    totalMisses: 0
  }

  constructor(config: PhotoCacheConfig) {
    this.config = config

    // Log initialization info
    console.log(
      '%c[PhotoCache] Initialized with parallel photo loading:',
      'color: #4CAF50; font-weight: bold',
      `\n- Google Photos: ${config.rateLimits['lh3.googleusercontent.com'].maxConcurrent} parallel requests` +
      `\n- Cache: ${config.cache.maxSize} images, ${config.cache.ttl / 60000}min TTL` +
      `\n- Using referrerPolicy="no-referrer" to prevent rate limiting` +
      `\n\n✅ Photos will load quickly in parallel and be cached for ${config.cache.ttl / 60000} minutes.`
    )
  }

  /**
   * Get a photo with caching and rate limiting
   *
   * @param type - Photo type (API or EXTERNAL)
   * @param url - Photo URL
   * @param userId - User ID for cache key
   * @param fullSize - Whether to fetch full size or thumbnail
   * @returns Promise resolving to blob URL or null
   */
  async getPhoto(
    type: PhotoType,
    url: string | undefined,
    userId: string,
    fullSize: boolean = false
  ): Promise<string | null> {
    if (!url || type === 'NONE') {
      return null
    }

    // Generate cache key
    const cacheKey = this.generateCacheKey(type, userId, url, fullSize)

    // Check cache first
    const cached = this.checkCache(cacheKey)
    if (cached !== undefined) {
      this.stats.totalHits++
      return cached
    }

    this.stats.totalMisses++

    // Check if request is already in flight
    if (this.inFlightRequests.has(cacheKey)) {
      return this.inFlightRequests.get(cacheKey)!
    }

    // Create new request
    const requestPromise = this.fetchAndCachePhoto(type, url, userId, fullSize, cacheKey)
    this.inFlightRequests.set(cacheKey, requestPromise)

    try {
      const result = await requestPromise
      return result
    } finally {
      this.inFlightRequests.delete(cacheKey)
    }
  }

  /**
   * Generate a unique cache key
   */
  private generateCacheKey(type: PhotoType, userId: string, url: string, fullSize: boolean): string {
    // Simple hash for URL to keep key manageable
    const urlHash = this.simpleHash(url)
    return `${type}-${userId}-${urlHash}-${fullSize ? 'full' : 'thumb'}`
  }

  /**
   * Simple string hash function
   */
  private simpleHash(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36)
  }

  /**
   * Check cache for a photo
   */
  private checkCache(cacheKey: string): string | null | undefined {
    const entry = this.cache.get(cacheKey)
    if (!entry) {
      return undefined
    }

    // Check TTL
    const now = Date.now()
    if (now - entry.timestamp > this.config.cache.ttl) {
      // Expired - remove from cache
      this.evictCacheEntry(cacheKey)
      return undefined
    }

    // Update last accessed time for LRU
    entry.lastAccessed = now

    // Log cache hit for debugging (only for EXTERNAL to avoid spam)
    if (entry.type === 'EXTERNAL') {
      console.log(`[PhotoCache] ✅ Cache HIT for user ${entry.userId} (${entry.type})`)
    }

    return entry.blobUrl
  }

  /**
   * Fetch and cache a photo
   */
  private async fetchAndCachePhoto(
    type: PhotoType,
    url: string,
    userId: string,
    fullSize: boolean,
    cacheKey: string
  ): Promise<string | null> {
    try {
      let blobUrl: string | null = null

      if (type === 'API') {
        // Fetch from API backend (existing pattern)
        blobUrl = await this.fetchAPIPhoto(url, userId, fullSize)
      } else if (type === 'EXTERNAL') {
        // Fetch external URL with rate limiting
        blobUrl = await this.fetchExternalPhoto(url)
      }

      // Cache the result (even if null to prevent retry storms)
      this.setCacheEntry(cacheKey, blobUrl, userId, type)

      return blobUrl
    } catch (error) {
      console.error(`[PhotoCache] Failed to fetch photo:`, error)
      // Cache null result to prevent repeated failures
      this.setCacheEntry(cacheKey, null, userId, type)
      return null
    }
  }

  /**
   * Fetch API photo via backend (uses existing apiClient)
   */
  private async fetchAPIPhoto(url: string, userId: string, fullSize: boolean): Promise<string | null> {
    try {
      const response = await apiClient.get(url, {
        responseType: 'blob'
      })

      if (response && response.data) {
        return URL.createObjectURL(response.data)
      }

      return null
    } catch (error) {
      console.error(`[PhotoCache] API photo fetch failed:`, error)
      return null
    }
  }

  /**
   * Fetch external photo with rate limiting and convert to blob URL
   */
  private async fetchExternalPhoto(url: string): Promise<string | null> {
    try {
      // Extract domain for rate limiting
      const domain = this.extractDomain(url)
      const queue = this.getOrCreateQueue(domain)

      // Enqueue request with rate limiting
      const response = await queue.enqueue(url)

      // Convert response to blob URL
      const blob = await response.blob()
      return URL.createObjectURL(blob)
    } catch (error) {
      // If CORS fails, log warning and return original URL as fallback
      if (error instanceof TypeError && error.message.includes('CORS')) {
        console.warn(`[PhotoCache] CORS blocked for ${url}, using direct URL`)
        // Return original URL as fallback (won't be cached as blob)
        return url
      }

      console.error(`[PhotoCache] External photo fetch failed:`, error)
      return null
    }
  }

  /**
   * Extract domain from URL
   */
  private extractDomain(url: string): string {
    try {
      const urlObj = new URL(url)
      return urlObj.hostname
    } catch {
      return 'unknown'
    }
  }

  /**
   * Get or create request queue for a domain
   */
  private getOrCreateQueue(domain: string): RequestQueue {
    if (!this.requestQueues.has(domain)) {
      // Get config for this domain or use default
      const config = this.config.rateLimits[domain] || this.config.rateLimits.default
      const queue = new RequestQueue(domain, config)
      this.requestQueues.set(domain, queue)
    }

    return this.requestQueues.get(domain)!
  }

  /**
   * Set cache entry with LRU eviction
   */
  private setCacheEntry(cacheKey: string, blobUrl: string | null, userId: string, type: PhotoType): void {
    // Check if we need to evict entries
    if (this.config.cache.enableLRU && this.cache.size >= this.config.cache.maxSize) {
      this.evictLRU()
    }

    const now = Date.now()
    this.cache.set(cacheKey, {
      blobUrl,
      timestamp: now,
      lastAccessed: now,
      userId,
      type
    })
  }

  /**
   * Evict least recently used cache entry
   */
  private evictLRU(): void {
    let oldestKey: string | null = null
    let oldestTime = Date.now()

    // Find least recently accessed entry
    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.evictCacheEntry(oldestKey)
    }
  }

  /**
   * Evict a single cache entry and cleanup blob URL
   */
  private evictCacheEntry(cacheKey: string): void {
    const entry = this.cache.get(cacheKey)
    if (entry && entry.blobUrl && entry.blobUrl.startsWith('blob:')) {
      URL.revokeObjectURL(entry.blobUrl)
    }
    this.cache.delete(cacheKey)
  }

  /**
   * Clear all cached photos
   */
  clearCache(): void {
    // Revoke all blob URLs
    for (const entry of this.cache.values()) {
      if (entry.blobUrl && entry.blobUrl.startsWith('blob:')) {
        URL.revokeObjectURL(entry.blobUrl)
      }
    }

    this.cache.clear()
    this.inFlightRequests.clear()
    this.stats.totalHits = 0
    this.stats.totalMisses = 0

    console.log('[PhotoCache] Cache cleared')
  }

  /**
   * Clear photos for a specific user
   */
  clearUserPhotos(userId: string): void {
    const keysToDelete: string[] = []

    for (const [key, entry] of this.cache.entries()) {
      if (entry.userId === userId) {
        keysToDelete.push(key)
        if (entry.blobUrl && entry.blobUrl.startsWith('blob:')) {
          URL.revokeObjectURL(entry.blobUrl)
        }
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key))

    console.log(`[PhotoCache] Cleared ${keysToDelete.length} photos for user ${userId}`)
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): CacheStats {
    const queueSizes: Record<string, number> = {}
    for (const [domain, queue] of this.requestQueues.entries()) {
      queueSizes[domain] = queue.getQueueSize()
    }

    const totalRequests = this.stats.totalHits + this.stats.totalMisses
    const hitRate = totalRequests > 0 ? this.stats.totalHits / totalRequests : 0

    return {
      cacheSize: this.cache.size,
      inFlightRequests: this.inFlightRequests.size,
      totalHits: this.stats.totalHits,
      totalMisses: this.stats.totalMisses,
      hitRate: Math.round(hitRate * 100) / 100,
      cacheKeys: Array.from(this.cache.keys()),
      queueSizes
    }
  }
}
