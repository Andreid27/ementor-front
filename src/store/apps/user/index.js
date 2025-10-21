import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import toast from 'react-hot-toast'

// ** Axios Imports
import axios from 'axios'
import apiClient from 'src/@core/axios/axiosEmentor'
import { profileServiceClient } from 'src/services'

// Helper to check if cache is expired (older than 1 month)
const isCacheExpired = timestamp => {
  if (!timestamp) return true
  const oneMonthInMs = 30 * 24 * 60 * 60 * 1000 // 30 days

  return Date.now() - timestamp > oneMonthInMs
}

// ** Fetch Users
export const fetchData = createAsyncThunk('appUsers/fetchData', async () => {
  const response = await apiClient
    .get('service3/users/role/STUDENT')
    .then(response => {
      return response.data
    })
    .catch(error => {
      console.log(error)
      toast.error('Nu s-au putut prelua utilizatorii')

      return []
    })

  return response
})

// ** Add User
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

// ** Delete User
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
  if (!state.user?.allStudents || state.user.allStudents.length === 0) {
    return fetchData()
  }

  return state.user.allStudents
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
    professorProfiles: {}, // { userId: { data, cachedAt }, ... }
    professorProfilesLoading: {}, // { userId: boolean, ... }
    professorProfilesErrors: {} // { userId: error, ... }
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchData.fulfilled, (state, action) => {
        state.data = action.payload.users
        state.total = action.payload.total
        state.params = action.payload.params
        state.allStudents = action.payload.allStudents
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
  }
})

export default appUsersSlice.reducer
