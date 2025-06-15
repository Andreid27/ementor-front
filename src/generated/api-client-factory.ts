// API Client Factory - Centralized API management for all microservices
import { Configuration } from './user-service/configuration'
import apiClient from '../@core/axios/axiosEmentor'

// Import types and interfaces (these will be available after generation)
// import * as UserService from './user-service';
// import * as ProfileService from './profile-service';
// import * as QuizService from './quiz-service';
// import * as LessonService from './lesson-service';
// import * as NotificationService from './notification-service';

// Base configuration for all services
const createConfiguration = (basePath: string) =>
  new Configuration({
    basePath: process.env.NEXT_PUBLIC_PROD_HOST + basePath,

    // The generated APIs will use our custom axios instance
    axios: apiClient
  })

// Service configurations
const configs = {
  userService: createConfiguration('/service1/user'),
  profileService: createConfiguration('/service2'),
  quizService: createConfiguration('/service3/quiz'),
  lessonService: createConfiguration('/service4'),
  notificationService: createConfiguration('/service5')
}

// API Client Factory
class ApiClientFactory {
  private static instance: ApiClientFactory

  // Service clients (will be populated after code generation)
  // public userService: UserService.UserApi;
  // public profileService: ProfileService.ProfileApi;
  // public quizService: QuizService.QuizApi;
  // public lessonService: LessonService.LessonApi;
  // public notificationService: NotificationService.NotificationApi;

  private constructor() {
    // Initialize service clients
    // This will be populated after generating the APIs
    this.initializeServices()
  }

  public static getInstance(): ApiClientFactory {
    if (!ApiClientFactory.instance) {
      ApiClientFactory.instance = new ApiClientFactory()
    }

    return ApiClientFactory.instance
  }

  private initializeServices() {
    // These will be uncommented and populated after API generation
    // this.userService = new UserService.UserApi(configs.userService);
    // this.profileService = new ProfileService.ProfileApi(configs.profileService);
    // this.quizService = new QuizService.QuizApi(configs.quizService);
    // this.lessonService = new LessonService.LessonApi(configs.lessonService);
    // this.notificationService = new NotificationService.NotificationApi(configs.notificationService);
  }

  // Utility method to create a new service client with custom config
  public createServiceClient<T>(ServiceClass: new (config: Configuration) => T, basePath: string): T {
    const config = createConfiguration(basePath)

    return new ServiceClass(config)
  }
}

// Export singleton instance
export const apiClientFactory = ApiClientFactory.getInstance()

// Export individual configurations for direct use
export { configs }

// Export the factory class for advanced use cases
export default ApiClientFactory
