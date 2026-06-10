'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { ClubCard } from '@/components/club-card';
import { EmptyState } from '@/components/ui/empty-state';
import { ChevronLeftIcon, ChevronRightIcon, SearchIcon, CloseIcon } from '@/components/icons';
import type {
  AppSidebarAdminBadges,
  AppSidebarRole,
  AppSidebarStats,
  AppSidebarUser,
} from '@/components/app-sidebar';
import type { VerificationStatus } from '@/components/verification-badge';
import { toggleSubscription } from '@/lib/clubs/actions';
import { cn } from '@/lib/utils';

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
    <nav aria-label="პაგინაცია" className="mt-7 flex items-center justify-center gap-1.5">
      <button
        type="button"
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        aria-label="წინა გვერდი"
        className="flex h-9 items-center gap-1 rounded-btn border border-ink-800 px-3 text-[13px] font-medium text-ink-600 transition-colors disabled:cursor-not-allowed enabled:border-ink-700 enabled:text-ink-300 enabled:hover:border-ink-600 enabled:hover:text-ink-100"
      >
        <ChevronLeftIcon className="size-4" />
        წინა
      </button>

      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="px-1 text-ink-600">
            ···
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            aria-current={p === page ? 'page' : undefined}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-btn text-[13px] font-semibold transition-colors',
              p === page
                ? 'bg-brand-400 text-ink-950'
                : 'border border-ink-700 text-ink-300 hover:border-ink-600 hover:text-ink-100',
            )}
          >
            {p}
          </button>
        ),
      )}

      <button
        type="button"
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
        aria-label="შემდეგი გვერდი"
        className="flex h-9 items-center gap-1 rounded-btn border border-ink-700 px-3 text-[13px] font-medium text-ink-300 transition-colors hover:border-ink-600 hover:text-ink-100 disabled:cursor-not-allowed disabled:border-ink-800 disabled:text-ink-600"
      >
        შემდ.
        <ChevronRightIcon className="size-4" />
      </button>
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

  const [searchDraft, setSearchDraft] = React.useState(initialSearch ?? '');

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
  const activeChips: { label: string; clear: () => void }[] = [
    ...(initialSearch
      ? [
          {
            label: `"${initialSearch}"`,
            clear: () => pushUrl({ ...currentParams(), search: undefined }),
          },
        ]
      : []),
    ...(initialCountry
      ? [
          {
            label: initialCountry,
            clear: () => pushUrl({ ...currentParams(), country: undefined }),
          },
        ]
      : []),
    ...(initialCity
      ? [{ label: initialCity, clear: () => pushUrl({ ...currentParams(), city: undefined }) }]
      : []),
  ];

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
      {/* Page header */}
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-brand-400">
            აღმოაჩინე
          </p>
          <h1 className="mt-1.5 font-display text-[28px] font-bold leading-tight tracking-tight text-ink-50 sm:text-[32px]">
            კლუბების ძიება
          </h1>
          <p className="mt-1.5 max-w-[48ch] text-[13.5px] text-ink-400">
            იპოვე კლუბი, გამოიწერე ფიდი და მიადევნე თვალი ღია სელექციებს.
          </p>
        </div>

        {/* Search row */}
        <div className="flex w-full items-center gap-2.5 sm:w-auto">
          <form onSubmit={handleSearchSubmit} className="flex flex-1 sm:flex-none gap-2">
            <div className="flex h-11 flex-1 items-center gap-2.5 rounded-field border border-ink-700 bg-ink-950 px-3.5 transition-colors focus-within:border-brand-400/60 focus-within:ring-4 focus-within:ring-brand-400/15 sm:w-72">
              <SearchIcon className="size-4 shrink-0 text-ink-500" aria-hidden="true" />
              <input
                type="search"
                placeholder="კლუბის ძიება…"
                value={searchDraft}
                onChange={(e) => setSearchDraft(e.target.value)}
                className="h-full flex-1 bg-transparent text-[14px] text-ink-50 outline-none placeholder:text-ink-600"
                aria-label="კლუბის ძებნა"
              />
              {searchDraft && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchDraft('');
                    pushUrl({ ...currentParams(), search: undefined });
                  }}
                  className="text-ink-500 hover:text-ink-200"
                  aria-label="ძიების გასუფ."
                >
                  <CloseIcon className="size-4" />
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Filters bar */}
      <div className="mb-5 flex flex-wrap items-center gap-2.5">
        {/* Country select */}
        {countryOptions.length > 0 && (
          <div className="relative">
            <select
              aria-label="ქვეყანა"
              value={initialCountry ?? ''}
              onChange={(e) => handleCountryChange(e.target.value)}
              className="h-10 appearance-none rounded-btn border border-ink-700 bg-ink-900 pl-3.5 pr-8 text-[13px] font-medium text-ink-200 transition-colors hover:border-ink-600 focus:outline-none focus:ring-2 focus:ring-brand-400/30"
            >
              <option value="">ყველა ქვ.</option>
              {countryOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <ChevronRightIcon
              className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 rotate-90 text-ink-500"
              aria-hidden="true"
            />
          </div>
        )}

        {/* City select */}
        {cityOptions.length > 0 && (
          <div className="relative">
            <select
              aria-label="ქალაქი"
              value={initialCity ?? ''}
              onChange={(e) => handleCityChange(e.target.value)}
              className="h-10 appearance-none rounded-btn border border-ink-700 bg-ink-900 pl-3.5 pr-8 text-[13px] font-medium text-ink-200 transition-colors hover:border-ink-600 focus:outline-none focus:ring-2 focus:ring-brand-400/30"
            >
              <option value="">ყველა ქ.</option>
              {cityOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <ChevronRightIcon
              className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 rotate-90 text-ink-500"
              aria-hidden="true"
            />
          </div>
        )}

        {/* Sort select */}
        <div className="relative">
          <select
            aria-label="სორტირება"
            value={sort}
            onChange={(e) => handleSortChange(e.target.value as SortKey)}
            className="h-10 appearance-none rounded-btn border border-ink-700 bg-ink-900 pl-3.5 pr-8 text-[13px] font-medium text-ink-200 transition-colors hover:border-ink-600 focus:outline-none focus:ring-2 focus:ring-brand-400/30"
          >
            {(Object.entries(SORT_LABELS) as [SortKey, string][]).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <ChevronRightIcon
            className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 rotate-90 text-ink-500"
            aria-hidden="true"
          />
        </div>

        {/* Reset */}
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={handleReset}>
            გასუფ.
          </Button>
        )}
      </div>

      {/* Active filter chips */}
      {activeChips.length > 0 && (
        <div className="mb-5 flex flex-wrap items-center gap-2">
          {activeChips.map((chip) => (
            <span
              key={chip.label}
              className="inline-flex items-center gap-1.5 rounded-pill border border-ink-700 bg-ink-900 py-1 pl-3 pr-2 text-[12px] text-ink-200"
            >
              {chip.label}
              <button
                type="button"
                onClick={chip.clear}
                className="text-ink-500 hover:text-ink-200"
                aria-label={`${chip.label} ფილტრის მოხსნა`}
              >
                <CloseIcon className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Results count */}
      <p className="mb-5 text-[13.5px] text-ink-400">
        <span className="font-mono font-semibold tabular-nums text-ink-50">{total}</span> კლუბი
        მოიძებნა
      </p>

      {/* Results grid */}
      {items.length === 0 ? (
        <div className="rounded-card border border-border bg-card">
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
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
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

      <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
    </AppShell>
  );
}
