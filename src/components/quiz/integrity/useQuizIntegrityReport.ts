// ** React Imports
import { useCallback, useEffect, useState } from 'react'

// ** Services
import { quizUIService } from 'src/pages/quizzes/services/quizUIService'

// ** Types
import type { QuizIntegrityReportDTO } from './integrityTypes'

export type QuizIntegrityReportState =
  | { status: 'idle' | 'loading' | 'unavailable' | 'error' }
  | { status: 'ready'; report: QuizIntegrityReportDTO }

/**
 * useQuizIntegrityReport - Loads the integrity report of a submitted attempt for the professor's review.
 * 'unavailable' means there is nothing to show (no report, no access, or a backend without the endpoint).
 */
export const useQuizIntegrityReport = (attemptId: string | undefined, enabled: boolean) => {
  const [state, setState] = useState<QuizIntegrityReportState>({ status: 'idle' })
  const [reloads, setReloads] = useState(0)

  useEffect(() => {
    if (!enabled || !attemptId) return

    let cancelled = false
    setState({ status: 'loading' })

    quizUIService
      .getAttemptIntegrity(attemptId)
      .then(report => {
        if (!cancelled) setState(report ? { status: 'ready', report } : { status: 'unavailable' })
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'error' })
      })

    return () => {
      cancelled = true
    }
  }, [attemptId, enabled, reloads])

  const retry = useCallback(() => setReloads(count => count + 1), [])

  return { state, retry }
}
