// ** Next Imports
import Head from 'next/head'
import { Router } from 'next/router'

// ** Store Imports
import { store } from 'src/store'
import { Provider } from 'react-redux'

// ** Loader Import
import NProgress from 'nprogress'

// ** Emotion Imports
import { CacheProvider } from '@emotion/react'

// ** Config Imports
import 'src/configs/i18n'
import { defaultACLObj } from 'src/configs/acl'
import themeConfig from 'src/configs/themeConfig'

// ** Fake-DB Import
import 'src/@fake-db'

// ** Third Party Import
import { Toaster } from 'react-hot-toast'

// ** Component Imports
import UserLayout from 'src/layouts/UserLayout'
import AclGuard from 'src/@core/components/auth/AclGuard'
import ThemeComponent from 'src/@core/theme/ThemeComponent'
import AuthGuard from 'src/@core/components/auth/AuthGuard'
import GuestGuard from 'src/@core/components/auth/GuestGuard'

// ** Spinner Import
import Spinner from 'src/@core/components/spinner'

// ** Contexts
import { AuthProvider } from 'src/context/AuthContext'
import { SettingsConsumer, SettingsProvider } from 'src/@core/context/settingsContext'

// ** Styled Components
import ReactHotToast from 'src/@core/styles/libs/react-hot-toast'

// ** Utils Imports
import { createEmotionCache } from 'src/@core/utils/create-emotion-cache'

// ** Prismjs Styles
import 'prismjs'
import 'prismjs/themes/prism-tomorrow.css'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-tsx'

// ** React Perfect Scrollbar Style
import 'react-perfect-scrollbar/dist/css/styles.css'
import 'src/iconify-bundle/icons-bundle-react'

// ** Global css styles
import '../../styles/globals.css'

// ** Added imports for cookie handling
import { useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import { parseCookies } from 'nookies'

const clientSideEmotionCache = createEmotionCache()

// ** Pace Loader
if (themeConfig.routingLoader) {
  Router.events.on('routeChangeStart', () => {
    NProgress.start()
  })
  Router.events.on('routeChangeError', () => {
    NProgress.done()
  })
  Router.events.on('routeChangeComplete', () => {
    NProgress.done()
  })
}

const Guard = ({ children, authGuard, guestGuard }) => {
  if (guestGuard) {
    return <GuestGuard fallback={<Spinner />}>{children}</GuestGuard>
  } else if (!guestGuard && !authGuard) {
    return <>{children}</>
  } else {
    return <AuthGuard fallback={<Spinner />}>{children}</AuthGuard>
  }
}

import { IncomingMessage } from 'http'
import { AppProps, AppContext } from 'next/app'
import { SSRKeycloakProvider, SSRCookies } from '@react-keycloak/ssr'

const keycloakCfg = {
  realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM,
  url: process.env.NEXT_PUBLIC_KEYCLOAK_URL,
  clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID,
  onLoad: 'check-sso', // Silently check if the user is logged in
  checkLoginIframe: true, // Enables the iframe feature for session management
  enableLogging: true,    // Enables Keycloak logging
}

function InitialProps(cookies) {
  this.cookies = cookies;
}

// ** Configure JSS & ClassName
function App(props) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps, initialCookies } = props;

  const [cookies, setCookies] = useState(initialCookies);

  useEffect(() => {
    // This will run on the client after the component mounts
    const clientSideCookies = Cookies.get(); // Get all cookies
    setCookies(clientSideCookies);
  }, []);

  console.log('cookies  ', cookies)

  // Variables
  const contentHeightFixed = Component.contentHeightFixed ?? false

  const getLayout =
    Component.getLayout ?? (page => <UserLayout contentHeightFixed={contentHeightFixed}>{page}</UserLayout>)
  const setConfig = Component.setConfig ?? undefined
  const authGuard = Component.authGuard ?? true
  const guestGuard = Component.guestGuard ?? false
  const aclAbilities = Component.acl ?? defaultACLObj

  return (
    <Provider store={store}>
      <CacheProvider value={emotionCache}>
        <Head>
          <title>{`${themeConfig.templateName} - Mentorul tău digital`}</title>
          <meta
            name='description'
            content={`${themeConfig.templateName} – Aplicația ta pentru admitere. Creează un cont chiar acum și începe pregătirea!`}
          />
          <meta name='keywords' content='E-mentor, Admitere, Bac, Pregătire' />
          <meta name='viewport' content='initial-scale=1, width=device-width' />
        </Head>
        <SSRKeycloakProvider
          keycloakConfig={keycloakCfg}
          onEvent={(eventType, error) => {
            // Log each event with detailed information
            console.log('Keycloak Event:', eventType);
            if (error) {
              console.error('Error on Keycloak event:', eventType, error);
            }

            switch (eventType) {
              case 'onReady':
                console.log('Keycloak is ready');
                break;
              case 'onAuthSuccess':
                console.log('User successfully authenticated');
                break;
              case 'onAuthError':
                console.error('Authentication error:', error);
                break;
              case 'onAuthRefreshSuccess':
                console.log('Token was successfully refreshed');
                break;
              case 'onAuthRefreshError':
                console.error('Error refreshing token:', error);
                break;
              case 'onAuthLogout':
                console.log('User logged out');
                break;
              case 'onTokenExpired':
                console.log('Token has expired');
                break;
              default:
                console.log('Unhandled Keycloak event:', eventType);
            }
          }}
          onToken={({ token, idToken }) => {
            // Log token details for debugging
            console.log('Token received:', token);
            console.log('ID Token received:', idToken);
          }}
          persistor={SSRCookies(cookies)}
        >
          <AuthProvider>
            <SettingsProvider {...(setConfig ? { pageSettings: setConfig() } : {})}>
              <SettingsConsumer>
                {({ settings }) => {
                  return (
                    <ThemeComponent settings={settings}>
                      <Guard authGuard={authGuard} guestGuard={guestGuard}>
                        <AclGuard aclAbilities={aclAbilities} guestGuard={guestGuard} authGuard={authGuard}>
                          {getLayout(<Component {...pageProps} />)}
                        </AclGuard>
                      </Guard>
                      <ReactHotToast>
                        <Toaster position={settings.toastPosition} toastOptions={{ className: 'react-hot-toast' }} />
                      </ReactHotToast>
                    </ThemeComponent>
                  )
                }}
              </SettingsConsumer>
            </SettingsProvider>
          </AuthProvider>
        </SSRKeycloakProvider>
      </CacheProvider>
    </Provider>
  )
}

App.getInitialProps = async (AppContext) => {
  // Use parseCookies from nookies for server-side cookie parsing
  const initialCookies = parseCookies(AppContext.ctx);

  return {
    initialCookies
  };
};

export default App
