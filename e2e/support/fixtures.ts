/**
 * The test fixture every e2e spec uses.
 *
 * The app still sends the services this stack does not run (users, lessons, quizzes, notifications) to
 * NEXT_PUBLIC_PROD_HOST. Every request to e-mentor.ro is aborted before it leaves the browser, so a test can
 * never reach production. If the app ever tries production's Keycloak, it was started without the e2e
 * settings and the test fails.
 *
 * On a failure the browser console is attached to the report (Playwright's traces do not finish writing
 * on the Node version this project uses).
 */
import { writeFileSync } from 'node:fs'
import { test as base, expect, type BrowserContext } from '@playwright/test'
import { PHOTO } from './stack'

// Any scheme, any subdomain, any port, with or without a path
const PRODUCTION = /^https?:\/\/([a-z0-9-]+\.)*e-mentor\.ro(:\d+)?([/?#]|$)/i
const GOOGLE_PHOTOS = /^https:\/\/lh\d*\.googleusercontent\.com\//i

/**
 * Abort every request to production from this browser context, and answer Google photo links with the local
 * test image so the suite needs no network; returns the list of production requests that were stopped.
 */
export const blockProduction = async (context: BrowserContext): Promise<string[]> => {
  const blocked: string[] = []
  await context.route(PRODUCTION, route => {
    blocked.push(`${route.request().method()} ${route.request().url()}`)

    return route.abort('blockedbyclient')
  })
  await context.route(GOOGLE_PHOTOS, route =>
    route.fulfill({ path: PHOTO, contentType: 'image/png', headers: { 'access-control-allow-origin': '*' } })
  )

  return blocked
}

export const test = base.extend<{ blockedProductionRequests: string[]; consoleOnFailure: void }>({
  blockedProductionRequests: [
    async ({ context }, use) => {
      const blocked = await blockProduction(context)
      await use(blocked)
      expect(
        blocked.filter(request => request.includes('/auth/')),
        'the app tried production Keycloak: start the frontend with the e2e settings (npm run test:e2e does)'
      ).toEqual([])
    },
    { auto: true }
  ],
  consoleOnFailure: [
    async ({ page }, use, testInfo) => {
      const lines: string[] = []
      page.on('console', message => {
        if (!message.text().includes('ERR_BLOCKED_BY_CLIENT')) lines.push(`[${message.type()}] ${message.text()}`)
      })
      page.on('pageerror', error => lines.push(`[pageerror] ${error.message}`))
      page.on('response', response => {
        if (response.status() >= 400) lines.push(`[http ${response.status()}] ${response.request().method()} ${response.url()}`)
      })
      await use()
      if (testInfo.status !== testInfo.expectedStatus) {
        const path = testInfo.outputPath('browser-console.txt')
        writeFileSync(path, lines.join('\n'))
        await testInfo.attach('browser-console', { path, contentType: 'text/plain' })
      }
    },
    { auto: true }
  ]
})

export { expect }
