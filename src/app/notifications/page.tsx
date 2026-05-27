import type { Metadata } from 'next';

import { requireAppShellContext } from '@/lib/app-shell/load-context';
import { listNotifications } from '@/lib/notifications';
import { NotificationsClient } from './notifications-client';

export const metadata: Metadata = {
  title: 'შეტყობინებები',
};

export default async function NotificationsPage() {
  const shell = await requireAppShellContext('/notifications');
  const notifications = await listNotifications(shell.userId, 100);

  return (
    <NotificationsClient
      shellRole={shell.role}
      shellUser={shell.user}
      userId={shell.userId}
      sidebarStats={shell.sidebarStats}
      adminBadges={shell.adminBadges}
      unreadNotifications={shell.unreadNotifications}
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
