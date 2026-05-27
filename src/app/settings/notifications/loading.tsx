import { Skeleton } from '@/components/ui/skeleton';

// Mirrors NotificationPreferencesClient: heading + description, then a
// rounded card with a section title and a divide-y list of preference rows
// (icon + title + description + toggle switch).
function PreferenceRowSkeleton() {
  return (
    <div className="flex items-start justify-between gap-4 py-4">
      <div className="flex min-w-0 items-start gap-3">
        <Skeleton className="mt-0.5 size-4 shrink-0" />
        <div className="min-w-0 space-y-1.5">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-64" />
          <Skeleton className="h-3 w-52" />
        </div>
      </div>
      <Skeleton className="mt-0.5 h-5 w-9 shrink-0 rounded-full" />
    </div>
  );
}

export default function NotificationSettingsLoading() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-6 md:p-6 lg:p-8">
      <div className="space-y-2">
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-3 w-3/4" />
      </div>
      <div className="rounded-lg border border-border bg-card">
        <div className="border-b border-border px-5 py-3">
          <Skeleton className="h-3 w-44" />
        </div>
        <div className="divide-y divide-border px-5">
          {Array.from({ length: 2 }).map((_, i) => (
            <PreferenceRowSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
