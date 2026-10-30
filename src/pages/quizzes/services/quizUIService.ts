// Quiz UI Service - Wrapper around quiz-service-client for UI-specific logic
import quizServiceClient from 'src/generated/quiz-service-client'
import {
  QuizDTO,
  FilterCriteriaObjectOperationEnum,
  SortCriteriaDirectionEnum,
  SubmitQuizDTO
} from '../../../generated/quiz-service/api'
import { QuizGridRow, DataGridParams } from '../types'
import { transformQuizDTOToGridRow } from '../utils/transformers'
import type { QuizIntegrityPayload, QuizIntegrityReportDTO } from '../../../components/quiz/integrity/integrityTypes'

export class QuizUIService {
  private client = quizServiceClient

  /**
   * Get quizzes formatted for DataGrid display with pagination and filtering
   */
  async getQuizzesForDataGrid(params: DataGridParams): Promise<{
    data: QuizGridRow[]
    total: number
  }> {
    try {
      // Transform DataGrid params to API params
      const paginatedRequest = {
        page: params.page,
        pageSize: params.pageSize,
        filters:
          params.filterModel?.quickFilterValues && params.filterModel.quickFilterValues.length > 0
            ? [
                {
                  key: 'title',
                  operation: FilterCriteriaObjectOperationEnum.Like,
                  value: params.filterModel.quickFilterValues[0] as unknown as object
                }
              ]
            : [],
        sorters:
          params.sortModel && params.sortModel.length > 0
            ? [
                {
                  key: params.sortModel[0].field,
                  direction: params.sortModel[0].sort.toUpperCase() as SortCriteriaDirectionEnum
                }
              ]
            : []
      }

      const response = await this.client.quizzes.getPaginated({
        paginatedRequest
      })

      // Transform API response to UI format
      const transformedData = response.data.data?.map(transformQuizDTOToGridRow) || []

      return {
        data: transformedData,
        total: response.data.totalCount || 0
      }
    } catch (error) {
      console.error('Error fetching quizzes for DataGrid:', error)
      throw error
    }
  }

  /**
   * Get a single quiz by ID
   * Enhanced with better error handling (Requirement 9.3)
   */
  async getQuizById(quizId: string): Promise<QuizDTO> {
    try {
      const response = await this.client.quizzes.get1({ id: quizId })
      return response.data
    } catch (error: any) {
      console.error(`Error fetching quiz ${quizId}:`, error)

      // Provide user-friendly error messages
      if (error.response?.status === 404) {
        throw new Error('Testul nu a fost găsit.')
      } else if (error.response?.status === 403) {
        throw new Error('Nu ai permisiunea de a accesa acest test.')
      } else if (error.message?.includes('network') || !error.response) {
        throw new Error('Probleme de conexiune. Verifică conexiunea la internet.')
      }

      throw new Error('Nu am putut încărca testul. Te rugăm să încerci din nou.')
    }
  }

  /**
   * Start a quiz attempt
   * Enhanced with better error handling (Requirement 9.3)
   */
  async startQuiz(quizId: string): Promise<any> {
    try {
      const response = await this.client.quizzes.start({ id: quizId })
      return response.data
    } catch (error: any) {
      console.error(`Error starting quiz ${quizId}:`, error)

      // Provide user-friendly error messages
      if (error.response?.status === 404) {
        throw new Error('Testul nu a fost găsit.')
      } else if (error.response?.status === 403) {
        throw new Error('Nu ai permisiunea de a începe acest test.')
      } else if (error.response?.status === 409) {
        throw new Error('Ai început deja acest test.')
      } else if (error.message?.includes('network') || !error.response) {
        throw new Error('Probleme de conexiune. Verifică conexiunea la internet.')
      }

      throw new Error('Nu am putut începe testul. Te rugăm să încerci din nou.')
    }
  }

  /**
   * Submit quiz answers
   * Enhanced with better error handling (Requirement 9.3)
   *
   * The integrity record (what the student did during the quiz) travels with the answers but never costs the
   * student the submission: if it is refused (400) or too large for a proxy (413), the answers are sent again alone.
   */
  async submitQuiz(
    quizId: string,
    answers: Record<string, number>,
    integrity?: QuizIntegrityPayload | null
  ): Promise<any> {
    try {
      // Transform answers to match the API format
      const submitData: SubmitQuizDTO = {
        quizStudentId: quizId,
        submitedQuestionAnswers: Object.entries(answers).map(([questionId, answerIndex]) => ({
          questionId,
          answer: answerIndex
        }))
      }

      if (!integrity) {
        const response = await this.client.quizzes.submit({ submitQuizDTO: submitData })

        return response.data
      }

      // Not in the generated client until it is regenerated from the backend that accepts it
      const submitWithIntegrity: SubmitQuizDTO & { integrity: QuizIntegrityPayload } = { ...submitData, integrity }

      try {
        const response = await this.client.quizzes.submit({ submitQuizDTO: submitWithIntegrity })

        return response.data
      } catch (error: any) {
        if (![400, 413].includes(error.response?.status)) throw error

        console.warn(`Submit with the integrity record failed (${error.response.status}); sending the answers alone.`)
        const response = await this.client.quizzes.submit({ submitQuizDTO: submitData })

        return response.data
      }
    } catch (error: any) {
      console.error(`Error submitting quiz ${quizId}:`, error)

      // Provide user-friendly error messages
      if (error.response?.status === 404) {
        throw new Error('Testul nu a fost găsit.')
      } else if (error.response?.status === 400) {
        throw new Error('Răspunsurile nu sunt valide. Te rugăm să verifici și să încerci din nou.')
      } else if (error.response?.status === 409) {
        throw new Error('Testul a fost deja trimis.')
      } else if (error.message?.includes('timeout')) {
        throw new Error('Timpul de așteptare a expirat. Te rugăm să încerci din nou.')
      } else if (error.message?.includes('network') || !error.response) {
        throw new Error('Probleme de conexiune. Verifică conexiunea la internet.')
      }

      throw new Error('Nu am putut trimite testul. Te rugăm să încerci din nou.')
    }
  }

  /**
   * Get the integrity report of a submitted attempt, for the professor who assigned the quiz and for admins.
   * Null when there is nothing to show: the backend answers 404 for attempts it will not show, and backends
   * without integrity tracking do not have the endpoint at all
   */
  async getAttemptIntegrity(attemptId: string): Promise<QuizIntegrityReportDTO | null> {
    try {
      const response = await this.client.getAttemptIntegrity(attemptId)
      const report = response.data

      return report && typeof report === 'object' && report.risk && report.summary ? report : null
    } catch (error: any) {
      if ([403, 404].includes(error.response?.status)) return null

      console.error(`Error fetching the integrity report of attempt ${attemptId}:`, error)
      throw error
    }
  }

  /**
   * Get quiz attempt details
   */
  async getQuizAttempt(attemptId: string): Promise<any> {
    try {
      const response = await this.client.quizzes.getAttempt({
        id: attemptId
      })
      return response.data
    } catch (error) {
      console.error(`Error fetching quiz attempt ${attemptId}:`, error)
      throw error
    }
  }
}

// Export singleton instance
export const quizUIService = new QuizUIService()

// Export class for testing or custom instances
export default QuizUIService
