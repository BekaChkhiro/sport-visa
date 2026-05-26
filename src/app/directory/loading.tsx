import { Skeleton, SkeletonCard } from '@/components/ui/skeleton';

export default function DirectoryLoading() {
  return (
    <div className="container mx-auto flex gap-6 px-4 py-6">
      {/* sidebar filter skeleton */}
      <div className="hidden w-64 shrink-0 lg:flex lg:flex-col gap-4">
        <Skeleton className="h-8 w-32" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>

      {/* grid skeleton */}
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
