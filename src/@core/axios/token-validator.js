import jwt_decode from 'jwt-decode'
import { useState } from 'react'
import store from '../../store/index'
import axios from 'axios'
import * as apiSpec from '../../apiSpec'
import { deleteTokens, deleteUser, updateTokens } from 'src/store/apps/user'
import { AuthProvider, logout as handleLogout } from 'src/context/AuthContext'
import authConfig from 'src/configs/auth'

export const verifyToken = async token => {
  var querystring = require('querystring');
  let decodedToken = jwt_decode(token)
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
        let accessTokenParams = {
          grant_type: "refresh_token",
          client_id: authConfig.clientId,
          refresh_token: getRefreshToken(),
        }

        axios
          .post(authConfig.loginEndpoint, querystring.stringify(accessTokenParams),
            {
              headers: {
                "Content-Type": "application/x-www-form-urlencoded"
              }
            })
          .then(async response => {
            console.log(response)
            if (response.status === 200) {
              console.log(response.data)
              auth.login(response.data, () => {
                setError('email', {
                  type: 'manual',
                  message: 'Email-ul sau Parola sunt invalide'
                })
              })
            } else {
              window.location.href = authConfig.authCode
            }
            console.log(response.data)
          })
          .catch(error => {
            console.log(error)

            // window.location.href = authConfig.authCode
          })

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
    return token
  }
}

function getRefreshToken() {
  const state = store.getState()
  let refreshTokens = state.user.tokens.refreshToken

  return refreshTokens
}

export default verifyToken
