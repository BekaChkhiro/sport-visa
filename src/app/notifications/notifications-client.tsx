'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { BellIcon, CheckCircleIcon } from '@/components/icons';
import { useNotifications } from '@/hooks/use-notifications';
import { formatRelativeTime } from '@/lib/format-relative-time';
import { cn } from '@/lib/utils';
import type { NotificationItem } from '@/hooks/use-notifications';
import type {
  AppSidebarAdminBadges,
  AppSidebarRole,
  AppSidebarStats,
  AppSidebarUser,
} from '@/components/app-sidebar';

// ─── Tone palette ─────────────────────────────────────────────────────────────

type ToneKey = 'accent' | 'brand' | 'iris' | 'flame' | 'success' | 'warning';

const TONE_CLASSES: Record<ToneKey, string> = {
  accent: 'bg-accent-400/15 text-accent-300',
  brand: 'bg-brand-400/15 text-brand-300',
  iris: 'bg-iris-400/15 text-iris-300',
  flame: 'bg-flame-400/15 text-flame-300',
  success: 'bg-success-400/15 text-success-300',
  warning: 'bg-warning-400/15 text-warning-300',
};

// ─── Inline SVG icons (not yet in icons.tsx) ──────────────────────────────────

function MegaphoneSvg() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 11v2a1 1 0 0 0 1 1h2l9 5V5L6 10H4a1 1 0 0 0-1 1Z" />
      <path d="M18 9a4 4 0 0 1 0 6" />
    </svg>
  );
}
function BookmarkSvg() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z" />
    </svg>
  );
}
function BriefcaseSvg() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18" />
    </svg>
  );
}
function MessageSvg() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12a8 8 0 0 1-11.5 7.2L4 20l.9-5.4A8 8 0 1 1 21 12Z" />
    </svg>
  );
}
function ShieldCheckSvg() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
function CheckSvg() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m20 6-11 11-5-5" />
    </svg>
  );
}
function CloseSvg() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

// ─── Type → icon + tone ───────────────────────────────────────────────────────

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; tone: ToneKey }> = {
  NEW_MESSAGE: { icon: <MessageSvg />, tone: 'accent' },
  NEW_CLUB_POST: { icon: <MegaphoneSvg />, tone: 'iris' },
  ACCOUNT_APPROVED: { icon: <ShieldCheckSvg />, tone: 'success' },
  SERVICE_REQUEST_RESOLVED: { icon: <CheckSvg />, tone: 'brand' },
  SERVICE_REQUEST_SUBMITTED: { icon: <BriefcaseSvg />, tone: 'warning' },
  APPLICATION_STATUS: { icon: <BookmarkSvg />, tone: 'flame' },
};

const DEFAULT_CONFIG = {
  icon: <BellIcon className="size-[18px]" aria-hidden="true" />,
  tone: 'accent' as ToneKey,
};

// ─── Grouping helper ──────────────────────────────────────────────────────────

function groupByDate(items: NotificationItem[]) {
  const groups: { label: string; items: NotificationItem[] }[] = [];
  const seen = new Set<string>();

  for (const item of items) {
    const date = new Date(item.createdAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    let label: string;
    if (diffDays === 0) {
      label = 'დღეს';
    } else if (diffDays < 7) {
      label = 'ამ კვირაში';
    } else {
      label = 'ადრე';
    }

    if (!seen.has(label)) {
      seen.add(label);
      groups.push({ label, items: [] });
    }
    groups.find((g) => g.label === label)!.items.push(item);
  }

  return groups;
}

// ─── Types ────────────────────────────────────────────────────────────────────

type NotificationsClientProps = {
  shellRole: AppSidebarRole;
  shellUser: AppSidebarUser & { email?: string };
  userId: string;
  sidebarStats?: AppSidebarStats;
  adminBadges?: AppSidebarAdminBadges;
  unreadNotifications: number;
  initialNotifications: NotificationItem[];
};

// ─── NotificationRow ─────────────────────────────────────────────────────────

function NotificationRow({
  notification,
  onMarkRead,
}: {
  notification: NotificationItem;
  onMarkRead: (id: string) => void;
}) {
  const typeInfo = TYPE_CONFIG[notification.type] ?? DEFAULT_CONFIG;

  return (
    <div
      className={cn(
        'group flex gap-3.5 px-4 py-3.5 transition-colors hover:bg-ink-800/40',
        !notification.read && 'bg-brand-400/[0.04]',
      )}
    >
      {/* Icon chip */}
      <span
        aria-hidden="true"
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px]',
          TONE_CLASSES[typeInfo.tone],
        )}
      >
        {typeInfo.icon}
      </span>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <p
            className={cn(
              'text-[13.5px] leading-snug',
              notification.read ? 'font-medium text-ink-200' : 'font-semibold text-ink-50',
            )}
          >
            {notification.title}
          </p>
          {!notification.read && (
            <span
              aria-hidden="true"
              className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-400"
            />
          )}
        </div>
        <p className="mt-0.5 truncate text-[12.5px] text-ink-400">{notification.body}</p>
        <p className="mt-1 text-[11px] text-ink-600">
          {formatRelativeTime(notification.createdAt)}
        </p>
      </div>

      {/* Mark read + dismiss */}
      <div className="flex shrink-0 flex-col items-center gap-1.5 pt-0.5">
        {!notification.read && (
          <>
            <span aria-hidden="true" className="h-2 w-2 rounded-full bg-brand-400" />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-6"
              aria-label="წაკითხულად მონიშვნა"
              onClick={() => onMarkRead(notification.id)}
            >
              <CheckCircleIcon className="size-4" aria-hidden="true" />
            </Button>
          </>
        )}
        <button
          type="button"
          aria-label="შეტყობინების წაშლა"
          className="flex h-8 w-8 items-center justify-center rounded-btn text-ink-600 opacity-0 transition-all hover:bg-ink-800 hover:text-ink-200 group-hover:opacity-100"
        >
          <CloseSvg />
        </button>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function NotificationsClient({
  shellRole,
  shellUser,
  userId,
  sidebarStats,
  adminBadges,
  unreadNotifications,
  initialNotifications,
}: NotificationsClientProps) {
  const router = useRouter();
  const [filter, setFilter] = React.useState<'all' | 'unread'>('all');

  const { notifications, unreadCount, loading, markRead, markAllRead } = useNotifications(
    userId,
    initialNotifications,
  );

  const shown = filter === 'unread' ? notifications.filter((n) => !n.read) : notifications;
  const groups = groupByDate(shown);

  async function handleSignOut() {
    await signOut({ redirect: false });
    router.push('/auth/signin');
  }

  return (
    <AppShell
      role={shellRole}
      currentPath="/notifications"
      userId={userId}
      user={shellUser}
      unreadNotifications={unreadNotifications}
      sidebarStats={sidebarStats}
      adminBadges={adminBadges}
      onSignOut={handleSignOut}
    >
      <div className="mx-auto max-w-[760px] space-y-6">
        {/* Page heading */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-display text-[27px] font-bold tracking-tight text-ink-50">
                შეტყობინებები
              </h1>
              {unreadCount > 0 && (
                <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-brand-400 px-2 text-[12px] font-bold text-ink-950">
                  {unreadCount}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <p className="mt-1 text-[13px] text-ink-400">{unreadCount} წაუკითხავი</p>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => void markAllRead()}
                className="border-ink-700 bg-ink-900 text-ink-200 hover:border-ink-600 hover:bg-ink-800"
              >
                <CheckCircleIcon className="size-4" aria-hidden="true" />
                ყველა წაკითხულად
              </Button>
            )}
          </div>
        </div>

        {/* Filter tabs */}
        <div className="inline-flex rounded-btn border border-ink-700 bg-ink-900 p-1">
          {(
            [
              ['all', 'ყველა', notifications.length],
              ['unread', 'წაუკითხავი', unreadCount],
            ] as const
          ).map(([id, label, count]) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              className={cn(
                'flex items-center gap-2 rounded-[8px] px-4 py-2 text-[13px] font-medium transition-colors',
                filter === id ? 'bg-ink-800 text-ink-50' : 'text-ink-400 hover:text-ink-100',
              )}
            >
              {label}
              <span
                className={cn(
                  'flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10.5px] font-bold',
                  filter === id ? 'bg-brand-400/20 text-brand-300' : 'bg-ink-800 text-ink-500',
                )}
              >
                {count}
              </span>
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-ink-400">
            <BellIcon className="size-10 animate-pulse" aria-hidden="true" />
            <p className="text-[13px]">იტვირთება…</p>
          </div>
        ) : shown.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20">
            <BellIcon className="size-12 text-ink-600" aria-hidden="true" />
            <p className="text-[13px] text-ink-400">შეტყობინება არ არის</p>
          </div>
        ) : (
          <div className="space-y-6">
            {groups.map((group) => (
              <div key={group.label}>
                <p className="mb-2.5 px-1 text-[11px] font-bold uppercase tracking-[0.16em] text-ink-600">
                  {group.label}
                </p>
                <div className="overflow-hidden rounded-card border border-ink-800 bg-ink-900 shadow-card">
                  <div className="divide-y divide-ink-800">
                    {group.items.map((n) => (
                      <NotificationRow
                        key={n.id}
                        notification={n}
                        onMarkRead={(id) => void markRead(id)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
