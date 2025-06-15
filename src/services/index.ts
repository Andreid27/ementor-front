// Main API Services Index
// This file provides a centralized access point for all your microservice APIs

// Import existing service examples
export * from './api-examples'

export * from './profile-service-examples'

// Import generated profile service client
export { profileServiceClient } from '../generated/profile-service-client'

// Re-export types from generated services
export type {
  StudentProfileDTO,
  ProfessorProfileDTO,
  UniversityDTO,
  SpecialityDTO,
  SingularEventDTO,
  EventOccurrenceDTO,
  PaginatedRequest,
  PaginatedResponseStudentProfileView,
  PaginatedResponseProfessorProfileView,
  BankAccountDTO,
  UserDTO,
  GroupDTO
} from '../generated/profile-service'

// Centralized API client factory
export const apiServices = {
  // Profile Service (Service 2)
  profile: {
    student: () => import('./profile-service-examples').then(m => m.StudentProfileService),
    professor: () => import('./profile-service-examples').then(m => m.ProfessorProfileService),
    university: () => import('./profile-service-examples').then(m => m.UniversityService),
    speciality: () => import('./profile-service-examples').then(m => m.SpecialityService),
    events: () => import('./profile-service-examples').then(m => m.EventsService),
    profilePicture: () => import('./profile-service-examples').then(m => m.ProfilePictureService)
  },

  // User Service (Service 1) - Using existing patterns
  user: () => import('./api-examples').then(m => m.UserService),

  // Quiz Service (Service 3) - Using existing patterns
  quiz: () => import('./api-examples').then(m => m.QuizService)

  // Add other services as you generate them
}

// Utility function to get service by name
export function getService(serviceName: keyof typeof apiServices) {
  return apiServices[serviceName]
}

// Hook for using any service
export { useApi } from './api-examples'

export { useProfileService } from './profile-service-examples'
