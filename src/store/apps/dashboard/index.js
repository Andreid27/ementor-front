import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ** Axios Imports
import axios from 'axios'
import apiClient from 'src/@core/axios/axiosEmentor'
import * as apiSpec from 'src/apiSpec'

// ** Fetch Users

export const fetchData = createAsyncThunk('appDashboard/fetchData', async params => {
  const quizServiceUrl = `${apiSpec.QUIZ_SERVICE}/dashboard-stats`
  const lessonServiceUrl = `${apiSpec.LESSON_CONTROLLER}/dashboard-stats`

  const [quizServiceData, lessonServiceData] = await Promise.all([
    apiClient.get(quizServiceUrl).then(res => res.data),
    apiClient.get(lessonServiceUrl).then(res => res.data)
  ])


  return { quizService: quizServiceData, lessonService: lessonServiceData }
})

export const selectDashboardData = state => state.dashboard

export const appDashboardSlice = createSlice({
  name: 'appDashboard',
  initialState: {
    quizService: {},
    lessonService: {}
  },
  reducers: {},
  extraReducers: builder => {
    builder.addCase(fetchData.fulfilled, (state, action) => {
      state.quizService = action.payload.quizService
      state.lessonService = action.payload.lessonService
    })
  }
})

export default appDashboardSlice.reducer
