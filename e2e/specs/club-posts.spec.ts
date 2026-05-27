/**
 * Club posts spec — composer at /posts/new + the resulting post showing up
 * on /clubs/[id]?tab=news + /clubs/[id]/posts/[postId].
 *
 * Coverage:
 *   • Access control: non-CLUB users bounced off /posts/new.
 *   • Validation: submitting an empty form renders inline field errors (not
 *     a toast).
 *   • Happy path: fill title + body → submit → redirect to /dashboard/club.
 *   • Public surface: seeded post appears on the club's news tab and the
 *     post-detail page renders title + body.
 *   • Footballer viewer of the post-detail page sees the like button with
 *     correct aria-pressed initial state (annotation in 10-club-detail).
 */

import { expect, test } from '@playwright/test';

import { test as authTest } from '../fixtures/index.js';
import {
  addClubPostDb,
  createVerifiedClubWithProfile,
  deleteUser,
  disconnect,
} from '../helpers/db.js';

test.afterAll(async () => {
  await disconnect();
});

// ── Access control ───────────────────────────────────────────────────────────

test.describe('post composer — access control', () => {
  test('unauthenticated /posts/new redirects to /auth/signin', async ({ page }) => {
    await page.goto('/posts/new');
    await page.waitForURL(/\/auth\/signin/, { timeout: 20_000 });
    await expect(page.locator('#email')).toBeVisible();
  });
});

authTest.describe('post composer — role gates', () => {
  authTest('footballer role on /posts/new is bounced to /dashboard', async ({ footballerPage }) => {
    await footballerPage.goto('/posts/new');
    await footballerPage.waitForURL(/\/dashboard/, { timeout: 20_000 });
    await expect(footballerPage).not.toHaveURL(/\/posts\/new/);
  });
});

// ── Composer rendering ───────────────────────────────────────────────────────

authTest.describe('post composer — rendering', () => {
  authTest('renders the title + body fields and publish button', async ({ clubPage }) => {
    await clubPage.goto('/posts/new');

    await expect(clubPage.getByRole('heading', { name: 'ახალი სიახლე' })).toBeVisible();
    await expect(clubPage.getByLabel(/^სათაური$/)).toBeVisible();
    await expect(clubPage.getByLabel(/^ტექსტი$/)).toBeVisible();
    await expect(clubPage.getByRole('button', { name: 'გამოქვეყნება' })).toBeVisible();
  });
});

// ── Validation ───────────────────────────────────────────────────────────────

authTest.describe('post composer — validation', () => {
  authTest('submitting empty fields surfaces inline errors (not a toast)', async ({ clubPage }) => {
    await clubPage.goto('/posts/new');

    await clubPage.getByRole('button', { name: 'გამოქვეყნება' }).click();

    // The composer marks title + body inputs with aria-invalid when the
    // server-action schema rejects empty strings.
    await expect(clubPage.getByLabel(/^სათაური$/)).toHaveAttribute('aria-invalid', 'true', {
      timeout: 10_000,
    });
    await expect(clubPage.getByLabel(/^ტექსტი$/)).toHaveAttribute('aria-invalid', 'true');
  });
});

// ── Happy path ───────────────────────────────────────────────────────────────

test.describe('post composer — publish', () => {
  test('publishing redirects to /dashboard/club', async ({ browser }, testInfo) => {
    const club = await createVerifiedClubWithProfile(
      `posts-publish-${testInfo.workerIndex}-${Date.now()}`,
    );

    // Sign in via the form rather than the clubPage fixture so we own the
    // session (and can delete the user afterwards without disturbing others).
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto('/auth/signin');
    await page.locator('#email').fill(club.email);
    await page.locator('#password').fill(club.password);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 20_000 });

    await page.goto('/posts/new');
    await page.getByLabel(/^სათაური$/).fill('ახალი სიახლე ტესტისთვის');
    await page.getByLabel(/^ტექსტი$/).fill('სიახლის ტექსტი — გამოქვეყნებულია E2E ტესტიდან.');
    await page.getByRole('button', { name: 'გამოქვეყნება' }).click();

    await page.waitForURL(/\/dashboard\/club/, { timeout: 20_000 });
    await expect(page).toHaveURL(/\/dashboard\/club/);

    await context.close();
    await deleteUser(club.email);
  });
});

// ── Public news tab + detail page ────────────────────────────────────────────

authTest.describe('club posts — public surface', () => {
  authTest(
    'seeded post appears on /clubs/[id]?tab=news and the detail page renders body',
    async ({ footballerPage }, testInfo) => {
      const club = await createVerifiedClubWithProfile(
        `posts-public-${testInfo.workerIndex}-${Date.now()}`,
      );
      const post = await addClubPostDb(
        club.clubProfileId,
        'სატესტო პოსტი',
        'ეს არის E2E ტესტის სიახლე — სრული ტექსტი.',
      );

      // News tab on the club detail page lists the post as a link card.
      await footballerPage.goto(`/clubs/${club.clubProfileId}?tab=news`);
      await expect(footballerPage.getByRole('heading', { name: 'სატესტო პოსტი' })).toBeVisible({
        timeout: 10_000,
      });

      // Clicking the article navigates to the post detail page.
      await footballerPage.getByRole('heading', { name: 'სატესტო პოსტი' }).click();
      await footballerPage.waitForURL(new RegExp(`/clubs/${club.clubProfileId}/posts/${post.id}`), {
        timeout: 20_000,
      });

      // Detail page renders the full title + body and a like button (footballer
      // viewer → canLike=true).
      await expect(
        footballerPage.getByRole('heading', { level: 1, name: 'სატესტო პოსტი' }),
      ).toBeVisible();
      await expect(
        footballerPage.getByText('ეს არის E2E ტესტის სიახლე — სრული ტექსტი.'),
      ).toBeVisible();
      await expect(footballerPage.getByRole('button', { name: 'მოწონება' })).toBeVisible();

      await deleteUser(club.email);
    },
  );

  authTest(
    'club viewer on the post detail does NOT see the interactive like button',
    async ({ clubPage }, testInfo) => {
      const club = await createVerifiedClubWithProfile(
        `posts-public-club-${testInfo.workerIndex}-${Date.now()}`,
      );
      const post = await addClubPostDb(club.clubProfileId, 'კლუბის სიახლე', 'მოკლე ბოდი.');

      await clubPage.goto(`/clubs/${club.clubProfileId}/posts/${post.id}`);

      await expect(
        clubPage.getByRole('heading', { level: 1, name: 'კლუბის სიახლე' }),
      ).toBeVisible();
      // Non-footballer viewers see the heart icon as a static label, not a
      // toggle button labeled "მოწონება".
      await expect(clubPage.getByRole('button', { name: 'მოწონება' })).toHaveCount(0);

      await deleteUser(club.email);
    },
  );
});
