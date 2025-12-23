import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import toast from 'react-hot-toast'

// ** Axios Imports
import axios from 'axios'
import { profileServiceClient } from 'src/services'

// Helper to check if cache is expired (older than 1 month)
const isCacheExpired = timestamp => {
  if (!timestamp) return true
  const oneMonthInMs = 30 * 24 * 60 * 60 * 1000 // 30 days

  return Date.now() - timestamp > oneMonthInMs
}

// ** Fetch Active Students
export const fetchData = createAsyncThunk('appUsers/fetchData', async (_, { rejectWithValue }) => {
  try {
    const response = await profileServiceClient.studentProfessorRelationship.getActiveStudentsForCurrentProfessor()

    return {
      students: response.data || [],
      fetchedAt: Date.now()
    }
  } catch (error) {
    console.error('Failed to fetch active students:', error)
    toast.error('Failed to fetch active students')

    return rejectWithValue(error.response?.data || error.message)
  }
})

// ** Fetch Inactive Students (not cached - always fresh)
export const fetchInactiveStudents = createAsyncThunk(
  'appUsers/fetchInactiveStudents',
  async (_, { rejectWithValue }) => {
    try {
      // For now, we'll use the same endpoint and filter by status on frontend
      // When backend adds inactive endpoint, we can update this
      const response = await profileServiceClient.studentProfessorRelationship.getActiveStudentsForCurrentProfessor()

      // Return just the students array, no caching
      return response.data || []
    } catch (error) {
      console.error('Failed to fetch inactive students:', error)
      toast.error('Failed to fetch inactive students')

      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

// ** Add Student By Email
export const addStudentByEmail = createAsyncThunk(
  'appUsers/addStudentByEmail',
  async (requestData, { rejectWithValue, dispatch }) => {
    try {
      const response = await profileServiceClient.studentProfessorRelationship.addStudentByEmail({
        addStudentByEmailRequest: requestData
      })

      // Refresh active students list after adding
      dispatch(fetchData())

      return response.data
    } catch (error) {
      console.error('Failed to add student by email:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add student'
      toast.error(errorMessage)

      return rejectWithValue({
        message: errorMessage,
        status: error.response?.status
      })
    }
  }
)

// ** Add User (legacy - kept for backward compatibility)
export const addUser = createAsyncThunk('appUsers/addUser', async data => {
  return data
})

// ** Add User
export const addThumbnail = createAsyncThunk('appUsers/addThumbnail', async data => {
  return data
})

export const updateUserHasProfile = createAsyncThunk('appUsers/updateUserHasProfile', async data => {
  return data
})

export const updateTokens = createAsyncThunk('appUsers/updateTokens', async data => {
  return data
})

// ** Fetch Professor Generations
export const fetchProfessorGenerations = createAsyncThunk(
  'appUsers/fetchProfessorGenerations',
  async (professorId, { rejectWithValue }) => {
    try {
      const response = await profileServiceClient.studentProfessorRelationship.getProfessorGenerations({
        professorId
      })

      return response.data || []
    } catch (error) {
      console.error('Failed to fetch professor generations:', error)
      toast.error('Failed to fetch generations')

      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

// ** Fetch Students By Generation
export const fetchStudentsByGeneration = createAsyncThunk(
  'appUsers/fetchStudentsByGeneration',
  async ({ professorId, generation }, { rejectWithValue }) => {
    try {
      const response = await profileServiceClient.studentProfessorRelationship.getStudentsByGeneration({
        professorId,
        generation
      })

      return {
        students: response.data || [],
        generation
      }
    } catch (error) {
      console.error('Failed to fetch students by generation:', error)
      toast.error('Failed to fetch students by generation')

      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

// ** Update Student Generation
export const updateStudentGeneration = createAsyncThunk(
  'appUsers/updateStudentGeneration',
  async ({ studentUserId, professorId, generation, validGeneration }, { rejectWithValue, dispatch }) => {
    try {
      const response = await profileServiceClient.studentProfessorRelationship.updateGeneration({
        studentUserId,
        professorId,
        updateGenerationRequest: {
          generation,
          validGeneration
        }
      })

      // Refresh active students list after updating
      dispatch(fetchData())

      toast.success('Generation updated successfully')

      return response.data
    } catch (error) {
      console.error('Failed to update student generation:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update generation'
      toast.error(errorMessage)

      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

// ** Deactivate Student Relationship
export const deactivateStudentRelationship = createAsyncThunk(
  'appUsers/deactivateStudentRelationship',
  async ({ studentUserId, professorId }, { rejectWithValue, dispatch }) => {
    try {
      await profileServiceClient.studentProfessorRelationship.deactivateRelationship({
        studentUserId,
        professorId
      })

      // Refresh active students list after deactivating
      dispatch(fetchData())

      toast.success('Student relationship deactivated successfully')

      return { studentUserId, professorId }
    } catch (error) {
      console.error('Failed to deactivate student relationship:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to deactivate relationship'
      toast.error(errorMessage)

      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

// ** Delete User (legacy - kept for backward compatibility)
export const deleteUser = createAsyncThunk('appUsers/deleteUser', async (id, { getState, dispatch }) => {
  const response = await axios.delete('/apps/users/delete', {
    data: id
  })

  return response.data
})

// ** Delete Tokens
export const deleteTokens = createAsyncThunk('appUsers/deleteTokens', () => {
  return null
})

// ** Update allStudents which containts Students users.
export const updateAllStudents = createAsyncThunk('appUsers/updateAllStudents', async data => {
  return data
})

// ** Fetch Professor Profile by userId with caching
export const fetchProfessorProfile = createAsyncThunk(
  'appUsers/fetchProfessorProfile',
  async (userId, { getState, rejectWithValue }) => {
    try {
      if (!userId) {
        return rejectWithValue('User ID is required')
      }

      // Check if profile exists in cache and is not expired
      const state = getState()
      const cachedProfile = state.user.professorProfiles?.[userId]

      if (cachedProfile && !isCacheExpired(cachedProfile.cachedAt)) {
        // Return cached data
        return { userId, profile: cachedProfile.data, cached: true }
      }

      // Fetch from API
      const response = await profileServiceClient.professorProfile.get3({ id: userId })

      return {
        userId,
        profile: response.data,
        cached: false,
        cachedAt: Date.now()
      }
    } catch (error) {
      console.error('Error fetching professor profile:', error)
      console.error('Error details:', {
        message: error.message,
        response: error.response,
        userId
      })
      toast.error('Nu s-a putut prelua profilul profesorului')

      return rejectWithValue(error.response?.data || error.message || 'Failed to fetch professor profile')
    }
  }
)

// ** Clear specific professor profile from cache
export const clearProfessorCache = createAsyncThunk('appUsers/clearProfessorCache', async userId => {
  return userId
})

export const selectTokens = state => state.user.tokens

export const selectUser = state => state.user.data

export const selectThumbnail = state => state.user.tokens

export const selectAllStudents = state => {
  // Return the allStudents array directly (should be an array)
  return state.user?.allStudents || []
}

export const selectProfessorProfile = userId => state => {
  if (!userId) return null
  const cachedProfile = state.user.professorProfiles?.[userId]
  if (!cachedProfile) return null
  if (isCacheExpired(cachedProfile.cachedAt)) return null

  return cachedProfile.data
}

export const selectProfessorProfileLoading = userId => state => {
  if (!userId) return false

  return state.user.professorProfilesLoading?.[userId] || false
}

export const appUsersSlice = createSlice({
  name: 'appUsers',
  initialState: {
    data: {},
    total: 1,
    params: {},
    tokens: {},
    thumbnailUrl: '',
    allStudents: [],
    activeStudents: [], // Active students cache
    inactiveStudents: [], // Inactive students (NOT cached)
    activeStudentsFetchedAt: null, // Timestamp of last fetch
    loading: false, // Global loading state
    inactiveLoading: false, // Loading state for inactive students
    error: null, // Error state
    professorProfiles: {}, // { userId: { data, cachedAt }, ... }
    professorProfilesLoading: {}, // { userId: boolean, ... }
    professorProfilesErrors: {}, // { userId: error, ... }
    generations: [], // List of available generations
    generationsLoading: false, // Loading state for generations
    selectedGeneration: null // Currently selected generation for filtering
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchData.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchData.fulfilled, (state, action) => {
        state.loading = false
        state.activeStudents = action.payload.students
        state.activeStudentsFetchedAt = action.payload.fetchedAt

        // For backward compatibility
        state.allStudents = action.payload.students
      })
      .addCase(fetchData.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to fetch students'
      })
      .addCase(fetchInactiveStudents.pending, state => {
        state.inactiveLoading = true
        state.error = null
      })
      .addCase(fetchInactiveStudents.fulfilled, (state, action) => {
        state.inactiveLoading = false

        // No caching for inactive students - just set the data
        state.inactiveStudents = action.payload
      })
      .addCase(fetchInactiveStudents.rejected, (state, action) => {
        state.inactiveLoading = false
        state.error = action.payload || 'Failed to fetch inactive students'
        state.inactiveStudents = [] // Clear on error
      })
      .addCase(addUser.fulfilled, (state, action) => {
        state.data = action.payload
      })
      .addCase(updateTokens.fulfilled, (state, action) => {
        state.tokens = action.payload
      })
      .addCase(addThumbnail.fulfilled, (state, action) => {
        state.thumbnailUrl = action.payload
      })
      .addCase(deleteTokens.fulfilled, (state, action) => {
        state.tokens = action.payload
        state.thumbnailUrl = ''
      })
      .addCase(updateUserHasProfile.fulfilled, (state, action) => {
        state.data.hasProfile = action.payload
      })
      .addCase(updateAllStudents.fulfilled, (state, action) => {
        state.allStudents = action.payload
      })
      .addCase(fetchProfessorProfile.pending, (state, action) => {
        const userId = action.meta.arg
        if (!state.professorProfilesLoading) state.professorProfilesLoading = {}
        if (!state.professorProfilesErrors) state.professorProfilesErrors = {}
        state.professorProfilesLoading[userId] = true
        state.professorProfilesErrors[userId] = null
      })
      .addCase(fetchProfessorProfile.fulfilled, (state, action) => {
        const { userId, profile, cachedAt, cached } = action.payload
        if (!state.professorProfiles) state.professorProfiles = {}
        if (!state.professorProfilesLoading) state.professorProfilesLoading = {}

        state.professorProfilesLoading[userId] = false

        // Only update cache if it's a fresh fetch
        if (!cached) {
          state.professorProfiles[userId] = {
            data: profile,
            cachedAt: cachedAt
          }
        }
      })
      .addCase(fetchProfessorProfile.rejected, (state, action) => {
        const userId = action.meta.arg
        if (!state.professorProfilesLoading) state.professorProfilesLoading = {}
        if (!state.professorProfilesErrors) state.professorProfilesErrors = {}
        state.professorProfilesLoading[userId] = false
        state.professorProfilesErrors[userId] = action.payload || 'Unknown error'
      })
      .addCase(clearProfessorCache.fulfilled, (state, action) => {
        const userId = action.payload
        if (userId) {
          // Clear specific profile
          if (state.professorProfiles[userId]) {
            delete state.professorProfiles[userId]
          }
          if (state.professorProfilesLoading[userId]) {
            delete state.professorProfilesLoading[userId]
          }
          if (state.professorProfilesErrors[userId]) {
            delete state.professorProfilesErrors[userId]
          }
        } else {
          // Clear all profiles
          state.professorProfiles = {}
          state.professorProfilesLoading = {}
          state.professorProfilesErrors = {}
        }
      })
      .addCase(fetchProfessorGenerations.pending, state => {
        state.generationsLoading = true
      })
      .addCase(fetchProfessorGenerations.fulfilled, (state, action) => {
        state.generationsLoading = false
        state.generations = action.payload
      })
      .addCase(fetchProfessorGenerations.rejected, (state, action) => {
        state.generationsLoading = false
        state.error = action.payload || 'Failed to fetch generations'
      })
      .addCase(fetchStudentsByGeneration.pending, state => {
        state.loading = true
      })
      .addCase(fetchStudentsByGeneration.fulfilled, (state, action) => {
        state.loading = false
        state.selectedGeneration = action.payload.generation
        state.activeStudents = action.payload.students
      })
      .addCase(fetchStudentsByGeneration.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to fetch students by generation'
      })
  }
})

export default appUsersSlice.reducer
