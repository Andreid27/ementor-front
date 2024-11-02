import * as apiSpec from '../apiSpec'

export default {
  meEndpoint: 'http://localhost:49200/api/redisTokens/tokens',
  authCode: `${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM}/protocol/openid-connect/auth?client_id=e-mentor&response_type=code&redirect_uri=`,
  loginEndpoint: `${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM}/protocol/openid-connect/token`,
  registerEndpoint: apiSpec.PROD_HOST + apiSpec.USER_SERVICE + '/register',
  logoutEndpoint: `${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM}/protocol/openid-connect/logout`,
  storageTokenKeyName: 'accessToken',
  onTokenExpiration: 'refreshToken',
  clientId: 'e-mentor',
}
