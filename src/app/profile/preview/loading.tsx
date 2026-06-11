import { AppShellSkeleton } from '@/components/app-shell-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

// Mirrors ProfilePreviewClient: preview banner, hero card (cover + avatar +
// quick-facts + meta), tabs, then tab-content sections.

export default function ProfilePreviewLoading() {
  return (
    <AppShellSkeleton variant="footballer">
      <div className="mx-auto max-w-[900px]">
        {/* Preview banner */}
        <div className="mb-5 flex items-center justify-between gap-3 rounded-card border border-brand-400/25 bg-brand-400/8 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <Skeleton className="size-4 shrink-0 rounded" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-8 w-32 shrink-0 rounded-btn" />
        </div>

        {/* Hero card */}
        <div className="overflow-hidden rounded-card border border-ink-800 bg-ink-900 shadow-card">
          {/* Cover */}
          <Skeleton className="h-36 w-full rounded-none" />
          <div className="px-5 pb-5 sm:px-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              {/* Avatar overlapping cover */}
              <Skeleton className="-mt-16 h-28 w-28 shrink-0 rounded-[22px]" />
              <div className="min-w-0 space-y-2 pb-1">
                <Skeleton className="h-8 w-48" />
                <div className="flex gap-1.5">
                  <Skeleton className="h-5 w-10 rounded-pill" />
                  <Skeleton className="h-5 w-10 rounded-pill" />
                </div>
                <Skeleton className="h-4 w-56" />
              </div>
            </div>

            {/* Quick-facts strip */}
            <div className="mt-5 grid grid-cols-3 gap-px overflow-hidden rounded-[12px] border border-ink-800 bg-ink-800/60 lg:grid-cols-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-ink-900 px-4 py-3.5">
                  <Skeleton className="mb-1.5 h-2.5 w-12" />
                  <Skeleton className="h-6 w-10" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs bar */}
        <div className="mt-5 flex items-center gap-1 border-b border-ink-800">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="mx-1 mb-1 h-8 w-20 rounded-btn" />
          ))}
        </div>

        {/* Tab content skeleton */}
        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_300px]">
          {/* Main column */}
          <div className="space-y-5">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="rounded-card border border-ink-800 bg-ink-900 shadow-card">
                <div className="border-b border-ink-800 px-5 py-3.5">
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="p-5 space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
          {/* Sidebar */}
          <div className="space-y-4">
            <div className="rounded-card border border-ink-800 bg-ink-900 p-5 shadow-card">
              <Skeleton className="h-4 w-32 mb-3" />
              <Skeleton className="h-3 w-full mb-2" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
        </div>
      </div>
    </AppShellSkeleton>
  );
}
