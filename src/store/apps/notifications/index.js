import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import toast from 'react-hot-toast'
import apiClient from 'src/@core/axios/axiosEmentor'
import * as apiSpec from 'src/apiSpec'


export const addNotification = createAsyncThunk('appNotification/addNotification', async data => {
  return data
})

export const fetchNotifications = createAsyncThunk('appNotification/fetchNotifications', async (_, { getState }) => {
  const { notifications } = getState().notifications;
  if (notifications.length > 0) {
    return notifications;
  }

  const response = await apiClient.get(apiSpec.NOTIFICATION_CONTROLLER)
    .then(response => {
      const notifications = response.data;
      notifications.forEach(notification => {
        notification.content = JSON.parse(notification.content);
        notification.creation = new Date(notification.creation);
      });

      return notifications;
    })
    .catch(error => {
      console.log(error);
      toast.error('Nu s-au putut prelua notificările');

      return [];
    });

  return response;
});

export const updateNotification = createAsyncThunk('appNotification/updateNotification', async data => {
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
        state.notifications = [action.payload, ...state.notifications]
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.notifications = action.payload
        state.lastFetch = Date.now()
      })
      .addCase(updateNotification.fulfilled, (state, action) => {
        state.notifications = state.notifications.map(notification => {
          if (notification.id === action.payload.id) {
            return action.payload
          }

          return notification
        })
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
