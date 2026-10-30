// ** React Imports
import { useCallback, useEffect, useState } from 'react'

interface FileProgress {
  lastPage: number
  numPages: number

  /** Pages the student actively spent time on (see useReadingTracker). */
  read: number[]
}

type LessonProgress = Record<string, FileProgress>

const storageKey = (userId: string, lessonId: string) => `ementor.lesson-progress.${userId}.${lessonId}`

const load = (key: string | null): LessonProgress => {
  if (!key || typeof window === 'undefined') return {}

  try {
    return JSON.parse(window.localStorage.getItem(key) ?? '{}') ?? {}
  } catch {
    return {}
  }
}

/**
 * Where the student is in each file of a lesson and which pages they have
 * read, kept on this device so the lesson reopens where they stopped. The
 * server only stores reading time, so this is a convenience, not a record.
 */
const useLessonProgress = (userId?: string, lessonId?: string) => {
  const key = userId && lessonId ? storageKey(userId, lessonId) : null
  const [progress, setProgress] = useState<LessonProgress>(() => load(key))

  useEffect(() => {
    setProgress(load(key))
  }, [key])

  const update = useCallback(
    (fileId: string, change: (current: FileProgress) => FileProgress) => {
      setProgress(previous => {
        const current = previous[fileId] ?? { lastPage: 1, numPages: 0, read: [] }
        const next = { ...previous, [fileId]: change(current) }

        if (key) {
          try {
            window.localStorage.setItem(key, JSON.stringify(next))
          } catch {
            // Without storage the lesson simply opens on the first page next time.
          }
        }

        return next
      })
    },
    [key]
  )

  const setPage = useCallback(
    (fileId: string, page: number, numPages: number) =>
      update(fileId, current => ({ ...current, lastPage: page, numPages })),
    [update]
  )

  const markRead = useCallback(
    (fileId: string, page: number) =>
      update(fileId, current =>
        current.read.includes(page) ? current : { ...current, read: [...current.read, page] }
      ),
    [update]
  )

  return { progress, setPage, markRead }
}

export default useLessonProgress
