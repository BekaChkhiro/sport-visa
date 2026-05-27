import { AppShellSkeleton } from '@/components/app-shell-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

// Mirrors ServiceCategoriesClient: back-link + heading + step indicator +
// 2-column grid of category cards.

function CategoryCardSkeleton() {
  return (
    <div className="flex flex-col rounded-xl border border-border bg-card p-5">
      <Skeleton className="mb-3 size-12 rounded-lg" />
      <Skeleton className="mb-1 h-5 w-2/3" />
      <Skeleton className="mb-1 h-3 w-full" />
      <Skeleton className="mb-4 h-3 w-5/6" />
      <Skeleton className="mt-auto h-8 w-full rounded-md" />
    </div>
  );
}

export default function ServiceRequestLoading() {
  return (
    <AppShellSkeleton variant="footballer">
      <div className="space-y-6">
        <div>
          <Skeleton className="mb-4 h-7 w-44" />
          <Skeleton className="mb-2 h-7 w-56" />
          <Skeleton className="h-3 w-72" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <CategoryCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </AppShellSkeleton>
  );
}
