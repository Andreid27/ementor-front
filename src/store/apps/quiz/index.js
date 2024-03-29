import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

export const addQuiz = createAsyncThunk('appQuiz/addQuiz', async data => {
  return data
})

export const updateAnswers = createAsyncThunk('appQuiz/updateAnswer', async data => {
  return data
})

export const resetQuiz = createAsyncThunk('appQuiz/resetQuiz', () => {
  return null
})

export const updateNewQuiz = createAsyncThunk('appQuiz/updateNewQuiz', async data => {
  return data
})

export const resetNewQuiz = createAsyncThunk('appQuiz/resetNewQuiz', () => {
  return null
})

export const selectQuiz = state => state.quiz.quiz

export const selectAnswers = state => state.quiz.answers

export const selectNewQuiz = state => state.quiz.newQuiz

const initialState = {
  quiz: {},
  answers: new Map(),
  newQuiz: {}
}

export const appQuizSlice = createSlice({
  name: 'appQuiz',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(addQuiz.fulfilled, (state, action) => {
        state.quiz = action.payload
      })
      .addCase(updateAnswers.fulfilled, (state, action) => {
        const newAnswers = new Map(state.answers.size ? state.answers : null)
        newAnswers.set(action.payload.questionId, action.payload.answer)
        state.answers = newAnswers
      })
      .addCase(resetQuiz.fulfilled, state => {
        state.quiz = initialState.quiz
        state.answers = initialState.answers
      })
      .addCase(updateNewQuiz.fulfilled, (state, action) => {
        state.newQuiz = action.payload
      })
      .addCase(resetNewQuiz.fulfilled, state => {
        state.newQuiz = initialState.newQuiz
      })
  }
})

export default appQuizSlice.reducer
