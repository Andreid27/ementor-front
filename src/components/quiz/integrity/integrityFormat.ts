/**
 * integrityFormat - Romanian labels, formats and small helpers for the quiz integrity report the professor reads
 *
 * The server writes the explanation sentences; these cover the badges, chips and figures around them.
 */

import type {
  ExitCause,
  IntegrityQuestionFlag,
  IntegrityQuestionStats,
  IntegrityStatus,
  QuizIntegrityReportDTO,
  RiskLevel
} from './integrityTypes'

type ChipColor = 'success' | 'info' | 'warning' | 'error'

export const RISK_LEVELS: Record<RiskLevel, { label: string; color: ChipColor }> = {
  NONE: { label: 'Fără semnale', color: 'success' },
  LOW: { label: 'Risc scăzut', color: 'info' },
  MEDIUM: { label: 'Risc mediu', color: 'warning' },
  HIGH: { label: 'Risc ridicat', color: 'error' }
}

export const EXIT_SEVERITIES: Record<'LOW' | 'MEDIUM' | 'HIGH', { label: string; color: ChipColor }> = {
  LOW: { label: 'Semnal slab', color: 'info' },
  MEDIUM: { label: 'Semnal mediu', color: 'warning' },
  HIGH: { label: 'Semnal puternic', color: 'error' }
}

export const EXIT_CAUSES: Record<ExitCause, string> = {
  TAB_OR_APP_SWITCH: 'A schimbat fila sau aplicația',
  APP_SWITCH_OR_LOCK: 'A ieșit din browser sau a blocat telefonul',
  OTHER_WINDOW: 'A lucrat în altă fereastră, iar testul a rămas vizibil',
  SCREEN_LOCKED_OR_SLEEP: 'Ecranul s-a blocat sau dispozitivul a intrat în repaus'
}

// One line for the statuses whose data needs care
export const STATUS_NOTES: Partial<Record<IntegrityStatus, string>> = {
  PARTIAL: 'Datele de monitorizare au fost analizate, dar au probleme. Tratează concluziile cu prudență.',
  INVALID: 'Datele de monitorizare nu au putut fi folosite, așa că rezolvarea nu a fost analizată.',
  MISSING:
    'Pentru această rezolvare nu există date de monitorizare (de exemplu, a fost trimisă dintr-o versiune mai veche a aplicației).',
  ANALYSIS_FAILED: 'Datele de monitorizare au fost primite, dar analiza lor a eșuat. Încearcă din nou mai târziu.'
}

const STATUS_REASONS: Record<string, string> = {
  PAYLOAD_TOO_LARGE: 'datele sunt prea mari',
  UNPARSEABLE: 'datele nu pot fi citite',
  UNSUPPORTED_SCHEMA: 'versiune de date necunoscută',
  ID_MISMATCH: 'datele aparțin altei rezolvări',
  SEQUENCE_GAP: 'lipsesc înregistrări',
  TIME_ORDER: 'înregistrări în ordine greșită',
  ANSWERS_MISMATCH: 'răspunsurile nu corespund celor trimise',
  DURATION_MISMATCH: 'durata nu corespunde',
  CLOCK_UNRELIABLE: 'ceasul dispozitivului nu este de încredere',
  SUMMARY_MISMATCH: 'totalurile nu corespund',
  TRUNCATED: 'o parte din înregistrări a fost omisă',
  UNKNOWN_EVENT_TYPES: 'tipuri de evenimente necunoscute'
}

export const QUESTION_FLAGS: Partial<Record<IntegrityQuestionFlag, string>> = {
  ANSWERED_RIGHT_AFTER_RETURN: 'Răspuns imediat după o ieșire',
  FIXED_RIGHT_AFTER_RETURN: 'Corectat imediat după o ieșire',
  VIEWED_WHILE_UNFOCUSED: 'Citită în timp ce lucra în altă fereastră'
}

export const BLOCKED_ACTIONS: Record<string, string> = {
  COPY: 'Copiere',
  CUT: 'Decupare',
  PASTE: 'Lipire',
  CONTEXT_MENU: 'Click dreapta',
  DRAG: 'Tragere',
  PRINT_SHORTCUT: 'Printare (scurtătură)',
  PRINT_DIALOG: 'Printare (meniul browserului)',
  SAVE_SHORTCUT: 'Salvarea paginii',
  VIEW_SOURCE_SHORTCUT: 'Sursa paginii',
  DEVTOOLS_SHORTCUT: 'Unelte de dezvoltator',
  SCREENSHOT_SHORTCUT: 'Captură de ecran'
}

export const DEVICE_TYPES: Record<string, string> = { PHONE: 'Telefon', TABLET: 'Tabletă', DESKTOP: 'Calculator' }

// "1 min 35 s", "6 s", "1 h 5 min"
export const formatDuration = (ms: number): string => {
  const totalSeconds = Math.max(0, Math.round(ms / 1000))
  if (totalSeconds === 0) return ms > 0 ? '<1 s' : '0 s'

  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) return minutes > 0 ? `${hours} h ${minutes} min` : `${hours} h`
  if (minutes > 0) return seconds > 0 ? `${minutes} min ${seconds} s` : `${minutes} min`

  return `${seconds} s`
}

// The minute of the quiz, written as in the server's sentences: "1:20", or "1:02:05" past an hour
export const formatQuizMinute = (offsetMs: number): string => {
  const totalSeconds = Math.max(0, Math.floor(offsetMs / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = String(totalSeconds % 60).padStart(2, '0')

  return hours > 0 ? `${hours}:${String(minutes).padStart(2, '0')}:${seconds}` : `${minutes}:${seconds}`
}

// Clock time in the professor's time zone
export const formatClockTime = (iso: string): string => {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''

  return date.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

// "1 ieșire", "4 ieșiri", "20 de ieșiri": Romanian adds "de" from 20 on, except when the number ends in 01 to 19
export const countLabel = (count: number, one: string, many: string): string => {
  if (count === 1) return `1 ${one}`

  const lastTwo = count % 100

  return count >= 20 && (lastTwo === 0 || lastTwo >= 20) ? `${count} de ${many}` : `${count} ${many}`
}

// "4 ieșiri · 3 min 40 s"
export const formatExitsSummary = (exitCount: number, awayMs: number): string =>
  `${countLabel(exitCount, 'ieșire', 'ieșiri')} · ${formatDuration(awayMs)}`

export const answerLetter = (answer: number | null): string =>
  answer !== null && answer >= 1 && answer <= 5 ? 'ABCDE'[answer - 1] : '–'

export const describeStatusReasons = (codes: string[]): string =>
  codes
    .map(code => (Object.prototype.hasOwnProperty.call(STATUS_REASONS, code) ? STATUS_REASONS[code] : code))
    .join(', ')

// Question stats by question id, for the markers in the review. A malformed row is skipped: this runs in the
// review page itself, outside the report's error boundary
export const indexQuestionStats = (report: Pick<QuizIntegrityReportDTO, 'questions'> | null) => {
  const byQuestion: Record<string, IntegrityQuestionStats> = {}
  ;(report?.questions || []).forEach(stats => {
    const questionId = stats?.question?.questionId
    if (questionId) byQuestion[questionId] = stats
  })

  return byQuestion
}
