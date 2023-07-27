export default {
  meEndpoint: 'http://localhost:49200/api/redisTokens/tokens',
  loginEndpoint: 'http://localhost:49200/user/authenticate',
  registerEndpoint: '/jwt/register',
  storageTokenKeyName: 'accessToken',
  onTokenExpiration: 'refreshToken' // logout | refreshToken
}
