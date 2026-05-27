/**
 * Club profile spec — /profile/club/edit + /profile/club/preview.
 *
 * Covers access control, edit-page section rendering, the identity-section
 * save round-trip, and preview-page tab routing for the four tabs (bio,
 * roster, stadium, news).
 *
 * The `clubPage` fixture's seeded club (FC Tbilisi) is used for read-only
 * checks. Tests that mutate the profile create an isolated verified club via
 * createVerifiedClubWithProfile so they don't disturb other specs sharing
 * the seeded user.
 */

import { expect, test, type Page } from '@playwright/test';

import { test as authTest } from '../fixtures/index.js';
import { createVerifiedClubWithProfile, deleteUser, disconnect } from '../helpers/db.js';

test.afterAll(async () => {
  await disconnect();
});

async function signIn(page: Page, email: string, password: string) {
  await page.goto('/auth/signin');
  await page.locator('#email').fill(email);
  await page.locator('#password').fill(password);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 20_000 });
}

// ── Access control ───────────────────────────────────────────────────────────

test.describe('club profile — access control', () => {
  test('unauthenticated /profile/club/edit redirects to /auth/signin', async ({ page }) => {
    await page.goto('/profile/club/edit');
    await page.waitForURL(/\/auth\/signin/, { timeout: 20_000 });
    await expect(page.locator('#email')).toBeVisible();
  });

  test('unauthenticated /profile/club/preview redirects to /auth/signin', async ({ page }) => {
    await page.goto('/profile/club/preview');
    await page.waitForURL(/\/auth\/signin/, { timeout: 20_000 });
    await expect(page.locator('#email')).toBeVisible();
  });
});

authTest.describe('club profile — role gates', () => {
  authTest(
    'footballer role on /profile/club/edit is bounced to /dashboard',
    async ({ footballerPage }) => {
      await footballerPage.goto('/profile/club/edit');
      // Non-club users are redirected to /dashboard which then forwards to
      // /dashboard/footballer (or whatever role-home middleware resolves).
      await footballerPage.waitForURL(/\/dashboard/, { timeout: 20_000 });
      await expect(footballerPage).not.toHaveURL(/\/profile\/club\/edit/);
    },
  );

  authTest(
    'footballer role on /profile/club/preview is bounced to /dashboard',
    async ({ footballerPage }) => {
      await footballerPage.goto('/profile/club/preview');
      await footballerPage.waitForURL(/\/dashboard/, { timeout: 20_000 });
      await expect(footballerPage).not.toHaveURL(/\/profile\/club\/preview/);
    },
  );
});

// ── Edit page rendering ──────────────────────────────────────────────────────

authTest.describe('club profile — edit page rendering', () => {
  authTest('renders all club edit sections', async ({ clubPage }) => {
    await clubPage.goto('/profile/club/edit');

    await expect(
      clubPage.getByRole('heading', { name: /კლუბის პროფილის რედაქტირება/ }),
    ).toBeVisible();

    // Section headings are styled <h2>s with Georgian labels.
    await expect(clubPage.getByRole('heading', { name: 'ვინაობა' })).toBeVisible();
    await expect(clubPage.getByRole('heading', { name: 'მედია' })).toBeVisible();
    await expect(clubPage.getByRole('heading', { name: 'მიმდინარე შემადგენლობა' })).toBeVisible();
    await expect(clubPage.getByRole('heading', { name: 'ისტ. / ბიო' })).toBeVisible();
    await expect(clubPage.getByRole('heading', { name: 'ისტ. მოვლენები' })).toBeVisible();
    await expect(clubPage.getByRole('heading', { name: 'ხილვადობა' })).toBeVisible();
  });

  authTest('identity section pre-fills the seeded club name', async ({ clubPage }) => {
    await clubPage.goto('/profile/club/edit');
    const identitySection = clubPage.locator('section').filter({
      has: clubPage.getByRole('heading', { name: 'ვინაობა' }),
    });
    // seed-e2e sets name="FC Tbilisi"
    await expect(identitySection.getByLabel(/^კლუბის სახელი/).first()).toHaveValue(/FC Tbilisi/);
  });
});

// ── Identity save flow ───────────────────────────────────────────────────────

test.describe('club profile — identity save flow', () => {
  test('updating foundedYear shows the success indicator', async ({ page }, testInfo) => {
    const club = await createVerifiedClubWithProfile(
      `identity-save-${testInfo.workerIndex}-${Date.now()}`,
    );

    await signIn(page, club.email, club.password);
    await page.goto('/profile/club/edit');

    const identitySection = page.locator('section').filter({
      has: page.getByRole('heading', { name: 'ვინაობა' }),
    });

    await expect(identitySection).toBeVisible();
    const yearInput = identitySection.getByLabel(/^დაარსების წელი/).first();
    await yearInput.fill('1980');

    await identitySection.getByRole('button', { name: /^შენახვა$/ }).click();
    await expect(identitySection.getByText('✓ შენახულია')).toBeVisible({ timeout: 10_000 });

    await deleteUser(club.email);
  });
});

// ── Preview page rendering ───────────────────────────────────────────────────

authTest.describe('club profile — preview rendering', () => {
  authTest('renders the preview banner and hero', async ({ clubPage }) => {
    await clubPage.goto('/profile/club/preview');

    // Banner with the footballer-view copy.
    await expect(clubPage.getByText(/პრევიუ — ფეხბურთელების ხედვა/)).toBeVisible();

    // Club name as the page-level h1 (matches seed-e2e ClubProfile.name).
    await expect(clubPage.getByRole('heading', { name: /FC Tbilisi/ })).toBeVisible();

    // "Return to edit" button at the top of the preview points back at /edit.
    await expect(clubPage.getByRole('link', { name: /რედ\. დაბრუნება/ })).toHaveAttribute(
      'href',
      '/profile/club/edit',
    );
  });

  authTest('tabs switch the visible panel via ?tab= param', async ({ clubPage }) => {
    await clubPage.goto('/profile/club/preview');

    // Bio is the default tab — no ?tab= search param.
    await expect(clubPage).toHaveURL(/\/profile\/club\/preview(?:\?.*)?$/);

    // Click "შემ. სია" (roster) — URL acquires ?tab=roster.
    await clubPage.getByRole('button', { name: 'შემ. სია' }).click();
    await clubPage.waitForURL(/tab=roster/, { timeout: 20_000 });

    // Click "სტ. ინფ." (stadium).
    await clubPage.getByRole('button', { name: 'სტ. ინფ.' }).click();
    await clubPage.waitForURL(/tab=stadium/, { timeout: 20_000 });

    // Click "სიახლეები" (news).
    await clubPage.getByRole('button', { name: 'სიახლეები' }).click();
    await clubPage.waitForURL(/tab=news/, { timeout: 20_000 });
  });

  authTest('"return to edit" link navigates back to /profile/club/edit', async ({ clubPage }) => {
    await clubPage.goto('/profile/club/preview');
    await clubPage
      .getByRole('link', { name: /რედ\. დაბრუნება/ })
      .first()
      .click();
    await clubPage.waitForURL(/\/profile\/club\/edit/, { timeout: 20_000 });
    await expect(
      clubPage.getByRole('heading', { name: /კლუბის პროფილის რედაქტირება/ }),
    ).toBeVisible();
  });
});
