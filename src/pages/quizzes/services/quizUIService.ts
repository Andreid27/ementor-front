// Quiz UI Service - Wrapper around quiz-service-client for UI-specific logic
import { quizServiceClient } from '../../../generated/quiz-service-client'
import {
  QuizDTO,
  QuizzesView,
  FilterCriteriaObjectOperationEnum,
  SortCriteriaDirectionEnum
} from '../../../generated/quiz-service/api'
import { QuizGridRow, DataGridParams } from '../types'
import { transformQuizDTOToGridRow } from '../utils/transformers'

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
   */
  async submitQuiz(quizId: string, answers: Record<string, number>): Promise<any> {
    try {
      // Transform answers to match the API format
      const submitData = {
        quizStudentId: quizId,
        submitedQuestionAnswers: Object.entries(answers).map(([questionId, answerIndex]) => ({
          questionId,
          answer: answerIndex
        }))
      }

      const response = await this.client.quizzes.submit({ submitQuizDTO: submitData })
      return response.data
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
