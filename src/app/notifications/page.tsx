import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { listNotifications } from '@/lib/notifications';
import { NotificationsClient } from './notifications-client';

export const metadata: Metadata = {
  title: 'შეტყობინებები',
};

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user) redirect('/auth/signin');

  const userId = session.user.id;
  const role = session.user.role;
  const r2BaseUrl = process.env.R2_PUBLIC_BASE_URL ?? '';

  const [notifications, userProfile] = await Promise.all([
    listNotifications(userId, 100),
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
    <NotificationsClient
      currentPath="/notifications"
      userId={userId}
      role={role === 'ADMIN' ? 'footballer' : (role.toLowerCase() as 'footballer' | 'club')}
      user={{ name, initials, image }}
      initialNotifications={notifications.map((n) => ({
        id: n.id,
        type: String(n.type),
        title: n.title,
        body: n.body,
        read: n.read,
        createdAt: n.createdAt.toISOString(),
      }))}
    />
  );
}
