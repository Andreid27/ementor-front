// Example usage of generated APIs
// This file demonstrates how to use the generated API clients

import { useState, useEffect } from 'react'
import apiClient from '../@core/axios/axiosEmentor'

// After generation, you can import like this:
// import { apiClient } from '@/generated'

// or import individual services:
// import { userService, profileService } from '@/generated'

// Example: User Service API calls
export class UserService {
  // Get all users
  static async getAllUsers() {
    try {
      // Using the generated API client (after generation)
      // const response = await apiClient.userService.userApi.getUsers()
      // return response.data

      // Fallback to direct axios call
      const response = await apiClient.get('/service1/user/users')

      return response.data
    } catch (error) {
      console.error('Failed to fetch users:', error)

      throw error
    }
  }

  // Get user by ID
  static async getUserById(userId: string) {
    try {
      const response = await apiClient.get(`/service1/user/users/${userId}`)

      return response.data
    } catch (error) {
      console.error(`Failed to fetch user ${userId}:`, error)

      throw error
    }
  }

  // Create new user
  static async createUser(userData: any) {
    try {
      const response = await apiClient.post('/service1/user/users', userData)

      return response.data
    } catch (error) {
      console.error('Failed to create user:', error)

      throw error
    }
  }
}

// Example: Profile Service API calls
export class ProfileService {
  static async getProfile(userId: string) {
    try {
      // const response = await apiClient.profileService.profileApi.getProfile({ userId });
      // return response.data;

      const response = await apiClient.get(`/service2/profile/${userId}`)

      return response.data
    } catch (error) {
      console.error(`Failed to fetch profile for user ${userId}:`, error)
      throw error
    }
  }

  static async updateProfile(userId: string, profileData: any) {
    try {
      // const response = await apiClient.profileService.profileApi.updateProfile({
      //   userId,
      //   updateProfileRequest: profileData
      // });
      // return response.data;

      const response = await apiClient.put(`/service2/profile/${userId}`, profileData)

      return response.data
    } catch (error) {
      console.error(`Failed to update profile for user ${userId}:`, error)
      throw error
    }
  }
}

// Example: Quiz Service API calls
export class QuizService {
  static async getAllQuizzes() {
    try {
      const response = await apiClient.get('/service3/quiz/quizzes')

      return response.data
    } catch (error) {
      console.error('Failed to fetch quizzes:', error)
      throw error
    }
  }

  static async getQuizById(quizId: string) {
    try {
      const response = await apiClient.get(`/service3/quiz/quizzes/${quizId}`)

      return response.data
    } catch (error) {
      console.error(`Failed to fetch quiz ${quizId}:`, error)
      throw error
    }
  }

  static async submitQuizAttempt(quizId: string, answers: any) {
    try {
      const response = await apiClient.post(`/service3/quiz/quizzes/${quizId}/attempts`, answers)

      return response.data
    } catch (error) {
      console.error(`Failed to submit quiz attempt for ${quizId}:`, error)
      throw error
    }
  }
}

// Example React Hook for API calls
export function useApi() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const callApi = async <T>(apiCall: () => Promise<T>): Promise<T | null> => {
    setLoading(true)
    setError(null)

    try {
      const result = await apiCall()

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)

      return null
    } finally {
      setLoading(false)
    }
  }

  return { callApi, loading, error }
}

// Example usage in a React component:
/*
import { UserService, useApi } from '@/services/api-examples';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const { callApi, loading, error } = useApi();

  useEffect(() => {
    const fetchUsers = async () => {
      const result = await callApi(() => UserService.getAllUsers());
      if (result) {
        setUsers(result);
      }
    };

    fetchUsers();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Users</h1>
      {users.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}
*/
