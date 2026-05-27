import { Skeleton } from '@/components/ui/skeleton';

// Mirrors ClubsDirectoryClient: title + count, filter bar (search input,
// country/city/sort selects), then a responsive grid of club cards (logo +
// name + meta + subscribe button).
function ClubCardSkeleton() {
  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        <Skeleton className="size-12 shrink-0 rounded-lg" />
        <div className="min-w-0 flex-1 space-y-1.5">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-3 w-2/3" />
      <Skeleton className="h-8 w-full rounded-md" />
    </div>
  );
}

export default function ClubsLoading() {
  return (
    <div className="px-4 py-6 md:p-6 lg:p-8">
      <div className="mb-6 space-y-2">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-3 w-20" />
      </div>
      <div className="mb-6 flex flex-wrap items-end gap-3">
        <div className="flex gap-2">
          <Skeleton className="h-8 w-48 rounded-md sm:w-64" />
          <Skeleton className="h-8 w-16 rounded-md" />
        </div>
        <Skeleton className="h-8 w-24 rounded-md" />
        <Skeleton className="h-8 w-24 rounded-md" />
        <Skeleton className="h-8 w-24 rounded-md" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <ClubCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
