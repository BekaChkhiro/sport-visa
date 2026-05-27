/**
 * Club history spec — history-timeline section on /profile/club/edit + the
 * rendered events on the public detail page /clubs/[id].
 *
 * Coverage:
 *   • Open the inline add form, save a new event, see it appear in the list.
 *   • Inline year validation surfaces a field-level error rather than a toast.
 *   • Delete removes the event from the list.
 *   • A pre-seeded event renders on the public /clubs/[id] history tab.
 *
 * All mutating specs use an isolated verified club so they don't disturb the
 * shared clubVerified fixture user.
 */

import { expect, test, type Page } from '@playwright/test';

import { test as authTest } from '../fixtures/index.js';
import {
  addClubHistoryEventDb,
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

test.describe('club history — add', () => {
  test('adding an event surfaces it in the list and flashes saved', async ({ page }, testInfo) => {
    const club = await createVerifiedClubWithProfile(
      `history-add-${testInfo.workerIndex}-${Date.now()}`,
    );

    await signIn(page, club.email, club.password);
    await page.goto('/profile/club/edit');

    const historySection = page.locator('section').filter({
      has: page.getByRole('heading', { name: 'ისტ. მოვლენები' }),
    });

    await historySection.getByRole('button', { name: '+ მოვლენის დამატება' }).click();

    // The inline form is the muted card inside the section.
    await historySection.getByLabel(/^წელი/).fill('2005');
    await historySection.getByLabel(/^სათაური/).fill('პირველი ჩემპიონატი');
    await historySection
      .getByPlaceholder('მოვლენის დამატებითი ინფ.')
      .fill('სეზონის ფინალი თბილისში');

    await historySection.getByRole('button', { name: /^შენახვა$/ }).click();

    // List now contains "2005 · პირველი ჩემპიონატი"
    await expect(historySection.getByText(/2005.*პირველი ჩემპიონატი/)).toBeVisible({
      timeout: 10_000,
    });
    await expect(historySection.getByText('✓ შენახულია')).toBeVisible({ timeout: 5_000 });

    await deleteUser(club.email);
  });
});

// ── Validation ───────────────────────────────────────────────────────────────

test.describe('club history — validation', () => {
  test('year out of range surfaces an inline error', async ({ page }, testInfo) => {
    const club = await createVerifiedClubWithProfile(
      `history-validate-${testInfo.workerIndex}-${Date.now()}`,
    );

    await signIn(page, club.email, club.password);
    await page.goto('/profile/club/edit');

    const historySection = page.locator('section').filter({
      has: page.getByRole('heading', { name: 'ისტ. მოვლენები' }),
    });

    await historySection.getByRole('button', { name: '+ მოვლენის დამატება' }).click();

    // 1700 is below the min (1800) — server-action schema rejects it.
    await historySection.getByLabel(/^წელი/).fill('1700');
    await historySection.getByLabel(/^სათაური/).fill('გადასინჯვა');

    await historySection.getByRole('button', { name: /^შენახვა$/ }).click();

    // Server-action error renders inline (role="alert"), not as a toast.
    await expect(historySection.getByRole('alert').first()).toBeVisible({ timeout: 10_000 });

    await deleteUser(club.email);
  });
});

// ── Delete ───────────────────────────────────────────────────────────────────

test.describe('club history — delete', () => {
  test('deleting a pre-seeded event removes it from the list', async ({ page }, testInfo) => {
    const club = await createVerifiedClubWithProfile(
      `history-delete-${testInfo.workerIndex}-${Date.now()}`,
    );
    await addClubHistoryEventDb(club.clubProfileId, 1999, 'წინათ-დაარს. იუბილე');

    await signIn(page, club.email, club.password);
    await page.goto('/profile/club/edit');

    const historySection = page.locator('section').filter({
      has: page.getByRole('heading', { name: 'ისტ. მოვლენები' }),
    });

    // Confirm the seeded event is on the page.
    const eventRow = historySection.getByText(/1999.*წინათ-დაარს\. იუბილე/);
    await expect(eventRow).toBeVisible();

    // The delete button is the destructive ghost button next to the row.
    await historySection.getByRole('button', { name: /^წაშ\.$/ }).click();
    await expect(eventRow).not.toBeVisible({ timeout: 10_000 });

    await deleteUser(club.email);
  });
});

// ── Public render ────────────────────────────────────────────────────────────

authTest.describe('club history — public render', () => {
  authTest(
    'seeded event renders on /clubs/[id] history tab as year + title',
    async ({ footballerPage }, testInfo) => {
      const club = await createVerifiedClubWithProfile(
        `history-public-${testInfo.workerIndex}-${Date.now()}`,
      );
      await addClubHistoryEventDb(club.clubProfileId, 1925, 'კლუბის დაარსება', 'პირველი წელი');

      await footballerPage.goto(`/clubs/${club.clubProfileId}`);

      // History is the default tab on the public detail page. Heading is the
      // styled "მნიშვნელოვანი თარიღები" h2 in HistoryTab.
      await expect(
        footballerPage.getByRole('heading', { name: 'მნიშვნელოვანი თარიღები' }),
      ).toBeVisible();
      await expect(footballerPage.getByText('1925', { exact: true })).toBeVisible();
      await expect(footballerPage.getByText('კლუბის დაარსება')).toBeVisible();

      await deleteUser(club.email);
    },
  );
});
