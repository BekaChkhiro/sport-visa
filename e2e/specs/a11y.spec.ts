/**
 * Accessibility spec — axe-core scans for key public pages.
 *
 * Run via `npm run test:a11y`. Each test reports violations as a Playwright
 * failure with a human-readable summary; violations are NOT warnings.
 *
 * Only public (unauthenticated) pages are scanned here because authenticated
 * pages depend on the E2E database being seeded. The full authenticated scan
 * lives in T14.x follow-up specs.
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const PAGES = ['/', '/auth/signin', '/auth/signup'] as const;

for (const route of PAGES) {
  test(`a11y — ${route}`, async ({ page }) => {
    await page.goto(route);
    // Wait for the page to be interactive before scanning
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page }).analyze();

    // Attach the full axe report as a test attachment for debugging
    await test.info().attach('axe-results', {
      body: JSON.stringify(results, null, 2),
      contentType: 'application/json',
    });

    expect(
      results.violations,
      `${results.violations.length} axe violation(s) on ${route}:\n` +
        results.violations.map((v) => `  [${v.impact}] ${v.id}: ${v.description}`).join('\n'),
    ).toHaveLength(0);
  });
}
