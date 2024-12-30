import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

export const addNotification = createAsyncThunk('appNotification/addNotification', async data => {
  return data
})

export const fetchNotifications = createAsyncThunk('appNotification/updateNotification', async data => {
  return data
})

export const resetNotifications = createAsyncThunk('appNotification/resetNewNotification', () => {
  return null
})

export const deleteNotification = createAsyncThunk('appNotification/deleteNotification', async data => {
  return data
})

export const selectNotifications = state => state.notifications


const initialState = {
  notifications: [],
  lastFetch: null
}

export const appNotificationsSlice = createSlice({
  name: 'appNotification',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(addNotification.fulfilled, (state, action) => {
        state.notifications = [...state.notifications, action.payload]
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.notifications = action.payload
        state.lastFetch = Date.now()
      })
      .addCase(resetNotifications.fulfilled, state => {
        state.notifications = initialState.notifications
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.notifications = state.notifications.filter(notification => notification.id !== action.payload.id)
      })
  }
})

export default appNotificationsSlice.reducer
