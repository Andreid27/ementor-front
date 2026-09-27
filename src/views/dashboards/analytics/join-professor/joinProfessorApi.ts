// ** API Imports
import * as apiSpec from 'src/apiSpec'
import apiClient from 'src/@core/axios/axiosEmentor'
import { profileServiceClient } from 'src/generated/profile-service-client'
import type { ProfessorPreviewDTO } from 'src/generated/profile-service-client/api'

// ** Utils
import { normalizeApiError } from 'src/@core/utils/api-error'

export type { ProfessorPreviewDTO }

/**
 * Row returned by GET /student-professor-relationships/my-professors.
 * Not in the generated client yet, so the shape is mirrored from MyProfessorDTO.
 */
export interface MyProfessorDTO {
  relationshipId: string
  professor: ProfessorPreviewDTO
  generation?: string
  joinedAt?: string
}

export const fetchMyProfessors = async (): Promise<MyProfessorDTO[]> => {
  const response = await apiClient.get(`${apiSpec.PROFILE_SERVICE}/student-professor-relationships/my-professors`)

  return Array.isArray(response.data) ? response.data : []
}

export const previewProfessorByCode = async (code: string): Promise<ProfessorPreviewDTO> => {
  const response = await profileServiceClient.professorProfile.previewByCode({ code })

  return response.data
}

export const joinProfessorByCode = async (code: string, idempotencyKey: string) => {
  const response = await profileServiceClient.studentProfessorRelationship.joinByCode({
    idempotencyKey,
    joinByCodeRequest: { invitationCode: code }
  })

  return response.data
}

export const createIdempotencyKey = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8

    return v.toString(16)
  })
}

/**
 * Invitation codes are lowercase slugs of the professor's name: `[a-z0-9-]{3,30}`
 * (InvitationCodeGenerator). Normalising while the student types means a code
 * read aloud as "Maria Popescu" still ends up as `maria-popescu`.
 */
export const INVITATION_CODE_MIN_LENGTH = 3

export const INVITATION_CODE_MAX_LENGTH = 30

export const normalizeInvitationCode = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-/, '')
    .slice(0, INVITATION_CODE_MAX_LENGTH)

export type JoinErrorKind = 'notFound' | 'alreadyJoined' | 'network' | 'unknown'

export interface JoinErrorInfo {
  kind: JoinErrorKind
  message: string
}

/**
 * profile-service has no @ControllerAdvice: an EmentorApiError leaves Spring as
 * HTTP 500 with the reason in `message`, so the text is the signal, not the status.
 *
 * - ProfessorProfileService.previewByInvitationCode: "Professor not found with invitation code: x"
 * - StudentProfessorRelationshipService.joinByCode:   "Invalid invitation code"
 * - StudentProfessorRelationshipService.createRelationship:
 *                                   "Active relationship already exists between student and professor"
 */
export const resolveJoinError = (error: unknown, code: string): JoinErrorInfo => {
  const info = normalizeApiError(error)

  if (info.isNetworkError) {
    return {
      kind: 'network',
      message: 'Nu ne-am putut conecta la server. Verifică internetul și încearcă din nou.'
    }
  }

  if (/already exists/i.test(info.backendMessage) || info.status === 409) {
    return { kind: 'alreadyJoined', message: 'Ești deja conectat la acest profesor.' }
  }

  if (/professor not found|invalid invitation code/i.test(info.backendMessage) || info.status === 404) {
    return {
      kind: 'notFound',
      message: `Nu există niciun profesor cu codul „${code}”. Verifică literele și cratimele.`
    }
  }

  return { kind: 'unknown', message: 'Ceva nu a mers. Încearcă din nou în câteva secunde.' }
}
