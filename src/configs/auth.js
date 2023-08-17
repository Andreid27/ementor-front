import * as apiSpec from '../apiSpec'

export default {
  meEndpoint: 'http://localhost:49200/api/redisTokens/tokens',
  loginEndpoint: 'http://localhost:49201/user/authenticate',
  registerEndpoint: apiSpec.USER_SERVICE + '/register',
  storageTokenKeyName: 'accessToken',
  onTokenExpiration: 'refreshToken' // logout | refreshToken
}
