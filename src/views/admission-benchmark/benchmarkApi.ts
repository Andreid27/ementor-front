// ** API Imports
import * as apiSpec from 'src/apiSpec'
import apiClient from 'src/@core/axios/axiosEmentor'

// ** Types
import type { AdmissionResult, AdmissionResultRequest, BenchmarkCohorts, BenchmarkCurves, BenchmarkLine } from './types'

const BENCHMARK = `${apiSpec.PROFILE_SERVICE}/admission-benchmark`
const RELATIONSHIPS = `${apiSpec.PROFILE_SERVICE}/student-professor-relationships`

/**
 * The benchmark endpoints answer 404 for "not allowed" (a 403 would end the
 * session through the axios interceptor), and every caller reads that as
 * "nothing to show".
 */
export const isNotFound = (error: any) => error?.response?.status === 404

/** The cohort line for the logged-in student, or for one student when a professor passes `studentId`. */
export const fetchBenchmarkLine = async (days: number, studentId?: string): Promise<BenchmarkLine> => {
  const url = studentId ? `${BENCHMARK}/students/${studentId}` : `${BENCHMARK}/me`
  const response = await apiClient.get(url, { params: { days } })

  return { ...response.data, points: response.data?.points ?? [] }
}

export const fetchCohorts = async (): Promise<BenchmarkCohorts> => {
  const response = await apiClient.get(`${BENCHMARK}/cohorts`)

  return { computedAt: response.data?.computedAt ?? null, cohorts: response.data?.cohorts ?? [] }
}

export const fetchCurves = async (keys: string[], days: number): Promise<BenchmarkCurves> => {
  const response = await apiClient.get(`${BENCHMARK}/curves`, { params: { keys: keys.join(','), days } })

  return { computedAt: response.data?.computedAt ?? null, curves: response.data?.curves ?? [] }
}

/**
 * The relationships a student has with professors, inactive ones included, so
 * a result can still be entered after the student has left. A professor only
 * gets their own; an admin gets every professor's.
 */
export const fetchAdmissionResults = async (studentId: string, professorId?: string): Promise<AdmissionResult[]> => {
  const response = await apiClient.post(`${RELATIONSHIPS}/batch-by-student-ids`, {
    studentIds: [studentId],
    professorId: professorId ?? null,
    includeInactive: true
  })

  return Array.isArray(response.data) ? response.data : []
}

export const saveAdmissionResult = async (
  studentId: string,
  professorId: string,
  result: AdmissionResultRequest
): Promise<AdmissionResult> => {
  const response = await apiClient.put(`${RELATIONSHIPS}/${studentId}/${professorId}/admission-result`, result)

  return response.data
}
