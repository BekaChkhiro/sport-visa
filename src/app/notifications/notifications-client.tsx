'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { BellIcon, CheckCircleIcon, ClockIcon } from '@/components/icons';
import { useNotifications } from '@/hooks/use-notifications';
import { formatRelativeTime } from '@/lib/format-relative-time';
import { cn } from '@/lib/utils';
import type { NotificationItem } from '@/hooks/use-notifications';

type NotificationsClientProps = {
  currentPath: string;
  userId: string;
  role: 'footballer' | 'club';
  user: {
    name: string;
    initials: string;
    image?: string;
  };
  initialNotifications: NotificationItem[];
};

function NotificationRow({
  notification,
  onMarkRead,
}: {
  notification: NotificationItem;
  onMarkRead: (id: string) => void;
}) {
  return (
    <div
      className={cn(
        'flex items-start gap-4 rounded-lg border p-4 transition-colors',
        notification.read ? 'border-border bg-background' : 'border-primary/20 bg-primary/5',
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'mt-1 size-2.5 shrink-0 rounded-full',
          notification.read ? 'bg-muted' : 'bg-primary',
        )}
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-snug">{notification.title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{notification.body}</p>
        <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
          <ClockIcon className="size-3.5 shrink-0" aria-hidden="true" />
          {formatRelativeTime(notification.createdAt)}
        </p>
      </div>
      {!notification.read && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 shrink-0 text-muted-foreground hover:text-foreground"
          aria-label="წაკითხულად მონიშვნა"
          onClick={() => onMarkRead(notification.id)}
        >
          <CheckCircleIcon className="size-5" aria-hidden="true" />
        </Button>
      )}
    </div>
  );
}

export function NotificationsClient({
  currentPath,
  userId,
  role,
  user,
  initialNotifications,
}: NotificationsClientProps) {
  const router = useRouter();

  const { notifications, unreadCount, loading, markRead, markAllRead } = useNotifications(
    userId,
    initialNotifications,
  );

  async function handleSignOut() {
    await signOut({ redirect: false });
    router.push('/auth/signin');
  }

  return (
    <AppShell
      role={role}
      currentPath={currentPath}
      userId={userId}
      user={user}
      onSignOut={handleSignOut}
    >
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">შეტყობინებები</h1>
            {unreadCount > 0 && (
              <p className="mt-0.5 text-sm text-muted-foreground">{unreadCount} წაუკითხავი</p>
            )}
          </div>
          {unreadCount > 0 && (
            <Button type="button" variant="outline" size="sm" onClick={() => void markAllRead()}>
              ყველა წაკითხულად
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
            <BellIcon className="size-10 animate-pulse" aria-hidden="true" />
            <p className="text-sm">იტვირთება…</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20">
            <BellIcon className="size-12 text-muted-foreground/30" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">შეტყობინება არ არის</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => (
              <NotificationRow key={n.id} notification={n} onMarkRead={(id) => void markRead(id)} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
