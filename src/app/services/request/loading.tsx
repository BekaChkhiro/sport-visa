import { AppShellSkeleton } from '@/components/app-shell-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

// Mirrors ServiceCategoriesClient: heading + section label + 2-column card grid.

function CategoryCardSkeleton() {
  return (
    <div className="flex items-start gap-4 rounded-card border border-ink-800 bg-ink-900 p-5 shadow-card">
      <Skeleton className="h-12 w-12 shrink-0 rounded-[13px]" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="mt-1 h-3 w-24" />
      </div>
    </div>
  );
}

export default function ServiceRequestLoading() {
  return (
    <AppShellSkeleton variant="footballer">
      <div className="space-y-6">
        <div className="space-y-1.5">
          <Skeleton className="h-7 w-28" />
          <Skeleton className="h-3 w-72" />
        </div>
        <Skeleton className="h-3 w-40" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <CategoryCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </AppShellSkeleton>
  );
}
