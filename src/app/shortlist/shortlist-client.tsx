'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { ProfileAvatar } from '@/components/profile-avatar';
import { PositionChip } from '@/components/position-chip';
import { EmptyState } from '@/components/ui/empty-state';
import { ArrowLeftIcon, StarIcon, UserIcon, MapPinIcon } from '@/components/icons';
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
        'group flex items-center gap-3.5 rounded-card border border-ink-800 bg-ink-900 px-4 py-3.5 shadow-card transition-colors hover:border-ink-700',
        removing && 'pointer-events-none opacity-50',
      )}
    >
      <ProfileAvatar src={item.avatarUrl} fallback={initials} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-semibold text-ink-50">{name}</p>
        {meta ? (
          <p className="mt-0.5 flex items-center gap-1 truncate text-[12px] text-ink-500">
            <MapPinIcon className="size-3 shrink-0" />
            {meta}
          </p>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {item.positions[0] ? <PositionChip position={item.positions[0]} /> : null}
        <Button variant="outline" size="sm" asChild>
          <Link href={`/directory/${item.id}`}>პროფილი</Link>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="სიიდან ამოშლა"
          aria-pressed={true}
          onClick={() => onRemove(item.id)}
          disabled={removing}
          className="size-9 text-brand-300 hover:bg-danger-400/10 hover:text-danger-300"
        >
          <StarIcon className="size-4 fill-current" />
        </Button>
      </div>
    </div>
  );
}

export function ShortlistClient({
  currentPath,
  user,
  sidebarStats,
  unreadNotifications,
  items: initialItems,
}: ShortlistClientProps) {
  const router = useRouter();
  const [items, setItems] = React.useState(initialItems);
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
              Dashboard-ზე დაბრუნება
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
              <h1 className="text-[24px] font-bold tracking-tight text-ink-50">
                შერჩეული ფეხბურთელები
              </h1>
            </div>
            {items.length > 0 ? (
              <p className="mt-1.5 text-[13.5px] text-ink-400">
                შენი სკაუტინგის სია —{' '}
                <span className="font-mono font-semibold tabular-nums text-ink-200">
                  {items.length} ფეხბ.
                </span>
              </p>
            ) : null}
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/directory">
              <StarIcon className="size-4" />
              Directory
            </Link>
          </Button>
        </div>

        {items.length > 0 ? (
          <div className="flex flex-col gap-2">
            {items.map((item) => (
              <ShortlistRow
                key={item.id}
                item={item}
                onRemove={handleRemove}
                removing={removingIds.has(item.id)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-card border border-ink-800 bg-ink-900 shadow-card">
            <EmptyState
              icon={<UserIcon className="size-10" />}
              title="შ. სია ცარიელია"
              description="Directory-ში მოიძიე ფეხბურთელები და ★ ღილაკით დაამატე შ. სიაში."
              action={
                <Button variant="default" size="sm" asChild>
                  <Link href="/directory">Directory-ს გახსნა</Link>
                </Button>
              }
            />
          </div>
        )}
      </div>
    </AppShell>
  );
}
