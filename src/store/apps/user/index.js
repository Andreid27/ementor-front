import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ** Axios Imports
import axios from 'axios'

// ** Fetch Users
export const fetchData = createAsyncThunk('appUsers/fetchData', async params => {
  const response = await axios.get('/apps/users/list', {
    params
  })

  return response.data
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

export const selectTokens = state => state.user.tokens

export const selectUser = state => state.user.data

export const selectThumbnail = state => state.user.tokens

export const appUsersSlice = createSlice({
  name: 'appUsers',
  initialState: {
    data: {},
    total: 1,
    params: {},
    tokens: {},
    thumbnailUrl: '',
    allData: []
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchData.fulfilled, (state, action) => {
        state.data = action.payload.users
        state.total = action.payload.total
        state.params = action.payload.params
        state.allData = action.payload.allData
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
      })
      .addCase(updateUserHasProfile.fulfilled, (state, action) => {
        state.data.hasProfile = action.payload
      })
  }
})

export default appUsersSlice.reducer
