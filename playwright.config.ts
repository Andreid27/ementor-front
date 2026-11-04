import { defineConfig } from '@playwright/test'

/**
 * End-to-end tests against a fully local stack (see e2e/README.md). Start the stack with `npm run e2e:up`;
 * Playwright starts the frontend itself, pointed at the local Keycloak and profile-service.
 */
export default defineConfig({
  testDir: './e2e/tests',
  globalSetup: './e2e/global-setup.ts',
  timeout: 120_000,
  expect: { timeout: 20_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:3000',
    // The installed Google Chrome; set E2E_BUNDLED_CHROMIUM=1 to use Playwright's own (npx playwright install chromium)
    channel: process.env.E2E_BUNDLED_CHROMIUM ? undefined : 'chrome',
    viewport: { width: 1440, height: 900 },
    // Traces never finish writing under Node 26 with this Playwright; a video and the console (see fixtures) do
    video: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000/login',
    // Never reuse a dev server: one started normally talks to production Keycloak
    reuseExistingServer: false,
    timeout: 240_000,
    env: {
      NEXT_PUBLIC_KEYCLOAK_URL: 'http://localhost:8180',
      NEXT_PUBLIC_KEYCLOAK_REALM: 'e-mentor',
      NEXT_PUBLIC_PROFILE_SERVICE_HOST: 'http://localhost:49202'
    }
  }
})
