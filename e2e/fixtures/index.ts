/**
 * Extended test fixtures with pre-authenticated pages for each role.
 *
 * The storage-state files are written by e2e/setup/auth.setup.ts which runs
 * as the "setup" project before the main browser projects. Importing this
 * module gives you an extended `test` and re-exported `expect` that expose:
 *
 *   footballerPage          — verified footballer (FOOTBALLER, verificationStatus VERIFIED)
 *   verifiedFootballerPage  — alias for footballerPage (explicit name for readability)
 *   footballerPendingPage   — pending footballer (verificationStatus PENDING)
 *   clubPage                — verified club (CLUB, verificationStatus VERIFIED)
 *   adminPage               — admin (ADMIN role)
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test as base, type Page } from '@playwright/test';

const stateDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../.playwright');

type AuthFixtures = {
  adminPage: Page;
  footballerPage: Page;
  verifiedFootballerPage: Page;
  footballerPendingPage: Page;
  clubPage: Page;
};

export const test = base.extend<AuthFixtures>({
  adminPage: async ({ browser }, use) => {
    const ctx = await browser.newContext({
      storageState: path.join(stateDir, 'admin.json'),
    });
    const page = await ctx.newPage();
    await use(page);
    await ctx.close();
  },

  footballerPage: async ({ browser }, use) => {
    const ctx = await browser.newContext({
      storageState: path.join(stateDir, 'footballer-verified.json'),
    });
    const page = await ctx.newPage();
    await use(page);
    await ctx.close();
  },

  verifiedFootballerPage: async ({ browser }, use) => {
    const ctx = await browser.newContext({
      storageState: path.join(stateDir, 'footballer-verified.json'),
    });
    const page = await ctx.newPage();
    await use(page);
    await ctx.close();
  },

  footballerPendingPage: async ({ browser }, use) => {
    const ctx = await browser.newContext({
      storageState: path.join(stateDir, 'footballer-pending.json'),
    });
    const page = await ctx.newPage();
    await use(page);
    await ctx.close();
  },

  clubPage: async ({ browser }, use) => {
    const ctx = await browser.newContext({
      storageState: path.join(stateDir, 'club-verified.json'),
    });
    const page = await ctx.newPage();
    await use(page);
    await ctx.close();
  },
});

export { expect } from '@playwright/test';
