import { Skeleton, SkeletonCard } from '@/components/ui/skeleton';

export default function ClubsLoading() {
  return (
    <div className="px-4 py-6">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-9 w-24" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
