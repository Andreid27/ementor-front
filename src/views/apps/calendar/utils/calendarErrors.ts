// ** Utils
import { normalizeApiError, NormalizedApiError } from 'src/@core/utils/api-error'

/**
 * Translates calendar backend failures into messages a professor can act on.
 *
 * The profile service (`service2`) has no @ControllerAdvice, so every business
 * error thrown by the events code leaves Spring as a plain HTTP 500 whose body
 * carries the real reason in `message`:
 *
 *   { "status": 500, "exception": "...EmentorApiError",
 *     "message": "End recurrence cannot be before start time", ... }
 *
 * Status codes are therefore useless for calendar calls and the mapping below
 * keys off the message text. Every entry cites the backend source it mirrors, so
 * the table can be re-checked when the services change.
 */

export type CalendarErrorField = 'title' | 'startDate' | 'duration' | 'pattern' | 'price' | 'endRecurrence'

export interface CalendarErrorInfo {
  /** Romanian, user-facing. Always populated. */
  message: string
  /** Form field the error belongs to, when the backend rejected a specific input. */
  field?: CalendarErrorField
  /** `validation` errors are the professor's to fix; the rest are not. */
  kind: 'validation' | 'permission' | 'notFound' | 'conflict' | 'network' | 'unknown'
  /** Raw English message from the backend, kept for logging. */
  backendMessage: string
  status: number
}

interface ErrorRule {
  match: RegExp
  message: string | ((match: RegExpMatchArray) => string)
  field?: CalendarErrorField
  kind: CalendarErrorInfo['kind']
}

/**
 * Ordered: the first rule whose pattern matches the backend message wins.
 */
const ERROR_RULES: ErrorRule[] = [
  // ── Validation, RecurringSeriesService.validateRecurringSeriesInput() ──────
  // and EventOccurrenceService.validateSingularEventInput(); both raise the
  // same wording, so one rule covers recurring series and singular events.
  {
    match: /^Title is required$/i,
    message: 'Titlul evenimentului este obligatoriu.',
    field: 'title',
    kind: 'validation'
  },
  {
    match: /^Start time is required$/i,
    message: 'Data și ora de început sunt obligatorii.',
    field: 'startDate',
    kind: 'validation'
  },
  {
    match: /^Valid duration is required$/i,
    message: 'Durata evenimentului trebuie să fie mai mare de zero.',
    field: 'duration',
    kind: 'validation'
  },
  {
    match: /^Recurrence pattern is required$/i,
    message: 'Trebuie să alegi un model de recurență pentru evenimentul repetitiv.',
    field: 'pattern',
    kind: 'validation'
  },
  {
    match: /^Price cannot be negative$/i,
    message: 'Prețul nu poate fi negativ.',
    field: 'price',
    kind: 'validation'
  },
  {
    match: /^Start time cannot be in the past$/i,
    message: 'Data de început nu poate fi în trecut. Alege o dată din viitor.',
    field: 'startDate',
    kind: 'validation'
  },
  {
    match: /^End recurrence cannot be before start time$/i,
    message: 'Data de sfârșit a recurenței nu poate fi înaintea datei de început a evenimentului.',
    field: 'endRecurrence',
    kind: 'validation'
  },
  {
    match: /^Unsupported recurrence pattern:\s*(.+)$/i,
    message: match => `Modelul de recurență „${match[1]}” nu este acceptat.`,
    field: 'pattern',
    kind: 'validation'
  },

  // ── Wrong endpoint for the event type, EventOccurrenceService ──────────────
  {
    match: /^Cannot update recurring event as singular event$/i,
    message: 'Evenimentul face parte dintr-o serie recurentă și nu poate fi modificat ca eveniment singular.',
    kind: 'conflict'
  },
  {
    match: /^Cannot delete recurring event as singular event$/i,
    message: 'Evenimentul face parte dintr-o serie recurentă și nu poate fi șters ca eveniment singular.',
    kind: 'conflict'
  },
  {
    match: /^Cannot create virtual singular event entity$/i,
    message:
      'Evenimentul este generat automat din seria recurentă și nu poate fi salvat separat. Modifică seria sau ocurența.',
    kind: 'conflict'
  },

  // ── Ownership, RecurringSeriesService + EventOccurrenceService ─────────────
  {
    match: /^You can only update your own recurring series$/i,
    message: 'Poți modifica doar seriile recurente create de tine.',
    kind: 'permission'
  },
  {
    match: /^You can only delete your own recurring series$/i,
    message: 'Poți șterge doar seriile recurente create de tine.',
    kind: 'permission'
  },
  {
    match: /^You can only (update|delete) your own singular events$/i,
    message: match =>
      match[1].toLowerCase() === 'delete'
        ? 'Poți șterge doar evenimentele create de tine.'
        : 'Poți modifica doar evenimentele create de tine.',
    kind: 'permission'
  },
  {
    match: /^You can only (complete|cancel|modify) your own event occurrences$/i,
    message: match => {
      const action =
        match[1].toLowerCase() === 'complete' ? 'finaliza' : match[1].toLowerCase() === 'cancel' ? 'anula' : 'modifica'

      return `Poți ${action} doar evenimentele create de tine.`
    },
    kind: 'permission'
  },

  // ── Role checks, SecurityService.hasRole() / hasAnyRole() ─────────────────
  // hasAnyRole builds its message with a double space ("does not have  any role"),
  // hence the loose spacing in the pattern.
  {
    match: /does not have\s+(any\s+)?role/i,
    message: 'Nu ai permisiunile necesare pentru această acțiune. Doar profesorii pot administra evenimente.',
    kind: 'permission'
  },

  // ── Missing records ───────────────────────────────────────────────────────
  {
    match: /Recurring series not found with ID/i,
    message: 'Seria recurentă nu mai există. Reîmprospătează calendarul și încearcă din nou.',
    kind: 'notFound'
  },
  {
    match: /^Singular event not found with ID/i,
    message: 'Evenimentul nu mai există. Reîmprospătează calendarul și încearcă din nou.',
    kind: 'notFound'
  },
  {
    match: /^Event occurrence not found with ID/i,
    message: 'Ocurența evenimentului nu mai există. Reîmprospătează calendarul și încearcă din nou.',
    kind: 'notFound'
  },
  {
    match: /^Event not found:/i,
    message: 'Evenimentul nu a fost găsit. Reîmprospătează calendarul și încearcă din nou.',
    kind: 'notFound'
  },
  {
    match: /^Professor profile not found/i,
    message: 'Profilul tău de profesor nu a fost găsit. Completează-ți profilul înainte de a administra evenimente.',
    kind: 'notFound'
  },
  {
    match: /^Student profile not found/i,
    message: 'Unul dintre elevii selectați nu mai are un profil activ. Verifică lista de participanți.',
    kind: 'notFound'
  },
  {
    match: /No active relationship found/i,
    message: 'Unul dintre elevii selectați nu îți mai este asociat. Verifică lista de participanți.',
    kind: 'conflict'
  },

  // ── Spring-level failures that never reach our services ───────────────────
  {
    match: /HttpMessageNotReadable|JSON parse error|Cannot deserialize/i,
    message: 'Datele evenimentului nu au putut fi citite de server. Verifică valorile introduse și încearcă din nou.',
    kind: 'validation'
  },
  {
    match: /MethodArgumentTypeMismatch|Failed to convert value/i,
    message: 'Identificatorul evenimentului este invalid. Reîmprospătează calendarul și încearcă din nou.',
    kind: 'validation'
  },
  {
    match: /DataIntegrityViolation|ConstraintViolation/i,
    message: 'Datele evenimentului intră în conflict cu cele existente. Verifică participanții și prețurile.',
    kind: 'conflict'
  }
]

const GENERIC_MESSAGE = 'A apărut o eroare la salvarea evenimentului. Încearcă din nou.'

const messageForStatus = (status: number): { message: string; kind: CalendarErrorInfo['kind'] } => {
  if (status === 401) {
    return { message: 'Sesiunea a expirat. Autentifică-te din nou.', kind: 'permission' }
  }
  if (status === 403) {
    return { message: 'Nu ai permisiunile necesare pentru această acțiune.', kind: 'permission' }
  }
  if (status === 404) {
    return { message: 'Evenimentul nu mai există. Reîmprospătează calendarul.', kind: 'notFound' }
  }
  if (status === 409) {
    return { message: 'Evenimentul a fost modificat între timp. Reîmprospătează calendarul.', kind: 'conflict' }
  }
  if (status === 429) {
    return { message: 'Prea multe cereri. Așteaptă câteva momente și încearcă din nou.', kind: 'conflict' }
  }
  if (status === 502 || status === 503 || status === 504) {
    return { message: 'Serverul nu este disponibil momentan. Încearcă din nou în câteva momente.', kind: 'network' }
  }

  return { message: GENERIC_MESSAGE, kind: 'unknown' }
}

/** Recognises a value that has already been through `resolveCalendarError`. */
export const isCalendarErrorInfo = (value: unknown): value is CalendarErrorInfo =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as CalendarErrorInfo).message === 'string' &&
  typeof (value as CalendarErrorInfo).kind === 'string' &&
  typeof (value as CalendarErrorInfo).backendMessage === 'string'

/**
 * Resolves any thrown value into something the calendar UI can display.
 * Never throws and never returns an empty message.
 *
 * Idempotent: rejected thunks hand back an already-resolved `CalendarErrorInfo`
 * (see the calendar slice), so callers can pipe anything through this without
 * having to know where the failure came from.
 */
export const resolveCalendarError = (error: unknown): CalendarErrorInfo => {
  if (isCalendarErrorInfo(error)) {
    return error
  }

  const normalized: NormalizedApiError = normalizeApiError(error)

  if (normalized.isNetworkError) {
    return {
      message: normalized.isTimeout
        ? 'Serverul nu a răspuns la timp. Verifică conexiunea și încearcă din nou.'
        : 'Nu s-a putut contacta serverul. Verifică conexiunea la internet și încearcă din nou.',
      kind: 'network',
      backendMessage: normalized.backendMessage,
      status: normalized.status
    }
  }

  const backendMessage = normalized.backendMessage

  for (const rule of ERROR_RULES) {
    const match = backendMessage.match(rule.match)
    if (match) {
      return {
        message: typeof rule.message === 'function' ? rule.message(match) : rule.message,
        field: rule.field,
        kind: rule.kind,
        backendMessage,
        status: normalized.status
      }
    }
  }

  // Unmapped backend message: fall back to the status, so the professor still
  // gets something meaningful instead of "Request failed with status code 500".
  const fallback = messageForStatus(normalized.status)

  return {
    message: fallback.message,
    kind: fallback.kind,
    backendMessage,
    status: normalized.status
  }
}
