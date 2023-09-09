import * as apiSpec from '../apiSpec'

export default {
  meEndpoint: 'http://localhost:49200/api/redisTokens/tokens',
  loginEndpoint: 'https://api.e-mentor.ro/service1/user/authenticate',
  registerEndpoint: apiSpec.PROD_HOST + apiSpec.USER_SERVICE + '/register',
  storageTokenKeyName: 'accessToken',
  onTokenExpiration: 'refreshToken' // logout | refreshToken
}
