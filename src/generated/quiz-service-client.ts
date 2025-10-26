// Quiz Service API Wrapper - Integrates generated APIs with custom axios interceptor
import { Configuration } from './quiz-service/configuration'
import {
  ChaptersControllerApi,
  QuestionsControllerApi,
  QuizzesControllerApi,
  UserControllerApi
} from './quiz-service/api'

// Import our custom axios instance
// @ts-ignore - Suppress TS error for JS import
import baseApiClient from '../@core/axios/axiosEmentor'
import axios from 'axios'

// Create a custom axios instance for quiz service without baseURL
// so that the Configuration basePath is properly used
const createQuizServiceAxios = () => {
  // Create a new instance with the same configuration but without baseURL
  const quizAxios = axios.create({
    timeout: baseApiClient.defaults.timeout,
    headers: baseApiClient.defaults.headers
  })

  // Copy interceptors from the base client
  quizAxios.interceptors.request = baseApiClient.interceptors.request
  quizAxios.interceptors.response = baseApiClient.interceptors.response

  return quizAxios
}

const apiClient = createQuizServiceAxios()

// Create configuration with our custom axios instance
const createQuizServiceConfig = () =>
  new Configuration({
    basePath: process.env.NEXT_PUBLIC_PROD_HOST + '/service3',
    baseOptions: {
      // Any additional axios configuration can go here
    }
  })

// API Client instances using our custom configuration
export class QuizServiceClient {
  private config: Configuration

  constructor() {
    this.config = createQuizServiceConfig()
  }

  // Chapters APIs
  get chapters() {
    return new ChaptersControllerApi(this.config, undefined, apiClient)
  }

  // Questions APIs
  get questions() {
    return new QuestionsControllerApi(this.config, undefined, apiClient)
  }

  // Quizzes APIs
  get quizzes() {
    return new QuizzesControllerApi(this.config, undefined, apiClient)
  }

  // User APIs
  get user() {
    return new UserControllerApi(this.config, undefined, apiClient)
  }
}

// Export singleton instance
export const quizServiceClient = new QuizServiceClient()

// Export individual API controllers for direct access
export { ChaptersControllerApi, QuestionsControllerApi, QuizzesControllerApi, UserControllerApi }

// Export types
export * from './quiz-service'

// Default export
export default quizServiceClient
