'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { FootballerCard } from '@/components/footballer-card';
import { DirectoryFilterBar } from '@/components/directory-filter-bar';
import {
  DEFAULT_FILTERS,
  filtersToParams,
  countActiveFilters,
  type DirectoryFilters,
} from '@/lib/directory/filters';
import { EmptyState } from '@/components/ui/empty-state';
import {
  FiltersIcon,
  ListViewIcon,
  GridViewIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SearchIcon,
  UserIcon,
} from '@/components/icons';
import type { AppSidebarStats } from '@/components/app-sidebar';
import type { VerificationStatus } from '@/components/verification-badge';
import type { ComboboxOption } from '@/components/ui/combobox-field';
import { toggleShortlist } from '@/lib/directory/actions';
import { PositionChip } from '@/components/position-chip';
import { cn } from '@/lib/utils';
import Image from 'next/image';

type DirectoryUser = {
  name: string;
  initials: string;
  image?: string;
  city?: string;
  verificationStatus?: VerificationStatus;
};

type DirectoryFootballer = {
  id: string;
  name: string;
  position: string;
  age?: number;
  height?: number;
  nationality?: string;
  photoUrl?: string;
  verificationStatus: VerificationStatus;
  isShortlisted: boolean;
};

type SortKey = 'newest' | 'age-asc' | 'age-desc' | 'height-asc' | 'height-desc';
type ViewKey = 'grid' | 'list';

const SORT_LABELS: Record<SortKey, string> = {
  newest: 'სიახლე',
  'age-asc': 'ასაკი ↑',
  'age-desc': 'ასაკი ↓',
  'height-asc': 'სიმ. ↑',
  'height-desc': 'სიმ. ↓',
};

type DirectoryClientProps = {
  currentPath: string;
  user: DirectoryUser;
  sidebarStats?: AppSidebarStats;
  unreadNotifications: number;
  items: DirectoryFootballer[];
  total: number;
  page: number;
  pageSize: number;
  sort: SortKey;
  view: ViewKey;
  initialFilters: DirectoryFilters;
  nationalityOptions?: ComboboxOption[];
  cityOptions?: ComboboxOption[];
};

function buildUrl(base: string, overrides: Record<string, string | string[] | undefined>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      value.forEach((v) => params.append(key, v));
    } else {
      params.set(key, value);
    }
  }
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
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

export function DirectoryClient({
  currentPath,
  user,
  sidebarStats,
  unreadNotifications,
  items,
  total,
  page,
  pageSize,
  sort,
  view,
  initialFilters,
  nationalityOptions,
  cityOptions,
}: DirectoryClientProps) {
  const router = useRouter();

  const [draftFilters, setDraftFilters] = React.useState<DirectoryFilters>(initialFilters);
  const [shortlistedIds, setShortlistedIds] = React.useState<Set<string>>(
    () => new Set(items.filter((f) => f.isShortlisted).map((f) => f.id)),
  );
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [pendingIds, setPendingIds] = React.useState<Set<string>>(new Set());

  const filtersKey = JSON.stringify(initialFilters);
  React.useEffect(() => {
    setDraftFilters(initialFilters);
  }, [filtersKey]); // filtersKey is the stringified proxy — intentional single dep

  React.useEffect(() => {
    setShortlistedIds(new Set(items.filter((f) => f.isShortlisted).map((f) => f.id)));
  }, [items]);

  const totalPages = Math.ceil(total / pageSize);
  const activeFilterCount = countActiveFilters(draftFilters);

  async function handleSignOut() {
    await signOut({ redirect: false });
    router.push('/auth/signin');
  }

  function pushUrl(overrides: Record<string, string | string[] | undefined>) {
    router.push(buildUrl('/directory', overrides));
  }

  function handleApply() {
    setSheetOpen(false);
    pushUrl({ ...filtersToParams(draftFilters), sort, view: view === 'list' ? 'list' : undefined });
  }

  function handleReset() {
    setDraftFilters(DEFAULT_FILTERS);
    setSheetOpen(false);
    pushUrl({ sort, view: view === 'list' ? 'list' : undefined });
  }

  function handleSortChange(next: SortKey) {
    pushUrl({
      ...filtersToParams(initialFilters),
      sort: next,
      view: view === 'list' ? 'list' : undefined,
    });
  }

  function handleViewToggle(next: ViewKey) {
    pushUrl({
      ...filtersToParams(initialFilters),
      sort,
      view: next === 'list' ? 'list' : undefined,
    });
  }

  function handlePageChange(p: number) {
    pushUrl({
      ...filtersToParams(initialFilters),
      sort,
      view: view === 'list' ? 'list' : undefined,
      page: p > 1 ? String(p) : undefined,
    });
  }

  async function handleShortlistToggle(id: string, next: boolean) {
    if (pendingIds.has(id)) return;
    setPendingIds((s) => new Set(s).add(id));
    setShortlistedIds((s) => {
      const updated = new Set(s);
      if (next) updated.add(id);
      else updated.delete(id);
      return updated;
    });

    const result = await toggleShortlist(id);

    if (result.status === 'error') {
      // revert
      setShortlistedIds((s) => {
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

  return (
    <AppShell
      role="club"
      currentPath={currentPath}
      user={user}
      unreadNotifications={unreadNotifications}
      sidebarStats={sidebarStats}
      onSignOut={handleSignOut}
    >
      {/* Page header */}
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-brand-400">
            სკაუტინგი
          </p>
          <h1 className="mt-1.5 font-display text-[28px] font-bold leading-tight tracking-tight text-ink-50 sm:text-[32px]">
            ფეხბურთელების ძიება
          </h1>
          <p className="mt-1.5 max-w-[52ch] text-[13.5px] text-ink-400">
            გაფილტრე პოზიციით, ასაკით, ფეხითა და ფიზიკური მახასიათებლებით.
          </p>
        </div>
        {/* Search + mobile filter trigger */}
        <div className="flex w-full items-center gap-2.5 sm:w-auto">
          <div className="flex h-11 flex-1 items-center gap-2.5 rounded-field border border-ink-700 bg-ink-950 px-3.5 transition-colors focus-within:border-brand-400/60 focus-within:ring-4 focus-within:ring-brand-400/15 sm:w-72">
            <SearchIcon className="size-4 shrink-0 text-ink-500" aria-hidden="true" />
            <input
              type="search"
              placeholder="სახელი ან ეროვნება…"
              value={draftFilters.nationality ?? ''}
              onChange={(e) =>
                setDraftFilters((f) => ({ ...f, nationality: e.target.value || undefined }))
              }
              className="h-full flex-1 bg-transparent text-[14px] text-ink-50 outline-none placeholder:text-ink-600"
              aria-label="ფეხბ. ძიება"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="relative lg:hidden h-11 gap-2 rounded-btn border-ink-700 bg-ink-900 px-3.5 text-[13px] font-medium text-ink-200 hover:border-ink-600"
            onClick={() => setSheetOpen(true)}
            aria-label={`ფილტრები${activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}`}
          >
            <FiltersIcon className="size-4" />
            ფილტრი
            {activeFilterCount > 0 ? (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-400 px-1 text-[10px] font-bold text-ink-950">
                {activeFilterCount}
              </span>
            ) : null}
          </Button>
        </div>
      </div>

      <div className="flex gap-7">
        {/* Filter sidebar (desktop) */}
        <DirectoryFilterBar
          filters={draftFilters}
          onFiltersChange={setDraftFilters}
          onApply={handleApply}
          onReset={handleReset}
          nationalityOptions={nationalityOptions}
          cityOptions={cityOptions}
          isOpen={sheetOpen}
          onOpenChange={setSheetOpen}
        />

        {/* Results column */}
        <div className="flex min-w-0 flex-1 flex-col gap-5">
          {/* Results bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[13.5px] text-ink-400">
              <span className="font-mono font-semibold tabular-nums text-ink-50">{total}</span>{' '}
              ფეხბურთელი მოიძებნა
            </p>
            <div className="flex items-center gap-2.5">
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

              {/* View toggle */}
              <div className="flex h-10 items-center rounded-btn border border-ink-700 bg-ink-900 p-1">
                {(
                  [
                    ['grid', GridViewIcon, 'Grid ხედი'],
                    ['list', ListViewIcon, 'List ხედი'],
                  ] as const
                ).map(([v, Icon, label]) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => handleViewToggle(v as ViewKey)}
                    aria-label={label}
                    aria-pressed={view === v}
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-[7px] transition-colors',
                      view === v ? 'bg-ink-800 text-ink-50' : 'text-ink-500 hover:text-ink-200',
                    )}
                  >
                    <Icon className="size-4" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results */}
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-ink-700 bg-ink-900/50 px-6 py-20 text-center">
              <EmptyState
                title="ფეხბ. ვერ მოიძებნა"
                description="ფილტრებთან ფეხბ. ვერ მოიძებნა — სცადეთ ფილტ. გასუფ."
                action={
                  <Button variant="outline" size="sm" onClick={handleReset}>
                    ფილტ. გასუფ.
                  </Button>
                }
              />
            </div>
          ) : view === 'grid' ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((f) => (
                <FootballerCard
                  key={f.id}
                  id={f.id}
                  name={f.name}
                  position={f.position}
                  nationality={f.nationality ?? ''}
                  age={f.age}
                  height={f.height}
                  photoUrl={f.photoUrl}
                  verificationStatus={f.verificationStatus}
                  isSaved={shortlistedIds.has(f.id)}
                  onSaveToggle={handleShortlistToggle}
                />
              ))}
            </div>
          ) : (
            <div className="overflow-hidden rounded-card border border-ink-800 bg-ink-900 shadow-card">
              <div className="divide-y divide-ink-800">
                {items.map((f) => (
                  <ListRow
                    key={f.id}
                    footballer={f}
                    isSaved={shortlistedIds.has(f.id)}
                    onSaveToggle={handleShortlistToggle}
                  />
                ))}
              </div>
            </div>
          )}

          <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
      </div>
    </AppShell>
  );
}

function ListRow({
  footballer,
  isSaved,
  onSaveToggle,
}: {
  footballer: DirectoryFootballer;
  isSaved: boolean;
  onSaveToggle: (id: string, saved: boolean) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-4 px-4 py-4 transition-colors hover:bg-ink-800/40">
      {/* Avatar */}
      <div className="relative size-[52px] shrink-0 overflow-hidden rounded-[14px] bg-ink-800">
        {footballer.photoUrl ? (
          <Image
            src={footballer.photoUrl}
            alt={footballer.name}
            fill
            sizes="52px"
            className="object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-ink-600">
            <UserIcon className="size-6" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-[15px] font-semibold text-ink-50">{footballer.name}</p>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[12px] text-ink-400">
          {footballer.position && <PositionChip position={footballer.position} />}
          {footballer.age !== undefined && <span>{footballer.age} წ.</span>}
          {footballer.height !== undefined && <span>{footballer.height} სმ</span>}
          {footballer.nationality && <span>{footballer.nationality}</span>}
        </div>
      </div>

      <div className={cn('flex shrink-0 items-center gap-2')}>
        <button
          type="button"
          aria-label={isSaved ? 'შენახული — ჩამოშორება' : 'შენახვა'}
          aria-pressed={isSaved}
          onClick={() => onSaveToggle(footballer.id, !isSaved)}
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-btn border transition-colors',
            isSaved
              ? 'border-brand-400/40 bg-brand-400/15 text-brand-300'
              : 'border-ink-700 text-ink-500 hover:border-ink-600 hover:text-ink-200',
          )}
        >
          <StarIconFilled className="size-4" filled={isSaved} />
        </button>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/directory/${footballer.id}`}>პროფ.</Link>
        </Button>
      </div>
    </div>
  );
}

function StarIconFilled({ className, filled }: { className?: string; filled: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 1.5}
      className={className}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
      />
    </svg>
  );
}
