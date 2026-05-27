import { Skeleton } from '@/components/ui/skeleton';

// Mirrors NotificationsClient: header row (title + unread count + mark-all
// button) and a stack of notification rows (dot + title + body + timestamp).
function NotificationRowSkeleton() {
  return (
    <div className="flex items-start gap-4 rounded-lg border border-border bg-background p-4">
      <Skeleton className="mt-1 size-2.5 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-1/4" />
      </div>
      <Skeleton className="size-8 shrink-0 rounded-md" />
    </div>
  );
}

export default function NotificationsLoading() {
  return (
    <div className="space-y-6 px-4 py-6 md:p-6 lg:p-8">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1.5">
          <Skeleton className="h-6 w-44" />
          <Skeleton className="h-3 w-28" />
        </div>
        <Skeleton className="h-8 w-32 shrink-0 rounded-md" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <NotificationRowSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
