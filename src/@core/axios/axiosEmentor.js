import axios from 'axios'
import store from '../../store/index'
import * as apiSpec from '../../apiSpec'
import { verifyToken } from './token-validator'
import toast from 'react-hot-toast'
import { deleteTokens, deleteUser, updateTokens } from 'src/store/apps/user'
import authConfig from 'src/configs/auth'

let isRefreshing = false;
let refreshSubscribers = [];

// Function to get token from your state
function getCurrentToken() {
  return window.localStorage.getItem(authConfig.storageTokenKeyName);
}

function onRefreshed(newToken) {
  refreshSubscribers.map(cb => cb(newToken));
  refreshSubscribers = [];
}

// Create an instance of axios
const apiClient = axios.create({
  baseURL: apiSpec.PROD_HOST,
  timeout: 300000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor
apiClient.interceptors.request.use(
  async config => {
    try {
      const token = getCurrentToken(); // Get current token from localStorage

      if (!token) {
        return config;
      }

      const verifiedToken = await verifyToken(token); // Wait for token verification/refresh

      // Set the verified token in the Authorization header
      config.headers['Authorization'] = `Bearer ${verifiedToken}`;

      // If the request involves file upload (multipart form data)
      if (config.data instanceof FormData) {
        config.headers['Content-Type'] = 'multipart/form-data';
      }

      return config; // Return the modified config to proceed with the request
    } catch (error) {
      return Promise.reject(error);
    }
  },
  error => Promise.reject(error)
);

// Add a response interceptor to handle token refresh
apiClient.interceptors.response.use(
  response => response,
  async error => {
    if (error.response && error.response.status === 403) {
      store.dispatch(deleteUser());
      store.dispatch(deleteTokens());
      window.localStorage.removeItem('userData');
      window.localStorage.removeItem(authConfig.storageTokenKeyName);
      window.location.replace('/login');
    }

    if (error.response && error.response.status === 401) {
      const token = getCurrentToken();

      if (!token || isRefreshing) {
        return Promise.reject(error);
      }

      isRefreshing = true;

      try {
        const newToken = await verifyToken(token);
        onRefreshed(newToken);
        isRefreshing = false;

        // Retry the failed request with the new token
        error.config.headers['Authorization'] = `Bearer ${newToken}`;

        return apiClient(error.config);
      } catch (refreshError) {
        isRefreshing = false;

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
