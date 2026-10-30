/**
 * Types for quiz integrity tracking, from the quiz integrity API contract: the record the student's browser
 * uploads with the submission (QuizIntegrityPayload) and the report the professor reads (QuizIntegrityReportDTO).
 */

// ** Payload (schemaVersion 1)

export type SubmitTrigger = 'MANUAL' | 'MANUAL_INCOMPLETE' | 'TIME_UP'

export type AnswerInput = 'MOUSE' | 'TOUCH' | 'PEN' | 'KEYBOARD' | 'UNKNOWN'

/** How an answer was selected, passed up by the answer component */
export interface AnswerSelectionSource {
  /** PointerEvent.pointerType of the click ('mouse', 'touch', 'pen'), 'keyboard', or '' when the browser does not say */
  pointerType: string
  isTrusted: boolean
}

export type BlockedAction =
  | 'COPY'
  | 'CUT'
  | 'PASTE'
  | 'CONTEXT_MENU'
  | 'DRAG'
  | 'PRINT_SHORTCUT'
  | 'PRINT_DIALOG'
  | 'SAVE_SHORTCUT'
  | 'VIEW_SOURCE_SHORTCUT'
  | 'DEVTOOLS_SHORTCUT'
  | 'SCREENSHOT_SHORTCUT'

export type IntegrityEventType =
  | 'TRACKING_STARTED'
  | 'TRACKING_STOPPED'
  | 'FOCUS_LOST'
  | 'FOCUS_GAINED'
  | 'PAGE_HIDDEN'
  | 'PAGE_VISIBLE'
  | 'FOCUS_IN_FRAME'
  | 'FOCUS_STATE_CORRECTED'
  | 'PAGE_FROZEN'
  | 'PAGE_RESUMED'
  | 'PAGE_HIDE'
  | 'PAGE_SHOW'
  | 'UNLOAD_ATTEMPT'
  | 'CLOCK_JUMP'
  | 'NETWORK_OFFLINE'
  | 'NETWORK_ONLINE'
  | 'QUESTION_VIEW'
  | 'IDLE_START'
  | 'IDLE_END'
  | 'POINTER_LEFT_PAGE'
  | 'POINTER_ENTERED_PAGE'
  | 'WINDOW_LAYOUT'
  | 'BLOCKED_ACTION'
  | 'SCREENSHOT_KEY'
  | 'DOM_INJECTION'

export interface IntegrityEvent {
  seq: number
  t: number
  at: number
  type: IntegrityEventType
  q: string | null
  data?: Record<string, unknown>
}

export interface IntegrityAnswer {
  seq: number
  t: number
  at: number
  questionId: string
  answer: number
  previousAnswer: number | null
  input: AnswerInput
  trusted: boolean
  present: boolean
}

export interface IntegritySummary {
  exitCount: number
  glanceCount: number
  awayMs: number
  hiddenMs: number
  longestExitMs: number
  idleCount: number
  idleMs: number
  blockedActionCount: number
  answerCount: number
  answerChangeCount: number
  untrustedAnswerCount: number
  domInjectionCount: number
  eventCount: number
}

export interface IntegrityTruncation {
  truncated: boolean
  droppedCount: number
  droppedByType: Record<string, number>

  /** Set when the tracker stopped recording after an internal error */
  error?: string
}

export interface IntegrityEnvironment {
  userAgent: string
  uaBrands: { brand: string; version: string }[] | null
  platform: string | null
  deviceType: 'PHONE' | 'TABLET' | 'DESKTOP'
  maxTouchPoints: number
  screen: { width: number; height: number; availWidth: number; availHeight: number; pixelRatio: number }
  isExtendedScreen: boolean | null
  window: { innerWidth: number; innerHeight: number; outerWidth: number; outerHeight: number }
  language: string
  timeZone: string
  webdriver: boolean
  supports: {
    pageVisibility: boolean
    pageLifecycle: boolean
    intersectionObserver: boolean
    screenIsExtended: boolean
  }
}

export interface QuizIntegrityPayload {
  schemaVersion: 1
  quizStudentId: string
  sessionId: string
  trackerVersion: string
  questionOrder: string[]
  timing: {
    startedAt: string
    submittedAt: string
    durationMs: number
    serverEndTime: string
    clockOffsetMs: number
    submitTrigger: SubmitTrigger
  }
  environment: IntegrityEnvironment
  events: IntegrityEvent[]
  answers: IntegrityAnswer[]
  summary: IntegritySummary
  truncation: IntegrityTruncation
}

// ** Report (GET /quiz/attempt/{quizStudentId}/integrity)

export type IntegrityStatus = 'VALID' | 'PARTIAL' | 'INVALID' | 'MISSING' | 'ANALYSIS_FAILED'

export type RiskLevel = 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH'

export interface QuestionRef {
  questionId: string
  number: number
  text: string
}

export interface IntegrityRiskReason {
  code: string
  points: number
  params: Record<string, number | string>
  text: string
}

export type ExitCause = 'TAB_OR_APP_SWITCH' | 'APP_SWITCH_OR_LOCK' | 'OTHER_WINDOW' | 'SCREEN_LOCKED_OR_SLEEP'

export type ExitClassification =
  | 'QUIZ_ENDED_WHILE_AWAY'
  | 'FIXED_ANSWER'
  | 'ANSWERED_ON_SCREEN_QUESTION'
  | 'CHANGED_ANSWER'
  | 'ANSWERED_OTHER_QUESTION'
  | 'NO_ANSWER'

export interface IntegrityExit {
  index: number
  startedAt: string
  endedAt: string
  offsetMs: number
  durationMs: number
  kind: 'HIDDEN' | 'BLUR_ONLY'
  likelyCause: ExitCause
  endedBySubmit: boolean
  questionOnScreen: QuestionRef | null
  onScreenQuestionAnswered: boolean
  onScreenQuestionViewedMs: number
  afterReturn: {
    classification: ExitClassification
    actions: {
      question: QuestionRef
      answer: number
      previousAnswer: number | null
      msAfterReturn: number
      correct: boolean
    }[]
  }
  severity: 'LOW' | 'MEDIUM' | 'HIGH'
  explanation: string
}

export type IntegrityQuestionFlag =
  | 'ANSWERED_RIGHT_AFTER_RETURN'
  | 'FIXED_RIGHT_AFTER_RETURN'
  | 'VIEWED_WHILE_UNFOCUSED'
  | 'FAST_ANSWER'

export interface IntegrityQuestionStats {
  question: QuestionRef
  viewedMs: number
  viewedUnfocusedMs: number
  awayWhileOnScreenMs: number
  timeToFirstAnswerMs: number | null
  readingCharsPerSecond: number | null
  answerChanges: number
  finalAnswer: number | null
  correct: boolean | null
  exitsWhileOnScreen: number[]
  answeredRightAfterExit: number | null
  flags: IntegrityQuestionFlag[]
}

export interface IntegrityIdlePeriod {
  startedAt: string
  offsetMs: number
  durationMs: number
  questionOnScreen: QuestionRef | null
  answerWithinMs: number | null
  correct: boolean | null
  explanation: string
}

export interface QuizIntegrityReportDTO {
  quizStudentId: string
  status: IntegrityStatus
  statusReasons: string[]
  schemaVersion: number | null
  analysisVersion: number
  trackerVersion: string | null
  receivedAt: string
  overview: string[]
  risk: {
    level: RiskLevel
    score: number
    reasons: IntegrityRiskReason[]
  }
  summary: {
    quizDurationMs: number
    presentMs: number
    awayMs: number
    awayRatio: number
    hiddenMs: number
    blurOnlyMs: number
    exitCount: number
    glanceCount: number
    longestExitMs: number
    answersRightAfterReturn: { count: number; correct: number }
    otherAnswers: { count: number; correct: number }
    idleCount: number
    idleMs: number
    blockedActions: Record<string, number>
    frameFocusCount: number
    reducedWindowMs: number
    sidePanelSuspectedMs: number
    extendedScreen: boolean | null
    untrustedAnswerCount: number
    webdriver: boolean
    device: { deviceType: string; platform: string | null; browser: string | null }
  }
  exits: IntegrityExit[]
  questions: IntegrityQuestionStats[]
  idlePeriods: IntegrityIdlePeriod[]
  blockedActions: { at: string; offsetMs: number; action: string; questionOnScreen: QuestionRef | null }[]
  frameFocus: { at: string; offsetMs: number; signature: string | null; questionOnScreen: QuestionRef | null }[]
  domInjections: { firstSeenAt: string; signature: string; knownAs: string | null }[]
  timeline: { at: string; offsetMs: number; type: string; questionNumber: number | null; label: string }[]
}

// ** Results list fields (assigned-paginated, attempt-preview); null for students and attempts not submitted

export interface IntegrityListFields {
  integrityStatus?: IntegrityStatus | null
  integrityRiskLevel?: RiskLevel | null
  integrityExitCount?: number | null
  integrityAwayMs?: number | null
}
