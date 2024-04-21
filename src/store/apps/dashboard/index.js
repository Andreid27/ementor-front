import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ** Axios Imports
import axios from 'axios'
import apiClient from 'src/@core/axios/axiosEmentor'
import * as apiSpec from 'src/apiSpec'

// ** Fetch Users

export const fetchData = createAsyncThunk('appDashboard/fetchData', async params => {
  const token = window.localStorage.getItem('accessToken')
  const url = `${apiSpec.PROD_HOST + apiSpec.QUIZ_SERVICE}/dashboard-stats`

  const response = await axios
    .get(url, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      return res.data
    })

  return response
})

export const selectDashboardData = state => state.dashboard

export const appDashboardSlice = createSlice({
  name: 'appDashboard',
  initialState: {
    questions: {
      totalQuestions: 0,
      correctQuestions: 0
    },
    quizzes: {
      completedQuizzes: 0
    }
  },
  reducers: {},
  extraReducers: builder => {
    builder.addCase(fetchData.fulfilled, (state, action) => {
      state.questions = action.payload.questions
      state.quizzes = action.payload.quizzes
    })
  }
})

export default appDashboardSlice.reducer
