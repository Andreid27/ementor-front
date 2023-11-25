import jwt_decode from 'jwt-decode'
import { useState } from 'react'
import store from '../../store/index'
import axios from 'axios'
import * as apiSpec from '../../apiSpec'
import { deleteTokens, deleteUser, updateTokens } from 'src/store/apps/user'
import { AuthProvider, logout as handleLogout } from 'src/context/AuthContext'
import authConfig from 'src/configs/auth'
import { useDispatch } from 'react-redux'
import { AuthContext } from 'src/context/AuthContext'
import { useRouter } from 'next/router'

export const verifyToken = async token => {
  let decodedToken = jwt_decode(token)
  console.log('Decoded Token', decodedToken)
  let currentDate = new Date()

  const handleLogoutHere = () => {
    store.dispatch(deleteUser())
    store.dispatch(deleteTokens())
    window.localStorage.removeItem('userData')
    window.localStorage.removeItem(authConfig.storageTokenKeyName)
    window.location.replace('/login')
  }

  if (decodedToken.exp * 1000 < currentDate.getTime() + 60) {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await axios.post(`${apiSpec.PROD_HOST + apiSpec.USER_SERVICE}/refresh-token`, null, {
          headers: {
            Authorization: `Bearer ${getRefreshToken()}`
          }
        })
        console.log('Token expired.')
        console.log('New token', response.data.accessToken)
        window.localStorage.setItem(authConfig.storageTokenKeyName, response.data.accessToken)
        store.dispatch(
          updateTokens({ accessToken: response.data.accessToken, refreshToken: response.data.refreshToken })
        )
        resolve(response.data.accessToken)
      } catch (error) {
        console.error(error)
        handleLogoutHere()
        reject(error)
      }
    })
  } else {
    console.log('Valid token')
    console.log(decodedToken.exp * 1000)
    console.log(currentDate.getTime())
    console.log(getRefreshToken())

    return token
  }
}

function getRefreshToken() {
  const state = store.getState()
  let refreshTokens = state.user.tokens.refreshToken

  return refreshTokens
}

export default verifyToken