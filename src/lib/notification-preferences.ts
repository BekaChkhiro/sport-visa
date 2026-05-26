import { db } from './db';

export type NotificationPreferenceRow = {
  id: string;
  userId: string;
  emailInstant: boolean;
  emailDigest: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type UpdateNotificationPreferencesParams = {
  emailInstant?: boolean;
  emailDigest?: boolean;
};

/**
 * Fetch a user's notification preferences, creating default row if absent.
 * Callers can treat the returned value as always present.
 */
export async function getOrCreatePreferences(userId: string): Promise<NotificationPreferenceRow> {
  return db.notificationPreference.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });
}

/**
 * Update specific preference fields for a user. Creates the row with defaults
 * if it doesn't exist yet, then applies the supplied patch.
 */
export async function updatePreferences(
  userId: string,
  data: UpdateNotificationPreferencesParams,
): Promise<NotificationPreferenceRow> {
  return db.notificationPreference.upsert({
    where: { userId },
    create: { userId, ...data },
    update: data,
  });
}

/**
 * Return only the emailDigest preference for a user without creating a row.
 * Returns `true` (opt-in by default) when no row exists.
 */
export async function getEmailDigestEnabled(userId: string): Promise<boolean> {
  const pref = await db.notificationPreference.findUnique({
    where: { userId },
    select: { emailDigest: true },
  });
  return pref?.emailDigest ?? true;
}
