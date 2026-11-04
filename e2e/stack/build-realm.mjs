// Builds the local test realm from the devops realm export.
//
// The export's secrets are masked, so everything that needs one gets a local test value, and anything that
// would reach outside this machine (Google sign-in, the real SMTP server, the custom theme) is switched off
// or pointed at the local stack.
//
// Usage: node build-realm.mjs <export.json> <out.json> <server-client-secret> <smtp-host>
import { readFileSync, writeFileSync } from 'node:fs'

const [exportPath, outPath, serverSecret, smtpHost] = process.argv.slice(2)
const realm = JSON.parse(readFileSync(exportPath, 'utf8'))

// The custom keycloakify theme is not in the public image; the default theme has the same flow
delete realm.loginTheme
delete realm.accountTheme
delete realm.emailTheme
realm.attributes = { ...realm.attributes, frontendUrl: '' }

// Verification emails go to Mailpit, which the tests read
realm.smtpServer = {
  host: smtpHost,
  port: '1025',
  from: 'no-reply@e-mentor.test',
  fromDisplayName: 'E-mentor (e2e)',
  auth: 'false',
  ssl: 'false',
  starttls: 'false'
}

// Keys are generated fresh by the local Keycloak
realm.components['org.keycloak.keys.KeyProvider'] = []

// Google sign-in cannot run locally
realm.identityProviders = (realm.identityProviders || []).map(idp => ({ ...idp, enabled: false }))

for (const client of realm.clients) {
  if (client.clientId === 'e-mentor-server') client.secret = serverSecret
}

// Prod stores pictureId and the Google picture as user attributes; the export (taken before that)
// still drops attributes the user profile does not declare
const profileComponent = realm.components['org.keycloak.userprofile.UserProfileProvider'][0]
const profileConfig = JSON.parse(profileComponent.config['kc.user.profile.config'][0])
profileConfig.unmanagedAttributePolicy = 'ENABLED'
profileComponent.config['kc.user.profile.config'] = [JSON.stringify(profileConfig)]

writeFileSync(outPath, JSON.stringify(realm, null, 2))
console.log(`realm written to ${outPath}`)
