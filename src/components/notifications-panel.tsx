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
        'flex items-start gap-3 px-4 py-3 transition-colors hover:bg-ink-800/50',
        !notification.read && 'bg-brand-400/[0.04]',
      )}
    >
      {/* Icon chip */}
      <span
        aria-hidden="true"
        className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-400/15 text-accent-300"
      >
        <BellIcon className="size-3.5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium leading-snug text-ink-100">
          {notification.title}
        </p>
        <p className="mt-0.5 line-clamp-2 text-xs text-ink-400">{notification.body}</p>
        <p className="mt-1 flex items-center gap-1 text-[11px] text-ink-500">
          <ClockIcon className="size-3 shrink-0" aria-hidden="true" />
          {formatRelativeTime(notification.createdAt)}
        </p>
      </div>
      {/* Trailing unread dot + action */}
      <div className="flex shrink-0 flex-col items-center gap-1.5 pt-0.5">
        {!notification.read && (
          <>
            <span aria-hidden="true" className="h-2 w-2 rounded-full bg-brand-400" />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-6"
              aria-label="Mark as read"
              onClick={() => onMarkRead(notification.id)}
            >
              <CheckCircleIcon className="size-4" aria-hidden="true" />
            </Button>
          </>
        )}
      </div>
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
      <PopoverContent
        align="end"
        className="w-80 border-ink-800 bg-ink-900 p-0 shadow-pop"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-ink-800 px-4 py-3">
          <h2 className="text-sm font-semibold text-ink-50">შეტყობინებები</h2>
          {unreadCount > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs text-ink-400 hover:text-ink-100"
              onClick={onMarkAllRead}
            >
              ყველა წაკითხულად
            </Button>
          )}
        </div>

        {/* Body */}
        <div className="max-h-[360px] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-10 text-sm text-ink-400">
              <BellIcon className="mr-2 size-4 animate-pulse" aria-hidden="true" />
              იტვირთება…
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10">
              <BellIcon className="size-8 text-ink-600" aria-hidden="true" />
              <p className="text-sm text-ink-400">შეტყობინება არ არის</p>
            </div>
          ) : (
            <div className="divide-y divide-ink-800">
              {notifications.map((n) => (
                <NotificationsPanelItem key={n.id} notification={n} onMarkRead={onMarkRead} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-ink-800 px-4 py-2.5">
          <Link
            href="/notifications"
            className="block text-center text-xs text-ink-400 transition-colors hover:text-ink-100"
          >
            ყველა შეტყობინება →
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
