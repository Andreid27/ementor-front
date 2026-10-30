// ** React Imports
import { useCallback, useEffect, useRef, useState } from 'react'

// ** API Imports
import * as apiSpec from 'src/apiSpec'
import apiClient from 'src/@core/axios/axiosEmentor'
import authConfig from 'src/configs/auth'

export type ReadingStatus = 'waiting' | 'reading' | 'idle' | 'page-limit' | 'hidden'

const TICK_MS = 1000

// A tick never credits more than this, so a throttled background tab or a
// laptop waking from sleep adds nothing for the time in between.
const MAX_TICK_SECONDS = 1.5

// A window that is visible but not focused (a second monitor, a video call on
// top) only counts while the student keeps interacting with it.
const UNFOCUSED_IDLE_SECONDS = 30

// Reading on the whole screen is a deliberate choice, so it earns a longer silent read.
const FULLSCREEN_IDLE_SECONDS = 300

// When the student turns out to have left, only this much of the time since
// their last interaction is kept: enough for the line they were finishing.
const AWAY_GRACE_SECONDS = 30

// Leaving the tab is a deliberate act, so a little more of that time is kept.
const HIDE_GRACE_SECONDS = 60

// Time is sent in small batches, so a lost request costs little.
const FLUSH_AFTER_SECONDS = 30

// Smaller pointer movements are sensor noise, not a reader.
const POINTER_MIN_MOVE_PX = 4

// Other windows of the same lesson are told at most this often.
const BROADCAST_EVERY_MS = 2000

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

/**
 * Limits scaled to the lesson: a dense page earns a longer silent read than a
 * light one. Without an estimate, a page is assumed to take a minute.
 */
export const readingLimits = (secondsPerPage?: number) => {
  const perPage = secondsPerPage && Number.isFinite(secondsPerPage) && secondsPerPage > 0 ? secondsPerPage : 60

  return {
    /** No interaction for longer than this pauses counting. */
    idleSeconds: clamp(Math.round(perPage * 1.5), 60, 180),

    /** Active time one page can add per visit; then the next page has to be opened. */
    pageSeconds: clamp(Math.round(perPage * 4), 300, 900),

    /** Active time after which a page counts as read. */
    pageReadSeconds: clamp(Math.round(perPage * 0.25), 5, 30)
  }
}

const timeUrl = (lessonId: string, seconds: number) =>
  `${apiSpec.LESSON_SERVICE}/lesson/student-lesson-time/${lessonId}?timeToAdd=${seconds}`

interface UseReadingTrackerOptions {
  lessonId?: string
  enabled: boolean

  /** The lesson's estimated reading time divided by its pages. */
  secondsPerPage?: number

  /** The page on screen, such as `${fileId}:${page}`; null until a document is shown. */
  pageKey: string | null

  /** Called once per page and visit, when the student has actively spent enough time on it. */
  onPageRead?: (pageKey: string) => void

  /** The viewer is in fullscreen: the idle limit becomes FULLSCREEN_IDLE_SECONDS. */
  fullscreen?: boolean
}

/**
 * Measures the time a student actually spends reading a lesson and adds it to
 * the lesson in small batches.
 *
 * A second counts only when the lesson is on screen, the student has
 * interacted with it recently (pointer, keyboard, touch, scroll, page turn),
 * the current page has not used up its share, and no other window of the
 * same lesson is the active one. A tab left open in the background, a window
 * behind other windows, or a laptop left on the lesson stops adding time on
 * its own, and the stretch before it is mostly taken back.
 */
const useReadingTracker = ({
  lessonId,
  enabled,
  secondsPerPage,
  pageKey,
  onPageRead,
  fullscreen = false
}: UseReadingTrackerOptions) => {
  const [status, setStatus] = useState<ReadingStatus>('waiting')
  const [sessionSeconds, setSessionSeconds] = useState(0)

  const baseLimits = readingLimits(secondsPerPage)
  const limits = { ...baseLimits, idleSeconds: fullscreen ? FULLSCREEN_IDLE_SECONDS : baseLimits.idleSeconds }
  const limitsRef = useRef(limits)
  limitsRef.current = limits

  const pageKeyRef = useRef(pageKey)
  pageKeyRef.current = pageKey

  const onPageReadRef = useRef(onPageRead)
  onPageReadRef.current = onPageRead

  const state = useRef({
    lastTick: Date.now(),
    lastActivity: Date.now(),
    lastBroadcast: 0,
    lastPointer: null as { x: number; y: number } | null,

    /** Counted since the last interaction: kept only once the student shows they are still there. */
    tentative: 0,

    /** Sure, waiting to be sent. */
    committed: 0,

    /** Shown to the student for this visit. */
    session: 0,
    pageDwell: 0,
    pageRead: false,
    status: 'waiting' as ReadingStatus
  })

  const channel = useRef<BroadcastChannel | null>(null)

  const flush = useCallback(
    (keepalive = false) => {
      const st = state.current
      const seconds = Math.floor(st.committed)
      if (!lessonId || seconds < 1) return

      st.committed -= seconds

      if (keepalive) {
        // The page may be going away, so the request must outlive it; axios cannot.
        const token = window.localStorage.getItem(authConfig.storageTokenKeyName)
        fetch(`${String(apiSpec.PROD_HOST ?? '').replace(/\/+$/, '')}${timeUrl(lessonId, seconds)}`, {
          method: 'GET',
          keepalive: true,
          headers: token ? { Authorization: `Bearer ${token}` } : undefined
        }).catch(() => undefined)
      } else {
        apiClient.get(timeUrl(lessonId, seconds)).catch(() => {
          // Goes out again with the next batch.
          state.current.committed += seconds
        })
      }
    },
    [lessonId]
  )

  /** Ends the tentative stretch, keeping at most `keep` seconds of it. */
  const settle = useCallback((keep: number) => {
    const st = state.current
    const kept = Math.min(st.tentative, keep)
    st.committed += kept
    st.session -= st.tentative - kept
    st.tentative = 0
  }, [])

  const markActive = useCallback(() => {
    const st = state.current
    const now = Date.now()
    st.lastActivity = now

    // The student is here, so the stretch before this counts in full.
    st.committed += st.tentative
    st.tentative = 0

    // Lift the pause prompt at once rather than on the next tick.
    if (st.status === 'idle') {
      st.status = 'reading'
      setStatus('reading')
    }

    if (channel.current && now - st.lastBroadcast > BROADCAST_EVERY_MS) {
      st.lastBroadcast = now
      channel.current.postMessage('active')
    }
  }, [])

  // A new page is a deliberate step: it counts as activity and starts its own share.
  useEffect(() => {
    const st = state.current
    st.pageDwell = 0
    st.pageRead = false
    if (pageKey) markActive()
  }, [pageKey, markActive])

  useEffect(() => {
    if (!enabled || !lessonId) return

    const st = state.current
    st.lastTick = Date.now()
    st.lastActivity = Date.now()

    if (typeof BroadcastChannel !== 'undefined') {
      channel.current = new BroadcastChannel(`ementor-lesson-reading-${lessonId}`)

      // Another window of this lesson is being read now; this one stops counting.
      channel.current.onmessage = () => {
        settle(AWAY_GRACE_SECONDS)
        state.current.lastActivity = 0
      }
    }

    const tick = () => {
      const now = Date.now()
      const delta = clamp((now - st.lastTick) / 1000, 0, MAX_TICK_SECONDS)
      st.lastTick = now

      const { idleSeconds, pageSeconds, pageReadSeconds } = limitsRef.current
      let next: ReadingStatus

      if (!pageKeyRef.current) next = 'waiting'
      else if (document.visibilityState !== 'visible') next = 'hidden'
      else if ((now - st.lastActivity) / 1000 > (document.hasFocus() ? idleSeconds : UNFOCUSED_IDLE_SECONDS))
        next = 'idle'
      else if (st.pageDwell >= pageSeconds) next = 'page-limit'
      else next = 'reading'

      if (next === 'reading') {
        st.tentative += delta
        st.session += delta
        st.pageDwell += delta

        if (!st.pageRead && st.pageDwell >= pageReadSeconds && pageKeyRef.current) {
          st.pageRead = true
          onPageReadRef.current?.(pageKeyRef.current)
        }
      } else if (next === 'idle' && st.status === 'reading') {
        settle(AWAY_GRACE_SECONDS)
      }

      if (st.committed >= FLUSH_AFTER_SECONDS) flush()

      if (next !== st.status) {
        st.status = next
        setStatus(next)
      }
      setSessionSeconds(Math.floor(st.session))
    }

    const leave = () => {
      settle(HIDE_GRACE_SECONDS)
      flush(true)
    }

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        leave()
      } else {
        // Coming back to the tab is an interaction; the time away earns nothing.
        st.lastTick = Date.now()
        markActive()
      }
    }

    const onPointerMove = (event: PointerEvent) => {
      const last = st.lastPointer
      if (last && Math.hypot(event.clientX - last.x, event.clientY - last.y) < POINTER_MIN_MOVE_PX) return
      st.lastPointer = { x: event.clientX, y: event.clientY }
      markActive()
    }

    const activityEvents = ['pointerdown', 'keydown', 'wheel', 'touchstart', 'focus'] as const
    activityEvents.forEach(type => window.addEventListener(type, markActive, { passive: true }))
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('scroll', markActive, { passive: true, capture: true })
    window.addEventListener('pagehide', leave)
    document.addEventListener('visibilitychange', onVisibilityChange)
    const interval = window.setInterval(tick, TICK_MS)

    return () => {
      window.clearInterval(interval)
      activityEvents.forEach(type => window.removeEventListener(type, markActive))
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('scroll', markActive, { capture: true })
      window.removeEventListener('pagehide', leave)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      channel.current?.close()
      channel.current = null
      leave()
    }
  }, [enabled, lessonId, flush, settle, markActive])

  return { status, sessionSeconds, limits, resume: markActive }
}

export default useReadingTracker
