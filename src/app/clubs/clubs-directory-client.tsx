'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ClubCard } from '@/components/club-card';
import { EmptyState } from '@/components/ui/empty-state';
import { ChevronLeftIcon, ChevronRightIcon, SearchIcon } from '@/components/icons';
import type {
  AppSidebarAdminBadges,
  AppSidebarRole,
  AppSidebarStats,
  AppSidebarUser,
} from '@/components/app-sidebar';
import type { VerificationStatus } from '@/components/verification-badge';
import { toggleSubscription } from '@/lib/clubs/actions';

type ClubItem = {
  id: string;
  name: string;
  city?: string;
  country?: string;
  league?: string;
  foundedYear?: number;
  logoUrl?: string;
  verificationStatus: VerificationStatus;
  isSubscribed: boolean;
};

type FilterOption = { value: string; label: string };

type SortKey = 'newest' | 'name-asc' | 'name-desc';

const SORT_LABELS: Record<SortKey, string> = {
  newest: 'სიახლე',
  'name-asc': 'სახ. ა-ჰ',
  'name-desc': 'სახ. ჰ-ა',
};

type ClubsDirectoryClientProps = {
  shellRole: AppSidebarRole;
  shellUser: AppSidebarUser & { email?: string };
  userId: string;
  sidebarStats?: AppSidebarStats;
  adminBadges?: AppSidebarAdminBadges;
  unreadNotifications: number;
  viewerRole: string | null;
  items: ClubItem[];
  total: number;
  page: number;
  pageSize: number;
  sort: SortKey;
  initialSearch?: string;
  initialCountry?: string;
  initialCity?: string;
  countryOptions: FilterOption[];
  cityOptions: FilterOption[];
};

function buildUrl(overrides: Record<string, string | undefined>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(overrides)) {
    if (value !== undefined) params.set(key, value);
  }
  const qs = params.toString();
  return qs ? `/clubs?${qs}` : '/clubs';
}

function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages: (number | '...')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push('...');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i);
    }
    if (page < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  return (
    <nav aria-label="პაგინაცია" className="flex items-center justify-center gap-1">
      <Button
        variant="outline"
        size="sm"
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        aria-label="წინა გვერდი"
      >
        <ChevronLeftIcon className="size-4" />
        წინა
      </Button>

      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="px-2 text-muted-foreground">
            ···
          </span>
        ) : (
          <Button
            key={p}
            variant={p === page ? 'default' : 'outline'}
            size="sm"
            onClick={() => onPageChange(p)}
            aria-current={p === page ? 'page' : undefined}
            className="min-w-9"
          >
            {p}
          </Button>
        ),
      )}

      <Button
        variant="outline"
        size="sm"
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
        aria-label="შემდეგი გვერდი"
      >
        შემდ.
        <ChevronRightIcon className="size-4" />
      </Button>
    </nav>
  );
}

export function ClubsDirectoryClient({
  shellRole,
  shellUser,
  userId,
  sidebarStats,
  adminBadges,
  unreadNotifications,
  viewerRole,
  items,
  total,
  page,
  pageSize,
  sort,
  initialSearch,
  initialCountry,
  initialCity,
  countryOptions,
  cityOptions,
}: ClubsDirectoryClientProps) {
  const router = useRouter();
  const canSubscribe = viewerRole === 'FOOTBALLER';

  async function handleSignOut() {
    await signOut({ redirect: false });
    router.push('/auth/signin');
  }

  const [subscribedIds, setSubscribedIds] = React.useState<Set<string>>(
    () => new Set(items.filter((c) => c.isSubscribed).map((c) => c.id)),
  );
  const [pendingIds, setPendingIds] = React.useState<Set<string>>(new Set());

  // search/filter local state (controlled inputs; apply on submit or select)
  const [searchDraft, setSearchDraft] = React.useState(initialSearch ?? '');

  // Keep the search box in sync with the applied search after navigation
  // (filter/sort/page changes) so the input never shows a stale, unapplied query.
  React.useEffect(() => {
    setSearchDraft(initialSearch ?? '');
  }, [initialSearch]);

  React.useEffect(() => {
    setSubscribedIds(new Set(items.filter((c) => c.isSubscribed).map((c) => c.id)));
  }, [items]);

  const totalPages = Math.ceil(total / pageSize);

  function pushUrl(overrides: Record<string, string | undefined>) {
    router.push(buildUrl(overrides));
  }

  function currentParams(): Record<string, string | undefined> {
    return {
      sort: sort !== 'newest' ? sort : undefined,
      search: initialSearch,
      country: initialCountry,
      city: initialCity,
    };
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = searchDraft.trim() || undefined;
    pushUrl({ ...currentParams(), search: q, page: undefined });
  }

  function handleSortChange(next: SortKey) {
    pushUrl({ ...currentParams(), sort: next !== 'newest' ? next : undefined, page: undefined });
  }

  function handleCountryChange(v: string) {
    pushUrl({
      ...currentParams(),
      country: v || undefined,
      city: undefined,
      page: undefined,
    });
  }

  function handleCityChange(v: string) {
    pushUrl({ ...currentParams(), city: v || undefined, page: undefined });
  }

  function handlePageChange(p: number) {
    pushUrl({ ...currentParams(), page: p > 1 ? String(p) : undefined });
  }

  function handleReset() {
    setSearchDraft('');
    router.push('/clubs');
  }

  async function handleSubscribeToggle(id: string, next: boolean) {
    if (pendingIds.has(id)) return;
    setPendingIds((s) => new Set(s).add(id));
    setSubscribedIds((s) => {
      const updated = new Set(s);
      if (next) updated.add(id);
      else updated.delete(id);
      return updated;
    });

    const result = await toggleSubscription(id);

    if (result.status === 'error') {
      setSubscribedIds((s) => {
        const reverted = new Set(s);
        if (next) reverted.delete(id);
        else reverted.add(id);
        return reverted;
      });
    }

    setPendingIds((s) => {
      const updated = new Set(s);
      updated.delete(id);
      return updated;
    });
  }

  const hasFilters = !!(initialSearch || initialCountry || initialCity);

  return (
    <AppShell
      role={shellRole}
      currentPath="/clubs"
      user={shellUser}
      userId={userId}
      unreadNotifications={unreadNotifications}
      sidebarStats={sidebarStats}
      adminBadges={adminBadges}
      onSignOut={handleSignOut}
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">კლუბები</h1>
        <p className="mt-1 text-sm text-muted-foreground">{total} კლუბი</p>
      </div>

      {/* Filters bar */}
      <div className="mb-6 flex flex-wrap items-end gap-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative">
            <SearchIcon
              className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              placeholder="კლუბის ძებნა..."
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              className="pl-8 w-48 sm:w-64"
              aria-label="კლუბის ძებნა"
            />
          </div>
          <Button type="submit" variant="outline" size="sm">
            ძებნა
          </Button>
        </form>

        {countryOptions.length > 0 && (
          <select
            aria-label="ქვეყანა"
            value={initialCountry ?? ''}
            onChange={(e) => handleCountryChange(e.target.value)}
            className="rounded-md border border-input bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">ყველა ქვ.</option>
            {countryOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        )}

        {cityOptions.length > 0 && (
          <select
            aria-label="ქალაქი"
            value={initialCity ?? ''}
            onChange={(e) => handleCityChange(e.target.value)}
            className="rounded-md border border-input bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">ყველა ქ.</option>
            {cityOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        )}

        <select
          aria-label="სორტირება"
          value={sort}
          onChange={(e) => handleSortChange(e.target.value as SortKey)}
          className="rounded-md border border-input bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {(Object.entries(SORT_LABELS) as [SortKey, string][]).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={handleReset}>
            გასუფ.
          </Button>
        )}
      </div>

      {/* Results */}
      {items.length === 0 ? (
        <div className="rounded-xl border border-border bg-card">
          <EmptyState
            title="კლუბი ვერ მოიძებნა"
            description={
              hasFilters
                ? 'ფილტრებთან კლუბი ვერ მოიძებნა — სცადეთ ფილტ. გასუფ.'
                : 'კლუბები ჯერ არ არის.'
            }
            action={
              hasFilters ? (
                <Button variant="outline" size="sm" onClick={handleReset}>
                  ფილტ. გასუფ.
                </Button>
              ) : undefined
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((club) => (
            <ClubCard
              key={club.id}
              id={club.id}
              name={club.name}
              city={club.city}
              country={club.country}
              league={club.league}
              foundedYear={club.foundedYear}
              logoUrl={club.logoUrl}
              verificationStatus={club.verificationStatus}
              canSubscribe={canSubscribe}
              isSubscribed={subscribedIds.has(club.id)}
              onSubscribeToggle={handleSubscribeToggle}
            />
          ))}
        </div>
      )}

      <div className="mt-6">
        <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
      </div>
    </AppShell>
  );
}
