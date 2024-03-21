import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

export const addLesson = createAsyncThunk('appLesson/addLesson', async data => {
  return data
})

export const updateNewLesson = createAsyncThunk('appLesson/updateNewLesson', async data => {
  return data
})

export const resetNewLesson = createAsyncThunk('appLesson/resetNewLesson', () => {
  return null
})

export const selectLesson = state => state.lesson.lesson

export const selectNewLesson = state => state.lesson.newLesson

const initialState = {
  lesson: {},
  newLesson: {}
}

export const appLessonSlice = createSlice({
  name: 'appLesson',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(addLesson.fulfilled, (state, action) => {
        state.lesson = action.payload
      })
      .addCase(updateNewLesson.fulfilled, (state, action) => {
        state.newLesson = action.payload
      })
      .addCase(resetNewLesson.fulfilled, state => {
        state.newLesson = initialState.newLesson
      })
  }
})

export default appLessonSlice.reducer
