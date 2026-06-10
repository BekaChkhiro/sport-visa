import { AppShellSkeleton } from '@/components/app-shell-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

// Mirrors MyRequestsClient: header (title + CTA), filter tabs, section label, divide-y list.

function RequestRowSkeleton() {
  return (
    <div className="px-5 py-4">
      <div className="flex items-center gap-3.5">
        <Skeleton className="h-10 w-10 shrink-0 rounded-[11px]" />
        <div className="min-w-0 flex-1 space-y-1.5">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-6 w-24 shrink-0 rounded-pill" />
      </div>
    </div>
  );
}

export default function MyRequestsLoading() {
  return (
    <AppShellSkeleton variant="footballer">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1.5">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-8 w-28 shrink-0 rounded-btn" />
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 rounded-field border border-ink-800 bg-ink-900 p-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 flex-1 rounded-[8px]" />
          ))}
        </div>

        {/* Section label */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-2.5 w-32" />
          <Skeleton className="h-2.5 w-16" />
        </div>

        {/* Request rows */}
        <div className="overflow-hidden rounded-card border border-ink-800 bg-ink-900 shadow-card">
          <div className="divide-y divide-ink-800">
            {Array.from({ length: 4 }).map((_, i) => (
              <RequestRowSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </AppShellSkeleton>
  );
}
