import { z } from 'zod';

const logLevelSchema = z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']);

const serverSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid PostgreSQL connection string'),

  LOG_LEVEL: logLevelSchema.optional(),
  SENTRY_DSN: z
    .string()
    .url()
    .optional()
    .or(z.literal('').transform(() => undefined)),
  SENTRY_ENVIRONMENT: z.string().optional(),

  // Cloudflare R2 (T1.6). All five are optional at boot so the app keeps
  // running before R2 is provisioned, but src/lib/r2.ts crashes loud on use
  // if any of them are missing — see `assertR2Configured`.
  R2_ACCOUNT_ID: z.string().min(1).optional(),
  R2_ACCESS_KEY_ID: z.string().min(1).optional(),
  R2_SECRET_ACCESS_KEY: z.string().min(1).optional(),
  R2_BUCKET: z.string().min(1).optional(),
  R2_PUBLIC_BASE_URL: z
    .string()
    .url('R2_PUBLIC_BASE_URL must be a valid URL (no trailing slash)')
    .refine((v) => !v.endsWith('/'), 'R2_PUBLIC_BASE_URL must not end with a trailing slash')
    .optional()
    .or(z.literal('').transform(() => undefined)),
});

const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url('NEXT_PUBLIC_APP_URL must be a valid URL (e.g. http://localhost:3000)'),
  NEXT_PUBLIC_SENTRY_DSN: z
    .string()
    .url()
    .optional()
    .or(z.literal('').transform(() => undefined)),
});

const envSchema = serverSchema.merge(clientSchema);

const processEnv = {
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL,
  LOG_LEVEL: process.env.LOG_LEVEL,
  SENTRY_DSN: process.env.SENTRY_DSN,
  SENTRY_ENVIRONMENT: process.env.SENTRY_ENVIRONMENT,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
  R2_BUCKET: process.env.R2_BUCKET,
  R2_PUBLIC_BASE_URL: process.env.R2_PUBLIC_BASE_URL,
};

const parsed = envSchema.safeParse(processEnv);

if (!parsed.success) {
  const formatted = Object.entries(parsed.error.flatten().fieldErrors)
    .map(([key, errors]) => `  - ${key}: ${(errors ?? []).join(', ')}`)
    .join('\n');

  throw new Error(
    `\n❌ Invalid environment variables:\n${formatted}\n\n` +
      `Copy .env.example to .env.local and fill in the missing values.\n`,
  );
}

export const env = parsed.data;
export type Env = z.infer<typeof envSchema>;
