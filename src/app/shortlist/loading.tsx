import { AppShellSkeleton } from '@/components/app-shell-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

// Mirrors ShortlistClient: back-link, heading row, and a vertical list of
// footballer rows. Club role for the sidebar (only clubs see shortlist).

function ShortlistRowSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
      <Skeleton className="size-10 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-1.5">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-56" />
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Skeleton className="h-6 w-12 rounded-full" />
        <Skeleton className="h-8 w-20 rounded-md" />
        <Skeleton className="size-8 rounded-md" />
      </div>
    </div>
  );
}

export default function ShortlistLoading() {
  return (
    <AppShellSkeleton variant="club">
      <div className="space-y-6">
        <Skeleton className="h-7 w-44" />
        <div className="flex items-center justify-between gap-2">
          <div className="space-y-2">
            <Skeleton className="h-6 w-56" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-8 w-32 shrink-0 rounded-md" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <ShortlistRowSkeleton key={i} />
          ))}
        </div>
      </div>
    </AppShellSkeleton>
  );
}
