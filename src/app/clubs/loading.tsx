import { AppShellSkeleton } from '@/components/app-shell-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

// Mirrors ClubsDirectoryClient: page header with title + search, filter bar,
// count, then responsive grid of club cards.

function ClubCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-card border border-ink-800 bg-ink-900 shadow-card">
      {/* Cover strip */}
      <Skeleton className="h-16 rounded-none" />
      <div className="flex flex-col gap-3 px-4 pb-4">
        <div className="-mt-6 flex items-end justify-between">
          <Skeleton className="h-12 w-12 rounded-[13px]" />
          <Skeleton className="size-5 rounded-full mb-0.5" />
        </div>
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-24 rounded-pill" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <div className="mt-auto flex items-center justify-between gap-2 border-t border-ink-800 px-4 py-2.5">
        <Skeleton className="h-7 w-20 rounded-btn" />
        <Skeleton className="h-7 w-16 rounded-btn" />
      </div>
    </div>
  );
}

export default function ClubsLoading() {
  return (
    <AppShellSkeleton variant="footballer">
      {/* Page header */}
      <div className="mb-7 space-y-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-3 w-72" />
      </div>

      {/* Filters bar */}
      <div className="mb-5 flex flex-wrap items-center gap-2.5">
        <Skeleton className="h-10 w-32 rounded-btn" />
        <Skeleton className="h-10 w-28 rounded-btn" />
        <Skeleton className="h-10 w-28 rounded-btn" />
      </div>

      {/* Count */}
      <Skeleton className="mb-5 h-4 w-32" />

      {/* Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <ClubCardSkeleton key={i} />
        ))}
      </div>
    </AppShellSkeleton>
  );
}
