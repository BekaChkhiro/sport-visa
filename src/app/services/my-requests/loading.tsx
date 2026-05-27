import { AppShellSkeleton } from '@/components/app-shell-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

// Mirrors MyRequestsClient: back-link, header (title + new-request CTA),
// filter tabs strip, then a divide-y list of request rows.

function RequestRowSkeleton() {
  return (
    <div className="flex items-start justify-between gap-4 px-4 py-4">
      <div className="flex min-w-0 items-start gap-3">
        <Skeleton className="mt-0.5 size-9 shrink-0 rounded-lg" />
        <div className="min-w-0 space-y-1.5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-3 w-14" />
      </div>
    </div>
  );
}

export default function MyRequestsLoading() {
  return (
    <AppShellSkeleton variant="footballer">
      <div className="space-y-6">
        <div>
          <Skeleton className="mb-4 h-7 w-44" />
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-2">
              <Skeleton className="h-7 w-56" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-8 w-28 shrink-0 rounded-md" />
          </div>
        </div>
        <div className="flex gap-1 rounded-lg bg-muted p-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-7 flex-1 rounded-md" />
          ))}
        </div>
        <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
          {Array.from({ length: 4 }).map((_, i) => (
            <RequestRowSkeleton key={i} />
          ))}
        </div>
      </div>
    </AppShellSkeleton>
  );
}
