import { NextResponse } from 'next/server';
import { z } from 'zod';

import { ApiError, apiHandler } from '@/lib/api-error';
import { requireAuthenticatedUser } from '@/lib/auth/require-user';
import { logger } from '@/lib/logger';
import { getOrCreatePreferences, updatePreferences } from '@/lib/notification-preferences';

export const runtime = 'nodejs';

/** GET /api/settings/notification-preferences — return caller's preferences. */
export const GET = apiHandler(async () => {
  const user = await requireAuthenticatedUser();

  const prefs = await getOrCreatePreferences(user.id);
  logger.debug({ userId: user.id }, 'notification_preferences_fetched');

  return NextResponse.json(
    {
      emailInstant: prefs.emailInstant,
      emailDigest: prefs.emailDigest,
    },
    { status: 200 },
  );
});

const patchSchema = z.object({
  emailInstant: z.boolean().optional(),
  emailDigest: z.boolean().optional(),
});

/** PATCH /api/settings/notification-preferences — update caller's preferences. */
export const PATCH = apiHandler(async (request: Request) => {
  const user = await requireAuthenticatedUser();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new ApiError('BAD_REQUEST', 'Request body must be valid JSON');
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    throw new ApiError('VALIDATION', 'Invalid preferences payload', {
      details: parsed.error.flatten().fieldErrors,
    });
  }

  if (Object.keys(parsed.data).length === 0) {
    throw new ApiError('BAD_REQUEST', 'At least one preference field is required');
  }

  const prefs = await updatePreferences(user.id, parsed.data);
  logger.info({ userId: user.id, data: parsed.data }, 'notification_preferences_updated');

  return NextResponse.json(
    {
      emailInstant: prefs.emailInstant,
      emailDigest: prefs.emailDigest,
    },
    { status: 200 },
  );
});
