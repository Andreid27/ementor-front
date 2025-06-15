// Profile Service Usage Examples
// This file demonstrates how to use the generated profile service API with your custom axios interceptor

import { useState, useEffect } from 'react'
import { profileServiceClient } from '../generated/profile-service-client'
import type {
  StudentProfileDTO,
  ProfessorProfileDTO,
  UniversityDTO,
  SpecialityDTO,
  PaginatedRequest,
  SingularEventDTO
} from '../generated/profile-service'

// Example 1: Student Profile Management
export class StudentProfileService {
  /**
   * Get current user's student profile
   */
  static async getCurrentStudentProfile(): Promise<StudentProfileDTO | null> {
    try {
      const response = await profileServiceClient.studentProfile.getUserProfile()

      return response.data
    } catch (error) {
      console.error('Failed to fetch current student profile:', error)

      return null
    }
  }

  /**
   * Get full student profile by user ID
   */
  static async getStudentProfileByUserId(userId: string): Promise<StudentProfileDTO | null> {
    try {
      const response = await profileServiceClient.studentProfile.getFull({ userId })

      return response.data
    } catch (error) {
      console.error(`Failed to fetch student profile for user ${userId}:`, error)

      return null
    }
  }

  /**
   * Update student profile
   */
  static async updateStudentProfile(profileData: StudentProfileDTO): Promise<StudentProfileDTO | null> {
    try {
      const response = await profileServiceClient.studentProfile.update({ studentProfileDTO: profileData })

      return response.data
    } catch (error) {
      console.error('Failed to update student profile:', error)

      return null
    }
  }

  /**
   * Get paginated student profiles (admin/professor use)
   */
  static async getPaginatedStudentProfiles(request: PaginatedRequest) {
    try {
      const response = await profileServiceClient.studentProfile.getPaginated({ paginatedRequest: request })

      return response.data
    } catch (error) {
      console.error('Failed to fetch paginated student profiles:', error)

      return null
    }
  }
}

// Example 2: Professor Profile Management
export class ProfessorProfileService {
  /**
   * Get current professor profile
   */
  static async getCurrentProfessorProfile(): Promise<ProfessorProfileDTO | null> {
    try {
      const response = await profileServiceClient.professorProfile.getUserProfile()

      return response.data
    } catch (error) {
      console.error('Failed to fetch current professor profile:', error)

      return null
    }
  }

  /**
   * Create professor profile
   */
  static async createProfessorProfile(profileData: ProfessorProfileDTO): Promise<boolean> {
    try {
      await profileServiceClient.professorProfile.create({ professorProfileDTO: profileData })

      return true
    } catch (error) {
      console.error('Failed to create professor profile:', error)

      return false
    }
  }

  /**
   * Update professor profile
   */
  static async updateProfessorProfile(profileData: ProfessorProfileDTO): Promise<boolean> {
    try {
      await profileServiceClient.professorProfile.update({ professorProfileDTO: profileData })

      return true
    } catch (error) {
      console.error('Failed to update professor profile:', error)

      return false
    }
  }
}

// Example 3: University and Speciality Management
export class UniversityService {
  /**
   * Get all universities
   */
  static async getAllUniversities(): Promise<UniversityDTO[]> {
    try {
      const response = await profileServiceClient.university.getAll()

      return response.data
    } catch (error) {
      console.error('Failed to fetch universities:', error)

      return []
    }
  }

  /**
   * Get university by ID
   */
  static async getUniversityById(id: string): Promise<UniversityDTO | null> {
    try {
      const response = await profileServiceClient.university.get({ id })

      return response.data
    } catch (error) {
      console.error(`Failed to fetch university ${id}:`, error)

      return null
    }
  }

  /**
   * Create new university
   */
  static async createUniversity(universityData: UniversityDTO): Promise<boolean> {
    try {
      await profileServiceClient.university.create({ universityDTO: universityData })

      return true
    } catch (error) {
      console.error('Failed to create university:', error)

      return false
    }
  }
}

export class SpecialityService {
  /**
   * Get all specialities
   */
  static async getAllSpecialities(): Promise<SpecialityDTO[]> {
    try {
      const response = await profileServiceClient.speciality.getAll()

      return response.data
    } catch (error) {
      console.error('Failed to fetch specialities:', error)

      return []
    }
  }

  /**
   * Create new speciality
   */
  static async createSpeciality(specialityData: SpecialityDTO): Promise<boolean> {
    try {
      await profileServiceClient.speciality.create({ specialityDTO: specialityData })

      return true
    } catch (error) {
      console.error('Failed to create speciality:', error)

      return false
    }
  }
}

// Example 4: Events Management
export class EventsService {
  /**
   * Get my events for a date range
   */
  static async getMyEvents(startDate: string, endDate: string) {
    try {
      const response = await profileServiceClient.events.getMyEvents({ startDate, endDate })

      return response.data
    } catch (error) {
      console.error('Failed to fetch my events:', error)

      return null
    }
  }

  /**
   * Create a singular event
   */
  static async createSingularEvent(eventData: SingularEventDTO): Promise<SingularEventDTO | null> {
    try {
      const response = await profileServiceClient.events.createSingularEvent({ singularEventDTO: eventData })

      return response.data
    } catch (error) {
      console.error('Failed to create singular event:', error)

      return null
    }
  }

  /**
   * Get consolidated events for a professor
   */
  static async getConsolidatedEventsForProfessor(professorId: string, startDate: string, endDate: string) {
    try {
      const response = await profileServiceClient.events.getConsolidatedEventsForProfessor({
        professorId,
        startDate,
        endDate
      })

      return response.data
    } catch (error) {
      console.error('Failed to fetch consolidated events for professor:', error)

      return []
    }
  }
}

// Example 5: Profile Picture Management
export class ProfilePictureService {
  /**
   * Upload profile picture
   */
  static async uploadProfilePicture(file: File): Promise<string | null> {
    try {
      const response = await profileServiceClient.profilePicture.upload({ file })

      return response.data // Returns UUID of uploaded image
    } catch (error) {
      console.error('Failed to upload profile picture:', error)

      return null
    }
  }

  /**
   * Download profile picture
   */
  static async downloadProfilePicture(fileId: string): Promise<Blob | null> {
    try {
      const response = await profileServiceClient.profilePicture.download({ fileId })

      return response.data
    } catch (error) {
      console.error('Failed to download profile picture:', error)

      return null
    }
  }
}

// Example React Hook for Profile Service
export function useProfileService() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const callProfileService = async <T>(apiCall: () => Promise<T>): Promise<T | null> => {
    setLoading(true)
    setError(null)

    try {
      const result = await apiCall()

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      console.error('Profile service error:', err)

      return null
    } finally {
      setLoading(false)
    }
  }

  return { callProfileService, loading, error }
}

// Example React Component Usage
/*
import { StudentProfileService, useProfileService } from '@/services/profile-service-examples';

export default function StudentProfilePage() {
  const [studentProfile, setStudentProfile] = useState<StudentProfileDTO | null>(null);
  const { callProfileService, loading, error } = useProfileService();

  useEffect(() => {
    const fetchProfile = async () => {
      const profile = await callProfileService(() =>
        StudentProfileService.getCurrentStudentProfile()
      );
      if (profile) {
        setStudentProfile(profile);
      }
    };

    fetchProfile();
  }, []);

  const handleUpdateProfile = async (updatedData: StudentProfileDTO) => {
    const result = await callProfileService(() =>
      StudentProfileService.updateStudentProfile(updatedData)
    );
    if (result) {
      setStudentProfile(result);
      // Show success message
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!studentProfile) return <div>No profile found</div>;

  return (
    <div>
      <h1>Student Profile</h1>
      <p>Name: {studentProfile.firstName} {studentProfile.lastName}</p>
      <p>Email: {studentProfile.email}</p>
      // Add more profile fields and edit functionality
    </div>
  );
}
*/
