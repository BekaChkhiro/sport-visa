import { defineConfig, devices } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:3000';
const E2E_DB_URL =
  process.env.E2E_DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/sport_visa_e2e';

export default defineConfig({
  // Note: testDir is set per-project so the "setup" project can live in
  // e2e/setup/ while the browser projects only see e2e/specs/. A global
  // testDir would hide the setup files from discovery.
  globalSetup: './e2e/global-setup.ts',
  globalTeardown: './e2e/global-teardown.ts',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [['github'], ['html', { outputFolder: 'playwright-report', open: 'never' }]]
    : [['html', { open: 'on-failure' }]],
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    // Auth setup: signs in each role once and persists storage state
    { name: 'setup', testDir: './e2e/setup', testMatch: /.*\.setup\.ts$/ },
    {
      name: 'chromium',
      testDir: './e2e/specs',
      use: { ...devices['Desktop Chrome'] },
      dependencies: process.env.PLAYWRIGHT_BASE_URL ? [] : ['setup'],
    },
    {
      name: 'webkit',
      testDir: './e2e/specs',
      use: { ...devices['Desktop Safari'] },
      dependencies: process.env.PLAYWRIGHT_BASE_URL ? [] : ['setup'],
    },
  ],
  // No webServer when PLAYWRIGHT_BASE_URL is provided (running against Vercel preview).
  // Locally / in CI: start next dev bound to 127.0.0.1 (uv_interface_addresses workaround).
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: 'npm run dev -- -H 127.0.0.1',
        url: BASE_URL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        env: {
          ...process.env,
          DATABASE_URL: E2E_DB_URL,
          NEXT_PUBLIC_APP_URL: BASE_URL,
          AUTH_SECRET: process.env.AUTH_SECRET ?? 'e2e-test-secret-must-be-at-least-32-chars-here!',
          NEXTAUTH_URL: BASE_URL,
          NODE_ENV: 'test',
        },
      },
});
