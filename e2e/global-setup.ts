/**
 * Fails fast, with the fix, when the local stack is not running, and warms the dev server up.
 */
import { chromium } from '@playwright/test'
import { blockProduction } from './support/fixtures'
import { FRONTEND_URL, KEYCLOAK_URL, MAILPIT_URL, PROFILE_SERVICE_URL, REALM } from './support/stack'

// The dev server compiles a page the first time it is opened and may then reload the open pages;
// opening them all once up front keeps that from happening in the middle of a test
const PAGES = ['/login', '/callback', '/register', '/dashboards/analytics', '/acl', '/404']

const reachable = async (url: string) => {
  try {
    await fetch(url)

    return true
  } catch {
    return false
  }
}

export default async function globalSetup() {
  const missing: string[] = []
  if (!(await reachable(`${KEYCLOAK_URL}/realms/${REALM}`))) missing.push(`Keycloak (${KEYCLOAK_URL})`)
  if (!(await reachable(`${MAILPIT_URL}/api/v1/messages`))) missing.push(`Mailpit (${MAILPIT_URL})`)
  if (!(await reachable(`${PROFILE_SERVICE_URL}/student-profile/profile-prerequire`))) {
    missing.push(`profile-service (${PROFILE_SERVICE_URL})`)
  }
  if (missing.length) {
    throw new Error(`The e2e stack is not running: ${missing.join(', ')}. Start it with: npm run e2e:up`)
  }

  const browser = await chromium.launch({ channel: process.env.E2E_BUNDLED_CHROMIUM ? undefined : 'chrome' })
  const context = await browser.newContext()
  await blockProduction(context)
  const page = await context.newPage()
  for (const path of PAGES) {
    await page.goto(`${FRONTEND_URL}${path}`, { timeout: 180_000 }).catch(() => {})
    await page.waitForLoadState('networkidle', { timeout: 60_000 }).catch(() => {})
  }
  // Keycloak renders its sign-up page slowly the first time too
  await page.goto(`${FRONTEND_URL}/login`)
  await page.waitForURL(url => url.href.startsWith(KEYCLOAK_URL), { timeout: 60_000 }).catch(() => {})
  await page.getByRole('link', { name: 'Register' }).click({ timeout: 30_000 }).catch(() => {})
  await browser.close()
}
