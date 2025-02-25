import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import FallbackSpinner from 'src/@core/components/spinner'
import BlankLayout from 'src/@core/layouts/BlankLayout'
import { useAuth } from 'src/hooks/useAuth'
import authConfig from 'src/configs/auth'

const KeycloakCallback = () => {
  const [authorizationCompleted, setAuthorizationCompleted] = useState(false)
  const router = useRouter()
  const auth = useAuth()

  useEffect(() => {
    var querystring = require('querystring');
    const { query } = router
    const authorizationCode = query.code

    if (authorizationCode) {
      let accessTokenParams = {
        grant_type: "authorization_code",
        client_id: authConfig.clientId,
        code: authorizationCode,
        redirect_uri: `${window.location.protocol}//${window.location.host}/callback/`,
      }

      axios
        .post(authConfig.loginEndpoint, querystring.stringify(accessTokenParams), {
          headers: { "Content-Type": "application/x-www-form-urlencoded" }
        })
        .then(response => {
          if (response.status === 200) {
            auth.login(response.data)
            setAuthorizationCompleted(true)
          }
        })
        .catch(error => {
          router.push('/login')
          console.log(error)
        })
    }
  }, [router])

  useEffect(() => {
    if (authorizationCompleted) {
      router.push('/')
    }
  }, [authorizationCompleted, router])

  useEffect(() => {
    if (!router.isReady) return
    if (typeof window !== "undefined") {
      let accessToken = window.localStorage.getItem(authConfig.storageTokenKeyName)
      if (accessToken) {
        router.push('/')
      }
    }

  }, [router, router.isReady, router.query])


  return <FallbackSpinner />
}

KeycloakCallback.getLayout = page => <BlankLayout>{page}</BlankLayout>
KeycloakCallback.guestGuard = true

export default KeycloakCallback

export async function getServerSideProps() {
  return { props: {} }
}
