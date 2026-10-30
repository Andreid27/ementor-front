/**
 * integrityTracker - Watches the quiz page and records every exit and what happened around it (contract section 7)
 *
 * Feeds integrityRecorder from the browser: focus and visibility (the student is present only while the page is
 * visible and focused), a once-a-second check that repairs missed events and notices sleep and idle time, the
 * question on screen, input, the window layout, and elements that browser extensions add to the page. Nothing is
 * sent anywhere: QuizInterface asks for the payload when it submits. Every handler is guarded, and an internal
 * error stops the tracking without touching the quiz.
 */

import { collectEnvironment } from './integrityEnvironment'
import {
  INTEGRITY_LIMITS,
  type IntegrityRecorder,
  applyPresenceEvent,
  createIntegrityRecorder,
  isPresent,
  toAnswerInput
} from './integrityRecorder'
import type {
  AnswerSelectionSource,
  BlockedAction,
  IntegrityEventType,
  QuizIntegrityPayload,
  SubmitTrigger
} from './integrityTypes'

const CHECK_INTERVAL_MS = 1000
const IDLE_AFTER_MS = 30000
const QUESTION_HOLD_MS = 500
const POINTER_OUT_MS = 2000
const CLOCK_JUMP_MS = 2000
const LAYOUT_THROTTLE_MS = 1000

// Frequent inputs (pointer moves, scrolling) are handled at most this often
const INPUT_THROTTLE_MS = 200

// An answer click without a pointer type takes the type of a pointerdown this recent
const POINTER_FALLBACK_MS = 1000

// A "not focused" reading of document.hasFocus() this soon after a keystroke or touch on the page is wrong
const ACTIVE_INPUT_MS = 1500

const QUESTION_THRESHOLDS = Array.from({ length: 21 }, (_, index) => index / 20)

// Signatures of AI assistant extensions, matched against DOM_INJECTION signatures. Empty until someone installs the
// popular AI sidebar extensions and notes what each adds to a page (contract section 6.6). Every injection is still
// reported with its signature, and the server matches signatures against its own copy of the list.
const KNOWN_AI_EXTENSIONS: { name: string; pattern: RegExp }[] = []

// Attributes the app itself sets on <html> and <body>
const APP_ATTRIBUTES = ['class', 'style', 'lang', 'dir']

// Elements under <html> and <body> that show nothing, or that the app and Next.js add next to the app root
const IGNORED_TAGS = [
  'SCRIPT',
  'STYLE',
  'LINK',
  'META',
  'TITLE',
  'HEAD',
  'BODY',
  'NOSCRIPT',
  'TEMPLATE',
  'NEXT-ROUTE-ANNOUNCER',
  'NEXTJS-PORTAL'
]

export interface QuizIntegrityTracker {
  recordAnswer(questionId: string, answer: number, source: AnswerSelectionSource): void
  recordBlockedAction(action: BlockedAction): void

  /** The record so far, ready to attach to the submit; null if it cannot be built */
  buildPayload(trigger: SubmitTrigger): QuizIntegrityPayload | null
  stop(): void
}

export interface QuizIntegrityTrackerOptions {
  quizStudentId: string
  questionOrder: string[]
  serverEndTime: string
  clockOffsetMs: number
}

const createSessionId = () => {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID()

  const bytes = crypto.getRandomValues(new Uint8Array(16))
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

const clip = (value: string, max = 100) => (value.length > max ? value.slice(0, max) : value)

const classNames = (element: Element) => (element.getAttribute('class') || '').trim()

// tag#id.firstClass in lower case; never any text content
const elementSignature = (element: Element) => {
  const id = element.id ? `#${element.id}` : ''
  const firstClass = classNames(element) ? `.${classNames(element).split(/\s+/)[0]}` : ''

  return clip(`${element.tagName}${id}${firstClass}`.toLowerCase(), 200)
}

// #nprogress is the page loading bar (NProgress, started on every route change); recharts measures text in a
// hidden span it adds to <body> and leaves there, so every student who saw a dashboard chart has one
const isAppElement = (element: Element) =>
  IGNORED_TAGS.includes(element.tagName) ||
  element.id.startsWith('__next') ||
  element.id === 'nprogress' ||
  element.id === 'recharts_measurement_span' ||
  classNames(element)
    .split(/\s+/)
    .some(name => name.startsWith('Mui') || name.startsWith('base-'))

// The element directly under <body> or <html> that holds this one
const topLevelElement = (element: Element) => {
  let current = element
  while (
    current.parentElement &&
    current.parentElement !== document.body &&
    current.parentElement !== document.documentElement
  ) {
    current = current.parentElement
  }

  return current
}

const knownExtension = (signature: string) => {
  const match = KNOWN_AI_EXTENSIONS.find(extension => extension.pattern.test(signature))

  return match ? match.name : null
}

const readLayout = () => {
  const screenInfo = window.screen as Screen & { isExtended?: boolean }

  return {
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight,
    outerWidth: window.outerWidth,
    outerHeight: window.outerHeight,
    availWidth: screenInfo.availWidth,
    availHeight: screenInfo.availHeight,
    pixelRatio: Math.round((window.devicePixelRatio || 1) * 100) / 100,
    isExtendedScreen: typeof screenInfo.isExtended === 'boolean' ? screenInfo.isExtended : null
  }
}

// The question card covering the largest part of the viewport height; on a tie, the one nearest its centre
const findQuestionOnScreen = (cards: HTMLElement[]) => {
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight
  let best: { id: string; ratio: number } | null = null
  let bestHeight = 0
  let bestDistance = Infinity

  for (const card of cards) {
    const rect = card.getBoundingClientRect()
    const height = Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0)
    const distance = Math.abs((rect.top + rect.bottom) / 2 - viewportHeight / 2)

    if (height > 0 && card.dataset.questionId) {
      if (height > bestHeight + 0.5 || (Math.abs(height - bestHeight) <= 0.5 && distance < bestDistance)) {
        best = { id: card.dataset.questionId, ratio: Math.round((height / rect.height) * 100) / 100 }
        bestHeight = height
        bestDistance = distance
      }
    }
  }

  return best
}

export const startQuizIntegrityTracker = (options: QuizIntegrityTrackerOptions): QuizIntegrityTracker | null => {
  if (typeof window === 'undefined') return null

  let recorder: IntegrityRecorder
  let stopped = false
  let blurPending = false
  let idleActive = false
  let idleFrom = 0
  let lastInputT = -Infinity
  let lastPointer: { type: string; t: number } | null = null
  let lastActiveInputT = -Infinity

  // Some browsers and in-app webviews misreport document.hasFocus(); once it contradicts the student typing or
  // touching the page, only focus events and input decide focus
  let hasFocusReliable = true
  let pointerOutAt: number | null = null
  let pointerLeftRecorded = false
  let pendingQuestion: string | null = null
  let lastLayout = ''
  let lastLayoutAt = -Infinity
  let lastWall = Date.now()
  let lastMono = performance.now()
  let signatureCount = 0
  const seenSignatures: Record<string, boolean> = {}
  const timers: Record<string, number | undefined> = {}
  const cleanups: (() => void)[] = []

  const teardown = () => {
    if (stopped) return
    stopped = true
    cleanups.forEach(cleanup => cleanup())
    Object.keys(timers).forEach(name => window.clearTimeout(timers[name]))
  }

  const guard =
    <A extends unknown[]>(handler: (...args: A) => void) =>
    (...args: A) => {
      if (stopped) return

      try {
        handler(...args)
      } catch (error) {
        console.error('Quiz integrity tracking stopped:', error)
        recorder.fail(error)
        teardown()
      }
    }

  const listen = (target: EventTarget, type: string, handler: (event: any) => void, capture = false) => {
    const guarded = guard(handler)
    const listenerOptions = { capture, passive: true }
    target.addEventListener(type, guarded, listenerOptions)
    cleanups.push(() => target.removeEventListener(type, guarded, listenerOptions))
  }

  const later = (name: string, delay: number, handler: () => void) => {
    window.clearTimeout(timers[name])
    timers[name] = window.setTimeout(guard(handler), delay)
  }

  // Sleep or a changed clock: the wall clock moved further than the monotonic one. Checked before every presence
  // event, so a sleep is recorded inside the exit it belongs to, before the event that ends it
  const checkClock = () => {
    const wall = Date.now()
    const mono = performance.now()
    const wallDelta = wall - lastWall
    const monoDelta = mono - lastMono
    lastWall = wall
    lastMono = mono

    if (wallDelta - monoDelta > CLOCK_JUMP_MS) {
      recorder.record('CLOCK_JUMP', { wallDeltaMs: Math.round(wallDelta), monoDeltaMs: Math.round(monoDelta) })
    }
  }

  const endIdle = (endedBy: 'INPUT' | 'PRESENCE_LOST') => {
    if (!idleActive) return
    idleActive = false
    recorder.record('IDLE_END', { idleMs: recorder.now() - idleFrom, endedBy })
  }

  const presenceEvent = (type: IntegrityEventType, data?: Record<string, unknown>) => {
    resolveBlur()
    checkClock()

    const wasPresent = isPresent(recorder.presence)
    const willBePresent = isPresent(applyPresenceEvent(recorder.presence, { type, data }))

    // An idle period ends before the exit that interrupts it
    if (wasPresent && !willBePresent) endIdle('PRESENCE_LOST')
    recorder.record(type, data)

    // Idle time only counts while present, so its clock restarts on return
    if (!wasPresent && willBePresent) idleFrom = recorder.now()
  }

  const emit = (type: IntegrityEventType, data?: Record<string, unknown>) => {
    resolveBlur()
    recorder.record(type, data)
  }

  // Focus that moved into a frame or an element outside the app, usually an extension panel; null otherwise
  const injectedFocusTarget = () => {
    const active = document.activeElement
    if (!document.hasFocus() || !active || active === document.body || active === document.documentElement) return null

    const container = topLevelElement(active)
    if (active.tagName === 'IFRAME') return isAppElement(container) ? active : container

    return isAppElement(container) ? null : container
  }

  // A window blur is decided after the current task, when document.activeElement shows where the focus went
  function resolveBlur() {
    if (!blurPending) return
    blurPending = false

    const target = injectedFocusTarget()
    if (target) recorder.record('FOCUS_IN_FRAME', { signature: elementSignature(target) })
    else presenceEvent('FOCUS_LOST')
  }

  const reportInjection = (
    signature: string,
    details: { tag: string; id: string | null; className: string | null; attribute: string | null },
    atStart: boolean
  ) => {
    if (seenSignatures[signature]) return
    seenSignatures[signature] = true

    if (signatureCount >= INTEGRITY_LIMITS.domInjectionSignatures) {
      recorder.drop('DOM_INJECTION')

      return
    }
    signatureCount++
    emit('DOM_INJECTION', { signature, ...details, knownAs: knownExtension(signature), atStart })
  }

  const scanElement = (element: Element, atStart: boolean) => {
    if (isAppElement(element)) return

    reportInjection(
      elementSignature(element),
      {
        tag: element.tagName.toLowerCase(),
        id: element.id ? clip(element.id) : null,
        className: classNames(element) ? clip(classNames(element)) : null,
        attribute: null
      },
      atStart
    )
  }

  const scanAttribute = (element: Element, name: string, atStart: boolean) => {
    if (APP_ATTRIBUTES.includes(name)) return

    const attribute = clip(name.toLowerCase())
    reportInjection(
      `@${attribute}`,
      { tag: element.tagName.toLowerCase(), id: null, className: null, attribute },
      atStart
    )
  }

  const recordLayout = () => {
    const layout = readLayout()
    const key = JSON.stringify(layout)
    if (key === lastLayout) return

    lastLayout = key
    lastLayoutAt = recorder.now()
    emit('WINDOW_LAYOUT', layout)
  }

  try {
    const cards = Array.from(document.querySelectorAll<HTMLElement>('[data-question-id]'))
    const initialQuestion = findQuestionOnScreen(cards)

    recorder = createIntegrityRecorder({
      clock: { mono: () => performance.now(), wall: () => Date.now() },
      quizStudentId: options.quizStudentId,
      sessionId: createSessionId(),
      questionOrder: options.questionOrder,
      serverEndTime: options.serverEndTime,
      clockOffsetMs: options.clockOffsetMs,
      environment: collectEnvironment()
    })
    recorder.start(
      { visible: document.visibilityState === 'visible', focused: document.hasFocus() },
      initialQuestion ? initialQuestion.id : null
    )
    recordLayout()

    // ** Presence

    listen(window, 'blur', (event: FocusEvent) => {
      if (event.target !== window) return
      blurPending = true
      later('blur', 0, resolveBlur)
    })
    listen(window, 'focus', (event: FocusEvent) => {
      if (event.target === window) presenceEvent('FOCUS_GAINED')
    })
    listen(document, 'visibilitychange', () =>
      presenceEvent(document.visibilityState === 'visible' ? 'PAGE_VISIBLE' : 'PAGE_HIDDEN')
    )
    listen(document, 'freeze', () => presenceEvent('PAGE_FROZEN'))
    listen(document, 'resume', () => presenceEvent('PAGE_RESUMED'))
    listen(window, 'pagehide', (event: PageTransitionEvent) => emit('PAGE_HIDE', { persisted: event.persisted }))
    listen(window, 'pageshow', (event: PageTransitionEvent) => {
      checkClock()
      emit('PAGE_SHOW', { persisted: event.persisted })
    })
    listen(window, 'beforeunload', () => emit('UNLOAD_ATTEMPT'))
    listen(window, 'offline', () => emit('NETWORK_OFFLINE'))
    listen(window, 'online', () => emit('NETWORK_ONLINE'))

    // The once-a-second check: repairs missed focus and visibility events, notices sleep and starts idle periods
    const interval = window.setInterval(
      guard(() => {
        resolveBlur()
        checkClock()

        const visible = document.visibilityState === 'visible'
        const focusedReading = document.hasFocus()
        const state = recorder.presence
        if (!focusedReading && state.focused && recorder.now() - lastActiveInputT < ACTIVE_INPUT_MS) {
          hasFocusReliable = false
        }

        const focused = hasFocusReliable ? focusedReading : state.focused
        if (visible !== state.visible || focused !== state.focused || state.frozen) {
          presenceEvent('FOCUS_STATE_CORRECTED', { visible, focused, source: 'CHECK' })
        }

        if (!idleActive && isPresent(recorder.presence) && recorder.now() - idleFrom >= IDLE_AFTER_MS) {
          idleActive = true
          emit('IDLE_START', { lastInputT: idleFrom })
        }
      }),
      CHECK_INTERVAL_MS
    )
    cleanups.push(() => window.clearInterval(interval))

    // ** Input and idle

    const onInput = (event: Event) => {
      const t = recorder.now()
      if (event.type === 'pointerdown') lastPointer = { type: (event as PointerEvent).pointerType, t }

      const frequent = event.type === 'pointermove' || event.type === 'scroll' || event.type === 'wheel'
      if (frequent && !idleActive && t - lastInputT < INPUT_THROTTLE_MS) return

      resolveBlur()

      // Keys and touches only reach a page that has the focus (pointer moves, wheels and clicks can reach a
      // window in the background), so they correct a focus state that missed its event
      if (event.isTrusted && (event.type === 'keydown' || event.type === 'touchstart')) {
        lastActiveInputT = t
        if (recorder.presence.visible && !recorder.presence.focused) {
          if (!document.hasFocus()) hasFocusReliable = false
          presenceEvent('FOCUS_STATE_CORRECTED', { visible: true, focused: true, source: 'INPUT' })
        }
      }

      endIdle('INPUT')
      lastInputT = t
      idleFrom = t
    }
    ;['pointerdown', 'pointermove', 'keydown', 'wheel', 'scroll', 'touchstart'].forEach(type =>
      listen(window, type, onInput, true)
    )

    // ** Mouse leaving the page for at least 2 s

    listen(document, 'pointerout', (event: PointerEvent) => {
      if (event.relatedTarget || event.pointerType !== 'mouse') return

      const leftAtT = recorder.now()
      pointerOutAt = leftAtT
      later('pointer', POINTER_OUT_MS, () => {
        if (pointerOutAt !== leftAtT) return
        pointerLeftRecorded = true
        emit('POINTER_LEFT_PAGE', { leftAtT })
      })
    })
    listen(document, 'pointerover', () => {
      if (pointerOutAt === null) return

      window.clearTimeout(timers.pointer)
      if (pointerLeftRecorded) emit('POINTER_ENTERED_PAGE', { outMs: recorder.now() - pointerOutAt })
      pointerOutAt = null
      pointerLeftRecorded = false
    })

    // ** Question on screen

    const checkQuestion = () => {
      const onScreen = findQuestionOnScreen(cards)

      // With nothing on screen (the submit card, say), the last question seen stays the question on screen
      if (!onScreen || onScreen.id === recorder.question) {
        pendingQuestion = null
        window.clearTimeout(timers.question)

        return
      }
      if (onScreen.id === pendingQuestion) return

      const held = onScreen.id
      pendingQuestion = held
      later('question', QUESTION_HOLD_MS, () => {
        pendingQuestion = null
        const current = findQuestionOnScreen(cards)

        if (current && current.id === held && current.id !== recorder.question) {
          resolveBlur()
          recorder.setQuestion(current.id)
          recorder.record('QUESTION_VIEW', { visibleRatio: current.ratio })
        } else {
          checkQuestion()
        }
      })
    }

    if (typeof IntersectionObserver === 'function') {
      const observer = new IntersectionObserver(guard(checkQuestion), { threshold: QUESTION_THRESHOLDS })
      cards.forEach(card => observer.observe(card))
      cleanups.push(() => observer.disconnect())
    }

    // ** Window layout, at most once a second and always ending with the latest

    const onLayoutChange = () => {
      if (timers.layout !== undefined) return

      later('layout', Math.max(0, lastLayoutAt + LAYOUT_THROTTLE_MS - recorder.now()), () => {
        timers.layout = undefined
        recordLayout()
      })
    }
    listen(window, 'resize', onLayoutChange)

    // Monitors connected or rearranged (Chromium); other browsers have no such event on screen
    const screenEvents = window.screen as unknown as Partial<EventTarget>
    if (typeof screenEvents.addEventListener === 'function') {
      listen(screenEvents as EventTarget, 'change', onLayoutChange)
    }

    listen(window, 'keyup', (event: KeyboardEvent) => {
      if (event.key === 'PrintScreen') emit('SCREENSHOT_KEY')
    })

    // ** Elements and attributes the app did not add: present at the start, then as they appear

    Array.from(document.documentElement.children).forEach(element => scanElement(element, true))
    Array.from(document.body.children).forEach(element => scanElement(element, true))
    ;[document.documentElement, document.body].forEach(element =>
      Array.from(element.attributes).forEach(attribute => scanAttribute(element, attribute.name, true))
    )

    const mutations = new MutationObserver(
      guard((records: MutationRecord[]) =>
        records.forEach(record => {
          if (record.type === 'childList') {
            record.addedNodes.forEach(node => {
              if (node.nodeType === Node.ELEMENT_NODE) scanElement(node as Element, false)
            })
          } else if (record.attributeName && record.oldValue === null) {
            scanAttribute(record.target as Element, record.attributeName, false)
          }
        })
      )
    )
    ;[document.documentElement, document.body].forEach(element =>
      mutations.observe(element, { childList: true, attributes: true, attributeOldValue: true })
    )
    cleanups.push(() => mutations.disconnect())
  } catch (error) {
    console.error('Quiz integrity tracking could not start:', error)
    teardown()

    return null
  }

  return {
    // Still works after an internal error stopped the watching: the answers must match the submission
    recordAnswer(questionId: string, answer: number, source: AnswerSelectionSource) {
      try {
        if (!stopped) resolveBlur()

        // A pointerdown just before tells what was really used: older browsers leave pointerType out of click
        // events, and iOS Safari reports the click of a finger tap as a mouse click
        let input = toAnswerInput(source.pointerType)
        if (
          (input === 'UNKNOWN' || input === 'MOUSE') &&
          source.isTrusted &&
          lastPointer &&
          recorder.now() - lastPointer.t <= POINTER_FALLBACK_MS &&
          toAnswerInput(lastPointer.type) !== 'UNKNOWN'
        ) {
          input = toAnswerInput(lastPointer.type)
        }

        recorder.recordAnswer(questionId, answer, input, source.isTrusted)
      } catch (error) {
        console.error('Quiz integrity answer could not be recorded:', error)
      }
    },

    recordBlockedAction: guard((action: BlockedAction) => emit('BLOCKED_ACTION', { action })),

    buildPayload(trigger) {
      try {
        if (!stopped) resolveBlur()

        return recorder.buildPayload(trigger)
      } catch (error) {
        console.error('Quiz integrity record could not be built:', error)

        return null
      }
    },

    stop: teardown
  }
}
