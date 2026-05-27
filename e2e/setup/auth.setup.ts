/**
 * Auth setup project — mints a NextAuth session cookie for each test role and
 * persists the browser storage state so main test suites skip the signin form.
 *
 * We bypass the signin form entirely because NextAuth v5 beta + Next 15 server
 * actions have unreliable cookie propagation in headless contexts. Instead we
 * read each seeded user from Prisma, encode a JWT that matches the shape our
 * jwt/session callbacks produce (see src/lib/auth/config.ts), and inject it
 * via page.context().addCookies() before saving storage state.
 *
 * Runs as the "setup" project (see playwright.config.ts) before chromium /
 * webkit. Each test produces a .playwright/<role>.json file consumed by the
 * fixtures in e2e/fixtures/index.ts.
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import { PrismaClient } from '@prisma/client';
import { test as setup, type BrowserContext } from '@playwright/test';
import { encode } from 'next-auth/jwt';

import { E2E_CREDENTIALS } from '../../prisma/seed-e2e.js';

const stateDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../.playwright');

export const STORAGE_STATE = {
  admin: path.join(stateDir, 'admin.json'),
  footballerVerified: path.join(stateDir, 'footballer-verified.json'),
  footballerPending: path.join(stateDir, 'footballer-pending.json'),
  clubVerified: path.join(stateDir, 'club-verified.json'),
  clubPending: path.join(stateDir, 'club-pending.json'),
} as const;

fs.mkdirSync(stateDir, { recursive: true });

// Cookie name when running over plain http — must match @auth/core's
// defaultCookies().sessionToken.name (no __Secure- prefix).
const SESSION_COOKIE_NAME = 'authjs.session-token';
const SESSION_MAX_AGE = 30 * 24 * 60 * 60; // 30 days, NextAuth default

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:3000';
const baseHost = new URL(BASE_URL).hostname;

function authSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error('AUTH_SECRET must be set for E2E auth setup');
  }
  return secret;
}

async function seedSession(
  context: BrowserContext,
  user: {
    id: string;
    email: string;
    role: string;
    emailVerified: Date | null;
    name: string | null;
  },
  stateFile: string,
) {
  const token = await encode({
    token: {
      sub: user.id,
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      // jwt callback in src/lib/auth/config.ts copies emailVerified through;
      // serialize as ISO string so the cookie round-trips cleanly.
      emailVerified: user.emailVerified ? user.emailVerified.toISOString() : null,
    },
    secret: authSecret(),
    salt: SESSION_COOKIE_NAME,
    maxAge: SESSION_MAX_AGE,
  });

  await context.addCookies([
    {
      name: SESSION_COOKIE_NAME,
      value: token,
      domain: baseHost,
      path: '/',
      httpOnly: true,
      sameSite: 'Lax',
      secure: false,
      expires: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE,
    },
  ]);

  await context.storageState({ path: stateFile });
}

async function userByEmail(prisma: PrismaClient, email: string) {
  const u = await prisma.user.findUniqueOrThrow({
    where: { email },
    select: {
      id: true,
      email: true,
      role: true,
      emailVerified: true,
      firstName: true,
      lastName: true,
    },
  });
  return {
    id: u.id,
    email: u.email,
    role: u.role,
    emailVerified: u.emailVerified,
    name: [u.firstName, u.lastName].filter(Boolean).join(' ') || null,
  };
}

// ── One setup test per role ───────────────────────────────────────────────────
//
// Each test creates an isolated context, seeds the auth cookie, and saves the
// storage state. We construct contexts manually instead of using the `page`
// fixture so cookie domain/secure flags stay under our control.

const prisma = new PrismaClient();

setup.afterAll(async () => {
  await prisma.$disconnect();
});

setup('seed session for admin', async ({ browser }) => {
  const context = await browser.newContext();
  const user = await userByEmail(prisma, E2E_CREDENTIALS.admin.email);
  await seedSession(context, user, STORAGE_STATE.admin);
  await context.close();
});

setup('seed session for verified footballer', async ({ browser }) => {
  const context = await browser.newContext();
  const user = await userByEmail(prisma, E2E_CREDENTIALS.footballerVerified.email);
  await seedSession(context, user, STORAGE_STATE.footballerVerified);
  await context.close();
});

setup('seed session for pending footballer', async ({ browser }) => {
  const context = await browser.newContext();
  const user = await userByEmail(prisma, E2E_CREDENTIALS.footballerPending.email);
  await seedSession(context, user, STORAGE_STATE.footballerPending);
  await context.close();
});

setup('seed session for verified club', async ({ browser }) => {
  const context = await browser.newContext();
  const user = await userByEmail(prisma, E2E_CREDENTIALS.clubVerified.email);
  await seedSession(context, user, STORAGE_STATE.clubVerified);
  await context.close();
});

setup('seed session for pending club', async ({ browser }) => {
  const context = await browser.newContext();
  const user = await userByEmail(prisma, E2E_CREDENTIALS.clubPending.email);
  await seedSession(context, user, STORAGE_STATE.clubPending);
  await context.close();
});
