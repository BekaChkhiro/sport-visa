'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { ProfileAvatar } from '@/components/profile-avatar';
import { PositionChip } from '@/components/position-chip';
import {
  ArrowLeftIcon,
  StarIcon,
  UserIcon,
  MapPinIcon,
  GridViewIcon,
  ListViewIcon,
  FiltersIcon,
} from '@/components/icons';
import type { AppSidebarStats } from '@/components/app-sidebar';
import type { VerificationStatus } from '@/components/verification-badge';
import { toggleShortlist } from '@/lib/directory/actions';
import { cn } from '@/lib/utils';

type ShortlistItem = {
  shortlistEntryId: string;
  id: string;
  firstName: string;
  lastName: string;
  positions: string[];
  height?: number;
  nationality?: string;
  city?: string;
  avatarUrl?: string;
  verificationStatus: VerificationStatus;
  shortlistedAt: string;
};

type ShortlistClientProps = {
  currentPath: string;
  user: {
    name: string;
    initials: string;
    image?: string;
    city?: string;
    verificationStatus?: VerificationStatus;
  };
  sidebarStats?: AppSidebarStats;
  unreadNotifications: number;
  items: ShortlistItem[];
};

function ShortlistCard({
  item,
  onRemove,
  removing,
}: {
  item: ShortlistItem;
  onRemove: (id: string) => void;
  removing: boolean;
}) {
  const name = `${item.firstName} ${item.lastName}`.trim();
  const initials = [item.firstName[0], item.lastName[0]].filter(Boolean).join('').toUpperCase();

  return (
    <article
      className={cn(
        'group overflow-hidden rounded-card border border-ink-800 bg-ink-900 shadow-card transition-colors hover:border-ink-700',
        removing && 'pointer-events-none opacity-50',
      )}
    >
      <div className="flex items-start gap-3.5 p-4">
        <ProfileAvatar src={item.avatarUrl} fallback={initials} size="md" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-[15px] font-semibold text-ink-50">{name}</p>
              {item.city ? (
                <p className="flex items-center gap-1 truncate text-[12px] text-ink-500">
                  <MapPinIcon className="size-3 shrink-0" />
                  {item.city}
                </p>
              ) : null}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="სიიდან ამოშლა"
              aria-pressed={true}
              onClick={() => onRemove(item.id)}
              disabled={removing}
              className="size-8 shrink-0 text-brand-300 hover:bg-danger-400/10 hover:text-danger-300"
            >
              <StarIcon className="size-4 fill-current" />
            </Button>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {item.positions.map((pos) => (
              <PositionChip key={pos} position={pos} />
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 border-t border-ink-800 px-4 py-3">
        <Button variant="ghost" size="sm" className="h-8 text-[12.5px]" asChild>
          <Link href={`/directory/${item.id}`}>ნახვა</Link>
        </Button>
        <Button size="sm" className="ml-auto" asChild>
          <Link href={`/chats?footballerId=${item.id}`}>მესიჯი</Link>
        </Button>
      </div>
    </article>
  );
}

function ShortlistRow({
  item,
  onRemove,
  removing,
}: {
  item: ShortlistItem;
  onRemove: (id: string) => void;
  removing: boolean;
}) {
  const name = `${item.firstName} ${item.lastName}`.trim();
  const initials = [item.firstName[0], item.lastName[0]].filter(Boolean).join('').toUpperCase();
  const meta = [item.city, item.nationality, item.height ? `${item.height} სმ` : null]
    .filter(Boolean)
    .join(' · ');

  return (
    <div
      className={cn(
        'flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-ink-800/40',
        removing && 'pointer-events-none opacity-50',
      )}
    >
      <ProfileAvatar src={item.avatarUrl} fallback={initials} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-semibold text-ink-50">{name}</p>
        {meta ? (
          <p className="mt-0.5 flex items-center gap-1 truncate text-[12px] text-ink-500">{meta}</p>
        ) : null}
      </div>
      <div className="hidden flex-wrap gap-1.5 sm:flex">
        {item.positions.map((pos) => (
          <PositionChip key={pos} position={pos} />
        ))}
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <Button variant="ghost" size="sm" className="h-9 text-[12.5px]" asChild>
          <Link href={`/directory/${item.id}`}>ნახვა</Link>
        </Button>
        <Button size="sm" asChild>
          <Link href={`/chats?footballerId=${item.id}`}>მესიჯი</Link>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="სიიდან ამოშლა"
          aria-pressed={true}
          onClick={() => onRemove(item.id)}
          disabled={removing}
          className="size-9 text-ink-500 hover:bg-danger-400/10 hover:text-danger-300"
        >
          <StarIcon className="size-4 fill-current" />
        </Button>
      </div>
    </div>
  );
}

type ViewKey = 'grid' | 'list';

export function ShortlistClient({
  currentPath,
  user,
  sidebarStats,
  unreadNotifications,
  items: initialItems,
}: ShortlistClientProps) {
  const router = useRouter();
  const [items, setItems] = React.useState(initialItems);
  const [view, setView] = React.useState<ViewKey>('grid');
  const [removingIds, setRemovingIds] = React.useState<Set<string>>(new Set());
  const [toast, setToast] = React.useState<{ message: string; type: 'success' | 'error' } | null>(
    null,
  );
  const toastTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  function showToast(message: string, type: 'success' | 'error' = 'success') {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, type });
    toastTimerRef.current = setTimeout(() => setToast(null), 3000);
  }

  async function handleRemove(footballerId: string) {
    setRemovingIds((prev) => new Set(prev).add(footballerId));
    const result = await toggleShortlist(footballerId);
    if (result.status === 'error') {
      showToast(result.message, 'error');
    } else {
      setItems((prev) => prev.filter((item) => item.id !== footballerId));
      showToast('სიიდან ამოიშალა');
      // Resync the server-rendered sidebar shortlist count.
      router.refresh();
    }
    setRemovingIds((prev) => {
      const next = new Set(prev);
      next.delete(footballerId);
      return next;
    });
  }

  async function handleSignOut() {
    await signOut({ redirect: false });
    router.push('/auth/signin');
  }

  return (
    <AppShell
      role="club"
      currentPath={currentPath}
      user={user}
      unreadNotifications={unreadNotifications}
      sidebarStats={sidebarStats}
      onSignOut={handleSignOut}
    >
      {toast ? (
        <div
          role="status"
          aria-live="polite"
          className={cn(
            'fixed bottom-6 left-1/2 z-50 -translate-x-1/2 flex items-center gap-2.5 rounded-pill border px-4 py-2.5 text-[13px] font-medium shadow-float',
            toast.type === 'error'
              ? 'border-danger-400/30 bg-ink-900 text-danger-300'
              : 'border-success-400/30 bg-ink-900 text-ink-100',
          )}
        >
          {toast.message}
        </div>
      ) : null}

      <div className="space-y-6">
        <div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/club">
              <ArrowLeftIcon className="size-4" />
              მთავარზე დაბრუნება
            </Link>
          </Button>
        </div>

        {/* Page header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-brand-400/15 text-brand-300">
                <StarIcon className="size-4 fill-current" />
              </span>
              <h1 className="font-display text-[27px] font-bold tracking-tight text-ink-50">
                შერჩეული ფეხბურთელები
              </h1>
            </div>
            {items.length > 0 ? (
              <p className="mt-1.5 font-mono tabular-nums text-[13.5px] text-ink-400">
                {`შენი სკაუტინგის სია — ${items.length} ფეხბურთელი შენახულია.`}
              </p>
            ) : null}
          </div>
          <div className="flex items-center gap-2.5">
            <Button variant="outline" size="sm" asChild>
              <Link href="/directory">
                <FiltersIcon className="size-4" />
                ფილტრი
              </Link>
            </Button>
            {/* View toggle */}
            <div className="flex rounded-btn border border-ink-700 bg-ink-900 p-1">
              <button
                type="button"
                onClick={() => setView('grid')}
                aria-label="Grid ხედი"
                aria-pressed={view === 'grid'}
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-[7px] transition-colors',
                  view === 'grid' ? 'bg-ink-800 text-ink-100' : 'text-ink-500 hover:text-ink-200',
                )}
              >
                <GridViewIcon className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setView('list')}
                aria-label="List ხედი"
                aria-pressed={view === 'list'}
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-[7px] transition-colors',
                  view === 'list' ? 'bg-ink-800 text-ink-100' : 'text-ink-500 hover:text-ink-200',
                )}
              >
                <ListViewIcon className="size-4" />
              </button>
            </div>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center rounded-card border border-dashed border-ink-700 px-5 py-20 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-ink-800 text-ink-500">
              <StarIcon className="size-7" />
            </span>
            <p className="mt-4 font-display text-[18px] font-bold text-ink-50">სია ცარიელია</p>
            <p className="mt-1.5 max-w-sm text-[13.5px] text-ink-500">
              დაამატე ფეხბურთელები შერჩეულებში ★-ით ფეხბურთელების დირექტორიიდან, რომ აქ ნახო.
            </p>
            <Button className="mt-4" asChild>
              <Link href="/directory">
                <UserIcon className="size-4" />
                ფეხბურთელების დათვალიერება
              </Link>
            </Button>
          </div>
        ) : view === 'grid' ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <ShortlistCard
                key={item.id}
                item={item}
                onRemove={handleRemove}
                removing={removingIds.has(item.id)}
              />
            ))}
          </div>
        ) : (
          <div className="overflow-hidden rounded-card border border-ink-800 bg-ink-900 shadow-card">
            <div className="divide-y divide-ink-800">
              {items.map((item) => (
                <ShortlistRow
                  key={item.id}
                  item={item}
                  onRemove={handleRemove}
                  removing={removingIds.has(item.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
