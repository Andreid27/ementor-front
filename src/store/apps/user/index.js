import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import toast from 'react-hot-toast'

// ** Axios Imports
import axios from 'axios'
import * as apiSpec from 'src/apiSpec'

// NOTE: profileServiceClient import may cause circular dependency warnings during dev
// but is needed for other thunks. Subscription uses direct axios to avoid issues.
// import { profileServiceClient } from 'src/services'
import { transformStudentData } from 'src/pages/apps/user/list/utils'

// Helper to check if cache is expired (older than 1 month)
const isCacheExpired = timestamp => {
  if (!timestamp) return true
  const oneMonthInMs = 30 * 24 * 60 * 60 * 1000 // 30 days

  return Date.now() - timestamp > oneMonthInMs
}

// Helper to check if subscription cache is expired (older than 2 hours)
const isSubscriptionCacheExpired = timestamp => {
  if (!timestamp) return true
  const twoHoursInMs = 2 * 60 * 60 * 1000 // 2 hours

  return Date.now() - timestamp > twoHoursInMs
}

// ** Fetch Active Students
export const fetchData = createAsyncThunk('appUsers/fetchData', async (_, { rejectWithValue }) => {
  try {
    // Dynamic import to avoid circular dependency
    const { profileServiceClient } = await import('src/services')
    const response = await profileServiceClient.studentProfessorRelationship.getActiveStudentsForCurrentProfessor()

    // Transform raw DTOs to StudentListItem format for consistency
    const transformedStudents = transformStudentData(response.data || [])

    return {
      students: transformedStudents,
      fetchedAt: Date.now()
    }
  } catch (error) {
    console.error('Failed to fetch active students:', error)
    toast.error('Failed to fetch active students')

    return rejectWithValue(error.response?.data || error.message)
  }
})

// ** Fetch Inactive Students with Server-Side Pagination
export const fetchInactiveStudents = createAsyncThunk(
  'appUsers/fetchInactiveStudents',
  async ({ professorId, params = {} }, { rejectWithValue }) => {
    try {
      // Dynamic import to avoid circular dependency
      const { profileServiceClient } = await import('src/services')

      const response = await profileServiceClient.studentProfessorRelationship.getInactiveStudentsForProfessor({
        professorId,
        page: params.page !== undefined ? params.page : 0,
        size: params.size || 10,
        sort: params.sort || 'modifiedAt,desc',
        generation: params.generation || undefined,
        createdAfter: params.createdAfter || undefined,
        createdBefore: params.createdBefore || undefined,
        modifiedAfter: params.modifiedAfter || undefined,
        modifiedBefore: params.modifiedBefore || undefined
      })

      return {
        students: response.data?.content || [],
        totalElements: response.data?.totalElements || 0,
        totalPages: response.data?.totalPages || 0,
        currentPage: response.data?.number || 0,
        pageSize: response.data?.size || 10
      }
    } catch (error) {
      console.error('Failed to fetch inactive students:', error)
      toast.error('Failed to fetch inactive students')

      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

// ** Fetch Students By IDs (Smart 3-Tier Lookup)
export const fetchStudentsByIds = createAsyncThunk(
  'appUsers/fetchStudentsByIds',
  async ({ studentIds }, { getState, dispatch, rejectWithValue }) => {
    try {
      // 1. Get professor ID and active students from state
      const state = getState()
      const professorId = state.user.data?.id
      const activeStudents = state.user.activeStudents || []

      if (!professorId) {
        throw new Error('Professor ID not found. Please log in again.')
      }

      // Handle empty input
      if (!studentIds || studentIds.length === 0) {
        return { students: [], source: 'empty' }
      }

      // Deduplicate student IDs
      const uniqueIds = [...new Set(studentIds)]

      // 2. TIER 1: Check cache (use id field which now contains studentId)
      const studentMap = new Map(activeStudents.map(s => [s.id, s]))
      let foundStudents = uniqueIds.map(id => studentMap.get(id)).filter(Boolean)
      let missingIds = uniqueIds.filter(id => !studentMap.has(id))

      console.debug('[fetchStudentsByIds] Tier 1 - Cache hit:', foundStudents.length, '/', uniqueIds.length)

      // 3. TIER 2: Refresh cache if needed
      if (missingIds.length > 0) {
        console.debug('[fetchStudentsByIds] Tier 2 - Refreshing cache for missing IDs:', missingIds.length)
        await dispatch(fetchData()).unwrap()
        const updatedState = getState()
        const updatedStudents = updatedState.user.activeStudents || []
        const updatedMap = new Map(updatedStudents.map(s => [s.id, s]))

        const newlyFound = missingIds.map(id => updatedMap.get(id)).filter(Boolean)
        foundStudents = [...foundStudents, ...newlyFound]
        missingIds = missingIds.filter(id => !updatedMap.has(id))

        console.debug(
          '[fetchStudentsByIds] Tier 2 - After refresh, found:',
          newlyFound.length,
          ', still missing:',
          missingIds.length
        )
      }

      // 4. TIER 3: Batch API for remaining IDs (likely inactive students)
      if (missingIds.length > 0) {
        console.debug('[fetchStudentsByIds] Tier 3 - Calling batch API for:', missingIds.length, 'IDs')
        try {
          const response = await profileServiceClient.studentProfessorRelationship.getRelationshipsByStudentIds({
            getRelationshipsByStudentIdsRequest: {
              studentIds: missingIds,
              professorId: professorId,
              includeInactive: true
            }
          })

          const batchStudents = transformStudentData(response.data || [])
          foundStudents = [...foundStudents, ...batchStudents]
          console.debug('[fetchStudentsByIds] Tier 3 - Batch API returned:', batchStudents.length, 'students')
        } catch (batchError) {
          console.warn('[fetchStudentsByIds] Tier 3 - Batch API failed:', batchError)
          toast.error('Some student information could not be loaded')

          // Continue with partial results
        }
      }

      const source = missingIds.length > 0 ? 'batch' : foundStudents.length === uniqueIds.length ? 'cache' : 'refresh'

      return {
        students: foundStudents,
        source: source
      }
    } catch (error) {
      console.error('[fetchStudentsByIds] Failed:', error)
      toast.error('Failed to load student information')

      return rejectWithValue(error.message)
    }
  }
)

// ** Add Student By Email
export const addStudentByEmail = createAsyncThunk(
  'appUsers/addStudentByEmail',
  async (requestData, { rejectWithValue, dispatch }) => {
    try {
      // Dynamic import to avoid circular dependency
      const { profileServiceClient } = await import('src/services')

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
      const { profileServiceClient } = await import('src/services')
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
// @deprecated Use fetchStudentsByIds instead for better performance and smart caching
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

// ** Fetch Subscription Status with 2-hour cache (only for active subscriptions)
// NOTE: Using direct axios call instead of profileServiceClient to avoid circular dependency
export const fetchSubscriptionStatus = createAsyncThunk(
  'appUsers/fetchSubscriptionStatus',
  async (_, { getState, rejectWithValue }) => {
    try {
      // Check if we have a valid cached subscription
      const state = getState()
      const cachedSubscription = state.user.subscription
      const subscriptionFetchedAt = state.user.subscriptionFetchedAt

      // Only use cache if subscription is ACTIVE and cache is not expired
      // If subscription is inactive or missing, always refetch (user might have paid)
      if (
        cachedSubscription &&
        cachedSubscription.active === true &&
        !isSubscriptionCacheExpired(subscriptionFetchedAt)
      ) {
        // Return cached data for active subscriptions
        return { subscription: cachedSubscription, cached: true }
      }

      // Fetch from API for inactive/missing subscriptions or expired cache
      // Using direct axios call to avoid circular dependency with profileServiceClient
      const token = window.localStorage.getItem('accessToken')

      const response = await axios.get(`${process.env.NEXT_PUBLIC_PROD_HOST}/service2/subscriptions/my`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })

      return {
        subscription: response.data,
        cached: false,
        fetchedAt: Date.now()
      }
    } catch (error) {
      console.error('Failed to fetch subscription status:', error)

      // Show warning but don't block - user requested to proceed with warning on API errors
      toast.error('Nu s-a putut verifica starea abonamentului. Continuați cu atenție.', {
        duration: 5000,
        icon: '⚠️'
      })

      return rejectWithValue({
        message: error.response?.data?.message || error.message,
        status: error.response?.status
      })
    }
  }
)

// ** Clear Subscription Cache (used on logout)
export const clearSubscriptionCache = createAsyncThunk('appUsers/clearSubscriptionCache', async () => {
  return null
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

// ** Subscription Selectors
export const selectSubscription = state => state.user.subscription

export const selectSubscriptionLoading = state => state.user.subscriptionLoading || false

export const selectSubscriptionError = state => state.user.subscriptionError

export const selectHasActiveSubscription = state => {
  const subscription = state.user.subscription
  if (!subscription) return false

  return subscription.active === true
}

export const selectIsSubscriptionCacheValid = state => {
  const subscription = state.user.subscription
  const fetchedAt = state.user.subscriptionFetchedAt

  // Cache is only valid if subscription is active AND not expired
  return subscription?.active === true && fetchedAt && !isSubscriptionCacheExpired(fetchedAt)
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
    inactiveTotalElements: 0, // Total inactive students count
    inactiveTotalPages: 0, // Total pages for inactive students
    inactiveCurrentPage: 0, // Current page for inactive students
    inactivePageSize: 10, // Page size for inactive students
    activeStudentsFetchedAt: null, // Timestamp of last fetch
    loading: false, // Global loading state
    inactiveLoading: false, // Loading state for inactive students
    error: null, // Error state
    professorProfiles: {}, // { userId: { data, cachedAt }, ... }
    professorProfilesLoading: {}, // { userId: boolean, ... }
    professorProfilesErrors: {}, // { userId: error, ... }
    generations: [], // List of available generations
    generationsLoading: false, // Loading state for generations
    selectedGeneration: null, // Currently selected generation for filtering
    // Subscription state (2-hour cache)
    subscription: null, // ProfessorSubscriptionDTO
    subscriptionFetchedAt: null, // Timestamp of last subscription fetch
    subscriptionLoading: false, // Loading state for subscription
    subscriptionError: null // Error state for subscription
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

        // Set paginated data
        state.inactiveStudents = action.payload.students
        state.inactiveTotalElements = action.payload.totalElements
        state.inactiveTotalPages = action.payload.totalPages
        state.inactiveCurrentPage = action.payload.currentPage
        state.inactivePageSize = action.payload.pageSize
      })
      .addCase(fetchInactiveStudents.rejected, (state, action) => {
        state.inactiveLoading = false
        state.error = action.payload || 'Failed to fetch inactive students'
        state.inactiveStudents = [] // Clear on error
        state.inactiveTotalElements = 0
        state.inactiveTotalPages = 0
        state.inactiveCurrentPage = 0
      })
      .addCase(fetchStudentsByIds.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchStudentsByIds.fulfilled, (state, action) => {
        state.loading = false

        // Merge batch results into allStudents for backward compatibility (use id field)
        const existingIds = new Set(state.allStudents.map(s => s.id))
        const newStudents = action.payload.students.filter(s => !existingIds.has(s.id))
        state.allStudents = [...state.allStudents, ...newStudents]
      })
      .addCase(fetchStudentsByIds.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to fetch students by IDs'
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

      // ** Subscription Status Reducers
      .addCase(fetchSubscriptionStatus.pending, state => {
        state.subscriptionLoading = true
        state.subscriptionError = null
      })
      .addCase(fetchSubscriptionStatus.fulfilled, (state, action) => {
        state.subscriptionLoading = false

        // Only update if it's a fresh fetch (not from cache)
        if (!action.payload.cached) {
          state.subscription = action.payload.subscription
          state.subscriptionFetchedAt = action.payload.fetchedAt
        }
      })
      .addCase(fetchSubscriptionStatus.rejected, (state, action) => {
        state.subscriptionLoading = false
        state.subscriptionError = action.payload?.message || 'Failed to fetch subscription'

        // On error, allow user to proceed (as per user request) - don't clear existing subscription
      })
      .addCase(clearSubscriptionCache.fulfilled, state => {
        state.subscription = null
        state.subscriptionFetchedAt = null
        state.subscriptionLoading = false
        state.subscriptionError = null
      })
  }
})

export default appUsersSlice.reducer
