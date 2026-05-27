/**
 * Club roster spec — roster section on /profile/club/edit + the rendered
 * roster table on the public detail page /clubs/[id]?tab=roster.
 *
 * Coverage:
 *   • Add a roster entry via the inline form (name + position + jersey #).
 *   • Delete a pre-seeded roster entry.
 *   • Public roster tab renders the seeded entry in the table.
 *   • Footballer view of /clubs/[id] shows the "გამოწერა" CTA (annotation A
 *     on wireframe 10-club-detail — subscribe is footballer-only).
 *
 * All mutating specs use an isolated verified club so they don't disturb the
 * shared clubVerified fixture user.
 */

import { expect, test, type Page } from '@playwright/test';

import { test as authTest } from '../fixtures/index.js';
import {
  addClubRosterEntryDb,
  createVerifiedClubWithProfile,
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

// ── Add flow ─────────────────────────────────────────────────────────────────

test.describe('club roster — add', () => {
  test('adding a roster entry surfaces it in the list and flashes saved', async ({
    page,
  }, testInfo) => {
    const club = await createVerifiedClubWithProfile(
      `roster-add-${testInfo.workerIndex}-${Date.now()}`,
    );

    await signIn(page, club.email, club.password);
    await page.goto('/profile/club/edit');

    const rosterSection = page.locator('section').filter({
      has: page.getByRole('heading', { name: 'მიმდინარე შემადგენლობა' }),
    });

    await rosterSection.getByRole('button', { name: '+ მოთამაშის დამატება' }).click();

    await rosterSection.getByLabel(/^მოთამაშის სახელი/).fill('ი. ბაბუნაშვილი');
    await rosterSection.getByLabel(/^№/).fill('9');

    await rosterSection.getByRole('button', { name: /^შენახვა$/ }).click();

    // The list now contains the new entry.
    await expect(rosterSection.getByText('ი. ბაბუნაშვილი')).toBeVisible({ timeout: 10_000 });
    await expect(rosterSection.getByText('✓ შენახულია')).toBeVisible({ timeout: 5_000 });

    await deleteUser(club.email);
  });
});

// ── Delete ───────────────────────────────────────────────────────────────────

test.describe('club roster — delete', () => {
  test('deleting a pre-seeded roster entry removes it from the list', async ({
    page,
  }, testInfo) => {
    const club = await createVerifiedClubWithProfile(
      `roster-delete-${testInfo.workerIndex}-${Date.now()}`,
    );
    await addClubRosterEntryDb(club.clubProfileId, 'გ. მამარდაშვილი', 'GK', 1);

    await signIn(page, club.email, club.password);
    await page.goto('/profile/club/edit');

    const rosterSection = page.locator('section').filter({
      has: page.getByRole('heading', { name: 'მიმდინარე შემადგენლობა' }),
    });

    const row = rosterSection.getByText('გ. მამარდაშვილი');
    await expect(row).toBeVisible();

    await rosterSection.getByRole('button', { name: /^წაშ\.$/ }).click();
    await expect(row).not.toBeVisible({ timeout: 10_000 });

    await deleteUser(club.email);
  });
});

// ── Public render ────────────────────────────────────────────────────────────

authTest.describe('club roster — public render', () => {
  authTest(
    'seeded entry renders on /clubs/[id]?tab=roster',
    async ({ footballerPage }, testInfo) => {
      const club = await createVerifiedClubWithProfile(
        `roster-public-${testInfo.workerIndex}-${Date.now()}`,
      );
      await addClubRosterEntryDb(club.clubProfileId, 'ნ. კვირკველია', 'CM', 8);

      await footballerPage.goto(`/clubs/${club.clubProfileId}?tab=roster`);

      await expect(
        footballerPage.getByRole('heading', { name: 'მიმდინარე შემადგენლობა' }),
      ).toBeVisible();
      await expect(footballerPage.getByText('ნ. კვირკველია')).toBeVisible();
      await expect(footballerPage.getByText('CM')).toBeVisible();
      // Jersey number renders in the # column (tabular-nums cell).
      await expect(footballerPage.getByRole('cell', { name: '8' })).toBeVisible();

      await deleteUser(club.email);
    },
  );
});

// ── Footballer-only subscribe CTA ────────────────────────────────────────────

authTest.describe('club detail — viewer-specific CTAs', () => {
  authTest('footballer viewer sees the subscribe CTA', async ({ footballerPage }, testInfo) => {
    const club = await createVerifiedClubWithProfile(
      `roster-subscribe-${testInfo.workerIndex}-${Date.now()}`,
    );

    await footballerPage.goto(`/clubs/${club.clubProfileId}`);
    await expect(footballerPage.getByRole('button', { name: 'გამოწერა' })).toBeVisible({
      timeout: 10_000,
    });

    await deleteUser(club.email);
  });

  authTest('club viewer does NOT see the subscribe CTA', async ({ clubPage }, testInfo) => {
    const club = await createVerifiedClubWithProfile(
      `roster-subscribe-club-${testInfo.workerIndex}-${Date.now()}`,
    );

    await clubPage.goto(`/clubs/${club.clubProfileId}`);
    // Hero renders (club name h1) but no subscribe button is present.
    await expect(clubPage.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(clubPage.getByRole('button', { name: 'გამოწერა' })).toHaveCount(0);

    await deleteUser(club.email);
  });
});
