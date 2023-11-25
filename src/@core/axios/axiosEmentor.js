import axios from 'axios'
import store from '../../store/index'
import * as apiSpec from '../../apiSpec'
import { verifyToken } from './token-validator'
import toast from 'react-hot-toast'
import { deleteTokens, deleteUser, updateTokens } from 'src/store/apps/user'
import authConfig from 'src/configs/auth'

// Function to get token from your state
function getCurrentToken() {
  // Replace this with actual logic to retrieve the token from your state

  const state = store.getState()
  let accessTokens = state.user.tokens.accessToken

  return accessTokens
}

// Create an instance of axios
const apiClient = axios.create({
  baseURL: apiSpec.PROD_HOST,
  timeout: 3000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add a request interceptor
apiClient.interceptors.request.use(
  async config => {
    try {
      const token = getCurrentToken()
      const verifiedToken = await verifyToken(token)

      if (verifiedToken) {
        config.headers['Authorization'] = `Bearer ${verifiedToken}`
      }

      // If the data is a file, set the Content-Type to multipart/form-data
      if (config.data instanceof FormData) {
        config.headers['Content-Type'] = 'multipart/form-data'
      }

      return config
    } catch (error) {
      return Promise.reject(error)
    }
  },
  error => Promise.reject(error)
)

apiClient.interceptors.response.use(
  response => response,
  async error => {
    // Handle specific cases
    if (error.response) {
      const { status, data } = error.response

      // Case 1: If the response is 403, call verifyToken
      if (status === 403) {
        store.dispatch(deleteUser())
        store.dispatch(deleteTokens())
        window.localStorage.removeItem('userData')
        window.localStorage.removeItem(authConfig.storageTokenKeyName)
        window.location.replace('/login')
      }

      // Case 2: If the response body error is EmentorApi, log the error
      if (data && data.exception === 'com.ementor.quiz.core.exceptions.EmentorApiError') {
        toast.error('Eroare: ' + data.message, {
          duration: 5000,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true
        })
      }
    }

    // Always reject the promise to propagate the error further
    return Promise.reject(error)
  }
)

export default apiClient
