/**
 * Profile spec — /profile/edit, gallery section, /profile/preview.
 *
 * Covers the three target surfaces for T14.3:
 *   - Footballer profile edit page (/profile/edit) — section rendering and
 *     server-action driven saves.
 *   - Gallery section embedded in the edit page — count, upload affordance,
 *     and a pre-seeded gallery item showing up in /profile/preview.
 *   - Preview page (/profile/preview) — banner + hero + sport-info render.
 *
 * Read-only assertions use the shared verified-footballer fixture. Tests
 * that mutate the profile or seed gallery rows create their own ad-hoc
 * verified footballer (via createVerifiedFootballerWithProfile) so other
 * tests sharing the seeded user aren't disturbed.
 */

import { expect, test, type Page } from '@playwright/test';

import { test as authTest } from '../fixtures/index.js';
import {
  addGalleryItem,
  createVerifiedFootballerWithProfile,
  deleteUser,
  disconnect,
} from '../helpers/db.js';

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

test.describe('profile — access control', () => {
  test('unauthenticated /profile/edit redirects to /auth/signin', async ({ page }) => {
    await page.goto('/profile/edit');
    await page.waitForURL(/\/auth\/signin/, { timeout: 20_000 });
    await expect(page.locator('#email')).toBeVisible();
  });

  test('unauthenticated /profile/preview redirects to /auth/signin', async ({ page }) => {
    await page.goto('/profile/preview');
    await page.waitForURL(/\/auth\/signin/, { timeout: 20_000 });
    await expect(page.locator('#email')).toBeVisible();
  });
});

authTest.describe('profile — role gates', () => {
  authTest('club role on /profile/edit is bounced to /dashboard/club', async ({ clubPage }) => {
    await clubPage.goto('/profile/edit');
    await clubPage.waitForURL(/\/dashboard\/club/, { timeout: 20_000 });
    await expect(clubPage).toHaveURL(/\/dashboard\/club/);
  });

  authTest('club role on /profile/preview is bounced to /dashboard/club', async ({ clubPage }) => {
    await clubPage.goto('/profile/preview');
    await clubPage.waitForURL(/\/dashboard\/club/, { timeout: 20_000 });
    await expect(clubPage).toHaveURL(/\/dashboard\/club/);
  });
});

// ── Edit page rendering ──────────────────────────────────────────────────────

authTest.describe('profile — edit page rendering', () => {
  authTest(
    'renders all sections (personal/sport/gallery/career/agent)',
    async ({ verifiedFootballerPage }) => {
      await verifiedFootballerPage.goto('/profile/edit');

      await expect(
        verifiedFootballerPage.getByRole('heading', { name: /პროფილის რედაქტირება/ }),
      ).toBeVisible();

      // Each section's heading is a styled <h2> with the Georgian label
      await expect(
        verifiedFootballerPage.getByRole('heading', { name: 'პირადი ინფორმაცია' }),
      ).toBeVisible();
      await expect(
        verifiedFootballerPage.getByRole('heading', { name: 'სპორტული ინფორმაცია' }),
      ).toBeVisible();
      await expect(
        verifiedFootballerPage.getByRole('heading', { name: 'ფოტო გალერეა' }),
      ).toBeVisible();
      await expect(
        verifiedFootballerPage.getByRole('heading', { name: 'კარიერის ისტორია' }),
      ).toBeVisible();
      await expect(
        verifiedFootballerPage.getByRole('heading', { name: 'აგენტის ინფორმაცია' }),
      ).toBeVisible();
    },
  );

  authTest(
    'personal-info section pre-fills firstName from seeded profile',
    async ({ verifiedFootballerPage }) => {
      await verifiedFootballerPage.goto('/profile/edit');
      await expect(
        verifiedFootballerPage.getByRole('heading', { name: 'პირადი ინფორმაცია' }),
      ).toBeVisible();
      // The "სახელი" (firstName) label is wired to its <Input> via shared
      // Field wrapper. seed-e2e sets firstName="Giorgi".
      await expect(verifiedFootballerPage.getByLabel(/^სახელი/).first()).toHaveValue(/Giorgi/);
    },
  );
});

// ── Edit page — save flows ───────────────────────────────────────────────────

test.describe('profile — edit save flows', () => {
  test('updating sport info shows the success indicator', async ({ page }, testInfo) => {
    const user = await createVerifiedFootballerWithProfile(
      `sport-save-${testInfo.workerIndex}-${Date.now()}`,
    );

    await signIn(page, user.email, user.password);
    await page.goto('/profile/edit');
    await expect(page.getByRole('heading', { name: 'სპორტული ინფორმაცია' })).toBeVisible();

    // Toggle a second position (the seed has ST; add CM)
    await page.getByRole('button', { name: 'CM', exact: true }).click();
    await expect(page.getByRole('button', { name: 'CM', exact: true })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    // The sport-info section's save button is the one inside that card —
    // scope to the sport-info section so we don't click the personal-info
    // save button by mistake.
    const sportSection = page.locator('section').filter({
      has: page.getByRole('heading', { name: 'სპორტული ინფორმაცია' }),
    });
    await sportSection.getByRole('button', { name: /^შენახვა$/ }).click();

    await expect(sportSection.getByText('✓ შენახულია')).toBeVisible({ timeout: 10_000 });

    await deleteUser(user.email);
  });

  test('updating personal info (bio) shows the success indicator', async ({ page }, testInfo) => {
    const user = await createVerifiedFootballerWithProfile(
      `personal-save-${testInfo.workerIndex}-${Date.now()}`,
    );

    await signIn(page, user.email, user.password);
    await page.goto('/profile/edit');

    const personalSection = page.locator('section').filter({
      has: page.getByRole('heading', { name: 'პირადი ინფორმაცია' }),
    });
    // Bio textarea — only <textarea> in the personal section.
    await personalSection.locator('textarea').fill('მოკლე ბიო E2E ტესტისთვის.');
    await personalSection.getByRole('button', { name: /^შენახვა$/ }).click();

    await expect(personalSection.getByText('✓ შენახულია')).toBeVisible({ timeout: 10_000 });

    await deleteUser(user.email);
  });
});

// ── Gallery section ──────────────────────────────────────────────────────────

authTest.describe('profile — gallery section (read-only)', () => {
  authTest(
    'shows the upload affordance and 0/8 count when empty',
    async ({ verifiedFootballerPage }) => {
      await verifiedFootballerPage.goto('/profile/edit');

      const gallerySection = verifiedFootballerPage.locator('section').filter({
        has: verifiedFootballerPage.getByRole('heading', { name: 'ფოტო გალერეა' }),
      });

      // Verified-footballer seed has no gallery items
      await expect(gallerySection.getByText(/0\/8 ფოტო/)).toBeVisible();

      // Upload tile (the + button) is interactive
      await expect(gallerySection.getByRole('button', { name: 'ფოტოს ატვირთვა' })).toBeVisible();
      // Secondary "+ ატვირთვა" button visible because count < max
      await expect(gallerySection.getByRole('button', { name: /^\+ ატვირთვა$/ })).toBeVisible();
    },
  );
});

test.describe('profile — gallery rendering with seeded photo', () => {
  test('a seeded gallery item shows in /profile/preview as a thumbnail', async ({
    page,
  }, testInfo) => {
    const user = await createVerifiedFootballerWithProfile(
      `gallery-preview-${testInfo.workerIndex}-${Date.now()}`,
    );
    await addGalleryItem(user.profileId, 'test/gallery/e2e-photo-1.jpg', 0);

    await signIn(page, user.email, user.password);
    await page.goto('/profile/preview');

    const gallerySection = page.locator('section').filter({
      has: page.getByRole('heading', { name: 'ფოტო გალერეა' }),
    });
    await expect(gallerySection).toBeVisible();

    // The seeded item renders as an <img> with the expected alt text. We
    // don't assert the src URL because R2_PUBLIC_BASE_URL may not be set
    // in test env (the URL is composed but image may 404 — DOM rendering
    // is what we're verifying).
    await expect(gallerySection.locator('img[alt="ფოტო 1"]')).toBeVisible();
    // Cover badge on the first item
    await expect(gallerySection.getByText('გარეკ.').first()).toBeVisible();

    await deleteUser(user.email);
  });
});

// ── Preview page rendering ───────────────────────────────────────────────────

authTest.describe('profile — preview rendering', () => {
  authTest(
    'renders the preview banner, name, and sport-info section',
    async ({ verifiedFootballerPage }) => {
      await verifiedFootballerPage.goto('/profile/preview');

      // Banner with "club's view" copy
      await expect(verifiedFootballerPage.getByText(/პრევიუ — კლუბების ხედვა/)).toBeVisible();

      // Footballer name as the page-level h1 (matches seed-e2e firstName + lastName)
      await expect(
        verifiedFootballerPage.getByRole('heading', { name: /Giorgi Footballer/ }),
      ).toBeVisible();

      // Sport info section is always shown when the profile has positions /
      // height / weight; verifiedFootballer seed has positions=['ST'].
      await expect(
        verifiedFootballerPage.getByRole('heading', { name: 'სპორტული ინფორმაცია' }),
      ).toBeVisible();

      // "Return to edit" button is present at the top
      await expect(
        verifiedFootballerPage.getByRole('link', { name: /რედ\. დაბრუნება/ }),
      ).toHaveAttribute('href', '/profile/edit');
    },
  );

  authTest(
    '"return to edit" link navigates back to /profile/edit',
    async ({ verifiedFootballerPage }) => {
      await verifiedFootballerPage.goto('/profile/preview');
      await verifiedFootballerPage.getByRole('link', { name: /რედ\. დაბრუნება/ }).click();
      await verifiedFootballerPage.waitForURL(/\/profile\/edit/, { timeout: 20_000 });
      await expect(
        verifiedFootballerPage.getByRole('heading', { name: /პროფილის რედაქტირება/ }),
      ).toBeVisible();
    },
  );
});
