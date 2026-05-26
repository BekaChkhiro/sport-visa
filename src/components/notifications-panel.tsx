'use client';

import * as React from 'react';
import Link from 'next/link';

import { BellIcon, CheckCircleIcon, ClockIcon } from '@/components/icons';
import { NotificationsBell } from '@/components/notifications-bell';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { formatRelativeTime } from '@/lib/format-relative-time';
import { cn } from '@/lib/utils';
import type { NotificationItem } from '@/hooks/use-notifications';

type NotificationsPanelProps = {
  notifications: NotificationItem[];
  unreadCount: number;
  loading?: boolean;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  className?: string;
};

function NotificationsPanelItem({
  notification,
  onMarkRead,
}: {
  notification: NotificationItem;
  onMarkRead: (id: string) => void;
}) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-md px-3 py-2.5 transition-colors',
        notification.read ? 'opacity-60' : 'bg-muted/40',
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'mt-0.5 size-2 shrink-0 rounded-full',
          notification.read ? 'bg-transparent' : 'bg-primary',
        )}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium leading-snug">{notification.title}</p>
        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{notification.body}</p>
        <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
          <ClockIcon className="size-3 shrink-0" aria-hidden="true" />
          {formatRelativeTime(notification.createdAt)}
        </p>
      </div>
      {!notification.read && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-6 shrink-0"
          aria-label="Mark as read"
          onClick={() => onMarkRead(notification.id)}
        >
          <CheckCircleIcon className="size-4" aria-hidden="true" />
        </Button>
      )}
    </div>
  );
}

export function NotificationsPanel({
  notifications,
  unreadCount,
  loading = false,
  onMarkRead,
  onMarkAllRead,
  className,
}: NotificationsPanelProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <NotificationsBell unreadCount={unreadCount} className={className} />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0" sideOffset={8}>
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-sm font-semibold">შეტყობინებები</h2>
          {unreadCount > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
              onClick={onMarkAllRead}
            >
              ყველა წაკითხულად
            </Button>
          )}
        </div>

        {/* Body */}
        <div className="max-h-[360px] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
              <BellIcon className="mr-2 size-4 animate-pulse" aria-hidden="true" />
              იტვირთება…
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10">
              <BellIcon className="size-8 text-muted-foreground/40" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">შეტყობინება არ არის</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((n) => (
                <NotificationsPanelItem key={n.id} notification={n} onMarkRead={onMarkRead} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-4 py-2.5">
          <Link
            href="/notifications"
            className="block text-center text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            ყველა შეტყობინება →
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
