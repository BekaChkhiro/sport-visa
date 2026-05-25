'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { FootballerCard } from '@/components/footballer-card';
import { DirectoryFilterBar, type DirectoryFilters } from '@/components/directory-filter-bar';
import { EmptyState } from '@/components/ui/empty-state';
import {
  FiltersIcon,
  ListViewIcon,
  GridViewIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@/components/icons';
import type { AppSidebarStats } from '@/components/app-sidebar';
import type { VerificationStatus } from '@/components/verification-badge';
import type { ComboboxOption } from '@/components/ui/combobox-field';
import { toggleShortlist } from '@/lib/directory/actions';
import { cn } from '@/lib/utils';

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

const DEFAULT_FILTERS: DirectoryFilters = {
  positions: [],
  foot: 'all',
  experience: [],
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

function filtersToParams(filters: DirectoryFilters): Record<string, string | string[] | undefined> {
  const out: Record<string, string | string[] | undefined> = {};
  if (filters.positions.length > 0) out['positions'] = filters.positions;
  if (filters.ageMin !== undefined) out['ageMin'] = String(filters.ageMin);
  if (filters.ageMax !== undefined) out['ageMax'] = String(filters.ageMax);
  if (filters.heightMin !== undefined) out['heightMin'] = String(filters.heightMin);
  if (filters.heightMax !== undefined) out['heightMax'] = String(filters.heightMax);
  if (filters.weightMin !== undefined) out['weightMin'] = String(filters.weightMin);
  if (filters.weightMax !== undefined) out['weightMax'] = String(filters.weightMax);
  if (filters.foot && filters.foot !== 'all') out['foot'] = filters.foot;
  if (filters.nationality) out['nationality'] = filters.nationality;
  if (filters.city) out['city'] = filters.city;
  if (filters.experience && filters.experience.length > 0) out['experience'] = filters.experience;
  return out;
}

function countActiveFilters(filters: DirectoryFilters): number {
  let n = 0;
  if (filters.positions.length > 0) n++;
  if (filters.ageMin !== undefined || filters.ageMax !== undefined) n++;
  if (filters.heightMin !== undefined || filters.heightMax !== undefined) n++;
  if (filters.weightMin !== undefined || filters.weightMax !== undefined) n++;
  if (filters.foot && filters.foot !== 'all') n++;
  if (filters.nationality) n++;
  if (filters.city) n++;
  if (filters.experience && filters.experience.length > 0) n++;
  return n;
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
      ...filtersToParams(draftFilters),
      sort: next,
      view: view === 'list' ? 'list' : undefined,
    });
  }

  function handleViewToggle(next: ViewKey) {
    pushUrl({ ...filtersToParams(draftFilters), sort, view: next === 'list' ? 'list' : undefined });
  }

  function handlePageChange(p: number) {
    pushUrl({
      ...filtersToParams(draftFilters),
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
      <div className="flex gap-6">
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

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h1 className="text-lg font-semibold">
              ფეხბ. Directory
              <span className="ml-2 text-sm font-normal text-muted-foreground">{total} შედეგი</span>
            </h1>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="lg:hidden relative"
                onClick={() => setSheetOpen(true)}
                aria-label={`ფილტრები${activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}`}
              >
                <FiltersIcon className="size-4" />
                ფილტრი
                {activeFilterCount > 0 ? (
                  <span className="absolute -right-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                    {activeFilterCount}
                  </span>
                ) : null}
              </Button>

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

              <div className="flex rounded-md border border-input overflow-hidden">
                <Button
                  type="button"
                  variant={view === 'grid' ? 'default' : 'ghost'}
                  size="icon"
                  className="rounded-none border-0 h-9 w-9"
                  aria-label="Grid ხედი"
                  aria-pressed={view === 'grid'}
                  onClick={() => handleViewToggle('grid')}
                >
                  <GridViewIcon className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant={view === 'list' ? 'default' : 'ghost'}
                  size="icon"
                  className="rounded-none border-0 h-9 w-9"
                  aria-label="List ხედი"
                  aria-pressed={view === 'list'}
                  onClick={() => handleViewToggle('list')}
                >
                  <ListViewIcon className="size-4" />
                </Button>
              </div>
            </div>
          </div>

          {items.length === 0 ? (
            <div className="rounded-xl border border-border bg-card">
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
            <div className="flex flex-col divide-y divide-border rounded-xl border border-border bg-card">
              {items.map((f) => (
                <ListRow
                  key={f.id}
                  footballer={f}
                  isSaved={shortlistedIds.has(f.id)}
                  onSaveToggle={handleShortlistToggle}
                />
              ))}
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
  const meta = [
    footballer.position,
    footballer.age !== undefined ? `${footballer.age} წ.` : null,
    footballer.height !== undefined ? `${footballer.height} სმ` : null,
    footballer.nationality,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div
        className="size-10 shrink-0 rounded-full bg-muted flex items-center justify-center overflow-hidden"
        aria-hidden="true"
      >
        {footballer.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={footballer.photoUrl} alt={footballer.name} className="size-full object-cover" />
        ) : (
          <span className="text-xs font-medium text-muted-foreground">
            {footballer.name
              .split(' ')
              .slice(0, 2)
              .map((w) => w[0])
              .join('')
              .toUpperCase()}
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{footballer.name}</p>
        <p className="truncate text-xs text-muted-foreground">{meta}</p>
      </div>

      <div className={cn('flex items-center gap-2 shrink-0')}>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={isSaved ? 'შენახული — ჩამოშორება' : 'შენახვა'}
          aria-pressed={isSaved}
          onClick={() => onSaveToggle(footballer.id, !isSaved)}
          className="size-8"
        >
          <StarIconFilled
            className={cn(
              'size-4',
              isSaved ? 'fill-primary text-primary' : 'text-muted-foreground',
            )}
            filled={isSaved}
          />
        </Button>
        <Button variant="outline" size="sm" asChild>
          <a href={`/directory/${footballer.id}`}>პროფ.</a>
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
