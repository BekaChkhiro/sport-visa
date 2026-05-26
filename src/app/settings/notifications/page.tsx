import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { getOrCreatePreferences } from '@/lib/notification-preferences';
import { NotificationPreferencesClient } from './notification-preferences-client';

export const metadata: Metadata = {
  title: 'შეტყობინებების პარამეტრები',
};

export default async function NotificationPreferencesPage() {
  const session = await auth();
  if (!session?.user) redirect('/auth/signin');

  const userId = session.user.id;
  const role = session.user.role;
  const r2BaseUrl = process.env.R2_PUBLIC_BASE_URL ?? '';

  const [prefs, userProfile] = await Promise.all([
    getOrCreatePreferences(userId),
    role === 'FOOTBALLER'
      ? db.footballerProfile.findUnique({
          where: { userId },
          select: { firstName: true, lastName: true, avatarKey: true },
        })
      : role === 'CLUB'
        ? db.clubProfile.findUnique({
            where: { userId },
            select: { name: true, logoKey: true },
          })
        : null,
  ]);

  let name = 'User';
  let initials = 'U';
  let image: string | undefined;

  if (role === 'FOOTBALLER' && userProfile && 'firstName' in userProfile) {
    name = `${userProfile.firstName} ${userProfile.lastName}`.trim();
    initials = [userProfile.firstName[0], userProfile.lastName[0]]
      .filter(Boolean)
      .join('')
      .toUpperCase();
    image = userProfile.avatarKey ? `${r2BaseUrl}/${userProfile.avatarKey}` : undefined;
  } else if (role === 'CLUB' && userProfile && 'name' in userProfile) {
    name = userProfile.name;
    initials = userProfile.name
      .split(' ')
      .slice(0, 2)
      .map((w: string) => w[0])
      .join('')
      .toUpperCase();
    image = userProfile.logoKey ? `${r2BaseUrl}/${userProfile.logoKey}` : undefined;
  }

  return (
    <NotificationPreferencesClient
      currentPath="/settings/notifications"
      userId={userId}
      role={role === 'ADMIN' ? 'footballer' : (role.toLowerCase() as 'footballer' | 'club')}
      user={{ name, initials, image }}
      initialPrefs={{
        emailInstant: prefs.emailInstant,
        emailDigest: prefs.emailDigest,
      }}
    />
  );
}
