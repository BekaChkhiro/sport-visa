import { z } from 'zod';

const serverSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url('NEXT_PUBLIC_APP_URL must be a valid URL (e.g. http://localhost:3000)'),
});

const envSchema = serverSchema.merge(clientSchema);

const processEnv = {
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
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
