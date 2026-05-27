/**
 * Direct Prisma helpers for E2E specs.
 *
 * Lets specs read verification / password-reset tokens that the app wrote to
 * Postgres (no Resend mock needed), and create ad-hoc users that are
 * already email-verified but have no profile — used by onboarding wizard
 * specs that would otherwise burn the signup-per-IP rate-limit budget.
 *
 * One PrismaClient is shared across the file so we don't pay
 * connection-pool setup for every helper call.
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

let cached: PrismaClient | undefined;

function db(): PrismaClient {
  if (cached) return cached;
  cached = new PrismaClient();
  return cached;
}

const PASSWORD_HASH_ROUNDS = 10;

// Password-reset tokens are namespaced with this prefix in the
// VerificationToken table — see src/lib/auth/tokens.ts.
const PASSWORD_RESET_PREFIX = 'pr:';

export async function getEmailVerificationToken(email: string): Promise<string | null> {
  const record = await db().verificationToken.findFirst({
    where: { identifier: email },
    orderBy: { expires: 'desc' },
  });
  return record?.token ?? null;
}

export async function getPasswordResetToken(email: string): Promise<string | null> {
  const record = await db().verificationToken.findFirst({
    where: { identifier: `${PASSWORD_RESET_PREFIX}${email}` },
    orderBy: { expires: 'desc' },
  });
  return record?.token ?? null;
}

/**
 * Create a user with verified email but no profile, ready to walk through
 * the onboarding wizard. Returns the credentials so the spec can sign in
 * via the regular form.
 */
export async function createVerifiedNoProfileUser(
  role: 'FOOTBALLER' | 'CLUB',
  suffix: string,
): Promise<{ email: string; password: string }> {
  const email = `wizard-${role.toLowerCase()}-${suffix}@sport-visa.test`;
  const password = 'TestPass123!';
  const passwordHash = await bcrypt.hash(password, PASSWORD_HASH_ROUNDS);

  // Wipe any prior user with this exact email so the spec is idempotent
  // when re-run locally without a full seed.
  await db().user.deleteMany({ where: { email } });

  await db().user.create({
    data: {
      email,
      role,
      emailVerified: new Date(),
      passwordHash,
      firstName: role === 'FOOTBALLER' ? 'Wizard' : 'Wizard FC',
      lastName: role === 'FOOTBALLER' ? 'Footballer' : 'Club',
    },
  });

  return { email, password };
}

/**
 * Remove a user created during a spec. Cascades through
 * profile / token / session relations.
 */
export async function deleteUser(email: string): Promise<void> {
  await db().verificationToken.deleteMany({
    where: { identifier: { in: [email, `${PASSWORD_RESET_PREFIX}${email}`] } },
  });
  await db().user.deleteMany({ where: { email } });
}

export async function disconnect(): Promise<void> {
  if (cached) {
    await cached.$disconnect();
    cached = undefined;
  }
}
