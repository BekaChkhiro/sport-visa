/**
 * Smoke spec — minimal "is it alive?" checks.
 *
 * These tests run in CI after every push and must stay fast (<30 s total).
 * They verify: the app starts, the landing page renders, and auth fixtures
 * deliver authenticated sessions without going through the signin form again.
 */

import { expect, test as base } from '@playwright/test';
import { test as authTest } from '../fixtures/index.js';

// ── Unauthenticated smoke ─────────────────────────────────────────────────────

base.describe('smoke — public', () => {
  base('landing page loads and has a title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/sport.?visa/i);
    // The app shell renders without a JS error
    await expect(page.locator('body')).toBeVisible();
  });

  base('signin page is reachable', async ({ page }) => {
    await page.goto('/auth/signin');
    // Email + password inputs present
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
  });
});

// ── Authenticated smoke ───────────────────────────────────────────────────────

authTest.describe('smoke — auth fixtures', () => {
  authTest(
    'footballerPage lands on /dashboard/footballer without signin form',
    async ({ footballerPage }) => {
      await footballerPage.goto('/dashboard/footballer');
      await expect(footballerPage).toHaveURL(/\/dashboard\/footballer/);
      // Must NOT be bounced back to the signin form
      await expect(footballerPage.locator('#email')).not.toBeVisible();
    },
  );

  authTest('clubPage lands on /dashboard/club without signin form', async ({ clubPage }) => {
    await clubPage.goto('/dashboard/club');
    await expect(clubPage).toHaveURL(/\/dashboard\/club/);
    await expect(clubPage.locator('#email')).not.toBeVisible();
  });

  authTest('adminPage lands on /admin without signin form', async ({ adminPage }) => {
    await adminPage.goto('/admin');
    await expect(adminPage).toHaveURL(/\/admin/);
    await expect(adminPage.locator('#email')).not.toBeVisible();
  });
});
