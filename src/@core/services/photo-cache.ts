/**
 * The app's one cache of downloaded profile photos.
 *
 * Successful downloads are kept (up to MAX_PHOTOS, oldest dropped first). A failure is never kept as
 * "no photo": the avatar falls back to the next source (then to initials), and the photo is asked for again
 * once its pause is over.
 *
 * Request budget, so a broken photo service is not flooded by its own clients:
 * - one photo (both its sizes together) costs at most PHOTO_REQUEST_BUDGET API requests per
 *   FAILED_PHOTO_PAUSE_MS: normally 2 tries of the preferred size and 1 of the other;
 * - a photo that failed is not requested again for FAILED_PHOTO_PAUSE_MS, however often its avatar mounts;
 * - at most MAX_PARALLEL_API_REQUESTS photo requests are in flight at once;
 * - after OUTAGE_FAILURES requests in a row get no answer from the service (no response, timeout, 502/503/504,
 *   429) the API is left alone for OUTAGE_PAUSE_MS, then a single request checks whether it is back. A 500 from
 *   the service itself is about one photo (a file it cannot read) and only counts against that photo.
 * Avatars that ask for the same photo at the same time share one request.
 *
 * On logout (SESSION_ENDED_EVENT, or clear()) everything is dropped, requests in flight are aborted and queued
 * ones are never sent, so nothing runs with the next user's token.
 */
import axios from 'axios'
import apiClient from 'src/@core/axios/axiosEmentor'
import type { PhotoSource } from './photo-sources'

// Some photo-service pods fail to read files while a node's disk is broken; a second try usually lands on a
// healthy pod. The other size is tried once after that.
const FIRST_SOURCE_ATTEMPTS = 2
const OTHER_SOURCE_ATTEMPTS = 1
const PHOTO_REQUEST_BUDGET = FIRST_SOURCE_ATTEMPTS + OTHER_SOURCE_ATTEMPTS
const RETRY_DELAY_MS = 400

// The API client waits up to 5 minutes; a photo is not worth holding one of the few request slots that long
const REQUEST_TIMEOUT_MS = 15_000

const FAILED_PHOTO_PAUSE_MS = 60_000
const MAX_PARALLEL_API_REQUESTS = 4
const OUTAGE_FAILURES = 6
const OUTAGE_PAUSE_MS = 60_000

// A thumbnail is a few KB; this bounds the memory a long session can hold
const MAX_PHOTOS = 400

/** Dispatched on window when the session ends without going through the logout button (e.g. a 403). */
export const SESSION_ENDED_EVENT = 'ementor:session-ended'

// The service did not answer, or its gateway says it is down or overloaded
const isUnavailable = (error: any): boolean => {
  const status = error?.response?.status

  return status === undefined || status === 429 || status === 502 || status === 503 || status === 504
}

// The service answers 500 "ProfilePicture not found" for a photo it has no record of. That is final for the
// photo, not a sign of an outage, so it is neither retried nor counted toward pausing the API.
const isMissingPhoto = async (error: any): Promise<boolean> => {
  try {
    const data = error?.response?.data
    const text = data instanceof Blob ? await data.text() : JSON.stringify(data ?? '')

    return /not found/i.test(text)
  } catch {
    return false
  }
}

const isImage = (blob: Blob | undefined): blob is Blob =>
  !!blob && blob.size > 0 && !blob.type.includes('json') && !blob.type.includes('text')

const revoke = (url: string | null | undefined) => {
  if (url?.startsWith('blob:')) URL.revokeObjectURL(url)
}

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// What one request to the API came to
type ApiResult = { url: string } | 'retry' | 'failed' | 'skipped'

// The photo, and whether a request was actually made for it (a skipped one does not pause the photo)
type Outcome = { url: string | null; requested: boolean }

class PhotoCache {
  // source url -> object URL (or the plain URL, for a Google photo that refuses CORS); oldest first
  private loaded = new Map<string, string>()
  // source url -> time until which it is not requested again
  private failedUntil = new Map<string, number>()
  // photo id -> API requests spent on it in the current window
  private budgets = new Map<string, { used: number; until: number }>()
  private pendingSources = new Map<string, Promise<string | null>>()
  private pendingChains = new Map<string, Promise<string | null>>()

  private apiFailuresInARow = 0
  private apiPausedUntil = 0
  private apiProbeRunning = false

  private apiRequestsRunning = 0
  private apiRequestsWaiting: Array<(granted: boolean) => void> = []

  // Bumped on logout: work started before it is dropped, and its requests are aborted
  private generation = 0
  private aborter = new AbortController()

  /** The best photo already downloaded for these sources, if any; good enough to show while a better one loads. */
  peek(sources: PhotoSource[]): string | null {
    for (const source of sources) {
      const url = this.loaded.get(source.url)
      if (url) return url
    }

    return null
  }

  /** Whether the preferred source is already downloaded, so there is nothing better to fetch. */
  hasBest(sources: PhotoSource[]): boolean {
    return sources.length > 0 && this.loaded.has(sources[0].url)
  }

  /** The first source that downloads, skipping sources that failed less than a minute ago; null when none does. */
  load(sources: PhotoSource[]): Promise<string | null> {
    if (sources.length === 0) return Promise.resolve(null)
    if (this.hasBest(sources)) return Promise.resolve(this.touch(sources[0].url) as string)

    const key = sources.map(source => source.url).join('|')
    const running = this.pendingChains.get(key)
    if (running) return running

    const chain = this.tryInOrder(sources).finally(() => {
      if (this.pendingChains.get(key) === chain) this.pendingChains.delete(key)
    })
    this.pendingChains.set(key, chain)

    return chain
  }

  /** Drop a photo that turned out not to display: it is freed, and not downloaded again until its pause is over. */
  forget(displayUrl: string): void {
    this.loaded.forEach((url, sourceUrl) => {
      if (url !== displayUrl) return
      this.loaded.delete(sourceUrl)
      this.failedUntil.set(sourceUrl, Date.now() + FAILED_PHOTO_PAUSE_MS)
    })
    revoke(displayUrl)
  }

  /** On logout: free every downloaded photo, forget every failure, abort what is in flight. */
  clear(): void {
    this.generation++
    this.aborter.abort()
    this.aborter = new AbortController()

    this.loaded.forEach(revoke)
    this.loaded.clear()
    this.failedUntil.clear()
    this.budgets.clear()
    this.pendingSources.clear()
    this.pendingChains.clear()
    this.apiFailuresInARow = 0
    this.apiPausedUntil = 0
    this.apiProbeRunning = false

    // The queued requests are dropped unsent; they never got a slot, so there is none to give back
    const waiting = this.apiRequestsWaiting
    this.apiRequestsWaiting = []
    waiting.forEach(resume => resume(false))
  }

  stats() {
    const now = Date.now()
    let paused = 0
    this.failedUntil.forEach(until => {
      if (until > now) paused++
    })

    return {
      loaded: this.loaded.size,
      pending: this.pendingSources.size,
      pausedPhotos: paused,
      apiFailuresInARow: this.apiFailuresInARow,
      apiPausedForMs: Math.max(0, this.apiPausedUntil - now),
      apiRequestsRunning: this.apiRequestsRunning,
      apiRequestsWaiting: this.apiRequestsWaiting.length,
      sources: Array.from(this.loaded.keys())
    }
  }

  // Mark as recently used (the Map keeps insertion order, so the first entry is the oldest)
  private touch(sourceUrl: string): string | undefined {
    const url = this.loaded.get(sourceUrl)
    if (url) {
      this.loaded.delete(sourceUrl)
      this.loaded.set(sourceUrl, url)
    }

    return url
  }

  private remember(sourceUrl: string, url: string) {
    this.loaded.set(sourceUrl, url)
    while (this.loaded.size > MAX_PHOTOS) {
      const [oldestSource, oldestUrl] = this.loaded.entries().next().value as [string, string]
      this.loaded.delete(oldestSource)
      revoke(oldestUrl)
    }
  }

  private async tryInOrder(sources: PhotoSource[]): Promise<string | null> {
    // A logout in the middle stops the chain: the next source would go out with the next user's token
    const generation = this.generation
    let apiSources = 0
    for (const source of sources) {
      if (generation !== this.generation) return null
      const attempts = source.kind === 'API' && apiSources++ === 0 ? FIRST_SOURCE_ATTEMPTS : OTHER_SOURCE_ATTEMPTS
      const url = await this.download(source, attempts, generation)
      if (generation !== this.generation) return null
      if (url) return url
    }

    return null
  }

  private download(source: PhotoSource, attempts: number, generation: number): Promise<string | null> {
    if (generation !== this.generation) return Promise.resolve(null)
    const cached = this.touch(source.url)
    if (cached) return Promise.resolve(cached)
    if ((this.failedUntil.get(source.url) ?? 0) > Date.now()) return Promise.resolve(null)

    const running = this.pendingSources.get(source.url)
    if (running) return running

    this.pruneExpired()

    const outcome =
      source.kind === 'API'
        ? this.downloadFromApi(source, attempts, generation)
        : this.downloadExternal(source.url, generation)

    const request: Promise<string | null> = outcome
      .then(({ url, requested }) => {
        if (generation !== this.generation) {
          revoke(url)

          return null
        }
        if (url) {
          this.remember(source.url, url)
          this.failedUntil.delete(source.url)
          this.budgets.delete(source.photoId ?? source.url)
        } else if (requested) {
          this.failedUntil.set(source.url, Date.now() + FAILED_PHOTO_PAUSE_MS)
        }

        return url
      })
      .finally(() => {
        if (this.pendingSources.get(source.url) === request) this.pendingSources.delete(source.url)
      })

    this.pendingSources.set(source.url, request)

    return request
  }

  // The failure and budget records only matter for a minute; drop the old ones once there are many
  private pruneExpired() {
    if (this.failedUntil.size + this.budgets.size < MAX_PHOTOS) return
    const now = Date.now()
    this.failedUntil.forEach((until, key) => {
      if (until <= now) this.failedUntil.delete(key)
    })
    this.budgets.forEach((budget, key) => {
      if (budget.until <= now) this.budgets.delete(key)
    })
  }

  // One more API request for this photo, if its budget for the current window allows it
  private spend(photoKey: string): boolean {
    const now = Date.now()
    const budget = this.budgets.get(photoKey)
    if (!budget || budget.until <= now) {
      this.budgets.set(photoKey, { used: 1, until: now + FAILED_PHOTO_PAUSE_MS })

      return true
    }
    if (budget.used >= PHOTO_REQUEST_BUDGET) return false
    budget.used++

    return true
  }

  private async downloadFromApi(source: PhotoSource, attempts: number, generation: number): Promise<Outcome> {
    let requested = false
    for (let attempt = 1; attempt <= attempts; attempt++) {
      // Spread the retries out, so the avatars of one page do not retry in the same instant
      if (attempt > 1) await wait(RETRY_DELAY_MS + Math.random() * RETRY_DELAY_MS)
      if (generation !== this.generation || !this.spend(source.photoId ?? source.url)) break

      const result = await this.requestFromApi(source.url, generation)
      if (result === 'skipped') return { url: null, requested }
      requested = true
      if (typeof result === 'object') return { url: result.url, requested }
      if (result === 'failed') break
    }

    return { url: null, requested }
  }

  private async requestFromApi(url: string, generation: number): Promise<ApiResult> {
    if (!(await this.acquireApiSlot())) return 'skipped'

    // Logged out while this one waited for a slot: it is not sent
    if (generation !== this.generation) {
      this.releaseApiSlot()

      return 'skipped'
    }

    // While the API looks down nothing is sent; when the pause is over one request at a time checks on it
    const checking = this.apiFailuresInARow >= OUTAGE_FAILURES
    if (checking && (Date.now() < this.apiPausedUntil || this.apiProbeRunning)) {
      this.releaseApiSlot()

      return 'skipped'
    }
    if (checking) this.apiProbeRunning = true

    try {
      const response = await apiClient.get(url, {
        responseType: 'blob',
        timeout: REQUEST_TIMEOUT_MS,
        signal: this.aborter.signal
      })
      this.apiFailuresInARow = 0

      return isImage(response?.data) ? { url: URL.createObjectURL(response.data) } : 'failed'
    } catch (error: any) {
      // Aborted by a logout: says nothing about the service or the photo
      if (axios.isCancel(error) || generation !== this.generation) return 'skipped'

      if (isUnavailable(error)) {
        this.apiFailuresInARow++
        if (this.apiFailuresInARow >= OUTAGE_FAILURES) this.apiPausedUntil = Date.now() + OUTAGE_PAUSE_MS

        // Asked to slow down: do not insist
        return error?.response?.status === 429 ? 'failed' : 'retry'
      }

      // The service answered, so it is up; the problem is this photo
      this.apiFailuresInARow = 0
      if (error.response.status >= 500 && !(await isMissingPhoto(error))) return 'retry'

      return 'failed'
    } finally {
      if (checking) this.apiProbeRunning = false
      this.releaseApiSlot()
    }
  }

  // Resolves true once a slot is held; false when the wait was cancelled by a logout
  private acquireApiSlot(): Promise<boolean> {
    if (this.apiRequestsRunning < MAX_PARALLEL_API_REQUESTS) {
      this.apiRequestsRunning++

      return Promise.resolve(true)
    }

    // releaseApiSlot hands its slot straight to the next one waiting
    return new Promise(resolve => this.apiRequestsWaiting.push(resolve))
  }

  private releaseApiSlot(): void {
    const next = this.apiRequestsWaiting.shift()
    if (next) next(true)
    else this.apiRequestsRunning--
  }

  private async downloadExternal(url: string, generation: number): Promise<Outcome> {
    try {
      // no-referrer keeps Google from rate-limiting the photos as hotlinks
      const response = await fetch(url, {
        mode: 'cors',
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
        signal: this.aborter.signal
      })
      if (!response.ok) return { url: null, requested: true }
      const blob = await response.blob()

      return { url: isImage(blob) ? URL.createObjectURL(blob) : null, requested: true }
    } catch (error) {
      if (generation !== this.generation) return { url: null, requested: false }

      // A CORS refusal surfaces as a TypeError; an <img> does not need CORS, so it can still show the URL
      return { url: error instanceof TypeError ? url : null, requested: true }
    }
  }
}

export const photoCache = new PhotoCache()

if (typeof window !== 'undefined') {
  window.addEventListener(SESSION_ENDED_EVENT, () => photoCache.clear())
  if (process.env.NODE_ENV === 'development') (window as any).__photoCache = photoCache
}
