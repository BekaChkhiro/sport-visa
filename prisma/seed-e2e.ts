/**
 * E2E test database seed.
 *
 * Creates a deterministic set of test users and reference data in the
 * sport_visa_e2e Postgres database. Safe to run multiple times — wipes all
 * data before inserting so the result is always identical.
 *
 * Used by:
 *   - e2e/global-setup.ts  (automatic, before every Playwright run)
 *   - CLI:  npx tsx prisma/seed-e2e.ts  (manual / ad-hoc)
 *
 * The DATABASE_URL env var must point at sport_visa_e2e before this runs.
 */

import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// ── Deterministic test credentials (re-exported for use in specs) ─────────────

export const E2E_CREDENTIALS = {
  admin: { email: 'admin@sport-visa.test', password: 'TestPass123!' },
  footballerVerified: {
    email: 'footballer.verified@sport-visa.test',
    password: 'TestPass123!',
  },
  footballerPending: {
    email: 'footballer.pending@sport-visa.test',
    password: 'TestPass123!',
  },
  clubVerified: { email: 'club.verified@sport-visa.test', password: 'TestPass123!' },
  clubPending: { email: 'club.pending@sport-visa.test', password: 'TestPass123!' },
} as const;

// ── Seed function ─────────────────────────────────────────────────────────────

export async function seedE2E() {
  const prisma = new PrismaClient();

  try {
    // Wipe in reverse-dependency order for idempotency
    await prisma.postLike.deleteMany();
    await prisma.clubPost.deleteMany();
    await prisma.message.deleteMany();
    await prisma.conversation.deleteMany();
    await prisma.clubShortlist.deleteMany();
    await prisma.clubSubscription.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.serviceRequest.deleteMany();
    await prisma.galleryItem.deleteMany();
    await prisma.careerEntry.deleteMany();
    await prisma.footballerProfile.deleteMany();
    await prisma.clubRosterEntry.deleteMany();
    await prisma.clubHistoryEvent.deleteMany();
    await prisma.clubProfile.deleteMany();
    await prisma.notificationPreference.deleteMany();
    await prisma.account.deleteMany();
    await prisma.session.deleteMany();
    await prisma.user.deleteMany();
    await prisma.serviceCategory.deleteMany();
    await prisma.league.deleteMany();

    // Reference data
    await prisma.serviceCategory.createMany({
      data: [
        { slug: 'meal-plan', name: 'Meal Plan', orderIndex: 0 },
        { slug: 'personal-trainer', name: 'Personal Trainer', orderIndex: 1 },
        { slug: 'accommodation', name: 'Accommodation', orderIndex: 2 },
      ],
    });

    await prisma.league.create({
      data: { name: 'Premier League', country: 'GB', orderIndex: 0 },
    });

    const now = new Date();
    const ROUNDS = 10; // faster than prod (12) — speed matters in test setup

    const [
      adminHash,
      footballerVerifiedHash,
      footballerPendingHash,
      clubVerifiedHash,
      clubPendingHash,
    ] = await Promise.all([
      bcrypt.hash(E2E_CREDENTIALS.admin.password, ROUNDS),
      bcrypt.hash(E2E_CREDENTIALS.footballerVerified.password, ROUNDS),
      bcrypt.hash(E2E_CREDENTIALS.footballerPending.password, ROUNDS),
      bcrypt.hash(E2E_CREDENTIALS.clubVerified.password, ROUNDS),
      bcrypt.hash(E2E_CREDENTIALS.clubPending.password, ROUNDS),
    ]);

    // Admin
    await prisma.user.create({
      data: {
        email: E2E_CREDENTIALS.admin.email,
        role: 'ADMIN',
        emailVerified: now,
        passwordHash: adminHash,
        firstName: 'E2E',
        lastName: 'Admin',
      },
    });

    // Verified footballer — profile verificationStatus = VERIFIED
    await prisma.user.create({
      data: {
        email: E2E_CREDENTIALS.footballerVerified.email,
        role: 'FOOTBALLER',
        emailVerified: now,
        passwordHash: footballerVerifiedHash,
        firstName: 'Giorgi',
        lastName: 'Footballer',
        footballerProfile: {
          create: {
            firstName: 'Giorgi',
            lastName: 'Footballer',
            nationality: 'GE',
            positions: ['ST'],
            verificationStatus: 'VERIFIED',
          },
        },
      },
    });

    // Pending footballer — profile verificationStatus = PENDING
    await prisma.user.create({
      data: {
        email: E2E_CREDENTIALS.footballerPending.email,
        role: 'FOOTBALLER',
        emailVerified: now,
        passwordHash: footballerPendingHash,
        firstName: 'Nino',
        lastName: 'Pending',
        footballerProfile: {
          create: {
            firstName: 'Nino',
            lastName: 'Pending',
            nationality: 'GE',
            positions: ['CM'],
            verificationStatus: 'PENDING',
          },
        },
      },
    });

    // Verified club — profile verificationStatus = VERIFIED
    await prisma.user.create({
      data: {
        email: E2E_CREDENTIALS.clubVerified.email,
        role: 'CLUB',
        emailVerified: now,
        passwordHash: clubVerifiedHash,
        firstName: 'FC',
        lastName: 'Tbilisi',
        clubProfile: {
          create: {
            name: 'FC Tbilisi',
            country: 'GE',
            verificationStatus: 'VERIFIED',
          },
        },
      },
    });

    // Pending club — profile verificationStatus = PENDING
    await prisma.user.create({
      data: {
        email: E2E_CREDENTIALS.clubPending.email,
        role: 'CLUB',
        emailVerified: now,
        passwordHash: clubPendingHash,
        firstName: 'FC',
        lastName: 'Rustavi',
        clubProfile: {
          create: {
            name: 'FC Rustavi',
            country: 'GE',
            verificationStatus: 'PENDING',
          },
        },
      },
    });

    console.log('✓ E2E database seeded (5 users, 3 service categories, 1 league)');
  } finally {
    await prisma.$disconnect();
  }
}

// ── CLI entrypoint ────────────────────────────────────────────────────────────
// Runs only when invoked directly: npx tsx prisma/seed-e2e.ts

const isCLI = process.argv[1] != null && fileURLToPath(import.meta.url) === process.argv[1];

if (isCLI) {
  seedE2E()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
