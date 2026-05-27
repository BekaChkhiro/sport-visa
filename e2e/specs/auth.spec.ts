/**
 * Auth-flow spec — signup → verify → signin → signout → forgot/reset.
 *
 * Runs unauthenticated against chromium and webkit. Each test creates a
 * unique user (timestamp + worker index) so that:
 *   - Resend isn't required (the verification email failure is swallowed;
 *     we read the token straight from Postgres).
 *   - Per-email rate limits never bite — every spec gets its own email.
 *
 * The "setup" project's pre-signed-in storage states are NOT used here on
 * purpose: these tests exercise the form-driven flows end-to-end.
 */

import { expect, test } from '@playwright/test';

import {
  createVerifiedNoProfileUser,
  deleteUser,
  disconnect,
  getEmailVerificationToken,
  getPasswordResetToken,
} from '../helpers/db.js';

test.afterAll(async () => {
  await disconnect();
});

// Each test gets a per-test unique email so they can run in parallel and
// re-run without colliding with prior test rows in Postgres.
function uniqueEmail(
  role: 'footballer' | 'club',
  testInfo: { workerIndex: number; title: string },
) {
  const slug = testInfo.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 24);
  return `${role}-${slug}-${testInfo.workerIndex}-${Date.now()}@sport-visa.test`;
}

test.describe('auth — signup', () => {
  test('footballer can sign up and lands on /verification-pending', async ({ page }, testInfo) => {
    const email = uniqueEmail('footballer', testInfo);

    await page.goto('/auth/signup?role=footballer');
    // FOOTBALLER role tile is pre-selected via query param
    await expect(page.locator('button[data-value="FOOTBALLER"]')).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    await page.locator('#firstName').fill('Giorgi');
    await page.locator('#lastName').fill('Test');
    await page.locator('#email').fill(email);
    await page.locator('#password').fill('TestPass123!');
    await page.locator('#passwordConfirm').fill('TestPass123!');
    await page.locator('#acceptTerms').check();
    await page.locator('button[type="submit"]').click();

    await page.waitForURL(/\/verification-pending/, { timeout: 20_000 });
    await expect(page.getByRole('heading', { name: /შეამოწმე ელ\. ფოსტა/ })).toBeVisible();
    await expect(page.getByText(email)).toBeVisible();

    await deleteUser(email);
  });

  test('club can sign up and lands on /verification-pending', async ({ page }, testInfo) => {
    const email = uniqueEmail('club', testInfo);

    await page.goto('/auth/signup?role=club');
    await expect(page.locator('button[data-value="CLUB"]')).toHaveAttribute('aria-pressed', 'true');

    await page.locator('#firstName').fill('FC');
    await page.locator('#lastName').fill('Sample');
    await page.locator('#email').fill(email);
    await page.locator('#password').fill('TestPass123!');
    await page.locator('#passwordConfirm').fill('TestPass123!');
    await page.locator('#acceptTerms').check();
    await page.locator('button[type="submit"]').click();

    await page.waitForURL(/\/verification-pending/, { timeout: 20_000 });
    await expect(page.getByText(email)).toBeVisible();

    await deleteUser(email);
  });

  test('shows a field error when passwords do not match', async ({ page }, testInfo) => {
    const email = uniqueEmail('footballer', testInfo);

    await page.goto('/auth/signup?role=footballer');
    await page.locator('#firstName').fill('Giorgi');
    await page.locator('#lastName').fill('Mismatch');
    await page.locator('#email').fill(email);
    await page.locator('#password').fill('TestPass123!');
    await page.locator('#passwordConfirm').fill('DifferentPass1!');
    await page.locator('#acceptTerms').check();
    await page.locator('button[type="submit"]').click();

    // Stay on /auth/signup and show a destructive error message
    await expect(page).toHaveURL(/\/auth\/signup/);
    await expect(page.locator('p.text-destructive').first()).toBeVisible();
  });
});

test.describe('auth — verify email', () => {
  test('valid token redirects to /auth/signin?verified=1 and shows banner', async ({
    page,
  }, testInfo) => {
    const email = uniqueEmail('footballer', testInfo);

    // 1. Sign up via the form so the server-side flow creates a real DB
    //    token (the Resend send fails silently in test env — that's fine).
    await page.goto('/auth/signup?role=footballer');
    await page.locator('#firstName').fill('Verify');
    await page.locator('#lastName').fill('Flow');
    await page.locator('#email').fill(email);
    await page.locator('#password').fill('TestPass123!');
    await page.locator('#passwordConfirm').fill('TestPass123!');
    await page.locator('#acceptTerms').check();
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/verification-pending/, { timeout: 20_000 });

    // 2. Read the token Prisma created and hit the verify endpoint.
    const token = await getEmailVerificationToken(email);
    expect(token, 'verification token should be persisted to DB after signup').toBeTruthy();

    await page.goto(`/api/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`);

    // 3. The handler clears the auto-login JWT and redirects to signin
    //    with ?verified=1 — banner is shown.
    await page.waitForURL(/\/auth\/signin\?verified=1/, { timeout: 20_000 });
    await expect(page.getByText(/ელ\. ფოსტა დადასტურდა/)).toBeVisible();

    await deleteUser(email);
  });

  test('invalid token redirects to signin with link-expired error', async ({ page }) => {
    await page.goto('/api/auth/verify-email?token=not-a-real-token&email=ghost@sport-visa.test');
    await page.waitForURL(/\/auth\/signin\?error=link-expired/, { timeout: 20_000 });
    await expect(page.getByText(/ვერიფიკაციის ლინკი ვადაგასულია/)).toBeVisible();
  });
});

test.describe('auth — signin / signout', () => {
  test('valid credentials sign in and reach the role dashboard', async ({ page }, testInfo) => {
    // Use a pre-verified, profile-less footballer — middleware will route
    // /dashboard → /dashboard/footballer → onboarding (no profile yet).
    const user = await createVerifiedNoProfileUser(
      'FOOTBALLER',
      `signin-${testInfo.workerIndex}-${Date.now()}`,
    );

    await page.goto('/auth/signin');
    await page.locator('#email').fill(user.email);
    await page.locator('#password').fill(user.password);
    await page.locator('button[type="submit"]').click();

    // The signin form pushes to /dashboard; layout/middleware then bounces
    // a profile-less footballer to /onboarding. Either /dashboard/* or
    // /onboarding is an acceptable landing pad for a verified login.
    await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 20_000 });
    await expect(page.locator('#email')).not.toBeVisible();

    await deleteUser(user.email);
  });

  test('invalid credentials show a generic error and stay on signin', async ({ page }) => {
    await page.goto('/auth/signin');
    await page.locator('#email').fill('nobody@sport-visa.test');
    await page.locator('#password').fill('WrongPassword1!');
    await page.locator('button[type="submit"]').click();

    await expect(page).toHaveURL(/\/auth\/signin/);
    await expect(page.getByText(/ელ\. ფოსტა ან პაროლი არასწორია/)).toBeVisible();
  });

  test('signed-in user visiting /auth/signin is bounced to their dashboard', async ({
    browser,
  }) => {
    // Spin up a context with the verified-footballer storage state from the
    // setup project. The auth-layout redirect must kick us to /dashboard/footballer.
    const ctx = await browser.newContext({
      storageState: '.playwright/footballer-verified.json',
    });
    const page = await ctx.newPage();

    await page.goto('/auth/signin');
    await page.waitForURL(/\/dashboard\/footballer/, { timeout: 20_000 });
    await expect(page).toHaveURL(/\/dashboard\/footballer/);

    await ctx.close();
  });
});

test.describe('auth — forgot / reset password', () => {
  test('full forgot-password loop: request → reset → sign in with new password', async ({
    page,
  }, testInfo) => {
    const user = await createVerifiedNoProfileUser(
      'FOOTBALLER',
      `reset-${testInfo.workerIndex}-${Date.now()}`,
    );
    const newPassword = 'NewPass456!';

    // 1. Request reset
    await page.goto('/auth/forgot-password');
    await page.locator('#email').fill(user.email);
    await page.locator('button[type="submit"]').click();
    await expect(page.getByText(/თუ ეს მისამართი დარეგისტრირებულია/)).toBeVisible();

    // 2. Read the reset token from Postgres (Resend isn't required in test env).
    const token = await getPasswordResetToken(user.email);
    expect(token, 'password-reset token should be persisted to DB').toBeTruthy();

    // 3. Visit reset link, submit new password
    await page.goto(`/auth/reset-password?token=${token}&email=${encodeURIComponent(user.email)}`);
    await page.locator('#password').fill(newPassword);
    await page.locator('#passwordConfirm').fill(newPassword);
    await page.locator('button[type="submit"]').click();

    await page.waitForURL(/\/auth\/signin\?reset=1/, { timeout: 20_000 });
    await expect(page.getByText(/პაროლი წარმატებით შეიცვალა/)).toBeVisible();

    // 4. Sign in with the new password
    await page.locator('#email').fill(user.email);
    await page.locator('#password').fill(newPassword);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 20_000 });

    await deleteUser(user.email);
  });

  test('forgot-password with unknown email still shows the generic success message', async ({
    page,
  }) => {
    // No-account enumeration guard — server returns success either way.
    await page.goto('/auth/forgot-password');
    await page.locator('#email').fill('unknown-account@sport-visa.test');
    await page.locator('button[type="submit"]').click();
    await expect(page.getByText(/თუ ეს მისამართი დარეგისტრირებულია/)).toBeVisible();
  });
});
