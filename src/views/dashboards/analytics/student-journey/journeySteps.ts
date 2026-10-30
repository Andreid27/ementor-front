// ** Types
import type { MyProfessorDTO } from '../join-professor/joinProfessorApi'

export type JourneyStepId = 'profile' | 'professor' | 'lesson' | 'test'

export const JOURNEY_STEP_IDS: JourneyStepId[] = ['profile', 'professor', 'lesson', 'test']

export interface JourneyProgress {
  professors: MyProfessorDTO[]
  lessonsOpened: number
  completedQuizzes: number
}

/** The steps the student has already done, in journey order. The profile is done by the time the dashboard opens. */
export const completedStepIds = ({ professors, lessonsOpened, completedQuizzes }: JourneyProgress): JourneyStepId[] => {
  const done: Record<JourneyStepId, boolean> = {
    profile: true,
    professor: professors.length > 0,
    lesson: lessonsOpened > 0,
    test: completedQuizzes > 0
  }

  return JOURNEY_STEP_IDS.filter(id => done[id])
}

/**
 * The journey ends with the first test. Opening a lesson is encouraged, not
 * required: some professors only send tests, and those students must still get
 * to the end.
 */
export const isJourneyFinished = (done: JourneyStepId[]) => done.includes('professor') && done.includes('test')
