// ** JWT import
import jwtDecode from 'jwt-decode'

// ** Mock Adapter
import mock from 'src/@fake-db/mock'

// ** Default AuthConfig
import defaultAuthConfig from 'src/configs/auth'

const users = [
  {
    id: 1,
    role: 'admin',
    password: 'admin',
    fullName: 'John Doe',
    username: 'johndoe',
    email: 'admin@vuexy.com'
  },
  {
    id: 2,
    role: 'client',
    password: 'client',
    fullName: 'Jane Doe',
    username: 'janedoe',
    email: 'client@vuexy.com'
  }
]

// Simple base64 token helper for fake-db (no real signing needed)
const createFakeToken = payload => {
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }))
  const body = btoa(JSON.stringify(payload))

  return `${header}.${body}.fakesignature`
}

mock.onPost('/jwt/login').reply(request => {
  const { email, password } = JSON.parse(request.data)

  let error = {
    email: ['Something went wrong']
  }
  const user = users.find(u => u.email === email && u.password === password)
  if (user) {
    const accessToken = createFakeToken({ id: user.id })

    const response = {
      accessToken,
      userData: { ...user, password: undefined }
    }

    return [200, response]
  } else {
    error = {
      email: ['email or Password is Invalid']
    }

    return [400, { error }]
  }
})
mock.onPost('/jwt/register').reply(request => {
  if (request.data.length > 0) {
    const { email, password, username } = JSON.parse(request.data)
    const isEmailAlreadyInUse = users.find(user => user.email === email)
    const isUsernameAlreadyInUse = users.find(user => user.username === username)

    const error = {
      email: isEmailAlreadyInUse ? 'This email is already in use.' : null,
      username: isUsernameAlreadyInUse ? 'This username is already in use.' : null
    }
    if (!error.username && !error.email) {
      const { length } = users
      let lastIndex = 0
      if (length) {
        lastIndex = users[length - 1].id
      }

      const userData = {
        id: lastIndex + 1,
        email,
        password,
        username,
        avatar: null,
        fullName: '',
        role: 'admin'
      }
      users.push(userData)
      const accessToken = createFakeToken({ id: userData.id })
      const user = { ...userData }
      delete user.password
      const response = { accessToken }

      return [200, response]
    }

    return [200, { error }]
  } else {
    return [401, { error: 'Invalid Data' }]
  }
})
mock.onGet('/auth/me').reply(config => {
  // ** Get token from header
  // @ts-ignore
  const token = config.headers.Authorization

  // ** Default response
  let response = [200, {}]

  try {
    const decoded = jwtDecode(token)

    // @ts-ignore
    const userId = decoded.id

    // ** Get user that matches id in token
    const userData = JSON.parse(JSON.stringify(users.find(u => u.id === userId)))
    delete userData.password

    // ** return 200 with user data
    response = [200, { userData }]
  } catch (err) {
    // ** If token is invalid
    if (defaultAuthConfig.onTokenExpiration === 'logout') {
      response = [401, { error: { error: 'Invalid User' } }]
    } else {
      // ** Try to decode and refresh
      try {
        const decoded = jwtDecode(token)

        // @ts-ignore
        const userId = decoded.id
        const user = users.find(u => u.id === userId)
        const accessToken = createFakeToken({ id: userId })

        window.localStorage.setItem(defaultAuthConfig.storageTokenKeyName, accessToken)
        const obj = { userData: { ...user, password: undefined } }
        response = [200, obj]
      } catch {
        response = [401, { error: { error: 'Invalid User' } }]
      }
    }
  }

  return response
})
