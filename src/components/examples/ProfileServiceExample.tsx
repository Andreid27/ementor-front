// Example React Component using the Profile Service API
import React, { useState, useEffect } from 'react'
import { Card, CardContent, Typography, Button, CircularProgress, Alert } from '@mui/material'
import { StudentProfileService, useProfileService } from '@/services/profile-service-examples'
import type { StudentProfileDTO } from '@/generated/profile-service'

/**
 * Example component showing how to use the generated Profile Service API
 * This component demonstrates:
 * - Loading student profile data
 * - Handling loading and error states
 * - Using the generated TypeScript types
 * - Integration with your existing axios interceptor
 */
export default function StudentProfileExample() {
  const [studentProfile, setStudentProfile] = useState<StudentProfileDTO | null>(null)
  const { callProfileService, loading, error } = useProfileService()

  // Load student profile on component mount
  useEffect(() => {
    loadStudentProfile()
  }, [])

  const loadStudentProfile = async () => {
    const profile = await callProfileService(() => StudentProfileService.getCurrentStudentProfile())

    if (profile) {
      setStudentProfile(profile)
    }
  }

  const handleRefresh = () => {
    loadStudentProfile()
  }

  // Loading state
  if (loading && !studentProfile) {
    return (
      <Card>
        <CardContent sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Loading profile...</Typography>
        </CardContent>
      </Card>
    )
  }

  // Error state
  if (error && !studentProfile) {
    return (
      <Card>
        <CardContent>
          <Alert severity='error' sx={{ mb: 2 }}>
            Failed to load student profile: {error}
          </Alert>
          <Button variant='contained' onClick={handleRefresh}>
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  // No profile state
  if (!studentProfile) {
    return (
      <Card>
        <CardContent>
          <Typography variant='h6' gutterBottom>
            No Student Profile Found
          </Typography>
          <Typography color='text.secondary' sx={{ mb: 2 }}>
            You haven't created a student profile yet.
          </Typography>
          <Button variant='contained' color='primary'>
            Create Profile
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Profile loaded successfully
  return (
    <Card>
      <CardContent>
        <Typography variant='h5' gutterBottom>
          Student Profile
        </Typography>

        {/* Profile Information */}
        <div style={{ marginBottom: 16 }}>
          <Typography variant='h6' color='primary'>
            Personal Information
          </Typography>
          <Typography>
            <strong>First Name:</strong> {studentProfile.firstName || 'Not provided'}
          </Typography>
          <Typography>
            <strong>Last Name:</strong> {studentProfile.lastName || 'Not provided'}
          </Typography>
          <Typography>
            <strong>Email:</strong> {studentProfile.email || 'Not provided'}
          </Typography>
          <Typography>
            <strong>Phone:</strong> {studentProfile.phone || 'Not provided'}
          </Typography>
        </div>

        {/* University Information */}
        {studentProfile.university && (
          <div style={{ marginBottom: 16 }}>
            <Typography variant='h6' color='primary'>
              University Information
            </Typography>
            <Typography>
              <strong>University:</strong> {studentProfile.university.name}
            </Typography>
            {studentProfile.speciality && (
              <Typography>
                <strong>Speciality:</strong> {studentProfile.speciality.name}
              </Typography>
            )}
          </div>
        )}

        {/* Academic Information */}
        <div style={{ marginBottom: 16 }}>
          <Typography variant='h6' color='primary'>
            Academic Information
          </Typography>
          {studentProfile.desiredExamDate && (
            <Typography>
              <strong>Desired Exam Date:</strong> {new Date(studentProfile.desiredExamDate).toLocaleDateString()}
            </Typography>
          )}
          {studentProfile.currentYear && (
            <Typography>
              <strong>Current Year:</strong> {studentProfile.currentYear}
            </Typography>
          )}
        </div>

        {/* Address */}
        {studentProfile.address && (
          <div style={{ marginBottom: 16 }}>
            <Typography variant='h6' color='primary'>
              Address
            </Typography>
            <Typography>
              {studentProfile.address.street} {studentProfile.address.number}
              {studentProfile.address.block && `, Block ${studentProfile.address.block}`}
              {studentProfile.address.staircase && `, Staircase ${studentProfile.address.staircase}`}
              {studentProfile.address.apartment && `, Apt ${studentProfile.address.apartment}`}
            </Typography>
            <Typography>
              {studentProfile.address.city}, {studentProfile.address.countyValue}
            </Typography>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <Button
            variant='contained'
            color='primary'
            onClick={() => {
              // Navigate to edit profile page
              console.log('Edit profile clicked')
            }}
          >
            Edit Profile
          </Button>
          <Button variant='outlined' onClick={handleRefresh} disabled={loading}>
            {loading ? <CircularProgress size={20} /> : 'Refresh'}
          </Button>
        </div>

        {/* Loading overlay for refresh */}
        {loading && studentProfile && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(255,255,255,0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 4
            }}
          >
            <CircularProgress />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Additional example components for other services

export function UniversityListExample() {
  const [universities, setUniversities] = useState<any[]>([])
  const { callProfileService, loading, error } = useProfileService()

  useEffect(() => {
    const loadUniversities = async () => {
      // This will use your generated API client with axios interceptor
      const result = await callProfileService(async () => {
        const { UniversityService } = await import('@/services/profile-service-examples')

        return UniversityService.getAllUniversities()
      })

      if (result) {
        setUniversities(result)
      }
    }

    loadUniversities()
  }, [])

  if (loading) return <CircularProgress />
  if (error) return <Alert severity='error'>{error}</Alert>

  return (
    <div>
      <Typography variant='h6' gutterBottom>
        Universities
      </Typography>
      {universities.map(university => (
        <Card key={university.id} sx={{ mb: 1 }}>
          <CardContent>
            <Typography variant='subtitle1'>{university.name}</Typography>
            {university.address && (
              <Typography variant='body2' color='text.secondary'>
                {university.address.city}, {university.address.countyValue}
              </Typography>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
