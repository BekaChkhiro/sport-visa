/**
 * Auth setup project — signs in each test role once and persists the browser
 * storage state so main test suites can skip the signin form entirely.
 *
 * Runs as the "setup" project (see playwright.config.ts) before chromium /
 * webkit. Each test here produces a .playwright/<role>.json file consumed by
 * the fixtures in e2e/fixtures/index.ts.
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import { test as setup, type Page } from '@playwright/test';

import { E2E_CREDENTIALS } from '../../prisma/seed-e2e.js';

const stateDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../.playwright');

// Storage-state file paths shared with e2e/fixtures/index.ts
export const STORAGE_STATE = {
  admin: path.join(stateDir, 'admin.json'),
  footballerVerified: path.join(stateDir, 'footballer-verified.json'),
  footballerPending: path.join(stateDir, 'footballer-pending.json'),
  clubVerified: path.join(stateDir, 'club-verified.json'),
  clubPending: path.join(stateDir, 'club-pending.json'),
} as const;

fs.mkdirSync(stateDir, { recursive: true });

// ── Shared sign-in helper ─────────────────────────────────────────────────────

async function signIn(page: Page, email: string, password: string, stateFile: string) {
  await page.goto('/auth/signin');
  await page.locator('#email').fill(email);
  await page.locator('#password').fill(password);
  await page.locator('button[type="submit"]').click();
  // Middleware redirects verified users away from /auth/signin to their
  // role-specific dashboard or /admin. Wait for any protected-route URL.
  await page.waitForURL(/\/(dashboard|admin)/, { timeout: 20_000 });
  await page.context().storageState({ path: stateFile });
}

// ── One setup test per role ───────────────────────────────────────────────────

setup('sign in as admin', async ({ page }) => {
  await signIn(
    page,
    E2E_CREDENTIALS.admin.email,
    E2E_CREDENTIALS.admin.password,
    STORAGE_STATE.admin,
  );
});

setup('sign in as verified footballer', async ({ page }) => {
  await signIn(
    page,
    E2E_CREDENTIALS.footballerVerified.email,
    E2E_CREDENTIALS.footballerVerified.password,
    STORAGE_STATE.footballerVerified,
  );
});

setup('sign in as pending footballer', async ({ page }) => {
  await signIn(
    page,
    E2E_CREDENTIALS.footballerPending.email,
    E2E_CREDENTIALS.footballerPending.password,
    STORAGE_STATE.footballerPending,
  );
});

setup('sign in as verified club', async ({ page }) => {
  await signIn(
    page,
    E2E_CREDENTIALS.clubVerified.email,
    E2E_CREDENTIALS.clubVerified.password,
    STORAGE_STATE.clubVerified,
  );
});

setup('sign in as pending club', async ({ page }) => {
  await signIn(
    page,
    E2E_CREDENTIALS.clubPending.email,
    E2E_CREDENTIALS.clubPending.password,
    STORAGE_STATE.clubPending,
  );
});
