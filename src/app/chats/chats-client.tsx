'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { ProfileAvatar } from '@/components/profile-avatar';
import { EmptyState } from '@/components/ui/empty-state';
import { MessageCircleIcon, SearchIcon } from '@/components/icons';
import type { AppSidebarStats, AppSidebarUser } from '@/components/app-sidebar';
import { formatRelativeTime } from '@/lib/format-relative-time';
import { cn } from '@/lib/utils';

type ConversationItem = {
  id: string;
  otherName: string;
  otherInitials: string;
  otherAvatarUrl?: string;
  lastMessageBody: string | null;
  lastMessageAt: string;
  unreadCount: number;
};

type ChatsClientProps = {
  currentPath: string;
  userId: string;
  role: 'footballer' | 'club';
  user: AppSidebarUser & { email?: string };
  unreadNotifications: number;
  sidebarStats?: AppSidebarStats;
  conversations: ConversationItem[];
};

function ConversationRow({ item }: { item: ConversationItem }) {
  const hasUnread = item.unreadCount > 0;
  const preview = item.lastMessageBody
    ? item.lastMessageBody.length > 60
      ? `${item.lastMessageBody.slice(0, 60)}…`
      : item.lastMessageBody
    : null;

  return (
    <Link
      href={`/chat/${item.id}`}
      className={cn(
        'flex w-full items-start gap-3 rounded-card px-3 py-3 text-left transition-colors hover:bg-ink-800/50',
        hasUnread ? 'bg-ink-800/30' : '',
      )}
    >
      <ProfileAvatar src={item.otherAvatarUrl} fallback={item.otherInitials} size="md" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p
            className={cn(
              'truncate text-[13.5px]',
              hasUnread ? 'font-semibold text-ink-50' : 'font-medium text-ink-100',
            )}
          >
            {item.otherName}
          </p>
          <span className="ml-auto shrink-0 text-[11px] text-ink-500">
            {formatRelativeTime(item.lastMessageAt)}
          </span>
        </div>
        <div className="mt-0.5 flex items-center gap-2">
          {preview ? (
            <p
              className={cn(
                'truncate text-[12.5px]',
                hasUnread ? 'font-medium text-ink-200' : 'text-ink-400',
              )}
            >
              {preview}
            </p>
          ) : null}
          {hasUnread ? (
            <span className="ml-auto flex h-[18px] min-w-[18px] shrink-0 items-center justify-center rounded-full bg-brand-400 px-1 text-[10.5px] font-bold text-ink-950">
              {item.unreadCount > 99 ? '99+' : item.unreadCount}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

export function ChatsClient({
  currentPath,
  userId,
  role,
  user,
  unreadNotifications,
  sidebarStats,
  conversations,
}: ChatsClientProps) {
  const router = useRouter();
  const [query, setQuery] = React.useState('');
  const [filter, setFilter] = React.useState<'all' | 'unread'>('all');

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  const filtered = conversations.filter((c) => {
    const matchesQuery = query ? c.otherName.toLowerCase().includes(query.toLowerCase()) : true;
    const matchesFilter = filter === 'all' || c.unreadCount > 0;
    return matchesQuery && matchesFilter;
  });

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
      unreadNotifications={unreadNotifications}
      sidebarStats={sidebarStats}
      onSignOut={handleSignOut}
    >
      <div className="space-y-5">
        {/* Page heading */}
        <div className="flex items-center justify-between gap-3">
          <h1 className="font-display text-[22px] font-bold tracking-tight text-ink-50">ჩატები</h1>
          {conversations.length > 0 && (
            <span className="text-[13px] text-ink-400">{conversations.length} საუბარი</span>
          )}
        </div>

        {/* Conversation list card */}
        <div className="overflow-hidden rounded-card border border-ink-800 bg-ink-900 shadow-card">
          {/* Search + filters header */}
          <div className="border-b border-ink-800 px-4 pb-3 pt-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-500">
                საუბრები
              </h2>
              {role === 'club' && (
                <Link
                  href="/directory"
                  aria-label="ახალი ჩატის დაწყება"
                  className="flex h-7 w-7 items-center justify-center rounded-btn bg-ink-800 text-ink-300 transition-colors hover:bg-ink-700 hover:text-ink-50"
                >
                  {/* Plus icon inline to avoid test mock gap */}
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </Link>
              )}
            </div>

            {conversations.length > 0 && (
              <>
                {/* Search */}
                <div className="relative mt-3">
                  <SearchIcon
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-500"
                    aria-hidden="true"
                  />
                  <input
                    type="search"
                    placeholder="საუბრის ძიება…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    aria-label="საუბრის ძიება"
                    className="h-10 w-full rounded-field border border-ink-700 bg-ink-950 pl-9 pr-3 text-[13.5px] text-ink-50 placeholder:text-ink-600 outline-none transition-colors focus:border-brand-400/60 focus:ring-4 focus:ring-brand-400/15"
                  />
                </div>

                {/* Filter tabs */}
                <div className="mt-3 flex gap-1">
                  {(
                    [
                      ['all', 'ყველა'],
                      ['unread', `წაუკითხავი${totalUnread ? ' · ' + totalUnread : ''}`],
                    ] as const
                  ).map(([k, l]) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setFilter(k)}
                      className={cn(
                        'flex-1 rounded-btn px-3 py-1.5 text-[12.5px] font-medium transition-colors',
                        filter === k
                          ? 'bg-ink-800 text-ink-50'
                          : 'text-ink-400 hover:bg-ink-800/50 hover:text-ink-200',
                      )}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* List body */}
          <div className="p-2">
            {conversations.length === 0 ? (
              <EmptyState
                icon={<MessageCircleIcon className="size-10" />}
                title="ჯერ ჩატი არ გაქვს"
                description={
                  role === 'footballer'
                    ? 'კლუბები ინიციირებენ საუბარს. მას შემდეგ, რაც კლუბი მოგწერს, ჩატი აქ გამოჩნდება.'
                    : 'გახსენი Directory, მოძებნე ფეხბურთელი და დაიწყე ჩატი მის პროფილიდან.'
                }
                action={
                  role === 'club' ? (
                    <Button variant="default" size="sm" asChild>
                      <Link href="/directory">Directory-ს გახსნა</Link>
                    </Button>
                  ) : undefined
                }
              />
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ink-800 text-ink-500">
                  <SearchIcon className="size-5" aria-hidden="true" />
                </span>
                <p className="mt-3 text-[13px] font-medium text-ink-300">
                  ამ სახელით საუბარი ვერ მოიძებნა.
                </p>
              </div>
            ) : (
              <div className="flex flex-col">
                {filtered.map((item) => (
                  <ConversationRow key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
