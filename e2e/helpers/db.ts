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
 * Create a verified footballer with a fully-onboarded profile — used by
 * specs that drive /profile/edit and /profile/preview and want to mutate
 * the profile without disturbing the shared seeded user.
 *
 * The profile carries the required-for-save fields (dateOfBirth, city,
 * nationality, positions, dominantFoot, height, weight) so SportInfo and
 * PersonalInfo server actions can be saved without filling missing values
 * first.
 */
export async function createVerifiedFootballerWithProfile(
  suffix: string,
): Promise<{ email: string; password: string; profileId: string }> {
  const email = `profile-footballer-${suffix}@sport-visa.test`;
  const password = 'TestPass123!';
  const passwordHash = await bcrypt.hash(password, PASSWORD_HASH_ROUNDS);

  await db().user.deleteMany({ where: { email } });

  const user = await db().user.create({
    data: {
      email,
      role: 'FOOTBALLER',
      emailVerified: new Date(),
      passwordHash,
      firstName: 'Profile',
      lastName: 'Tester',
      footballerProfile: {
        create: {
          firstName: 'Profile',
          lastName: 'Tester',
          dateOfBirth: new Date('2000-01-15'),
          nationality: 'GE',
          city: 'თბილისი',
          country: 'GE',
          positions: ['ST'],
          dominantFoot: 'RIGHT',
          height: 180,
          weight: 75,
          verificationStatus: 'VERIFIED',
        },
      },
    },
    include: { footballerProfile: true },
  });

  if (!user.footballerProfile) {
    throw new Error('expected footballerProfile to be created');
  }

  return { email, password, profileId: user.footballerProfile.id };
}

/**
 * Attach a deterministic gallery item to a footballer profile so preview /
 * edit specs can assert gallery rendering without going through the R2
 * presign upload flow.
 */
export async function addGalleryItem(
  profileId: string,
  mediaKey: string,
  orderIndex = 0,
): Promise<{ id: string }> {
  const item = await db().galleryItem.create({
    data: { profileId, mediaKey, orderIndex },
    select: { id: true },
  });
  return item;
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
