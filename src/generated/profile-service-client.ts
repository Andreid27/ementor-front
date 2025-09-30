// Profile Service API Wrapper - Integrates generated APIs with custom axios interceptor
import { Configuration } from './profile-service/configuration'
import {
  BankAccountControllerApi,
  EventsControllerApi,
  ProfessorProfileControllerApi,
  ProfilePictureControllerApi,
  SpecialityControllerApi,
  StudentProfileControllerApi,
  ThumbnailControllerApi,
  UniversityControllerApi,
  UserControllerApi,
  PaymentControllerApi,
  InvoiceControllerApi,
  WalletControllerApi
} from './profile-service/api'

// Import our custom axios instance
// @ts-ignore - Suppress TS error for JS import
import baseApiClient from '../@core/axios/axiosEmentor'
import axios from 'axios'

// Create a custom axios instance for profile service without baseURL
// so that the Configuration basePath is properly used
const createProfileServiceAxios = () => {
  // Create a new instance with the same configuration but without baseURL
  const profileAxios = axios.create({
    timeout: baseApiClient.defaults.timeout,
    headers: baseApiClient.defaults.headers
  })

  // Copy interceptors from the base client
  profileAxios.interceptors.request = baseApiClient.interceptors.request
  profileAxios.interceptors.response = baseApiClient.interceptors.response

  return profileAxios
}

const apiClient = createProfileServiceAxios()

// Create configuration with our custom axios instance
const createProfileServiceConfig = () =>
  new Configuration({
    basePath: process.env.NEXT_PUBLIC_PROD_HOST + '/service2',
    baseOptions: {
      // Any additional axios configuration can go here
    }
  })

// API Client instances using our custom configuration
export class ProfileServiceClient {
  private config: Configuration

  constructor() {
    this.config = createProfileServiceConfig()
  }

  // Bank Account APIs
  get bankAccount() {
    return new BankAccountControllerApi(this.config, undefined, apiClient)
  }

  // Events APIs
  get events() {
    return new EventsControllerApi(this.config, undefined, apiClient)
  }

  // Professor Profile APIs
  get professorProfile() {
    return new ProfessorProfileControllerApi(this.config, undefined, apiClient)
  }

  // Profile Picture APIs
  get profilePicture() {
    return new ProfilePictureControllerApi(this.config, undefined, apiClient)
  }

  // Speciality APIs
  get speciality() {
    return new SpecialityControllerApi(this.config, undefined, apiClient)
  }

  // Student Profile APIs
  get studentProfile() {
    return new StudentProfileControllerApi(this.config, undefined, apiClient)
  }

  // Thumbnail APIs
  get thumbnail() {
    return new ThumbnailControllerApi(this.config, undefined, apiClient)
  }

  // University APIs
  get university() {
    return new UniversityControllerApi(this.config, undefined, apiClient)
  }

  // User APIs
  get user() {
    return new UserControllerApi(this.config, undefined, apiClient)
  }

  // Payment APIs
  get payment() {
    return new PaymentControllerApi(this.config, undefined, apiClient)
  }

  // Wallet APIs
  get wallet() {
    return new WalletControllerApi(this.config, undefined, apiClient)
  }

  // Invoice APIs
  get invoice() {
    return new InvoiceControllerApi(this.config, undefined, apiClient)
  }
}

// Export singleton instance
export const profileServiceClient = new ProfileServiceClient()

// Export individual API controllers for direct access
export {
  BankAccountControllerApi,
  EventsControllerApi,
  ProfessorProfileControllerApi,
  ProfilePictureControllerApi,
  SpecialityControllerApi,
  StudentProfileControllerApi,
  ThumbnailControllerApi,
  UniversityControllerApi,
  InvoiceControllerApi,
  UserControllerApi,
  PaymentControllerApi,
  WalletControllerApi
}

// Export types
export * from './profile-service'

// Default export
export default profileServiceClient
