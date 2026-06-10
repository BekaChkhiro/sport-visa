import { AppShellSkeleton } from '@/components/app-shell-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

// Mirrors NotificationPreferencesClient: breadcrumb label + heading + legend
// card + three groups each with a section header and toggle rows.

function PreferenceRowSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-field border border-ink-800 bg-ink-950/40 px-3.5 py-2.5">
      <Skeleton className="size-9 shrink-0 rounded-[10px]" />
      <div className="min-w-0 flex-1 space-y-1.5">
        <Skeleton className="h-[13.5px] w-40" />
        <Skeleton className="h-3 w-3/4" />
      </div>
      <Skeleton className="h-6 w-11 shrink-0 rounded-full" />
    </div>
  );
}

function GroupSkeleton({ rowCount }: { rowCount: number }) {
  return (
    <div className="overflow-hidden rounded-card border border-ink-800 bg-ink-900 shadow-card">
      <div className="border-b border-ink-800 px-5 py-4 space-y-1.5">
        <Skeleton className="h-[15px] w-48" />
        <Skeleton className="h-3 w-2/3" />
      </div>
      <div className="space-y-2 p-4">
        {Array.from({ length: rowCount }).map((_, i) => (
          <PreferenceRowSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export default function NotificationSettingsLoading() {
  return (
    <AppShellSkeleton variant="footballer">
      <div className="mx-auto max-w-[680px] pb-20">
        {/* Heading */}
        <div className="mb-6 space-y-1.5">
          <Skeleton className="h-3 w-24 rounded" />
          <Skeleton className="h-[26px] w-48" />
          <Skeleton className="h-3 w-3/4" />
        </div>

        {/* Channel legend */}
        <div className="mb-6 flex items-center gap-6 rounded-card border border-ink-800 bg-ink-900 px-5 py-3.5">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-7 w-28 rounded-[8px]" />
          <Skeleton className="h-7 w-24 rounded-[8px]" />
        </div>

        {/* Groups */}
        <div className="space-y-6">
          <GroupSkeleton rowCount={4} />
          <GroupSkeleton rowCount={2} />
          <GroupSkeleton rowCount={2} />
        </div>
      </div>
    </AppShellSkeleton>
  );
}
