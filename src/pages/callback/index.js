// ** React Imports
import { use, useEffect, useState } from 'react'
import FallbackSpinner from 'src/@core/components/spinner'
import BlankLayout from 'src/@core/layouts/BlankLayout'
import { useAuth } from 'src/hooks/useAuth'
import axios from 'axios'
import authConfig from 'src/configs/auth'

const KeycloakCallback = () => {
  const [error, setError] = useState(null)

  const auth = useAuth()

  useEffect(() => {
    var querystring = require('querystring');

    let keycloakParams = new URL(document.location.toString()).searchParams
    const authorizationCode = keycloakParams.get('code')
    const sessionState = keycloakParams.get('session_state')

    if (authorizationCode) {
      let accessTokenParams = {
        grant_type: "authorization_code",
        client_id: authConfig.clientId,
        code: authorizationCode,
        redirect_uri: `${window.location.protocol + "//" + window.location.host}/callback/`,
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
    }
  }, [])

  let accessToken = window.localStorage.getItem(authConfig.storageTokenKeyName)

  const redirect = () => {
    console.log("Redirecting")
    window.location.href = '/'
  }

  return (
    accessToken ? redirect : <FallbackSpinner />
  )
}
KeycloakCallback.getLayout = page => <BlankLayout>{page}</BlankLayout>
KeycloakCallback.guestGuard = true

export default KeycloakCallback
