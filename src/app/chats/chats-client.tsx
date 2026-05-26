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
  user: {
    name: string;
    initials: string;
    image?: string;
    position?: string;
    nationality?: string;
    city?: string;
  };
  unreadNotifications: number;
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
        'flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors hover:bg-muted',
        hasUnread ? 'border-primary/20 bg-primary/5' : 'border-border bg-card',
      )}
    >
      <ProfileAvatar src={item.otherAvatarUrl} fallback={item.otherInitials} size="md" />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className={cn('truncate text-sm', hasUnread ? 'font-semibold' : 'font-medium')}>
            {item.otherName}
          </p>
          <span className="shrink-0 text-xs text-muted-foreground">
            {formatRelativeTime(item.lastMessageAt)}
          </span>
        </div>
        {preview ? (
          <p
            className={cn(
              'mt-0.5 truncate text-xs',
              hasUnread ? 'text-foreground' : 'text-muted-foreground',
            )}
          >
            {preview}
          </p>
        ) : null}
      </div>
      {hasUnread ? (
        <span className="inline-flex min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground">
          {item.unreadCount > 99 ? '99+' : item.unreadCount}
        </span>
      ) : null}
    </Link>
  );
}

export function ChatsClient({
  currentPath,
  userId,
  role,
  user,
  unreadNotifications,
  conversations,
}: ChatsClientProps) {
  const router = useRouter();
  const [query, setQuery] = React.useState('');

  const filtered = query
    ? conversations.filter((c) => c.otherName.toLowerCase().includes(query.toLowerCase()))
    : conversations;

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
      onSignOut={handleSignOut}
    >
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-xl font-bold">ჩატები</h1>
          {conversations.length > 0 ? (
            <span className="text-sm text-muted-foreground">{conversations.length} საუბარი</span>
          ) : null}
        </div>

        {conversations.length > 0 ? (
          <>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                placeholder="საუბრის ძიება…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {filtered.length > 0 ? (
              <div className="flex flex-col gap-2">
                {filtered.map((item) => (
                  <ConversationRow key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                ამ სახელით საუბარი ვერ მოიძებნა.
              </p>
            )}
          </>
        ) : (
          <div className="rounded-xl border border-border bg-card">
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
          </div>
        )}
      </div>
    </AppShell>
  );
}
