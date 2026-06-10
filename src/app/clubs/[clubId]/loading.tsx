import { AppShellSkeleton } from '@/components/app-shell-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

// Mirrors ClubDetailClient: breadcrumb, hero (cover + crest + name + stats
// strip), two-column layout (bio + tab nav + tab content | sidebar details).

export default function ClubDetailLoading() {
  return (
    <AppShellSkeleton variant="footballer">
      <div className="mx-auto max-w-[1180px]">
        {/* Breadcrumb */}
        <Skeleton className="mb-4 h-4 w-40" />

        {/* Hero */}
        <div className="overflow-hidden rounded-card border border-ink-800 bg-ink-900">
          <Skeleton className="h-44 rounded-none sm:h-56" />
          <div className="px-5 pb-5 sm:px-7">
            <div className="flex flex-wrap items-end gap-5">
              <Skeleton className="-mt-7 h-24 w-24 rounded-[20px]" />
              <div className="mb-1 flex-1 space-y-2">
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-4 w-56" />
              </div>
              <Skeleton className="mb-1 h-9 w-28 rounded-btn" />
            </div>
            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 border-t border-ink-800 pt-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-28" />
            </div>
          </div>
        </div>

        {/* Two-column */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            {/* Bio */}
            <Skeleton className="h-28 w-full rounded-card" />
            {/* Tab bar */}
            <div className="flex gap-1">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-24 rounded-btn" />
              ))}
            </div>
            {/* Tab content */}
            <div className="rounded-card border border-ink-800 bg-ink-900 p-5 space-y-3">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <Skeleton className="h-40 w-full rounded-card" />
            <Skeleton className="h-32 w-full rounded-card" />
          </div>
        </div>
      </div>
    </AppShellSkeleton>
  );
}
