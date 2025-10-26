// Quiz UI Service - Wrapper around quiz-service-client for UI-specific logic
import { quizServiceClient } from '../../../generated/quiz-service-client'
import { QuizDTO, QuizzesView } from '../../../generated/quiz-service/api'
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
            ? [{ field: 'title', operator: 'contains', value: params.filterModel.quickFilterValues[0] }]
            : [],
        sorters:
          params.sortModel && params.sortModel.length > 0
            ? [{ field: params.sortModel[0].field, direction: params.sortModel[0].sort }]
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
   */
  async getQuizById(quizId: string): Promise<QuizDTO> {
    try {
      const response = await this.client.quizzes.get1({ id: quizId })
      return response.data
    } catch (error) {
      console.error(`Error fetching quiz ${quizId}:`, error)
      throw error
    }
  }

  /**
   * Start a quiz attempt
   */
  async startQuiz(quizId: string): Promise<any> {
    try {
      const response = await this.client.quizzes.start({ id: quizId })
      return response.data
    } catch (error) {
      console.error(`Error starting quiz ${quizId}:`, error)
      throw error
    }
  }

  /**
   * Submit quiz answers
   */
  async submitQuiz(quizId: string, answers: Record<string, number>): Promise<any> {
    try {
      // Transform answers to API format
      const submitData = {
        quizId,
        answers: Object.entries(answers).map(([questionId, answerIndex]) => ({
          questionId,
          selectedAnswer: answerIndex
        }))
      }

      const response = await this.client.quizzes.submit({
        id: quizId,
        submitQuizDTO: submitData
      })
      return response.data
    } catch (error) {
      console.error(`Error submitting quiz ${quizId}:`, error)
      throw error
    }
  }

  /**
   * Get quiz attempt details
   */
  async getQuizAttempt(quizId: string, attemptId: string): Promise<any> {
    try {
      const response = await this.client.quizzes.getAttempt({
        quizId,
        attemptId
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
