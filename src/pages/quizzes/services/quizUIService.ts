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
    } catch (error) {
      console.error(`Error submitting quiz ${quizId}:`, error)
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
