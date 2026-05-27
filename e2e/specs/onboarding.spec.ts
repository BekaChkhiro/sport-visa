/**
 * Onboarding-wizard spec — footballer + club happy paths.
 *
 * Each test creates a fresh verified-email, profile-less user directly in
 * Postgres (bypassing /auth/signup so we don't burn the signup-per-IP
 * rate-limit budget) and signs them in via the form. The dashboard layout
 * sees they have no profile and bounces them to /onboarding, where the
 * appropriate wizard renders.
 *
 * The wizard uses Radix `Select` triggers and toggle-buttons; helpers
 * below encapsulate the gestures so the test body reads like a script.
 */

import { expect, test, type Page } from '@playwright/test';

import { createVerifiedNoProfileUser, deleteUser, disconnect } from '../helpers/db.js';

test.afterAll(async () => {
  await disconnect();
});

async function signIn(page: Page, email: string, password: string) {
  await page.goto('/auth/signin');
  await page.locator('#email').fill(email);
  await page.locator('#password').fill(password);
  await page.locator('button[type="submit"]').click();
}

async function selectFromRadix(page: Page, triggerLabel: string, optionLabel: string) {
  // Each Radix Select trigger immediately follows its <Label> in the DOM —
  // we open the label-scoped Field, then pick the right SelectItem.
  const field = page
    .locator('div', { has: page.locator('label', { hasText: triggerLabel }) })
    .first();
  await field.locator('button[role="combobox"], [role="combobox"]').first().click();
  await page.getByRole('option', { name: optionLabel }).click();
}

test.describe('onboarding — footballer wizard', () => {
  test('walks through all 4 steps and lands on /dashboard/footballer', async ({
    page,
  }, testInfo) => {
    const user = await createVerifiedNoProfileUser(
      'FOOTBALLER',
      `wizard-${testInfo.workerIndex}-${Date.now()}`,
    );

    await signIn(page, user.email, user.password);
    await page.waitForURL(/\/onboarding/, { timeout: 20_000 });
    await expect(
      page.getByRole('heading', { name: /შექმენი შენი ფეხბურთელის პროფილი/ }),
    ).toBeVisible();

    // ── Step 1: personal info ────────────────────────────────────────
    await page.locator('input[type="date"]').fill('2000-05-14');
    await selectFromRadix(page, 'ეროვნება', 'საქართველო');
    await page.getByLabel(/ქალაქი/).fill('თბილისი');
    await selectFromRadix(page, 'ქვეყანა', 'საქართველო');

    await page.getByRole('button', { name: /გაგრძელება/ }).click();

    // ── Step 2: sport info ───────────────────────────────────────────
    // Positions are <button> elements with the 2-letter code as text.
    await page.getByRole('button', { name: 'ST', exact: true }).click();
    // Dominant foot button (Right)
    await page.getByRole('button', { name: 'მარჯვენა', exact: true }).click();
    await page.getByLabel(/სიმაღლე/).fill('182');
    await page.getByLabel(/წონა/).fill('75');

    await page.getByRole('button', { name: /გაგრძელება/ }).click();

    // ── Step 3: media (no inputs, just continue) ─────────────────────
    await expect(page.getByRole('heading', { name: /ფოტო და ვიდეო/ })).toBeVisible();
    await page.getByRole('button', { name: /გაგრძელება/ }).click();

    // ── Step 4: review + submit ──────────────────────────────────────
    await expect(page.getByRole('heading', { name: /პროფილის გადახედვა/ })).toBeVisible();
    await page.getByRole('button', { name: /პროფ\. გაქტივება/ }).click();

    await page.waitForURL(/\/dashboard\/footballer/, { timeout: 30_000 });
    // No signin form on the destination
    await expect(page.locator('#email')).not.toBeVisible();

    await deleteUser(user.email);
  });

  test('blocks advancement on step 1 if required fields are empty', async ({ page }, testInfo) => {
    const user = await createVerifiedNoProfileUser(
      'FOOTBALLER',
      `wizard-empty-${testInfo.workerIndex}-${Date.now()}`,
    );

    await signIn(page, user.email, user.password);
    await page.waitForURL(/\/onboarding/, { timeout: 20_000 });

    // Click Continue without filling anything — validator must surface errors
    // and the heading for step 1 should still be visible.
    await page.getByRole('button', { name: /გაგრძელება/ }).click();

    // Field error appears for the missing date-of-birth
    await expect(page.getByText(/დაბადების თარიღი სავალდებულოა/)).toBeVisible();
    // Step 1 heading still visible — we did not advance
    await expect(page.getByRole('heading', { name: /პირადი ინფორმაცია/ })).toBeVisible();

    await deleteUser(user.email);
  });
});

test.describe('onboarding — club wizard', () => {
  test('walks through all 3 steps and lands on /dashboard/club', async ({ page }, testInfo) => {
    const user = await createVerifiedNoProfileUser(
      'CLUB',
      `wizard-${testInfo.workerIndex}-${Date.now()}`,
    );

    await signIn(page, user.email, user.password);
    await page.waitForURL(/\/onboarding/, { timeout: 20_000 });
    await expect(page.getByRole('heading', { name: /შექმენი შენი კლუბის პროფილი/ })).toBeVisible();

    // ── Step 1: identity ─────────────────────────────────────────────
    await page.getByLabel(/კლუბის სახელი/).fill('FC E2E Test');
    await page.getByLabel(/დაარსების წელი/).fill('1999');
    await selectFromRadix(page, 'ქვეყანა', 'საქართველო');
    await page.getByLabel(/ქალაქი/).fill('თბილისი');
    await page.getByLabel(/ლიგა \/ დივიზიონი/).fill('Erovnuli Liga');

    await page.getByRole('button', { name: /გაგრძელება/ }).click();

    // ── Step 2: media ────────────────────────────────────────────────
    await expect(page.getByRole('heading', { name: /ლოგო და ფოტო/ })).toBeVisible();
    await page.getByRole('button', { name: /გაგრძელება/ }).click();

    // ── Step 3: review + submit ──────────────────────────────────────
    await expect(page.getByRole('heading', { name: /გადახედვა/ })).toBeVisible();
    await expect(page.getByText('FC E2E Test')).toBeVisible();
    await page.getByRole('button', { name: /კლუბის გააქტ\./ }).click();

    await page.waitForURL(/\/dashboard\/club/, { timeout: 30_000 });
    await expect(page.locator('#email')).not.toBeVisible();

    await deleteUser(user.email);
  });

  test('blocks advancement on step 1 if the club name is empty', async ({ page }, testInfo) => {
    const user = await createVerifiedNoProfileUser(
      'CLUB',
      `wizard-empty-${testInfo.workerIndex}-${Date.now()}`,
    );

    await signIn(page, user.email, user.password);
    await page.waitForURL(/\/onboarding/, { timeout: 20_000 });

    await page.getByRole('button', { name: /გაგრძელება/ }).click();

    await expect(page.getByText(/კლუბის სახელი სავალდებულოა/)).toBeVisible();
    await expect(page.getByRole('heading', { name: /კლუბის ვინაობა/ })).toBeVisible();

    await deleteUser(user.email);
  });
});
