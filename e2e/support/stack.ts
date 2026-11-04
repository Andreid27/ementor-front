/**
 * Where the local e2e stack lives. Keep in sync with e2e/stack/config.sh.
 */
import path from 'node:path'

export const FRONTEND_URL = 'http://localhost:3000'
export const KEYCLOAK_URL = 'http://localhost:8180'
export const REALM = 'e-mentor'
export const SERVER_CLIENT = 'e-mentor-server'
export const SERVER_SECRET = 'e2e-server-secret'
export const MAILPIT_URL = 'http://localhost:8025'
export const PROFILE_SERVICE_URL = 'http://localhost:49202'
export const POSTGRES_CONTAINER = 'postgres_dev'
export const E2E_DATABASE = 'profile_service_e2e'
export const BACKEND_DIR = process.env.BACKEND_DIR || path.resolve(__dirname, '../../../backend')

export const PASSWORD = 'E2e-Test-Pass-1'
export const PHOTO = path.resolve(__dirname, '../fixtures/profile-photo.png')
export const GOOGLE_PHOTO_URL = 'https://lh3.googleusercontent.com/a/e2e-google-photo=s96-c'
