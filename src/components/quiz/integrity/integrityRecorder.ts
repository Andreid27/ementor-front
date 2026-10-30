/**
 * integrityRecorder - Keeps the quiz integrity record and turns it into the payload uploaded with the submission
 *
 * Plain logic with no DOM access, so the rules can be tested on their own: the shared sequence number, times,
 * presence state, answers, limits and truncation, and the summary the server cross-checks (contract sections 6
 * and 8.3). integrityTracker watches the page and calls record().
 */

import type {
  AnswerInput,
  IntegrityAnswer,
  IntegrityEnvironment,
  IntegrityEvent,
  IntegrityEventType,
  IntegritySummary,
  QuizIntegrityPayload,
  SubmitTrigger
} from './integrityTypes'

export const TRACKER_VERSION = '1.0.0'

// Payload limits from the contract (section 6.9), and how far the in-memory log may grow before it is compacted
export const INTEGRITY_LIMITS = {
  events: 2000,
  answers: 500,
  domInjectionSignatures: 50,
  targetBytes: 256 * 1024,

  // The server accepts 512 KB; this leaves room for the rest of the submit request
  maxBytes: 480 * 1024,
  liveEvents: 4000,
  liveAnswers: 1000
}

export type IntegrityLimits = typeof INTEGRITY_LIMITS

// Exits shorter than this are glances (section 8.3)
const MIN_EXIT_MS = 1000

export interface IntegrityClock {
  /** Monotonic milliseconds: performance.now() in the browser */
  mono(): number

  /** Epoch milliseconds: Date.now() in the browser */
  wall(): number
}

export interface PresenceState {
  visible: boolean
  focused: boolean
  frozen: boolean
}

// The student is present while the page is visible and focused (section 7.2)
export const isPresent = (state: PresenceState): boolean => state.visible && state.focused && !state.frozen

// The live recorder and the summary both use this, so they always agree on who was present when
export const applyPresenceEvent = (
  state: PresenceState,
  event: { type: string; data?: Record<string, unknown> }
): PresenceState => {
  switch (event.type) {
    case 'TRACKING_STARTED':
      return { visible: event.data?.visible === true, focused: event.data?.focused === true, frozen: false }
    case 'FOCUS_LOST':
      return { ...state, focused: false }
    case 'FOCUS_GAINED':
      return { ...state, focused: true }
    case 'PAGE_HIDDEN':
      return { ...state, visible: false }
    case 'PAGE_VISIBLE':
      return { ...state, visible: true }
    case 'PAGE_FROZEN':
      return { ...state, frozen: true }
    case 'PAGE_RESUMED':
      return { ...state, frozen: false }

    // The check that sends a correction is running, so the page is not frozen either
    case 'FOCUS_STATE_CORRECTED':
      return { visible: event.data?.visible === true, focused: event.data?.focused === true, frozen: false }
    default:
      return state
  }
}

const toNumber = (value: unknown) => (typeof value === 'number' && Number.isFinite(value) ? value : 0)

// The browser's own totals (section 6.8), with the server's rules: an exit runs from the record that makes the
// student not present to the record that makes them present again, plus any sleep reported inside it. Exits under
// 1 s are glances, and awayMs counts both. An exit or idle period still open at the last record closes there.
export const computeIntegritySummary = (events: IntegrityEvent[], answers: IntegrityAnswer[]): IntegritySummary => {
  let state: PresenceState = { visible: true, focused: true, frozen: false }
  let exitStart: number | null = null
  let exitSleep = 0
  let hiddenStart: number | null = null
  let hiddenSleep = 0
  let idleFrom: number | null = null
  let lastT = 0
  let exitCount = 0
  let glanceCount = 0
  let awayMs = 0
  let hiddenMs = 0
  let longestExitMs = 0
  let idleCount = 0
  let idleMs = 0
  let blockedActionCount = 0
  let domInjectionCount = 0

  const closeExit = (t: number) => {
    const duration = t - exitStart + exitSleep

    if (duration >= MIN_EXIT_MS) exitCount++
    else glanceCount++
    awayMs += duration
    longestExitMs = Math.max(longestExitMs, duration)
    exitStart = null
  }

  const closeHidden = (t: number) => {
    hiddenMs += t - hiddenStart + hiddenSleep
    hiddenStart = null
  }

  events
    .slice()
    .sort((a, b) => a.seq - b.seq)
    .forEach(event => {
      lastT = Math.max(lastT, event.t)

      if (event.type === 'CLOCK_JUMP') {
        const sleep = Math.max(0, toNumber(event.data?.wallDeltaMs) - toNumber(event.data?.monoDeltaMs))

        if (exitStart !== null) exitSleep += sleep
        if (hiddenStart !== null) hiddenSleep += sleep
      } else if (event.type === 'IDLE_START') {
        idleCount++
        idleFrom = toNumber(event.data?.lastInputT)
      } else if (event.type === 'IDLE_END') {
        idleMs += toNumber(event.data?.idleMs)
        idleFrom = null
      } else if (event.type === 'BLOCKED_ACTION') {
        blockedActionCount++
      } else if (event.type === 'DOM_INJECTION') {
        domInjectionCount++
      }

      // Before TRACKING_STARTED the student counts as present, so a quiz that starts in the background opens an exit
      const isStart = event.type === 'TRACKING_STARTED'
      const wasPresent = isStart || isPresent(state)
      const wasVisible = isStart || state.visible
      state = applyPresenceEvent(state, event)

      if (wasPresent && !isPresent(state)) {
        exitStart = event.t
        exitSleep = 0
      } else if (!wasPresent && isPresent(state) && exitStart !== null) {
        closeExit(event.t)
      }

      if (wasVisible && !state.visible) {
        hiddenStart = event.t
        hiddenSleep = 0
      } else if (!wasVisible && state.visible && hiddenStart !== null) {
        closeHidden(event.t)
      }
    })

  if (exitStart !== null) closeExit(lastT)
  if (hiddenStart !== null) closeHidden(lastT)
  if (idleFrom !== null) idleMs += Math.max(0, lastT - idleFrom)

  return {
    exitCount,
    glanceCount,
    awayMs: Math.round(awayMs),
    hiddenMs: Math.round(hiddenMs),
    longestExitMs: Math.round(longestExitMs),
    idleCount,
    idleMs: Math.round(idleMs),
    blockedActionCount,
    answerCount: answers.length,
    answerChangeCount: answers.filter(answer => answer.previousAnswer !== null).length,
    untrustedAnswerCount: answers.filter(answer => !answer.trusted).length,
    domInjectionCount,
    eventCount: events.length
  }
}

const ANSWER_INPUTS: Record<string, AnswerInput> = { mouse: 'MOUSE', touch: 'TOUCH', pen: 'PEN', keyboard: 'KEYBOARD' }

export const toAnswerInput = (pointerType: string): AnswerInput =>
  Object.prototype.hasOwnProperty.call(ANSWER_INPUTS, pointerType) ? ANSWER_INPUTS[pointerType] : 'UNKNOWN'

// ** Truncation (section 6.9)

type DropCounter = (type: string) => void

const isPointerEvent = (event: IntegrityEvent) =>
  event.type === 'POINTER_LEFT_PAGE' || event.type === 'POINTER_ENTERED_PAGE'

const indexesWhere = (events: IntegrityEvent[], match: (event: IntegrityEvent) => boolean) =>
  events.reduce<number[]>((indexes, event, index) => (match(event) ? indexes.concat(index) : indexes), [])

const removeIndexes = (events: IntegrityEvent[], indexes: number[], onDrop: DropCounter) => {
  if (indexes.length === 0) return events

  const removed: Record<number, boolean> = {}
  indexes.forEach(index => {
    removed[index] = true
    onDrop(events[index].type)
  })

  return events.filter((_, index) => !removed[index])
}

// Question views shown the shortest time go first. When a dropped view leaves two views of the same question side
// by side, the later one adds nothing and goes too ("merging repeats"), so this may pick one more than asked
const pickQuestionViews = (events: IntegrityEvent[], count: number) => {
  const views = indexesWhere(events, event => event.type === 'QUESTION_VIEW')
  const endT = events.length ? events[events.length - 1].t : 0
  const picked: number[] = []

  while (picked.length < count && views.length > 0) {
    let shortest = 0
    let shortestDwell = Infinity

    for (let k = 0; k < views.length; k++) {
      const dwell = (k + 1 < views.length ? events[views[k + 1]].t : endT) - events[views[k]].t

      if (dwell < shortestDwell) {
        shortestDwell = dwell
        shortest = k
      }
    }

    picked.push(views[shortest])
    views.splice(shortest, 1)

    if (shortest > 0 && shortest < views.length && events[views[shortest - 1]].q === events[views[shortest]].q) {
      picked.push(views[shortest])
      views.splice(shortest, 1)
    }
  }

  return picked
}

// Drops up to `count` records in the contract's order: pointer events, then window layouts except the first and
// the last, then question views. Presence, frame focus, blocked actions and lifecycle events are never dropped
const dropDroppable = (events: IntegrityEvent[], count: number, onDrop: DropCounter) => {
  let result = events
  let remaining = count

  if (remaining > 0) {
    const pointers = indexesWhere(result, isPointerEvent).slice(0, remaining)
    remaining -= pointers.length
    result = removeIndexes(result, pointers, onDrop)
  }

  if (remaining > 0) {
    const layouts = indexesWhere(result, event => event.type === 'WINDOW_LAYOUT')
      .slice(1, -1)
      .slice(0, remaining)
    remaining -= layouts.length
    result = removeIndexes(result, layouts, onDrop)
  }

  if (remaining > 0) result = removeIndexes(result, pickQuestionViews(result, remaining), onDrop)

  return result
}

const countDroppable = (events: IntegrityEvent[]) => {
  const layouts = events.filter(event => event.type === 'WINDOW_LAYOUT').length

  return (
    events.filter(event => isPointerEvent(event) || event.type === 'QUESTION_VIEW').length + Math.max(0, layouts - 2)
  )
}

// Keeps the last record of every question, which is what was submitted; older records of a question go first
const truncateAnswers = (answers: IntegrityAnswer[], max: number, onDrop: DropCounter) => {
  if (answers.length <= max) return answers

  const lastIndex: Record<string, number> = {}
  answers.forEach((answer, index) => {
    lastIndex[answer.questionId] = index
  })

  let excess = answers.length - max

  return answers.filter((answer, index) => {
    if (excess > 0 && lastIndex[answer.questionId] !== index) {
      excess--
      onDrop('ANSWER')

      return false
    }

    return true
  })
}

const byteLength = (payload: QuizIntegrityPayload) => new TextEncoder().encode(JSON.stringify(payload)).length

const describeError = (error: unknown) => (error instanceof Error ? error.message : String(error)).slice(0, 200)

// ** Recorder

export interface IntegrityRecorderOptions {
  clock: IntegrityClock
  quizStudentId: string
  sessionId: string
  questionOrder: string[]
  serverEndTime: string
  clockOffsetMs: number
  environment: IntegrityEnvironment
  limits?: IntegrityLimits
}

export interface IntegrityRecorder {
  readonly presence: PresenceState
  readonly question: string | null

  /** Milliseconds since the start, never going down */
  now(): number
  start(initial: { visible: boolean; focused: boolean }, question: string | null): void
  record(type: IntegrityEventType, data?: Record<string, unknown>): IntegrityEvent | null

  /** Counts a record that was left out on purpose; it still uses up a seq number */
  drop(type: string): void
  setQuestion(questionId: string | null): void
  recordAnswer(questionId: string, answer: number, input: AnswerInput, trusted: boolean): IntegrityAnswer | null

  /** Stops recording events after an internal error (answers are still recorded); the payload then says so */
  fail(error: unknown): void
  buildPayload(trigger: SubmitTrigger): QuizIntegrityPayload
}

export const createIntegrityRecorder = (options: IntegrityRecorderOptions): IntegrityRecorder => {
  const { clock } = options
  const limits = options.limits || INTEGRITY_LIMITS
  const currentAnswers: Record<string, number> = {}
  const droppedByType: Record<string, number> = {}
  let events: IntegrityEvent[] = []
  let answers: IntegrityAnswer[] = []
  let droppedCount = 0
  let nextSeq = 1
  let startMono = 0
  let startWall = 0
  let lastT = 0
  let started = false
  let failure: string | null = null
  let presence: PresenceState = { visible: true, focused: true, frozen: false }
  let question: string | null = null

  const countDrop = (type: string) => {
    droppedByType[type] = (droppedByType[type] || 0) + 1
    droppedCount++
  }

  const now = () => {
    if (!started) return 0
    lastT = Math.max(lastT, Math.round(clock.mono() - startMono))

    return lastT
  }

  const nextRecord = () => ({ seq: nextSeq++, t: now(), at: Math.round(clock.wall()) })

  const push = (type: IntegrityEventType, data?: Record<string, unknown>) => {
    const event: IntegrityEvent = { ...nextRecord(), type, q: question }
    if (data) event.data = data

    presence = applyPresenceEvent(presence, event)
    events.push(event)

    return event
  }

  return {
    get presence() {
      return presence
    },

    get question() {
      return question
    },

    now,

    start(initial, initialQuestion) {
      if (started) return

      started = true
      startMono = clock.mono()
      startWall = Math.round(clock.wall())
      question = initialQuestion
      push('TRACKING_STARTED', { visible: initial.visible, focused: initial.focused })
    },

    record(type, data) {
      if (!started || failure !== null) return null

      // A full log first loses what may be dropped. If it is still full, this record is lost too, but it keeps its
      // seq and the presence state still follows it
      if (events.length >= limits.liveEvents) events = dropDroppable(events, events.length - limits.events, countDrop)
      if (events.length >= limits.liveEvents) {
        nextSeq++
        countDrop(type)
        presence = applyPresenceEvent(presence, { type, data })

        return null
      }

      return push(type, data)
    },

    drop(type) {
      if (!started || failure !== null) return

      nextSeq++
      countDrop(type)
    },

    setQuestion(questionId) {
      question = questionId
    },

    // Answers are recorded even after an internal error: without them the record would not match the submitted
    // answers, which looks like tampering (ANSWERS_MISMATCH) for an honest student
    recordAnswer(questionId, answer, input, trusted) {
      if (!started) return null

      const previousAnswer = Object.prototype.hasOwnProperty.call(currentAnswers, questionId)
        ? currentAnswers[questionId]
        : null

      // Selecting the answer that is already selected changes nothing
      if (previousAnswer === answer) return null

      currentAnswers[questionId] = answer
      if (answers.length >= limits.liveAnswers) answers = truncateAnswers(answers, limits.answers, countDrop)

      const record: IntegrityAnswer = {
        ...nextRecord(),
        questionId,
        answer,
        previousAnswer,
        input,
        trusted,
        present: isPresent(presence)
      }
      answers.push(record)

      return record
    },

    fail(error) {
      if (failure === null) failure = describeError(error)
    },

    buildPayload(trigger) {
      // The stop record is not kept: if the submit fails, tracking goes on and the next payload gets a new one
      const stop: IntegrityEvent = {
        seq: nextSeq,
        t: now(),
        at: Math.round(clock.wall()),
        type: 'TRACKING_STOPPED',
        q: question,
        data: { trigger }
      }
      const dropped = { ...droppedByType }
      let droppedTotal = droppedCount

      const countPayloadDrop = (type: string) => {
        dropped[type] = (dropped[type] || 0) + 1
        droppedTotal++
      }

      const payloadAnswers = truncateAnswers(answers, limits.answers, countPayloadDrop)
      let payloadEvents = dropDroppable(events.concat(stop), events.length + 1 - limits.events, countPayloadDrop)

      const assemble = (): QuizIntegrityPayload => ({
        schemaVersion: 1,
        quizStudentId: options.quizStudentId,
        sessionId: options.sessionId,
        trackerVersion: TRACKER_VERSION,
        questionOrder: options.questionOrder,
        timing: {
          startedAt: new Date(startWall).toISOString(),
          submittedAt: new Date(stop.at).toISOString(),
          durationMs: stop.t,
          serverEndTime: options.serverEndTime,
          clockOffsetMs: options.clockOffsetMs,
          submitTrigger: trigger
        },
        environment: options.environment,
        events: payloadEvents,
        answers: payloadAnswers,
        summary: computeIntegritySummary(payloadEvents, payloadAnswers),
        truncation: {
          truncated: droppedTotal > 0 || failure !== null,
          droppedCount: droppedTotal,
          droppedByType: dropped,
          ...(failure !== null ? { error: failure } : {})
        }
      })

      let payload = assemble()
      let bytes = byteLength(payload)

      // Over the size target: drop more of what may be dropped, roughly as many records as the excess needs
      while (bytes > limits.targetBytes && countDroppable(payloadEvents) > 0) {
        const excess = Math.ceil((bytes - limits.targetBytes) / (bytes / payloadEvents.length))
        payloadEvents = dropDroppable(payloadEvents, Math.max(1, excess), countPayloadDrop)
        payload = assemble()
        bytes = byteLength(payload)
      }

      // Never more than the server accepts: as a last resort the newest records go, keeping the first and the stop
      while (bytes > limits.maxBytes && payloadEvents.length > 2) {
        const excess = Math.ceil((bytes - limits.maxBytes) / (bytes / payloadEvents.length))
        const keep = payloadEvents.length - 1 - Math.min(payloadEvents.length - 2, Math.max(1, excess))

        payloadEvents.slice(keep, -1).forEach(event => countPayloadDrop(event.type))
        payloadEvents = payloadEvents.slice(0, keep).concat(stop)
        payload = assemble()
        bytes = byteLength(payload)
      }

      return payload
    }
  }
}
