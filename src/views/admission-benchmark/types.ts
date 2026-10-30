/*
 * Admission benchmark responses from profile-service, typed by hand until the
 * backend is deployed and `npm run generate:api` can produce them. Calendar
 * dates are YYYY-MM-DD in the Europe/Bucharest calendar; timestamps are
 * ISO-8601 with an offset; averages are percentages from 0 to 100.
 */

export type BenchmarkScope = 'UNIVERSITY_SPECIALITY' | 'SPECIALITY'

export type BenchmarkStatus = 'READY' | 'NO_TARGET' | 'NO_EXAM_DATE' | 'EXAM_PASSED' | 'NO_COHORT_DATA'

/** One day on a student's chart: tests in a 7-day window around `date`. */
export interface BenchmarkLinePoint {
  date: string
  daysBeforeExam: number
  average: number
  tests: number
  students: number
}

/** GET /admission-benchmark/me and /admission-benchmark/students/{id}. */
export interface BenchmarkLine {
  status: BenchmarkStatus
  scope: BenchmarkScope | null
  universityId: string | null
  universityName: string | null
  specialityId: string | null
  specialityName: string | null
  examDate: string | null
  from: string | null
  to: string | null
  cohortStudents: number | null
  cohortTests: number | null
  computedAt: string | null
  points: BenchmarkLinePoint[]
}

export interface BenchmarkCohort {
  /** Opaque: passed back as-is to /curves. */
  key: string
  scope: BenchmarkScope
  universityId: string | null
  universityName: string | null
  specialityId: string
  specialityName: string
  students: number
  tests: number
}

/** GET /admission-benchmark/cohorts. */
export interface BenchmarkCohorts {
  computedAt: string | null
  cohorts: BenchmarkCohort[]
}

export interface BenchmarkCurvePoint {
  daysBeforeExam: number
  average: number
  tests: number
  students: number
}

export interface BenchmarkCurve extends BenchmarkCohort {
  /** Largest daysBeforeExam first, so they draw left to right toward the exam. */
  points: BenchmarkCurvePoint[]
}

/** GET /admission-benchmark/curves. */
export interface BenchmarkCurves {
  computedAt: string | null
  curves: BenchmarkCurve[]
}

/** PUT /student-professor-relationships/{student}/{professor}/admission-result: all four, every time. */
export interface AdmissionResultRequest {
  admissionScore: number | null
  admissionUniversityId: string | null
  admissionSpecialityId: string | null
  admissionExamDate: string | null
}

/** The admission fields of a student-professor relationship. */
export interface AdmissionResult extends AdmissionResultRequest {
  studentId: string
  professorId: string
  professorName?: string | null
  admissionUniversityValue: string | null
  admissionSpecialityValue: string | null
}
