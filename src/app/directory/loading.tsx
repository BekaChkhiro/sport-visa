import { AppShellSkeleton } from '@/components/app-shell-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

// Mirrors DirectoryClient: page header with title + search, left filter
// sidebar (desktop), and main column with results bar + grid of footballer
// cards.

function FootballerCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-card border border-ink-800 bg-ink-900 shadow-card">
      <Skeleton className="aspect-[3/4] w-full rounded-none" />
      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-5 w-12 rounded-pill" />
          <Skeleton className="size-8 rounded-btn" />
        </div>
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="mt-auto flex gap-2 pt-1">
          <Skeleton className="h-9 flex-1 rounded-btn" />
          <Skeleton className="h-9 flex-1 rounded-btn" />
        </div>
      </div>
    </div>
  );
}

export default function DirectoryLoading() {
  return (
    <AppShellSkeleton variant="club">
      {/* Page header */}
      <div className="mb-7 space-y-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-3 w-80" />
      </div>

      <div className="flex gap-7">
        {/* Filter sidebar (desktop only) */}
        <aside className="hidden w-[270px] shrink-0 lg:flex lg:flex-col lg:gap-5">
          <Skeleton className="h-5 w-24" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-2 border-t border-ink-800 pt-4">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-8 w-full rounded-field" />
            </div>
          ))}
        </aside>

        {/* Main column */}
        <div className="flex min-w-0 flex-1 flex-col gap-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Skeleton className="h-4 w-44" />
            <div className="flex items-center gap-2.5">
              <Skeleton className="h-10 w-8 rounded-btn lg:hidden" />
              <Skeleton className="h-10 w-32 rounded-btn" />
              <Skeleton className="h-10 w-20 rounded-btn" />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <FootballerCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </AppShellSkeleton>
  );
}
