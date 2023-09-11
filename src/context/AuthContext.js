// authContext.js
// ** React Imports
import { createContext, useEffect, useState } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** Axios
import axios from 'axios'

// ** Config
import authConfig from 'src/configs/auth'

// ** Redux Imports
import { useDispatch, useSelector } from 'react-redux'
import { addUser, deleteTokens, deleteUser, updateTokens } from '../store/apps/user/index' // import addUser and deleteUser actions

// ** Defaults
const defaultProvider = {
  user: null,
  loading: true,
  setUser: () => null,
  setLoading: () => Boolean,
  login: () => Promise.resolve(),
  logout: () => Promise.resolve()
}
const AuthContext = createContext(defaultProvider)

const AuthProvider = ({ children }) => {
  // ** States
  const [user, setUser] = useState(defaultProvider.user)
  const [loading, setLoading] = useState(defaultProvider.loading)
  const userData = useSelector(state => state.user.data)

  // ** Hooks
  const router = useRouter()
  const dispatch = useDispatch() // get access to dispatch function

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName)
      if (storedToken) {
        setLoading(true)
        if (userData) {
          setUser(userData)
          setLoading(false)
        } else {
          // handle the case when there's no user data in local storage
        }
      } else {
        setLoading(false)
      }
    }
    initAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleLogin = (params, errorCallback) => {
    axios
      .post(authConfig.loginEndpoint, params)
      .then(async response => {
        window.localStorage.setItem(authConfig.storageTokenKeyName, response.data.accessToken)
        window.localStorage.setItem('userData', JSON.stringify(response.data.userData))
        setUser({ ...response.data.userData })
        dispatch(updateTokens({ accessToken: response.data.accessToken, refreshToken: response.data.refreshToken }))
        dispatch(addUser(response.data.userData)) // dispatch addUser action with user data
        const returnUrl = router.query.returnUrl
        const redirectURL = returnUrl && returnUrl !== '/' ? returnUrl : '/'
        router.replace(redirectURL)
      })
      .catch(err => {
        if (errorCallback) errorCallback(err)
      })
  }

  const handleLogout = () => {
    dispatch(deleteUser()) // dispatch deleteUser action with no payload
    dispatch(deleteTokens()) // dispatch deleteUser action with no payload
    setUser(null)
    window.localStorage.removeItem('userData')
    window.localStorage.removeItem(authConfig.storageTokenKeyName)
    router.push('/login')
  }

  const values = {
    user,
    loading,
    setUser,
    setLoading,
    login: handleLogin,
    logout: handleLogout
  }

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>
}

export { AuthContext, AuthProvider }
