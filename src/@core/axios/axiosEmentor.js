import axios from 'axios'
import store from '../../store/index'

// Function to get token from your state
function getCurrentToken() {
  // Replace this with actual logic to retrieve the token from your state

  const state = store.getState()
  let accessTokens = state.user.tokens.accessToken

  return accessTokens
}

// Create an instance of axios
const apiClient = axios.create({
  baseURL: 'https://api.e-mentor.ro',
  timeout: 3000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add a request interceptor
apiClient.interceptors.request.use(
  config => {
    const token = getCurrentToken()
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }

    // If the data is a file, set the Content-Type to multipart/form-data
    if (config.data instanceof FormData) {
      config.headers['Content-Type'] = 'multipart/form-data'
    }

    return config
  },
  error => Promise.reject(error)
)

export default apiClient
