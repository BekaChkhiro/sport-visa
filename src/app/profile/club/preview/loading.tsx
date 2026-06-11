import { AppShellSkeleton } from '@/components/app-shell-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

// Mirrors ClubProfilePreviewClient: preview banner, hero card (cover + logo +
// meta + stats strip + tabs), then bio/roster tab content.

export default function ClubProfilePreviewLoading() {
  return (
    <AppShellSkeleton variant="club">
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
          <div className="px-5 pb-6 sm:px-7">
            {/* Logo + identity row */}
            <div className="-mt-12 flex flex-wrap items-end gap-4">
              <Skeleton className="h-24 w-24 shrink-0 rounded-[20px]" />
              <div className="mb-1 space-y-2">
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-4 w-56" />
              </div>
            </div>

            {/* Stats strip */}
            <div className="mt-5 flex gap-5 border-t border-ink-800 pt-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>

            {/* Tabs bar */}
            <div className="mt-5 flex gap-1 border-b border-ink-800">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="mb-1 h-8 w-20 rounded-btn" />
              ))}
            </div>

            {/* Tab content */}
            <div className="pt-5 space-y-4">
              <Skeleton className="h-2.5 w-24" />
              <div className="rounded-card border border-ink-800 bg-ink-950/40 p-4 space-y-2">
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-3.5 w-3/4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShellSkeleton>
  );
}
