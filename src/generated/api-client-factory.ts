// Auto-generated API client factory
// Generated on: 2025-09-29T17:32:17.472Z
// This file provides centralized access to all microservice APIs

import { Configuration } from './user-service/configuration';
import * as userService from './user-service';
import * as profileService from './profile-service';

// Create base configuration
const createConfiguration = (basePath: string) => new Configuration({
  basePath: (process.env.NEXT_PUBLIC_PROD_HOST || '') + basePath,
});

// Service configurations
export const serviceConfigs = {
  userService: createConfiguration('/service1/user'),
  profileService: createConfiguration('/service2'),
};

// Main API client with all services
export const apiClient = {
  userService: {
    config: userService.userServiceConfig,
    // APIs will be available here after generation
    // Example: userApi: new userService.UserApi(configuration),
  },
  profileService: {
    config: profileService.profileServiceConfig,
    // APIs will be available here after generation
    // Example: userApi: new profileService.UserApi(configuration),
  },
};

// Individual service exports for direct access
export { userService };
export { profileService };

// Default export
export default apiClient;

// Type-safe service access helpers
export type ServiceName = 'user-service' | 'profile-service';

export function getServiceConfig(serviceName: ServiceName): Configuration {
  const configKey = serviceName.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
  return serviceConfigs[configKey as keyof typeof serviceConfigs];
}
