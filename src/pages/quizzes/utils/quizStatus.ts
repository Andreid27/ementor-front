// ** Types
import type { StatusTone } from 'src/views/student-ui/StatusPill'

export interface QuizStatusDisplay {
  tone: StatusTone
  icon: string
  label: string

  /** What opening the test does in this state. */
  action: string
}

/**
 * How a test's state reads to the student, shared by the desktop table and the
 * phone cards so both say the same thing. The score keeps its colour code
 * (80% and up, 60–79%, under 60%), and each state has its own icon.
 */
export const getQuizStatusDisplay = (status: string, score?: number | null): QuizStatusDisplay => {
  if (status === 'completed') {
    const action = 'Vezi rezultatele'

    if (typeof score !== 'number') return { tone: 'neutral', icon: 'tabler:circle-check', label: 'Finalizat', action }
    if (score >= 80) return { tone: 'accent', icon: 'tabler:circle-check', label: `Finalizat · ${score}%`, action }
    if (score >= 60) return { tone: 'warning', icon: 'tabler:alert-triangle', label: `Finalizat · ${score}%`, action }

    return { tone: 'error', icon: 'tabler:circle-x', label: `Finalizat · ${score}%`, action }
  }

  switch (status) {
    case 'in_progress':
      return { tone: 'info', icon: 'tabler:player-play', label: 'În curs', action: 'Continuă testul' }
    case 'overdue':
      return { tone: 'error', icon: 'tabler:clock-x', label: 'Expirat', action: 'Vezi detalii' }
    default:
      return { tone: 'accent', icon: 'tabler:sparkles', label: 'Nou', action: 'Deschide testul' }
  }
}
