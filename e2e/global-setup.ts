import { execSync } from 'node:child_process';

import { seedE2E } from '../prisma/seed-e2e.js';

export default async function globalSetup() {
  const url =
    process.env.E2E_DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/sport_visa_e2e';

  // Ensure DATABASE_URL points at the E2E database before PrismaClient
  // is instantiated inside seedE2E().
  process.env.DATABASE_URL = url;

  // Keep schema in sync — safe to run on every boot (no-op when current).
  execSync('npx prisma migrate deploy', {
    env: { ...process.env, DATABASE_URL: url },
    stdio: 'inherit',
  });

  await seedE2E();
}
