import { enableMapSet } from 'immer'
import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { persistReducer, persistStore } from 'redux-persist' // Import persistReducer and persistStore
import storage from 'redux-persist/lib/storage' // defaults to localStorage for web

enableMapSet() // Enable Immer MapSet plugin

// ** Reducers
import chat from 'src/store/apps/chat'
import user from 'src/store/apps/user'
import quiz from 'src/store/apps/quiz'
import email from 'src/store/apps/email'
import invoice from 'src/store/apps/invoice'
import calendar from 'src/store/apps/calendar'
import permissions from 'src/store/apps/permissions'

// ** Logger import
import { createLogger } from 'redux-logger'

const persistConfig = {
  key: 'root',
  version: 1,
  storage
}

// ** Logger instance
const logger = createLogger({
  stateTransformer: state => state
})

// Wrap the root reducer with persistReducer
const persistedReducer = persistReducer(
  persistConfig,
  combineReducers({
    user,
    quiz,
    chat,
    email,
    invoice,
    calendar,
    permissions
  })
)

export const store = configureStore({
  reducer: persistedReducer, // Use the persistedReducer as the root reducer
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false
    }).concat(logger) // ** Logger middleware
})

// Export the persistor, so you can use it in the 'PersistGate'
export const persistor = persistStore(store)

export default store
