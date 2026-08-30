/**
 * Normalises anything thrown by the generated API clients (axios) into one shape.
 *
 * The backend services do not register a @ControllerAdvice, so an `EmentorApiError`
 * raised inside a service escapes as Spring Boot's *default* error body:
 *
 *   {
 *     "timestamp": "2026-08-30T12:03:09.220+00:00",
 *     "status": 500,
 *     "error": "Internal Server Error",
 *     "exception": "com.ementor.profile.service.core.exceptions.EmentorApiError",
 *     "message": "End recurrence cannot be before start time",
 *     "path": "/events/series/88fcd792-0265-4e8b-aa63-327fd07b80ac"
 *   }
 *
 * The `httpStatusCode` the service passed to `EmentorApiError` (400/403/404/...) is
 * dropped on the floor: every business error arrives as HTTP 500. The transport
 * status therefore carries no information and the only usable signal is `message`.
 * Any UI that wants to react to a backend error has to read it from here.
 */

export interface NormalizedApiError {
  /** Transport status. 0 when the request never got a response. */
  status: number
  /** Raw backend message (English), '' when the backend sent none. */
  backendMessage: string
  /** Fully qualified Java exception name, when Spring included it. */
  exception: string | null
  /** Request path reported by Spring's error body. */
  path: string | null
  /** Field-level messages from bean validation (`server.error.include-binding-errors`). */
  bindingErrors: string[]
  /** No HTTP response came back: offline, DNS, CORS or a dropped connection. */
  isNetworkError: boolean
  /** The request was aborted client side (axios timeout or cancellation). */
  isTimeout: boolean
  /** Untouched original, for console logging. */
  original: unknown
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const firstString = (...candidates: unknown[]): string => {
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim().length > 0) {
      return candidate.trim()
    }
  }

  return ''
}

const extractBindingErrors = (data: Record<string, unknown>): string[] => {
  if (!Array.isArray(data.errors)) {
    return []
  }

  return data.errors
    .map(entry => {
      if (typeof entry === 'string') return entry
      if (isRecord(entry)) return firstString(entry.defaultMessage, entry.message)

      return ''
    })
    .filter((message): message is string => message.length > 0)
}

const EMPTY: NormalizedApiError = {
  status: 0,
  backendMessage: '',
  exception: null,
  path: null,
  bindingErrors: [],
  isNetworkError: false,
  isTimeout: false,
  original: null
}

export const normalizeApiError = (error: unknown): NormalizedApiError => {
  const base: NormalizedApiError = { ...EMPTY, original: error }

  if (typeof error === 'string') {
    return { ...base, backendMessage: error.trim() }
  }

  if (!isRecord(error)) {
    return base
  }

  const response = isRecord(error.response) ? error.response : null

  // Redux Toolkit serialises rejected thunks: `{ name, message, code, stack }`.
  // Nothing left to unwrap, the message is all we have.
  if (!response) {
    const code = firstString(error.code)
    const message = firstString(error.message)
    const isTimeout = code === 'ECONNABORTED' || code === 'ETIMEDOUT' || /timeout/i.test(message)

    // `Network Error` / `ERR_NETWORK` is axios' way of saying the request never
    // reached the server. A plain `Error` thrown by our own code is not.
    const isNetworkError =
      isTimeout || code === 'ERR_NETWORK' || code === 'ERR_INTERNET_DISCONNECTED' || /network error/i.test(message)

    return { ...base, backendMessage: message, isNetworkError, isTimeout }
  }

  const status = typeof response.status === 'number' ? response.status : 0
  const data = response.data

  if (typeof data === 'string') {
    return { ...base, status, backendMessage: data.trim() }
  }

  if (!isRecord(data)) {
    return { ...base, status, backendMessage: firstString(error.message) }
  }

  const bindingErrors = extractBindingErrors(data)

  return {
    ...base,
    status,
    // `error` ("Internal Server Error") is only a fallback - it is the generic
    // Spring label, never the reason. `message` holds the reason.
    backendMessage: firstString(data.message, data.detail, bindingErrors[0], data.error, error.message),
    exception: firstString(data.exception) || null,
    path: firstString(data.path) || null,
    bindingErrors
  }
}
