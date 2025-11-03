// Quiz Service API Wrapper - Integrates generated APIs with custom axios interceptor
import { Configuration } from './quiz-service/configuration'
import {
  LessonControllerApi,
  HostFileControllerApi,

} from './lesson-service/api'

// Import our custom axios instance
// @ts-ignore - Suppress TS error for JS import
import baseApiClient from '../@core/axios/axiosEmentor'
import axios from 'axios'

// Create a custom axios instance for quiz service without baseURL
// so that the Configuration basePath is properly used
const createLessonServiceAxios = () => {
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

const apiClient = createLessonServiceAxios()

// Create configuration with our custom axios instance
const createLessonServiceConfig = () =>
  new Configuration({
    basePath: process.env.NEXT_PUBLIC_PROD_HOST + '/service4',
    baseOptions: {
      // Any additional axios configuration can go here
    }
  })

// API Client instances using our custom configuration
export class LessonServiceClient {
  private config: Configuration

  constructor() {
    this.config = createLessonServiceConfig()
  }

  // Chapters APIs
  get lessons() {
    return new LessonControllerApi(this.config, undefined, apiClient)
  }

  // Questions APIs
  get hostFiles() {
    return new HostFileControllerApi(this.config, undefined, apiClient)
  }
}

// Export singleton instance
export const lessonServiceClient = new LessonServiceClient()

// Export individual API controllers for direct access
export { LessonControllerApi, HostFileControllerApi } from './lesson-service/api'

// Export types
export * from './quiz-service'

// Default export
export default lessonServiceClient
