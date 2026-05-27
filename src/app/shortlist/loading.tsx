import { SkeletonCard } from '@/components/ui/skeleton';
import { Skeleton } from '@/components/ui/skeleton';

export default function ShortlistLoading() {
  return (
    <div className="space-y-4 px-4 py-6">
      <Skeleton className="h-7 w-44" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
