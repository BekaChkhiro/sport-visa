import type { Metadata } from 'next';

import { requireAppShellContext } from '@/lib/app-shell/load-context';
import { getOrCreatePreferences } from '@/lib/notification-preferences';
import { NotificationPreferencesClient } from './notification-preferences-client';

export const metadata: Metadata = {
  title: 'შეტყობინებების პარამეტრები',
};

export default async function NotificationPreferencesPage() {
  const shell = await requireAppShellContext('/settings/notifications');
  const prefs = await getOrCreatePreferences(shell.userId);

  return (
    <NotificationPreferencesClient
      shellRole={shell.role}
      shellUser={shell.user}
      userId={shell.userId}
      sidebarStats={shell.sidebarStats}
      adminBadges={shell.adminBadges}
      unreadNotifications={shell.unreadNotifications}
      initialPrefs={{
        emailInstant: prefs.emailInstant,
        emailDigest: prefs.emailDigest,
      }}
    />
  );
}
