/**
 * The local Keycloak, through the service account profile-service itself uses.
 */
import { KEYCLOAK_URL, PASSWORD, REALM, SERVER_CLIENT, SERVER_SECRET } from './stack'

export interface KeycloakUser {
  id: string
  email: string
  emailVerified: boolean
  attributes?: Record<string, string[]>
}

const tokenUrl = `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`

const serviceToken = async (): Promise<string> => {
  const response = await fetch(tokenUrl, {
    method: 'POST',
    body: new URLSearchParams({ grant_type: 'client_credentials', client_id: SERVER_CLIENT, client_secret: SERVER_SECRET })
  })
  if (!response.ok) throw new Error(`Keycloak service token: ${response.status}`)

  return (await response.json()).access_token
}

const admin = async (path: string, init: RequestInit = {}): Promise<any> => {
  const response = await fetch(`${KEYCLOAK_URL}/admin/realms/${REALM}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${await serviceToken()}`, 'Content-Type': 'application/json' }
  })
  if (!response.ok) throw new Error(`Keycloak ${init.method || 'GET'} ${path}: ${response.status} ${await response.text()}`)

  return response.status === 200 ? response.json() : null
}

export const findUserByEmail = async (email: string): Promise<KeycloakUser | null> => {
  const users = await admin(`/users?email=${encodeURIComponent(email)}&exact=true`)

  return users[0] || null
}

export const realmRolesOf = async (userId: string): Promise<string[]> =>
  (await admin(`/users/${userId}/role-mappings/realm`)).map((role: { name: string }) => role.name)

/** A user who has already verified their email, as Google sign-in or an admin would create one. */
export const createVerifiedUser = async (user: {
  email: string
  firstName: string
  lastName: string
  attributes?: Record<string, string[]>
}): Promise<KeycloakUser> => {
  await admin('/users', {
    method: 'POST',
    body: JSON.stringify({
      username: user.email,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      enabled: true,
      emailVerified: true,
      attributes: user.attributes,
      credentials: [{ type: 'password', value: PASSWORD, temporary: false }]
    })
  })

  return (await findUserByEmail(user.email)) as KeycloakUser
}

/** An access token for a user, as the app gets it (the e-mentor client allows the password grant). */
export const userToken = async (email: string): Promise<string> => {
  const response = await fetch(tokenUrl, {
    method: 'POST',
    body: new URLSearchParams({ grant_type: 'password', client_id: 'e-mentor', username: email, password: PASSWORD })
  })
  if (!response.ok) throw new Error(`Keycloak password grant for ${email}: ${response.status} ${await response.text()}`)

  return (await response.json()).access_token
}
