import jwt_decode from 'jwt-decode'
import { useState } from 'react'
import store from '../../store/index'
import axios from 'axios'
import * as apiSpec from '../../apiSpec'
import { updateTokens } from 'src/store/apps/user'
import { logout as handleLogout } from 'src/context/AuthContext'
import authConfig from 'src/configs/auth'
import { useDispatch } from 'react-redux'
import { AuthContext } from 'src/context/AuthContext'

export const verifyToken = token => {
  let decodedToken = jwt_decode(token)
  console.log('Decoded Token', decodedToken)
  let currentDate = new Date()

  if (decodedToken.exp * 1000 < currentDate.getTime() + 60) {
    async function refreshToken() {
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
      } catch (error) {
        console.error(error)
        AuthContext.logout()
      }
    }
    refreshToken()

    return response.data.accessToken
  } else {
    console.log('Valid token')
    console.log(decodedToken.exp * 1000)
    console.log(currentDate.getTime())
    console.log(getRefreshToken())

    return token
  }
}

function getRefreshToken() {
  // Replace this with actual logic to retrieve the token from your state
  const state = store.getState()
  let refreshTokens = state.user.tokens.refreshToken

  return refreshTokens
}

export default verifyToken
