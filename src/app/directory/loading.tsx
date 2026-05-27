import { Skeleton } from '@/components/ui/skeleton';

// Mirrors DirectoryClient: left filter sidebar (desktop), and main column
// with heading + count + filter/sort/view toggles + grid of footballer cards.
function FootballerCardSkeleton() {
  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-4">
      <Skeleton className="aspect-square w-full rounded-lg" />
      <div className="flex items-center justify-between gap-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="size-8 rounded-md" />
      </div>
      <Skeleton className="h-3 w-1/2" />
      <div className="flex gap-1.5">
        <Skeleton className="h-5 w-12 rounded-full" />
        <Skeleton className="h-5 w-12 rounded-full" />
      </div>
    </div>
  );
}

function FilterGroupSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-9 w-full rounded-md" />
    </div>
  );
}

export default function DirectoryLoading() {
  return (
    <div className="flex gap-6 px-4 py-6 md:p-6 lg:p-8">
      {/* Filter sidebar (desktop only) */}
      <aside className="hidden w-64 shrink-0 lg:flex lg:flex-col lg:gap-5">
        <Skeleton className="h-6 w-32" />
        {Array.from({ length: 6 }).map((_, i) => (
          <FilterGroupSkeleton key={i} />
        ))}
        <Skeleton className="mt-2 h-9 w-full rounded-md" />
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Skeleton className="h-6 w-44" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-20 rounded-md lg:hidden" />
            <Skeleton className="h-8 w-24 rounded-md" />
            <Skeleton className="h-9 w-20 rounded-md" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <FootballerCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
