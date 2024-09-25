// authContext.js
// ** React Imports
import { createContext, useEffect, useState } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** Axios
import jwt from 'jsonwebtoken';

// ** Config
import authConfig from 'src/configs/auth'

// ** Redux Imports
import { useDispatch, useSelector } from 'react-redux'
import { addUser, deleteTokens, deleteUser, updateTokens } from '../store/apps/user/index' // import addUser and deleteUser actions
import { fetchData } from 'src/store/apps/dashboard'
import Cookies from 'universal-cookie'
import session from 'redux-persist/lib/storage/session';
import axios from 'axios';
import store from '../store/index'

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
  const cookies = new Cookies()

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

  const extractUserData = (decodedToken) => ({
    email: decodedToken.email,
    firstName: decodedToken.given_name,
    lastName: decodedToken.family_name,
    role: decodedToken.realm_access.roles.includes('PROFESSOR') ? 'PROFESSOR' : 'STUDENT',
    profilePicture: decodedToken.picture
  });

  const handleLogin = (params, errorCallback) => {
    const parsedToken = jwt.decode(params.access_token);
    const extractedUserData = extractUserData(parsedToken);


    window.localStorage.setItem(authConfig.storageTokenKeyName, params.access_token)
    window.localStorage.setItem('userData', extractedUserData)
    cookies.set('userData', extractedUserData, {
      path: '/',
      domain: '.e-mentor.ro',
      sameSite: 'None',
      secure: true
    })
    setUser({ ...extractedUserData })
    dispatch(updateTokens({ accessToken: params.access_token, refreshToken: params.refresh_token, sessionState: params.session_state })) // dispatch updateTokens action with tokens
    dispatch(addUser(extractedUserData)) // dispatch addUser action with user data
    const returnUrl = router.query.returnUrl
    const redirectURL = returnUrl && returnUrl !== '/' ? returnUrl : '/'
    router.replace(redirectURL)
    dispatch(fetchData())

  }

  const handleLogout = () => {
    var querystring = require('querystring');
    axios.post(authConfig.logoutEndpoint, querystring.stringify({
      client_id: 'e-mentor',
      refresh_token: getRefreshToken()
    }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    )
    dispatch(deleteUser()) // dispatch deleteUser action with no payload
    dispatch(deleteTokens()) // dispatch deleteUser action with no payload
    setUser(null)
    window.localStorage.removeItem('userData')
    window.localStorage.removeItem(authConfig.storageTokenKeyName)
    cookies.remove('userData', { path: '/', domain: '.e-mentor.ro', sameSite: 'None', secure: true })
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

function getRefreshToken() {
  const state = store.getState()
  let refreshTokens = state.user.tokens.refreshToken

  return refreshTokens
}

export { AuthContext, AuthProvider }
