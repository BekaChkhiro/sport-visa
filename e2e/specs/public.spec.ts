/**
 * Public-pages spec — landing page sections + SEO endpoints.
 *
 * Runs unauthenticated against both chromium and webkit. Verifies the
 * landing page composes hero / how-it-works / features / for-footballers /
 * for-clubs / testimonials / FAQ / contact, that signup CTAs link to the
 * right role-scoped /auth/signup variant, and that /robots.txt and
 * /sitemap.xml return the expected content.
 */

import { test, expect } from '@playwright/test';

test.describe('public — landing page', () => {
  test('hero renders with both signup CTAs and tagline', async ({ page }) => {
    await page.goto('/');

    // Hero h1 — singular, visible
    const h1 = page.locator('h1', { hasText: /Sport Visa/i });
    await expect(h1).toBeVisible();

    // Signup CTAs route to role-scoped signup
    const footballerCta = page.getByRole('link', { name: /ფეხბურთელად რეგისტრაცია/ }).first();
    const clubCta = page.getByRole('link', { name: /კლუბად რეგისტრაცია/ }).first();
    await expect(footballerCta).toHaveAttribute('href', '/auth/signup?role=footballer');
    await expect(clubCta).toHaveAttribute('href', '/auth/signup?role=club');
  });

  test('renders how-it-works, features, testimonials, FAQ and contact sections', async ({
    page,
  }) => {
    await page.goto('/');

    // Section headings — anchor on the Georgian copy that the components own.
    await expect(page.getByRole('heading', { name: 'როგორ მუშაობს' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'ძირითადი ფუნქციები' })).toBeVisible();
    await expect(page.getByRole('heading', { name: /ისინი უკვე Sport Visa/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'ხშირად დასმული კითხვები' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'დაგვიკავშირდით' })).toBeVisible();

    // Contact form fields are rendered
    await expect(page.locator('#contact-name')).toBeVisible();
    await expect(page.locator('#contact-email')).toBeVisible();
    await expect(page.locator('#contact-message')).toBeVisible();
  });

  test('FAQ accordion opens an item when clicked', async ({ page }) => {
    await page.goto('/');

    const firstQuestion = page.getByRole('button', { name: /რეგისტრაცია ფასიანია/ });
    await firstQuestion.scrollIntoViewIfNeeded();
    await firstQuestion.click();

    await expect(page.getByText(/ფეხბურთელისთვის რეგისტრაცია/)).toBeVisible();
  });

  test('navigates from landing footballer CTA to signup form with footballer preselected', async ({
    page,
  }) => {
    await page.goto('/');
    await page
      .getByRole('link', { name: /ფეხბურთელად რეგისტრაცია/ })
      .first()
      .click();

    await expect(page).toHaveURL(/\/auth\/signup\?role=footballer/);
    // FOOTBALLER role tile is pre-selected (aria-pressed=true)
    await expect(page.locator('button[data-value="FOOTBALLER"]')).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  test('navigates from landing club CTA to signup form with club preselected', async ({ page }) => {
    await page.goto('/');
    await page
      .getByRole('link', { name: /კლუბად რეგისტრაცია/ })
      .first()
      .click();

    await expect(page).toHaveURL(/\/auth\/signup\?role=club/);
    await expect(page.locator('button[data-value="CLUB"]')).toHaveAttribute('aria-pressed', 'true');
  });
});

test.describe('public — SEO endpoints', () => {
  test('/robots.txt allows root and disallows protected sections', async ({ request, baseURL }) => {
    const response = await request.get('/robots.txt');
    expect(response.status()).toBe(200);

    const body = await response.text();
    expect(body).toMatch(/User-Agent:\s*\*/i);
    expect(body).toMatch(/Allow:\s*\//);
    expect(body).toMatch(/Disallow:\s*\/admin\//);
    expect(body).toMatch(/Disallow:\s*\/api\//);
    expect(body).toMatch(/Disallow:\s*\/dashboard\//);
    expect(body).toMatch(/Disallow:\s*\/onboarding\//);
    // Sitemap URL points at the same origin Next is serving from
    const expectedHost = (baseURL ?? 'http://127.0.0.1:3000').replace(/\/$/, '');
    expect(body).toContain(`Sitemap: ${expectedHost}/sitemap.xml`);
  });

  test('/sitemap.xml lists the static routes', async ({ request }) => {
    const response = await request.get('/sitemap.xml');
    expect(response.status()).toBe(200);

    const xml = await response.text();
    // Each static route in src/app/sitemap.ts must appear in the response.
    expect(xml).toContain('<urlset');
    expect(xml).toMatch(/<loc>https?:\/\/[^<]+\/<\/loc>/);
    expect(xml).toMatch(/<loc>https?:\/\/[^<]+\/clubs<\/loc>/);
    expect(xml).toMatch(/<loc>https?:\/\/[^<]+\/auth\/signin<\/loc>/);
    expect(xml).toMatch(/<loc>https?:\/\/[^<]+\/auth\/signup<\/loc>/);
  });
});
