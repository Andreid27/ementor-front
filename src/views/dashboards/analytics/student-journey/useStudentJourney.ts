// ** React Imports
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

// ** Third Party Imports
import { useReducedMotion } from 'framer-motion'

// ** Local Imports
import { isJourneyFinished, JourneyStepId } from './journeySteps'

/** What the student has already seen on this device, so a milestone is celebrated once. */
interface JourneyMemory {
  seen: JourneyStepId[]
  finished: boolean
  dismissed: boolean
}

const storageKey = (userId: string) => `ementor.student-journey.${userId}`

// Storage can be missing or blocked (private windows, cleared site data). The
// guide then behaves like a first visit, which is harmless.
const readMemory = (userId?: string): JourneyMemory | null => {
  if (!userId || typeof window === 'undefined') return null

  try {
    const raw = window.localStorage.getItem(storageKey(userId))

    return raw ? { seen: [], finished: false, dismissed: false, ...JSON.parse(raw) } : null
  } catch {
    return null
  }
}

const writeMemory = (userId: string, memory: JourneyMemory) => {
  try {
    window.localStorage.setItem(storageKey(userId), JSON.stringify(memory))
  } catch {
    // Not saving only means the next visit replays the celebration.
  }
}

// The first check lands once the card has settled in; later ones follow one by one.
const FIRST_MILESTONE_DELAY_MS = 650
const MILESTONE_INTERVAL_MS = 1150

interface UseStudentJourneyOptions {
  userId?: string
  enabled: boolean

  /** Steps done according to the latest data, in journey order. */
  done: JourneyStepId[]

  /** True once fresh data has arrived. Milestones are only played against fresh data. */
  settled: boolean
}

/**
 * Drives the "Primii pași" guide: which steps show as done, which one is being
 * celebrated right now, and whether the guide is shown at all.
 *
 * Steps the student already saw done start checked. Steps done since the last
 * visit (or while the dashboard is open, like joining a professor) are checked
 * one after another, each with its own celebration.
 */
const useStudentJourney = ({ userId, enabled, done, settled }: UseStudentJourneyOptions) => {
  const reduceMotion = useReducedMotion()
  const memoryAtLoad = useMemo(() => readMemory(userId), [userId])

  const [shown, setShown] = useState<JourneyStepId[]>([])
  const [celebrating, setCelebrating] = useState<JourneyStepId | null>(null)
  const [seeded, setSeeded] = useState(false)
  const [retired, setRetired] = useState(false)
  const [dismissed, setDismissed] = useState(memoryAtLoad?.dismissed ?? false)

  // Steps already shown or waiting for their turn, so none is played twice.
  const queued = useRef(new Set<JourneyStepId>())
  const seededRef = useRef(false)

  const doneKey = done.join(',')

  useEffect(() => {
    if (!enabled || !settled || !userId) return

    if (!seededRef.current) {
      seededRef.current = true

      // A student who finished before this guide existed goes straight to the full dashboard.
      if (memoryAtLoad === null && isJourneyFinished(done)) setRetired(true)

      const alreadySeen = done.filter(id => memoryAtLoad?.seen.includes(id))
      alreadySeen.forEach(id => queued.current.add(id))
      setShown(alreadySeen)
      setSeeded(true)
    }

    const queue = queued.current
    const fresh = done.filter(id => !queue.has(id))
    const waiting = new Set(fresh)
    const timers: ReturnType<typeof setTimeout>[] = []
    fresh.forEach(id => queue.add(id))

    if (fresh.length > 0) {
      if (reduceMotion) {
        setShown(previous => [...previous, ...fresh])
        setCelebrating(fresh[fresh.length - 1])
        waiting.clear()
      } else {
        fresh.forEach((id, index) => {
          timers.push(
            setTimeout(() => {
              waiting.delete(id)
              setShown(previous => (previous.includes(id) ? previous : [...previous, id]))
              setCelebrating(id)
            }, FIRST_MILESTONE_DELAY_MS + index * MILESTONE_INTERVAL_MS)
          )
        })
      }
    }

    writeMemory(userId, {
      seen: Array.from(new Set([...(memoryAtLoad?.seen ?? []), ...done])),
      finished: Boolean(memoryAtLoad?.finished) || isJourneyFinished(done),
      dismissed
    })

    // If the effect re-runs before a milestone played, it goes back in the queue
    // and the next run schedules it again.
    return () => {
      timers.forEach(clearTimeout)
      waiting.forEach(id => queue.delete(id))
    }

    // `done` is tracked through doneKey; the other values only change with it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, settled, userId, doneKey])

  const dismiss = useCallback(() => {
    setDismissed(true)
    if (!userId) return

    writeMemory(userId, {
      seen: Array.from(new Set([...(memoryAtLoad?.seen ?? []), ...done])),
      finished: true,
      dismissed: true
    })
  }, [userId, memoryAtLoad, done])

  // Read synchronously from storage, so a student who is past the guide never
  // sees its placeholder flash on the way in.
  const hiddenAtLoad = Boolean(memoryAtLoad?.finished || memoryAtLoad?.dismissed)

  return {
    visible: enabled && !hiddenAtLoad && !retired && !dismissed,
    ready: seeded,
    isFirstVisit: memoryAtLoad === null,
    shown,
    celebrating,
    dismiss
  }
}

export default useStudentJourney
