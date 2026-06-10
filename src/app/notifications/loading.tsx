import { AppShellSkeleton } from '@/components/app-shell-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

// Mirrors NotificationsClient: heading + unread count + mark-all button,
// filter tabs, then grouped notification rows with icon chip + body.

function NotificationRowSkeleton() {
  return (
    <div className="flex gap-3.5 px-4 py-3.5">
      <Skeleton className="size-10 shrink-0 rounded-[11px]" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-[13.5px] w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-1/4" />
      </div>
    </div>
  );
}

export default function NotificationsLoading() {
  return (
    <AppShellSkeleton variant="footballer">
      <div className="mx-auto max-w-[760px] space-y-6">
        {/* Heading */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <Skeleton className="h-[27px] w-52" />
              <Skeleton className="h-6 w-6 rounded-full" />
            </div>
            <Skeleton className="h-3 w-40" />
          </div>
          <Skeleton className="h-9 w-36 rounded-btn" />
        </div>

        {/* Filter tabs */}
        <div className="inline-flex gap-1 rounded-btn border border-ink-700 bg-ink-900 p-1">
          <Skeleton className="h-8 w-20 rounded-[8px]" />
          <Skeleton className="h-8 w-24 rounded-[8px]" />
        </div>

        {/* Group */}
        <div className="space-y-2.5">
          <Skeleton className="h-3 w-16 rounded" />
          <div className="overflow-hidden rounded-card border border-ink-800 bg-ink-900 shadow-card">
            <div className="divide-y divide-ink-800">
              {Array.from({ length: 3 }).map((_, i) => (
                <NotificationRowSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2.5">
          <Skeleton className="h-3 w-20 rounded" />
          <div className="overflow-hidden rounded-card border border-ink-800 bg-ink-900 shadow-card">
            <div className="divide-y divide-ink-800">
              {Array.from({ length: 2 }).map((_, i) => (
                <NotificationRowSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShellSkeleton>
  );
}
