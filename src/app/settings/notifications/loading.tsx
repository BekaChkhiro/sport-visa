import { Skeleton } from '@/components/ui/skeleton';

export default function NotificationSettingsLoading() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <div className="rounded-lg border">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex items-start justify-between gap-4 border-b px-5 py-4 last:border-0"
          >
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-3/4" />
            </div>
            <Skeleton className="h-6 w-11 shrink-0 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
