import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ** Axios Imports
import axios from 'axios'
import apiClient from 'src/@core/axios/axiosEmentor'

// ** Fetch Users
export const fetchData = createAsyncThunk('appUsers/fetchData', async () => {
  const response = await apiClient
    .post(apiSpec.USER_SERVICE + '/paginated', {
      filters: [
        {
          key: 'role',
          operation: 'EQUAL',
          value: 'STUDENT'

          //TODO continue filter users by role here
        }
      ],
      sorters: [],
      page: 0,
      pageSize: 1000
    })
    .then(response => {
      return response.data.data
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
  dispatch(fetchData(getState().user.params))

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

export const selectTokens = state => state.user.tokens

export const selectUser = state => state.user.data

export const selectThumbnail = state => state.user.tokens

export const selectAllStudents = state => state.user.allStudents

export const appUsersSlice = createSlice({
  name: 'appUsers',
  initialState: {
    data: {},
    total: 1,
    params: {},
    tokens: {},
    thumbnailUrl: '',
    allStudents: []
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
  }
})

export default appUsersSlice.reducer
