import { PrismaClient } from '@prisma/client';

import { env } from './env';

// Cache the PrismaClient on globalThis in development so Next.js HMR doesn't
// spawn a new client (and therefore a new connection pool) on every reload.
// In production we always create a fresh instance.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['warn', 'error'],
  });

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}
